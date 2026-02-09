import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Role,
  UserPermissions,
  extractRoleData,
} from "@/lib/permissions";

export interface AuthContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  orgId: string;
  role: Role;
  isSuperadmin: boolean;
  permissions: UserPermissions;
}

export async function getAuthContext(): Promise<AuthContext> {
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

  // Role fields may not exist before migration 007 is applied
  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, is_superadmin, permissions")
    .eq("id", user.id)
    .single()
    .then((res) => (res.error ? { data: null } : res));

  const { role, isSuperadmin, permissions } = extractRoleData(roleProfile);

  return {
    supabase,
    userId: user.id,
    orgId: profile.organization_id,
    role,
    isSuperadmin,
    permissions,
  };
}

export async function requireMutationAccess(): Promise<void> {
  const { permissions } = await getAuthContext();
  if (permissions.read_only) {
    throw new Error("You don't have permission to make changes.");
  }
}

export async function requireDeleteAccess(): Promise<void> {
  const { permissions } = await getAuthContext();
  if (!permissions.can_delete) {
    throw new Error("You don't have permission to delete.");
  }
}

export async function requireAdminRole(): Promise<void> {
  const { role } = await getAuthContext();
  if (role === "user") {
    throw new Error("Admin access required.");
  }
}

export async function requireSuperadmin(): Promise<void> {
  const { isSuperadmin } = await getAuthContext();
  if (!isSuperadmin) {
    throw new Error("Superadmin access required.");
  }
}
