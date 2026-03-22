import { createClient } from "@/lib/supabase/server";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrencyCompact } from "@/lib/format-currency";

export async function TodayStats({ orgId }: { orgId: string }) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const [
    { count: totalClients },
    { count: totalEnquiries },
    { data: monthSales },
    { count: overdueNoteCount },
    { count: todayNoteCount },
    { count: overdueEnquiryCount },
    { count: todayEnquiryCount },
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
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .lt("follow_up_date", today),
    supabase
      .from("notes")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .eq("follow_up_date", today),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .lt("timeline", today),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .eq("timeline", today),
    getOrgCurrency(),
  ]);

  const monthTotal = (monthSales ?? []).reduce(
    (sum: number, s: any) => sum + (Number(s.amount) || 0),
    0
  );

  const dueTodayCount =
    (overdueNoteCount ?? 0) +
    (todayNoteCount ?? 0) +
    (overdueEnquiryCount ?? 0) +
    (todayEnquiryCount ?? 0);

  const stats = [
    { label: "Total Clients", value: String(totalClients ?? 0) },
    { label: "Due Today", value: String(dueTodayCount) },
    {
      label: "This Month",
      value: formatCurrencyCompact(monthTotal, currency),
    },
    { label: "Open Enquiries", value: String(totalEnquiries ?? 0) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border border-[#b2b2b1]/15 bg-[#fcf9f8] px-4 py-4"
        >
          <p className="font-body text-[11px] text-[#9e9c9c] uppercase tracking-[0.2em] font-medium">
            {stat.label}
          </p>
          <p className="mt-1.5 font-serif text-2xl font-bold text-[#323233] tracking-tight">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TodayStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border border-[#b2b2b1]/15 bg-[#fcf9f8] px-4 py-4"
        >
          <div className="h-3 w-16 bg-[#b2b2b1]/15" />
          <div className="mt-3 h-7 w-12 bg-[#b2b2b1]/15" />
        </div>
      ))}
    </div>
  );
}
