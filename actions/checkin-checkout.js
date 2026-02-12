"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function guestCheckIn(bookingId) {
  try {
    const supabase = await createClient();

    console.log("=== GUEST CHECK IN ===");
    console.log("Booking ID:", bookingId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    console.log("User ID:", user.id);

    // Fetch booking (no joins, simple query)
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return { success: false, error: "Could not find booking" };
    }

    if (!bookings || bookings.length === 0) {
      return { success: false, error: "Booking not found" };
    }

    const booking = bookings[0];
    console.log("Booking found:", booking);
    console.log("Booking status:", booking.status);
    console.log("Booking user_id:", booking.user_id);

    // Verify this booking belongs to the user
    if (booking.user_id !== user.id) {
      return { success: false, error: "This booking does not belong to you" };
    }

    // Verify status is confirmed
    const status = booking.status?.trim().toLowerCase();
    if (status !== "confirmed") {
      return { success: false, error: `Cannot check in - booking status is "${booking.status}" (must be confirmed)` };
    }

    // Date validation for check-in
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for date-only comparison
    
    const checkInDate = new Date(booking.check_in);
    checkInDate.setHours(0, 0, 0, 0);

    if (today < checkInDate) {
      const checkInDateStr = checkInDate.toLocaleDateString();
      return { 
        success: false, 
        error: `Cannot check in yet - check-in date is ${checkInDateStr}` 
      };
    }

    // Update the booking
    const now = new Date().toISOString();
    const { data: updated, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "checked_in",
        checked_in_at: now,
      })
      .eq("id", bookingId)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, error: `Database error: ${updateError.message}` };
    }

    console.log("✅ Check-in successful:", updated);

    revalidatePath("/guest/dashboard");
    revalidatePath("/owner/bookings");

    return { success: true };
  } catch (err) {
    console.error("guestCheckIn unexpected error:", err);
    return { success: false, error: err.message || "Unexpected error occurred" };
  }
}

export async function guestCheckOut(bookingId) {
  try {
    const supabase = await createClient();

    console.log("=== GUEST CHECK OUT ===");
    console.log("Booking ID:", bookingId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch booking
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId);

    if (fetchError || !bookings?.length) {
      return { success: false, error: "Booking not found" };
    }

    const booking = bookings[0];

    if (booking.user_id !== user.id) {
      return { success: false, error: "This booking does not belong to you" };
    }

    const status = booking.status?.trim().toLowerCase();
    if (status !== "checked_in") {
      return { success: false, error: `Cannot check out - booking status is "${booking.status}" (must be checked_in)` };
    }

    // Date validation for check-out
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkInDate = new Date(booking.check_in);
    checkInDate.setHours(0, 0, 0, 0);
    
    const checkOutDate = new Date(booking.check_out);
    checkOutDate.setHours(0, 0, 0, 0);

    // Must be after check-in date
    if (today <= checkInDate) {
      return { 
        success: false, 
        error: "Cannot check out on or before check-in date" 
      };
    }

    // Must be on or before check-out date
    if (today > checkOutDate) {
      const checkOutDateStr = checkOutDate.toLocaleDateString();
      return { 
        success: false, 
        error: `Check-out date has passed (${checkOutDateStr})` 
      };
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        checked_out_at: now,
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, error: `Database error: ${updateError.message}` };
    }

    console.log("✅ Check-out successful");

    revalidatePath("/guest/dashboard");
    revalidatePath("/owner/bookings");

    return { success: true };
  } catch (err) {
    console.error("guestCheckOut unexpected error:", err);
    return { success: false, error: err.message || "Unexpected error occurred" };
  }
}