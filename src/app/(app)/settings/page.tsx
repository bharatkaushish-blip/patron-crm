import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { GallerySettings } from "@/components/settings/gallery-settings";
import { DataSection } from "@/components/settings/data-section";
import { AccountSection } from "@/components/settings/account-section";

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

  const { data: org } = await supabase
    .from("organizations")
    .select("name, subscription_status, trial_ends_at")
    .eq("id", profile.organization_id)
    .single();

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

        <GallerySettings name={org?.name || ""} />

        <DataSection />

        <AccountSection
          subscriptionStatus={org?.subscription_status || "trialing"}
          trialEndsAt={org?.trial_ends_at || ""}
        />
      </div>
    </div>
  );
}
