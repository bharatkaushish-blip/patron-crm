import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AnalyticsAllTime, AnalyticsAllTimeSkeleton } from "@/components/analytics/analytics-all-time";
import { AnalyticsMonth, AnalyticsMonthSkeleton } from "@/components/analytics/analytics-month";
import { AnalyticsTopClients, AnalyticsTopClientsSkeleton } from "@/components/analytics/analytics-top-clients";

export default async function AnalyticsPage() {
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

  const orgId = profile.organization_id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-serif font-bold tracking-tight text-[#323233]">
        Analytics
      </h1>

      <Suspense fallback={<AnalyticsAllTimeSkeleton />}>
        <AnalyticsAllTime orgId={orgId} />
      </Suspense>

      <Suspense fallback={<AnalyticsMonthSkeleton />}>
        <AnalyticsMonth orgId={orgId} />
      </Suspense>

      <Suspense fallback={<AnalyticsTopClientsSkeleton />}>
        <AnalyticsTopClients orgId={orgId} />
      </Suspense>
    </div>
  );
}
