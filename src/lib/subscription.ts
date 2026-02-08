import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Returns true if the organization's subscription allows writes.
 * Returns false if expired / canceled / trial ended.
 */
export async function canWrite(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) return false;

  const { data: org } = await supabase
    .from("organizations")
    .select("subscription_status, trial_ends_at")
    .eq("id", profile.organization_id)
    .single();

  if (!org) return false;

  if (org.subscription_status === "active") return true;

  if (org.subscription_status === "trialing") {
    return new Date(org.trial_ends_at) > new Date();
  }

  return false;
}

/**
 * Guard for server actions. Throws a user-friendly error if writes are blocked.
 */
export async function requireWriteAccess(): Promise<void> {
  const allowed = await canWrite();
  if (!allowed) {
    throw new Error(
      "Your trial has expired. Please upgrade to continue making changes."
    );
  }
}
