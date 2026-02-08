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

export async function createSale(formData: FormData) {
  await requireWriteAccess();
  const { supabase, orgId } = await getProfile();

  const clientId = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;

  const { error } = await supabase.from("sales").insert({
    client_id: clientId,
    organization_id: orgId,
    artwork_name: (formData.get("artwork_name") as string) || null,
    amount: amountStr ? parseFloat(amountStr) : null,
    sale_date:
      (formData.get("sale_date") as string) ||
      new Date().toISOString().split("T")[0],
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
  revalidatePath("/clients");
}

export async function updateSale(formData: FormData) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const saleId = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;

  const { error } = await supabase
    .from("sales")
    .update({
      artwork_name: (formData.get("artwork_name") as string) || null,
      amount: amountStr ? parseFloat(amountStr) : null,
      sale_date:
        (formData.get("sale_date") as string) ||
        new Date().toISOString().split("T")[0],
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", saleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteSale(saleId: string, clientId: string) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const { error } = await supabase.from("sales").delete().eq("id", saleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
}
