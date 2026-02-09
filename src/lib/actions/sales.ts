"use server";

import { revalidatePath } from "next/cache";
import { requireWriteAccess } from "@/lib/subscription";
import { getAuthContext, requireMutationAccess, requireDeleteAccess } from "@/lib/auth-context";

export async function createSale(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  const clientId = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;
  const inventoryItemId =
    (formData.get("inventory_item_id") as string) || null;

  const { error } = await supabase.from("sales").insert({
    client_id: clientId,
    organization_id: orgId,
    artwork_name: (formData.get("artwork_name") as string) || null,
    amount: amountStr ? parseFloat(amountStr) : null,
    sale_date:
      (formData.get("sale_date") as string) ||
      new Date().toISOString().split("T")[0],
    notes: (formData.get("notes") as string) || null,
    inventory_item_id: inventoryItemId,
  });

  if (error) {
    return { error: error.message };
  }

  // Mark linked inventory item as sold
  if (inventoryItemId) {
    await supabase
      .from("inventory")
      .update({ status: "sold" })
      .eq("id", inventoryItemId);
    revalidatePath("/inventory");
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
  await requireMutationAccess();
  const { supabase } = await getAuthContext();

  const saleId = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;
  const inventoryItemId =
    (formData.get("inventory_item_id") as string) || null;

  const { error } = await supabase
    .from("sales")
    .update({
      artwork_name: (formData.get("artwork_name") as string) || null,
      amount: amountStr ? parseFloat(amountStr) : null,
      sale_date:
        (formData.get("sale_date") as string) ||
        new Date().toISOString().split("T")[0],
      notes: (formData.get("notes") as string) || null,
      inventory_item_id: inventoryItemId,
    })
    .eq("id", saleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteSale(saleId: string, clientId: string) {
  await requireWriteAccess();
  await requireDeleteAccess();
  const { supabase } = await getAuthContext();

  const { error } = await supabase.from("sales").delete().eq("id", saleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
}
