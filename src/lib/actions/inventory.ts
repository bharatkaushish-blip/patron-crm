"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/subscription";
import { getAuthContext, requireMutationAccess, requireDeleteAccess } from "@/lib/auth-context";

export async function createInventoryItem(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  const yearStr = formData.get("year") as string;
  const askingPriceStr = formData.get("asking_price") as string;
  const reservePriceStr = formData.get("reserve_price") as string;

  const { data, error } = await supabase
    .from("inventory")
    .insert({
      organization_id: orgId,
      title: formData.get("title") as string,
      artist: (formData.get("artist") as string) || null,
      medium: (formData.get("medium") as string) || null,
      dimensions: (formData.get("dimensions") as string) || null,
      year: yearStr ? parseInt(yearStr, 10) : null,
      image_path: (formData.get("image_path") as string) || null,
      asking_price: askingPriceStr ? parseFloat(askingPriceStr) : null,
      reserve_price: reservePriceStr ? parseFloat(reservePriceStr) : null,
      status: (formData.get("status") as string) || "available",
      source: (formData.get("source") as string) || "owned",
      consignor: (formData.get("consignor") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventory");
  redirect(`/inventory/${data.id}`);
}

export async function updateInventoryItem(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase } = await getAuthContext();

  const id = formData.get("id") as string;
  const yearStr = formData.get("year") as string;
  const askingPriceStr = formData.get("asking_price") as string;
  const reservePriceStr = formData.get("reserve_price") as string;

  const { error } = await supabase
    .from("inventory")
    .update({
      title: formData.get("title") as string,
      artist: (formData.get("artist") as string) || null,
      medium: (formData.get("medium") as string) || null,
      dimensions: (formData.get("dimensions") as string) || null,
      year: yearStr ? parseInt(yearStr, 10) : null,
      image_path: (formData.get("image_path") as string) || null,
      asking_price: askingPriceStr ? parseFloat(askingPriceStr) : null,
      reserve_price: reservePriceStr ? parseFloat(reservePriceStr) : null,
      status: (formData.get("status") as string) || "available",
      source: (formData.get("source") as string) || "owned",
      consignor: (formData.get("consignor") as string) || null,
      notes: (formData.get("notes") as string) || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/inventory/${id}`);
  revalidatePath("/inventory");
  redirect(`/inventory/${id}`);
}

export async function deleteInventoryItem(itemId: string) {
  await requireWriteAccess();
  await requireDeleteAccess();
  const { supabase } = await getAuthContext();

  const { error } = await supabase
    .from("inventory")
    .update({ is_deleted: true })
    .eq("id", itemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function getInventoryItems(query?: string) {
  const { supabase, orgId } = await getAuthContext();

  let q = supabase
    .from("inventory")
    .select("*")
    .eq("organization_id", orgId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (query && query.length >= 2) {
    const pattern = `%${query}%`;
    q = q.or(
      `title.ilike.${pattern},artist.ilike.${pattern},medium.ilike.${pattern},notes.ilike.${pattern}`
    );
  }

  const { data } = await q;
  return data ?? [];
}

export async function getInventoryItem(id: string) {
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", id)
    .eq("organization_id", orgId)
    .eq("is_deleted", false)
    .single();

  return data;
}

export async function getAvailableInventoryItems() {
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase
    .from("inventory")
    .select("id, title, artist, asking_price, dimensions, status")
    .eq("organization_id", orgId)
    .eq("is_deleted", false)
    .eq("status", "available")
    .order("title");

  return data ?? [];
}

export async function getOrgArtists(): Promise<string[]> {
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase.rpc("get_org_artists", { org_id: orgId });
  return (data ?? []).map((r: { artist: string }) => r.artist);
}

export async function getOrgMediums(): Promise<string[]> {
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase.rpc("get_org_mediums", { org_id: orgId });
  return (data ?? []).map((r: { medium: string }) => r.medium);
}

export async function importInventoryItems(
  rows: {
    title: string;
    artist?: string;
    medium?: string;
    dimensions?: string;
    year?: string;
    asking_price?: string;
    reserve_price?: string;
    status?: string;
    source?: string;
    consignor?: string;
    notes?: string;
  }[]
): Promise<{ imported: number; errors: string[] }> {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  let imported = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.title?.trim()) {
      errors.push("Skipped row with no title");
      continue;
    }

    const yearVal = row.year?.trim() ? parseInt(row.year.trim(), 10) : null;
    const askingPrice = row.asking_price?.trim()
      ? parseFloat(row.asking_price.trim())
      : null;
    const reservePrice = row.reserve_price?.trim()
      ? parseFloat(row.reserve_price.trim())
      : null;

    const status = row.status?.trim().toLowerCase() || "available";
    const source = row.source?.trim().toLowerCase() || "owned";

    const { error } = await supabase.from("inventory").insert({
      organization_id: orgId,
      title: row.title.trim(),
      artist: row.artist?.trim() || null,
      medium: row.medium?.trim() || null,
      dimensions: row.dimensions?.trim() || null,
      year: yearVal && !isNaN(yearVal) ? yearVal : null,
      asking_price: askingPrice && !isNaN(askingPrice) ? askingPrice : null,
      reserve_price: reservePrice && !isNaN(reservePrice) ? reservePrice : null,
      status: ["available", "reserved", "sold", "not_for_sale"].includes(status)
        ? status
        : "available",
      source: ["owned", "consignment"].includes(source) ? source : "owned",
      consignor: row.consignor?.trim() || null,
      notes: row.notes?.trim() || null,
    });

    if (error) {
      errors.push(`Failed to import "${row.title}": ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePath("/inventory");
  return { imported, errors };
}
