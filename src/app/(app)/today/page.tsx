import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { FollowUpSection } from "@/components/today/follow-up-section";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrencyCompact } from "@/lib/format-currency";
import { getOrgCurrency } from "@/lib/actions/settings";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  const orgId = profile.organization_id;

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, permissions")
    .eq("id", user.id)
    .single()
    .then((res: any) => (res.error ? { data: null } : res));

  const { extractRoleData, canMutate } = await import("@/lib/permissions");
  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutate(role, perms);

  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  // Fetch all data in parallel
  const [
    { count: totalClients },
    { count: totalEnquiries },
    { data: monthSales },
    { data: overdueNotes },
    { data: dueTodayNotes },
    { data: overdueEnquiries },
    { data: dueTodayEnquiries },
    { data: recentClients },
    currency,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .neq("is_deleted", true),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("sales")
      .select("amount")
      .eq("organization_id", orgId)
      .gte("sale_date", monthStart),
    supabase
      .from("notes")
      .select("id, content, follow_up_date, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .lt("follow_up_date", today)
      .order("follow_up_date", { ascending: true }),
    supabase
      .from("notes")
      .select("id, content, follow_up_date, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .eq("follow_up_date", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("enquiries")
      .select("id, notes, budget, artist, timeline, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .lt("timeline", today)
      .order("timeline", { ascending: true }),
    supabase
      .from("enquiries")
      .select("id, notes, budget, artist, timeline, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .eq("timeline", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select("id, name, location, tags")
      .eq("organization_id", orgId)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false })
      .limit(5),
    getOrgCurrency(),
  ]);

  // Map enquiry items to the same shape as note follow-ups
  function mapEnquiryToFollowUp(e: any) {
    const parts = [
      e.budget ? `Budget: ${e.budget}` : null,
      e.artist ? `Artist: ${e.artist}` : null,
    ].filter(Boolean);
    const content = e.notes || parts.join(" · ") || "Enquiry follow-up";
    return {
      id: e.id,
      content,
      follow_up_date: e.timeline,
      type: "enquiry" as const,
      clients: e.clients,
    };
  }

  const overdue = [
    ...(overdueNotes ?? []).map((n: any) => ({ ...n, type: "note" as const })),
    ...(overdueEnquiries ?? []).map(mapEnquiryToFollowUp),
  ];

  const dueToday = [
    ...(dueTodayNotes ?? []).map((n: any) => ({ ...n, type: "note" as const })),
    ...(dueTodayEnquiries ?? []).map(mapEnquiryToFollowUp),
  ];

  const monthTotal = (monthSales ?? []).reduce(
    (sum: number, s: any) => sum + (Number(s.amount) || 0),
    0
  );

  const dueTodayCount = overdue.length + dueToday.length;
  const hasFollowUps = dueTodayCount > 0;

  const stats = [
    { label: "Total Clients", value: String(totalClients ?? 0) },
    { label: "Due Today", value: String(dueTodayCount) },
    {
      label: "This Month",
      value: monthTotal > 0 ? formatCurrencyCompact(monthTotal, currency) : formatCurrencyCompact(0, currency),
    },
    { label: "Open Enquiries", value: String(totalEnquiries ?? 0) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-4"
          >
            <p className="text-[11px] text-neutral-400 uppercase tracking-wide font-medium">
              {stat.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-neutral-900 tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Follow-ups column */}
        <div>
          {!hasFollowUps ? (
            <EmptyState
              title="All caught up!"
              description="No follow-ups due today. Add a client to get started."
              action={{ label: "Add a new client", href: "/clients/new" }}
            />
          ) : (
            <div className="space-y-6">
              <FollowUpSection
                title="Overdue"
                items={overdue as never[]}
                isOverdue
                canMutate={userCanMutate}
              />
              <FollowUpSection
                title="Today's Follow-ups"
                items={dueToday as never[]}
                canMutate={userCanMutate}
              />
            </div>
          )}
        </div>

        {/* Recent clients column */}
        <div>
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
            Recent Clients
          </h2>
          <div className="mt-3 space-y-2.5">
            {recentClients && recentClients.length > 0 ? (
              recentClients.map((client: any) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
                    {getInitials(client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {client.name}
                    </p>
                    {client.location && (
                      <p className="text-xs text-neutral-400">
                        {client.location}
                      </p>
                    )}
                  </div>
                  {client.tags && client.tags.length > 0 && (
                    <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                      {client.tags[0]}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-neutral-400">
                No clients yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
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
