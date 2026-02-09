export type Role = "superadmin" | "admin" | "user";

export interface UserPermissions {
  can_delete: boolean;
  can_access_settings: boolean;
  can_see_pricing: boolean;
  read_only: boolean;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  role: Role;
  is_superadmin: boolean;
  permissions: UserPermissions;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  can_delete: true,
  can_access_settings: true,
  can_see_pricing: true,
  read_only: false,
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  can_delete: false,
  can_access_settings: false,
  can_see_pricing: false,
  read_only: false,
};

export function getEffectivePermissions(role: Role, dbPermissions: UserPermissions): UserPermissions {
  if (role === "admin" || role === "superadmin") {
    return DEFAULT_ADMIN_PERMISSIONS;
  }
  return dbPermissions;
}

export function canMutate(role: Role, perms: UserPermissions): boolean {
  if (role === "admin" || role === "superadmin") return true;
  return !perms.read_only;
}

export function canDelete(role: Role, perms: UserPermissions): boolean {
  if (role === "admin" || role === "superadmin") return true;
  return perms.can_delete;
}

export function canSeePricing(role: Role, perms: UserPermissions): boolean {
  if (role === "admin" || role === "superadmin") return true;
  return perms.can_see_pricing;
}

export function canAccessSettings(role: Role, perms: UserPermissions): boolean {
  if (role === "admin" || role === "superadmin") return true;
  return perms.can_access_settings;
}

/**
 * Safely extract role data from a profile record.
 * Returns admin defaults if role columns don't exist yet (pre-migration).
 */
export function extractRoleData(profile: Record<string, unknown> | null): {
  role: Role;
  isSuperadmin: boolean;
  permissions: UserPermissions;
} {
  const role = (profile?.role as Role) || "admin";
  const isSuperadmin = profile?.is_superadmin === true;
  const perms = getEffectivePermissions(
    role,
    (profile?.permissions as UserPermissions) || DEFAULT_ADMIN_PERMISSIONS
  );
  return { role, isSuperadmin, permissions: perms };
}
