"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  return { supabase, userId: user.id, orgId: profile.organization_id };
}

export async function updateProfile(formData: FormData) {
  const { supabase, userId } = await getProfile();

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
  const { supabase, orgId } = await getProfile();

  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Gallery name is required" };

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim() })
    .eq("id", orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/today");
}

export async function exportData() {
  const { supabase, orgId } = await getProfile();

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
  const { supabase, orgId } = await getProfile();

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
