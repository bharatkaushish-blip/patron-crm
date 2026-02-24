import { createClient } from "@/lib/supabase/server";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrencyCompact } from "@/lib/format-currency";
import { StatCard } from "./stat-card";

export async function AnalyticsAllTime({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const [clientsRes, enquiriesRes, salesRes, currency] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .neq("is_deleted", true),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase.from("sales").select("amount").eq("organization_id", orgId),
    getOrgCurrency(),
  ]);

  const totalClients = clientsRes.count ?? 0;
  const totalEnquiries = enquiriesRes.count ?? 0;
  const allSales = salesRes.data ?? [];
  const totalSalesCount = allSales.length;
  const totalSaleAmount = allSales.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );
  const avgSaleValue =
    totalSalesCount > 0 ? totalSaleAmount / totalSalesCount : 0;

  function fmtCurrency(amount: number) {
    return formatCurrencyCompact(amount, currency);
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total clients" value={totalClients} />
        <StatCard label="Enquiries pending" value={totalEnquiries} />
        <StatCard label="Total sales" value={totalSalesCount} />
        <StatCard label="Sale amount" value={fmtCurrency(totalSaleAmount)} />
      </div>
      <div className="mt-3">
        <StatCard label="Avg sale value" value={fmtCurrency(avgSaleValue)} />
      </div>
    </>
  );
}

export function AnalyticsAllTimeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
          >
            <div className="h-3 w-16 bg-neutral-200 rounded" />
            <div className="mt-2 h-6 w-12 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
          <div className="h-3 w-20 bg-neutral-200 rounded" />
          <div className="mt-2 h-6 w-16 bg-neutral-200 rounded" />
        </div>
      </div>
    </div>
  );
}
