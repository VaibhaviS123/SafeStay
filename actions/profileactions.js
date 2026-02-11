"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData) {
  try {
    const supabase = await createClient();
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return { error: "Not authenticated" };
    }

    // Get form data
    const userId = formData.get("userId");
    const full_name = formData.get("full_name");

    console.log("Updating profile:", { full_name, userId });

    // Validate required fields
    if (!full_name || full_name.trim() === "") {
      return { error: "Full name is required" };
    }

    if (!userId || userId !== user.id) {
      return { error: "Unauthorized" };
    }

    // Update user profile - ONLY full_name to avoid column errors
    const { data, error } = await supabase
      .from("users")
      .update({ 
        full_name: full_name.trim()
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return { error: error.message || "Failed to update profile" };
    }

    console.log("Profile updated successfully:", data);

    // Revalidate pages
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    
    return { success: true, data };
    
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error);
    return { error: "An unexpected error occurred" };
  }
}