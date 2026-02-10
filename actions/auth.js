"use server";

import { createClient } from "@/lib/supabase/server";
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

  // Create auth user
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!data.user) {
    return { error: "Signup failed" };
  }

  // Use UPSERT instead of INSERT to handle duplicates
  const { error: profileError } = await supabase
    .from("users")
    .upsert(
      {
        id: data.user.id,
        full_name: fullName,
        role,
      },
      {
        onConflict: 'id'
      }
    );

  if (profileError) {
    return { error: profileError.message };
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

  // Redirect based on role
  return { 
    success: true, 
    role: userData.role 
  };
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}