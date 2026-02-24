import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { TodayStats, TodayStatsSkeleton } from "@/components/today/today-stats";
import { TodayFollowUps, TodayFollowUpsSkeleton } from "@/components/today/today-follow-ups";
import { TodayRecentClients, TodayRecentClientsSkeleton } from "@/components/today/today-recent-clients";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role, permissions")
    .eq("id", user.id)
    .single()
    .then((res: any) => (res.error ? { data: null } : res));

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  const orgId = profile.organization_id;

  const { extractRoleData, canMutate } = await import("@/lib/permissions");
  const { role, permissions: perms } = extractRoleData(profile);
  const userCanMutate = canMutate(role, perms);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <Suspense fallback={<TodayStatsSkeleton />}>
        <TodayStats orgId={orgId} />
      </Suspense>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Suspense fallback={<TodayFollowUpsSkeleton />}>
          <TodayFollowUps orgId={orgId} canMutate={userCanMutate} />
        </Suspense>

        <Suspense fallback={<TodayRecentClientsSkeleton />}>
          <TodayRecentClients orgId={orgId} />
        </Suspense>
      </div>

      {userCanMutate && (
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 md:bottom-6">
          <Link
            href="/clients/new"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
            title="Add client"
          >
            <UserPlus className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
