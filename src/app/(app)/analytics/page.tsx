import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrencyCompact } from "@/lib/format-currency";

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
  const currency = await getOrgCurrency();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // Fetch all data in parallel
  const [
    clientsRes,
    enquiriesRes,
    salesRes,
    monthClientsRes,
    monthEnquiriesRes,
    monthSalesRes,
    topClientsRes,
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
      .eq("organization_id", orgId),
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
    supabase
      .from("sales")
      .select("amount, client_id, clients!inner(name)")
      .eq("organization_id", orgId)
      .order("amount", { ascending: false }),
  ]);

  const totalClients = clientsRes.count ?? 0;
  const totalEnquiries = enquiriesRes.count ?? 0;

  const allSales = salesRes.data ?? [];
  const totalSalesCount = allSales.length;
  const totalSaleAmount = allSales.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );
  const avgSaleValue = totalSalesCount > 0 ? totalSaleAmount / totalSalesCount : 0;

  const monthNewClients = monthClientsRes.count ?? 0;
  const monthNewEnquiries = monthEnquiriesRes.count ?? 0;
  const monthSales = monthSalesRes.data ?? [];
  const monthSaleAmount = monthSales.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0
  );

  // Aggregate top clients by total sale amount
  const clientTotals = new Map<string, { name: string; id: string; total: number }>();
  for (const sale of topClientsRes.data ?? []) {
    const cid = sale.client_id;
    const clientName = (sale.clients as any)?.name ?? "Unknown";
    const existing = clientTotals.get(cid);
    if (existing) {
      existing.total += Number(sale.amount) || 0;
    } else {
      clientTotals.set(cid, { name: clientName, id: cid, total: Number(sale.amount) || 0 });
    }
  }
  const topClients = Array.from(clientTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const monthName = now.toLocaleString("en-IN", { month: "long" });

  function fmtCurrency(amount: number) {
    return formatCurrencyCompact(amount, currency);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Analytics
      </h1>

      {/* All-time stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total clients" value={totalClients} />
        <StatCard label="Enquiries pending" value={totalEnquiries} />
        <StatCard label="Total sales" value={totalSalesCount} />
        <StatCard label="Sale amount" value={fmtCurrency(totalSaleAmount)} />
      </div>

      {/* Average sale */}
      <div className="mt-3">
        <StatCard label="Avg sale value" value={fmtCurrency(avgSaleValue)} />
      </div>

      {/* This month */}
      <h2 className="mt-8 text-sm font-medium text-neutral-500 uppercase tracking-wider">
        {monthName} {now.getFullYear()}
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <StatCard label="New clients" value={monthNewClients} />
        <StatCard label="New enquiries" value={monthNewEnquiries} />
        <StatCard label="Sales" value={fmtCurrency(monthSaleAmount)} />
      </div>

      {/* Top clients */}
      {topClients.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium text-neutral-500 uppercase tracking-wider">
            Top clients by sales
          </h2>
          <div className="mt-3 rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
            {topClients.map((client, i) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-neutral-800">
                    {client.name}
                  </span>
                </div>
                <span className="text-sm text-neutral-600">
                  {fmtCurrency(client.total)}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
