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
  return { supabase, userId: user.id, orgId: profile.organization_id };
}

export async function createClientAction(formData: FormData) {
  await requireWriteAccess();
  const { supabase, orgId } = await getProfile();

  const tags = formData.get("tags") as string;
  const parsedTags = tags ? JSON.parse(tags) : [];

  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: orgId,
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      location: (formData.get("location") as string) || null,
      country: (formData.get("country") as string) || null,
      age_range: (formData.get("age_range") as string) || null,
      tags: parsedTags,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(formData: FormData) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const id = formData.get("id") as string;
  const tags = formData.get("tags") as string;
  const parsedTags = tags ? JSON.parse(tags) : [];

  const { error } = await supabase
    .from("clients")
    .update({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      location: (formData.get("location") as string) || null,
      country: (formData.get("country") as string) || null,
      age_range: (formData.get("age_range") as string) || null,
      tags: parsedTags,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(clientId: string) {
  await requireWriteAccess();
  const { supabase } = await getProfile();

  const { error } = await supabase
    .from("clients")
    .update({ is_deleted: true })
    .eq("id", clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function getOrgTags() {
  const { supabase, orgId } = await getProfile();

  const { data } = await supabase.rpc("get_org_tags", { org_id: orgId });
  return data ?? [];
}
