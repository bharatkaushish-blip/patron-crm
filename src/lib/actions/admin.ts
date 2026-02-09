"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/auth-context";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/permissions";

export async function getAllOrganizations() {
  await requireSuperadmin();

  const adminClient = createAdminClient();

  const { data: orgs } = await adminClient
    .from("organizations")
    .select("id, name, subscription_status, created_at")
    .order("created_at", { ascending: false });

  if (!orgs) return [];

  // Get member count for each org
  const results = await Promise.all(
    orgs.map(async (org) => {
      const { count } = await adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org.id);

      return {
        ...org,
        member_count: count || 0,
      };
    })
  );

  return results;
}

export async function getOrgMembers(orgId: string) {
  await requireSuperadmin();

  const adminClient = createAdminClient();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, is_superadmin, created_at")
    .eq("organization_id", orgId)
    .order("created_at");

  if (!profiles) return [];

  const members = await Promise.all(
    profiles.map(async (profile) => {
      const {
        data: { user },
      } = await adminClient.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        email: user?.email || "",
      };
    })
  );

  return members;
}

export async function changeUserRole(userId: string, newRole: Role) {
  await requireSuperadmin();

  if (newRole === "superadmin") {
    throw new Error("Cannot promote to superadmin.");
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
}
