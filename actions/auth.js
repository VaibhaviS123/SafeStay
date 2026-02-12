"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export async function registerUser(formData) {
  const supabase = await createClient();

  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");

  if (!fullName || !email || !password) {
    return { error: "All fields are required" };
  }

  // Create auth user (without metadata since we're not using trigger)
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    console.error("Auth error:", authError);
    return { error: authError.message };
  }

  if (!data.user) {
    return { error: "Signup failed" };
  }

  // Use service role to bypass RLS and insert user profile
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Insert into users table with admin client
  const { error: profileError } = await supabaseAdmin
    .from("users")
    .insert({
      id: data.user.id,
      full_name: fullName,
      email: email,
      role: role || 'guest',
    });

  if (profileError) {
    console.error("Profile error:", profileError);
    return { error: `Database error: ${profileError.message}` };
  }

  return { success: true };
}

export async function loginUser(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Login failed" };
  }

  // Get user role from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (userError) {
    return { error: "Failed to fetch user data" };
  }

  return { 
    success: true, 
    role: userData.role 
  };
}

export async function changePassword(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  if (!email || !currentPassword || !newPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  // First, verify the current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect" };
  }

  // If current password is correct, update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    console.error("Update password error:", updateError);
    return { error: updateError.message };
  }

  return { success: true };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}