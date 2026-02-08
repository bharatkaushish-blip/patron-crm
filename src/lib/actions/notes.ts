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

export async function createNote(formData: FormData) {
  await requireWriteAccess();
  const { supabase, orgId } = await getProfile();

  const clientId = formData.get("client_id") as string;
  const content = formData.get("content") as string;
  const followUpDate = (formData.get("follow_up_date") as string) || null;

  const { error } = await supabase.from("notes").insert({
    client_id: clientId,
    organization_id: orgId,
    content,
    follow_up_date: followUpDate,
    follow_up_status: followUpDate ? "pending" : null,
  });

  if (error) {
    return { error: error.message };
  }

  // Touch client's updated_at so it sorts to top of list
  await supabase
    .from("clients")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", clientId);

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/today");
  revalidatePath("/clients");
}

export async function updateNote(noteId: string, content: string, clientId: string) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const { error } = await supabase
    .from("notes")
    .update({ content })
    .eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteNote(noteId: string, clientId: string) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/today");
}

export async function markFollowUpDone(noteId: string, clientId?: string) {
  const supabase = (await getProfile()).supabase;

  const { error } = await supabase
    .from("notes")
    .update({ follow_up_status: "done" })
    .eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/today");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}

export async function rescheduleFollowUp(noteId: string, newDate: string, clientId?: string) {
  const supabase = (await getProfile()).supabase;

  const { error } = await supabase
    .from("notes")
    .update({ follow_up_date: newDate })
    .eq("id", noteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/today");
  if (clientId) revalidatePath(`/clients/${clientId}`);
}
