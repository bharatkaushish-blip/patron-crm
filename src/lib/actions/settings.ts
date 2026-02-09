"use server";

import { revalidatePath } from "next/cache";
import { requireWriteAccess } from "@/lib/subscription";
import { getAuthContext, requireMutationAccess, requireAdminRole } from "@/lib/auth-context";

export async function updateProfile(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, userId } = await getAuthContext();

  const fullName = formData.get("full_name") as string;
  const timezone = formData.get("timezone") as string;
  const reminderTime = formData.get("reminder_time") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      timezone: timezone || "Asia/Kolkata",
      reminder_time: reminderTime || "09:00",
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
}

export async function updateOrganization(formData: FormData) {
  await requireWriteAccess();
  await requireAdminRole();
  const { supabase, orgId } = await getAuthContext();

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Gallery name is required" };

  const currency = (formData.get("currency") as string) || "INR";

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim(), currency })
    .eq("id", orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/inventory");
  revalidatePath("/clients");
  revalidatePath("/analytics");
  revalidatePath("/search");
}

export async function getOrgCurrency(): Promise<string> {
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase
    .from("organizations")
    .select("currency")
    .eq("id", orgId)
    .single();

  return data?.currency || "INR";
}

export async function exportData() {
  await requireAdminRole();
  const { supabase, orgId } = await getAuthContext();

  const [clientsRes, notesRes, salesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("organization_id", orgId)
      .eq("is_deleted", false)
      .order("name"),
    supabase
      .from("notes")
      .select("*, clients!inner(name)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("sales")
      .select("*, clients!inner(name)")
      .eq("organization_id", orgId)
      .order("sale_date", { ascending: false }),
  ]);

  return {
    clients: clientsRes.data || [],
    notes: notesRes.data || [],
    sales: salesRes.data || [],
  };
}

export async function importClients(
  rows: { name: string; phone?: string; email?: string; location?: string; country?: string; tags?: string }[]
) {
  await requireWriteAccess();
  await requireAdminRole();
  const { supabase, orgId } = await getAuthContext();

  let imported = 0;
  let errors: string[] = [];

  for (const row of rows) {
    if (!row.name?.trim()) {
      errors.push("Skipped row with no name");
      continue;
    }

    const tags = row.tags
      ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("clients").insert({
      organization_id: orgId,
      name: row.name.trim(),
      phone: row.phone?.trim() || null,
      email: row.email?.trim() || null,
      location: row.location?.trim() || null,
      country: row.country?.trim() || null,
      tags,
    });

    if (error) {
      errors.push(`Failed to import "${row.name}": ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePath("/clients");
  revalidatePath("/settings");
  return { imported, errors };
}
