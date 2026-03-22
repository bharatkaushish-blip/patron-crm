import { createClient } from "@/lib/supabase/server";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrencyCompact } from "@/lib/format-currency";
import { StatCard } from "./stat-card";

export async function AnalyticsMonth({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [monthClientsRes, monthEnquiriesRes, monthSalesRes, currency] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .neq("is_deleted", true)
        .gte("created_at", monthStart),
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .gte("created_at", monthStart),
      supabase
        .from("sales")
        .select("amount")
        .eq("organization_id", orgId)
        .gte("sale_date", monthStart),
      getOrgCurrency(),
    ]);

  const monthNewClients = monthClientsRes.count ?? 0;
  const monthNewEnquiries = monthEnquiriesRes.count ?? 0;
  const monthSales = monthSalesRes.data ?? [];
  const monthSaleAmount = monthSales.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );

  const monthName = now.toLocaleString("en-IN", { month: "long" });

  return (
    <>
      <h2 className="mt-8 text-sm font-body font-medium text-[#5f5f5f] uppercase tracking-wider">
        {monthName} {now.getFullYear()}
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard label="New clients" value={monthNewClients} />
        <StatCard label="New enquiries" value={monthNewEnquiries} />
        <StatCard
          label="Sales"
          value={formatCurrencyCompact(monthSaleAmount, currency)}
        />
      </div>
    </>
  );
}

export function AnalyticsMonthSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mt-8 h-4 w-28 bg-[#b2b2b1]/15" />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-[#b2b2b1]/15 bg-[#ffffff] px-4 py-3"
          >
            <div className="h-3 w-16 bg-[#b2b2b1]/15" />
            <div className="mt-2 h-6 w-12 bg-[#b2b2b1]/15" />
          </div>
        ))}
      </div>
    </div>
  );
}
