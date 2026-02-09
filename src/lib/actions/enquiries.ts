"use server";

import { revalidatePath } from "next/cache";
import { requireWriteAccess } from "@/lib/subscription";
import { getAuthContext, requireMutationAccess, requireDeleteAccess } from "@/lib/auth-context";

export async function createEnquiry(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  const clientId = formData.get("client_id") as string;

  const inventoryItemId =
    (formData.get("inventory_item_id") as string) || null;

  const { error } = await supabase.from("enquiries").insert({
    client_id: clientId,
    organization_id: orgId,
    size: (formData.get("size") as string) || null,
    budget: (formData.get("budget") as string) || null,
    artist: (formData.get("artist") as string) || null,
    timeline: (formData.get("timeline") as string) || null,
    work_type: (formData.get("work_type") as string) || null,
    notes: (formData.get("notes") as string) || null,
    inventory_item_id: inventoryItemId,
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
  await requireMutationAccess();
  const { supabase } = await getAuthContext();

  const enquiryId = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;

  const inventoryItemId =
    (formData.get("inventory_item_id") as string) || null;

  const { error } = await supabase
    .from("enquiries")
    .update({
      size: (formData.get("size") as string) || null,
      budget: (formData.get("budget") as string) || null,
      artist: (formData.get("artist") as string) || null,
      timeline: (formData.get("timeline") as string) || null,
      work_type: (formData.get("work_type") as string) || null,
      notes: (formData.get("notes") as string) || null,
      inventory_item_id: inventoryItemId,
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
  await requireDeleteAccess();
  const { supabase } = await getAuthContext();

  const { error } = await supabase.from("enquiries").delete().eq("id", enquiryId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/enquiries");
}
