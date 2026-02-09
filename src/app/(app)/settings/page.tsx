import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { GallerySettings } from "@/components/settings/gallery-settings";
import { DataSection } from "@/components/settings/data-section";
import { AccountSection } from "@/components/settings/account-section";
import { TeamSection } from "@/components/settings/team-section";
import { getTeamMembers, getPendingInvitations } from "@/lib/actions/invitations";
import { extractRoleData } from "@/lib/permissions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, timezone, reminder_time, organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/onboarding");

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, is_superadmin, permissions")
    .eq("id", user.id)
    .single()
    .then((res) => (res.error ? { data: null } : res));

  const { data: org } = await supabase
    .from("organizations")
    .select("name, subscription_status, trial_ends_at, currency")
    .eq("id", profile.organization_id)
    .single();

  const { role } = extractRoleData(roleProfile);
  const isAdmin = role === "admin" || role === "superadmin";

  // Fetch team data only for admins
  let members: Awaited<ReturnType<typeof getTeamMembers>> = [];
  let pendingInvites: Awaited<ReturnType<typeof getPendingInvitations>> = [];
  if (isAdmin) {
    [members, pendingInvites] = await Promise.all([
      getTeamMembers(),
      getPendingInvitations(),
    ]);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-6">
        Settings
      </h1>

      <div className="space-y-8">
        <ProfileSettings
          fullName={profile.full_name || ""}
          email={user.email || ""}
          timezone={profile.timezone || "Asia/Kolkata"}
          reminderTime={profile.reminder_time || "09:00"}
        />

        {isAdmin && (
          <GallerySettings name={org?.name || ""} currency={org?.currency || "INR"} />
        )}

        {isAdmin && (
          <TeamSection
            members={members as any}
            pendingInvites={pendingInvites as any}
            currentUserId={user.id}
          />
        )}

        {isAdmin && <DataSection />}

        <AccountSection
          subscriptionStatus={org?.subscription_status || "trialing"}
          trialEndsAt={org?.trial_ends_at || ""}
        />
      </div>
    </div>
  );
}
