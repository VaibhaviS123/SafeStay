import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditPropertyForm from "@/components/forms/EditPropertyForm";

export default async function EditPropertyPage({ params }) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the property with its photos
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (
        id,
        image_url,
        display_order
      )
    `)
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !property) {
    redirect("/owner/dashboard");
  }

  return <EditPropertyForm property={property} />;
}