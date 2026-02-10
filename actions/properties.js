"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProperty(propertyData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify user is an owner
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "owner") {
      return { error: "Only owners can create properties" };
    }

    // Auto-generate location if not provided
    let location = propertyData.location;
    if (!location && propertyData.city && propertyData.area) {
      location = `${propertyData.area}, ${propertyData.city}`;
    }

    // Get the first photo URL for the main image_url field
    const mainImageUrl = Array.isArray(propertyData.photos) && propertyData.photos.length > 0 
      ? propertyData.photos[0] 
      : null;

    // 1. Create the property with all fields
    const { data, error } = await supabase
      .from("properties")
      .insert([
        {
          owner_id: user.id,
          name: propertyData.name,
          location: location,
          city: propertyData.city,
          area: propertyData.area,
          address: propertyData.address || null,
          description: propertyData.description || null,
          safety_rules: propertyData.safety_rules || null,
          price_per_night: propertyData.price_per_night || null,
          bedrooms: propertyData.bedrooms || 1,
          bathrooms: propertyData.bathrooms || 1,
          max_guests: propertyData.max_guests || 2,
          property_type: propertyData.property_type || 'apartment',
          amenities: propertyData.amenities || [],
          image_url: mainImageUrl, // First photo as main image
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { error: error.message };
    }

    console.log("Property created:", data);

    // 2. Insert photos into property_images table
    if (propertyData.photos && Array.isArray(propertyData.photos) && propertyData.photos.length > 0) {
      const photoInserts = propertyData.photos.map((url, index) => ({
        property_id: data.id,
        image_url: url,
        display_order: index,
      }));

      console.log("Inserting photos:", photoInserts);

      const { error: photosError } = await supabase
        .from("property_images")
        .insert(photoInserts);

      if (photosError) {
        console.error("Photos insert error:", photosError);
        // Don't fail the whole operation, just log the error
        console.warn("Property created but photos failed to upload");
      } else {
        console.log("Photos inserted successfully");
      }
    }

    revalidatePath("/owner/properties");
    revalidatePath("/owner/dashboard");
    revalidatePath("/guest/dashboard");

    return { property: data };
  } catch (error) {
    console.error("Error creating property:", error);
    return { error: "Failed to create property" };
  }
}

export async function updateProperty(propertyId, propertyData) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify the property belongs to the user
    const { data: property } = await supabase
      .from("properties")
      .select("owner_id")
      .eq("id", propertyId)
      .single();

    if (!property || property.owner_id !== user.id) {
      return { error: "Property not found or unauthorized" };
    }

    // Auto-generate location if not provided
    let location = propertyData.location;
    if (!location && propertyData.city && propertyData.area) {
      location = `${propertyData.area}, ${propertyData.city}`;
    }

    // Handle photos - extract URLs if they're objects with url property
    let photoUrls = [];
    if (propertyData.photos && Array.isArray(propertyData.photos)) {
      photoUrls = propertyData.photos.map(photo => 
        typeof photo === 'string' ? photo : photo.url
      );
    }

    const mainImageUrl = photoUrls.length > 0 ? photoUrls[0] : null;

    // 1. Update the property with all fields
    const { data, error } = await supabase
      .from("properties")
      .update({
        name: propertyData.name,
        location: location,
        city: propertyData.city,
        area: propertyData.area,
        address: propertyData.address || null,
        description: propertyData.description || null,
        safety_rules: propertyData.safety_rules || null,
        price_per_night: propertyData.price_per_night || null,
        bedrooms: propertyData.bedrooms || 1,
        bathrooms: propertyData.bathrooms || 1,
        max_guests: propertyData.max_guests || 2,
        property_type: propertyData.property_type || 'apartment',
        amenities: propertyData.amenities || [],
        image_url: mainImageUrl,
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { error: error.message };
    }

    // 2. Update photos - delete old ones and insert new ones
    if (propertyData.photos && Array.isArray(propertyData.photos)) {
      // Delete existing photos
      await supabase
        .from("property_images")
        .delete()
        .eq("property_id", propertyId);

      // Insert new photos
      if (photoUrls.length > 0) {
        const photoInserts = photoUrls.map((url, index) => ({
          property_id: propertyId,
          image_url: url,
          display_order: index,
        }));

        const { error: photosError } = await supabase
          .from("property_images")
          .insert(photoInserts);

        if (photosError) {
          console.error("Photos error:", photosError);
        }
      }
    }

    revalidatePath("/owner/properties");
    revalidatePath(`/owner/properties/${propertyId}`);
    revalidatePath("/owner/dashboard");
    revalidatePath("/guest/dashboard");

    return { property: data };
  } catch (error) {
    console.error("Error updating property:", error);
    return { error: "Failed to update property" };
  }
}

export async function deleteProperty(propertyId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    // Verify the property belongs to the user
    const { data: property } = await supabase
      .from("properties")
      .select("owner_id")
      .eq("id", propertyId)
      .single();

    if (!property || property.owner_id !== user.id) {
      return { error: "Property not found or unauthorized" };
    }

    // Get photos to delete from storage
    const { data: photos } = await supabase
      .from("property_images")
      .select("image_url")
      .eq("property_id", propertyId);

    // Delete the property (photos in DB will cascade delete)
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", propertyId);

    if (error) {
      console.error("Database error:", error);
      return { error: error.message };
    }

    // Delete photos from storage
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          const urlParts = photo.image_url.split("/properties/");
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from("properties").remove([filePath]);
          }
        } catch (storageError) {
          console.error("Error deleting photo from storage:", storageError);
          // Continue with other photos even if one fails
        }
      }
    }

    revalidatePath("/owner/properties");
    revalidatePath("/owner/dashboard");
    revalidatePath("/guest/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { error: "Failed to delete property" };
  }
}