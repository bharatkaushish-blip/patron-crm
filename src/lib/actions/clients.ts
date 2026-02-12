"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWriteAccess } from "@/lib/subscription";
import { getAuthContext, requireMutationAccess, requireDeleteAccess } from "@/lib/auth-context";

export async function createClientAction(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  const tags = formData.get("tags") as string;
  const parsedTags = tags ? JSON.parse(tags) : [];

  const photoUrl = (formData.get("photo_url") as string) || null;
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
      ...(photoUrl ? { photo_url: photoUrl } : {}),
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
  await requireMutationAccess();
  const { supabase } = await getAuthContext();

  const id = formData.get("id") as string;
  const tags = formData.get("tags") as string;
  const parsedTags = tags ? JSON.parse(tags) : [];

  const photoUrl = (formData.get("photo_url") as string) || null;
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
      ...(photoUrl ? { photo_url: photoUrl } : {}),
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
  await requireDeleteAccess();
  const { supabase } = await getAuthContext();

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
  const { supabase, orgId } = await getAuthContext();

  const { data } = await supabase.rpc("get_org_tags", { org_id: orgId });
  return data ?? [];
}

export async function searchClients(query: string) {
  const { supabase, orgId } = await getAuthContext();

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone, location")
    .eq("organization_id", orgId)
    .neq("is_deleted", true)
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(10);

  if (error) return [];
  return data ?? [];
}

export async function createClientAndReturnId(formData: FormData) {
  await requireWriteAccess();
  await requireMutationAccess();
  const { supabase, orgId } = await getAuthContext();

  const photoUrl = (formData.get("photo_url") as string) || null;
  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: orgId,
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      ...(photoUrl ? { photo_url: photoUrl } : {}),
    })
    .select("id, name")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/clients");
  return { id: data.id, name: data.name };
}
