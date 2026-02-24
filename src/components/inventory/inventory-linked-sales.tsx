import { createClient } from "@/lib/supabase/server";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrency } from "@/lib/format-currency";
import Link from "next/link";

export async function InventoryLinkedSales({ itemId }: { itemId: string }) {
  const supabase = await createClient();

  const [{ data: linkedSales }, currency] = await Promise.all([
    supabase
      .from("sales")
      .select("id, artwork_name, amount, sale_date, client_id, clients(name)")
      .eq("inventory_item_id", itemId)
      .order("sale_date", { ascending: false }),
    getOrgCurrency(),
  ]);

  if (!linkedSales || linkedSales.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Linked sales
      </h2>
      <div className="space-y-2">
        {linkedSales.map((sale: any) => (
          <Link
            key={sale.id}
            href={`/clients/${sale.client_id}`}
            className="block rounded-lg border border-neutral-200 bg-white p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-800">
                {(sale.clients as any)?.name || "Client"}
              </span>
              {sale.amount && (
                <span className="text-sm font-medium text-neutral-700">
                  {formatCurrency(Number(sale.amount), currency)}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {new Date(sale.sale_date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function InventoryLinkedSalesSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-16 bg-neutral-100 rounded-lg" />
      </div>
    </section>
  );
}
