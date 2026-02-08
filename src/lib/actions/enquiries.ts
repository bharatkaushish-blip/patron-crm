"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/subscription";

async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/onboarding");
  return { supabase, orgId: profile.organization_id };
}

export async function createEnquiry(formData: FormData) {
  await requireWriteAccess();
  const { supabase, orgId } = await getProfile();

  const clientId = formData.get("client_id") as string;

  const { error } = await supabase.from("enquiries").insert({
    client_id: clientId,
    organization_id: orgId,
    size: (formData.get("size") as string) || null,
    budget: (formData.get("budget") as string) || null,
    artist: (formData.get("artist") as string) || null,
    timeline: (formData.get("timeline") as string) || null,
    work_type: (formData.get("work_type") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Touch client's updated_at
  await supabase
    .from("clients")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", clientId);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/enquiries");
  revalidatePath("/clients");
}

export async function updateEnquiry(formData: FormData) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const enquiryId = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;

  const { error } = await supabase
    .from("enquiries")
    .update({
      size: (formData.get("size") as string) || null,
      budget: (formData.get("budget") as string) || null,
      artist: (formData.get("artist") as string) || null,
      timeline: (formData.get("timeline") as string) || null,
      work_type: (formData.get("work_type") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", enquiryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/enquiries");
}

export async function deleteEnquiry(enquiryId: string, clientId: string) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const { error } = await supabase.from("enquiries").delete().eq("id", enquiryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/enquiries");
}
