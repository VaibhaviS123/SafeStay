"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBooking(bookingData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to make a booking" };
    }

    // Validate dates
    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return { success: false, error: "Check-in date cannot be in the past" };
    }

    if (checkOut <= checkIn) {
      return { success: false, error: "Check-out date must be after check-in date" };
    }

    // Check for overlapping bookings
    const { data: existingBookings, error: checkError } = await supabase
      .from("bookings")
      .select("*")
      .eq("property_id", bookingData.property_id)
      .in("status", ["confirmed", "pending"])
      .or(
        `and(check_in.lte.${bookingData.check_out},check_out.gte.${bookingData.check_in})`
      );

    if (checkError) {
      console.error("Error checking bookings:", checkError);
      return { success: false, error: "Failed to check booking availability" };
    }

    if (existingBookings && existingBookings.length > 0) {
      return {
        success: false,
        error: "This property is not available for the selected dates",
      };
    }

    // Get property details to validate max guests
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("max_guests")
      .eq("id", bookingData.property_id)
      .single();

    if (propertyError || !property) {
      return { success: false, error: "Property not found" };
    }

    if (bookingData.guests > property.max_guests) {
      return {
        success: false,
        error: `Maximum ${property.max_guests} guests allowed`,
      };
    }

    // Create the booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingData,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      return { success: false, error: "Failed to create booking" };
    }

    revalidatePath("/guest/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    console.log("=== UPDATE BOOKING STATUS ===");
    console.log("Booking ID:", bookingId);
    console.log("New Status:", status);

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("❌ Auth error:", authError);
      return { success: false, error: "Unauthorized" };
    }

    console.log("✅ User authenticated:", user.id);

    // First, get the booking - use array result instead of single
    const { data: bookingArray, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId);

    console.log("Booking array:", bookingArray);
    console.log("Fetch error:", fetchError);

    if (fetchError) {
      console.log("❌ Fetch error:", fetchError);
      return { success: false, error: "Failed to fetch booking" };
    }

    if (!bookingArray || bookingArray.length === 0) {
      console.log("❌ Booking not found");
      return { success: false, error: "Booking not found" };
    }

    const booking = bookingArray[0];
    console.log("Booking:", booking);

    // Get the property to check ownership - use array result
    const { data: propertyArray, error: propertyError } = await supabase
      .from("properties")
      .select("owner_id")
      .eq("id", booking.property_id);

    console.log("Property array:", propertyArray);
    console.log("Property error:", propertyError);

    if (propertyError) {
      console.log("❌ Property fetch error:", propertyError);
      return { success: false, error: "Failed to fetch property" };
    }

    if (!propertyArray || propertyArray.length === 0) {
      console.log("❌ Property not found");
      return { success: false, error: "Property not found" };
    }

    const property = propertyArray[0];
    console.log("Property owner_id:", property.owner_id);
    console.log("Current user id:", user.id);

    // Verify user is the property owner
    if (property.owner_id !== user.id) {
      console.log("❌ Permission denied");
      return { success: false, error: "You don't have permission to update this booking" };
    }

    console.log("✅ Permission verified");

    // Update the booking status - DON'T use .single()
    const { data: updateResult, error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId)
      .select();

    console.log("Update result:", updateResult);
    console.log("Update error:", updateError);

    if (updateError) {
      console.error("❌ Update error:", updateError);
      return { success: false, error: `Failed to update: ${updateError.message}` };
    }

    if (!updateResult || updateResult.length === 0) {
      console.log("❌ No rows updated");
      return { success: false, error: "No rows were updated" };
    }

    console.log("✅ Booking updated successfully!");

    // Revalidate paths
    revalidatePath("/owner/bookings");
    revalidatePath(`/owner/bookings/${bookingId}`);
    revalidatePath("/owner/dashboard");
    revalidatePath("/guest/dashboard");
    
    return { success: true, data: updateResult[0] };
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    console.error("Error stack:", error.stack);
    return { success: false, error: `Unexpected error: ${error.message}` };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the booking to verify it belongs to the user
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Booking not found" };
    }

    // Verify user owns this booking
    if (booking.user_id !== user.id) {
      return { success: false, error: "You don't have permission to cancel this booking" };
    }

    // Check if booking can be cancelled (e.g., not in the past)
    const checkIn = new Date(booking.check_in);
    const today = new Date();

    if (checkIn < today && booking.status === "confirmed") {
      return { success: false, error: "Cannot cancel a booking that has already started" };
    }

    // Update the booking status to cancelled
    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: "Failed to cancel booking" };
    }

    revalidatePath("/guest/dashboard");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}