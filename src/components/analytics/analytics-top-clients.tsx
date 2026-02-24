import { createClient } from "@/lib/supabase/server";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrencyCompact } from "@/lib/format-currency";
import Link from "next/link";

export async function AnalyticsTopClients({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const [topClientsRes, currency] = await Promise.all([
    supabase
      .from("sales")
      .select("amount, client_id, clients!inner(name)")
      .eq("organization_id", orgId)
      .order("amount", { ascending: false }),
    getOrgCurrency(),
  ]);

  const clientTotals = new Map<
    string,
    { name: string; id: string; total: number }
  >();
  for (const sale of topClientsRes.data ?? []) {
    const cid = sale.client_id;
    const clientName = (sale.clients as any)?.name ?? "Unknown";
    const existing = clientTotals.get(cid);
    if (existing) {
      existing.total += Number(sale.amount) || 0;
    } else {
      clientTotals.set(cid, {
        name: clientName,
        id: cid,
        total: Number(sale.amount) || 0,
      });
    }
  }
  const topClients = Array.from(clientTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  if (topClients.length === 0) return null;

  return (
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
              {formatCurrencyCompact(client.total, currency)}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function AnalyticsTopClientsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mt-8 h-4 w-32 bg-neutral-200 rounded" />
      <div className="mt-3 rounded-lg border border-neutral-200 bg-white divide-y divide-neutral-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-neutral-200" />
              <div className="h-4 w-24 bg-neutral-200 rounded" />
            </div>
            <div className="h-4 w-16 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
