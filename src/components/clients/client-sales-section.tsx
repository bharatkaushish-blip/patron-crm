import { createClient } from "@/lib/supabase/server";
import { SaleForm } from "@/components/sales/sale-form";
import { SaleCard } from "@/components/sales/sale-card";
import { getAvailableInventoryItems } from "@/lib/actions/inventory";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrency } from "@/lib/format-currency";

export async function ClientSalesSection({
  clientId,
  orgId,
  canEdit,
  canDelete,
}: {
  clientId: string;
  orgId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const supabase = await createClient();

  const [{ data: sales }, inventoryItems, currency] = await Promise.all([
    supabase
      .from("sales")
      .select("*")
      .eq("client_id", clientId)
      .eq("organization_id", orgId)
      .order("sale_date", { ascending: false }),
    getAvailableInventoryItems(),
    getOrgCurrency(),
  ]);

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium font-serif text-[#5f5f5f] uppercase tracking-wide mb-3">
        Sales
        {sales && sales.length > 0 ? (
          <span className="ml-2 text-[#9e9c9c]">
            ({sales.length}
            {sales.length > 0 ? (
              <> &middot; {formatCurrency(sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0), currency)}</>
            ) : null})
          </span>
        ) : null}
      </h2>

      {canEdit && <SaleForm clientId={clientId} inventoryItems={inventoryItems} />}

      <div className="mt-3 space-y-2">
        {sales && sales.length > 0 ? (
          sales.map((sale) => (
            <SaleCard
              key={sale.id}
              id={sale.id}
              clientId={clientId}
              artworkName={sale.artwork_name}
              artistName={sale.artist_name ?? null}
              amount={sale.amount}
              saleDate={sale.sale_date}
              notes={sale.notes}
              currency={currency}
              canEdit={canEdit}
              canDelete={canDelete}
              inventoryItems={inventoryItems}
              inventoryItemId={sale.inventory_item_id ?? null}
            />
          ))
        ) : (
          <p className="text-sm font-body text-[#9e9c9c] py-4 text-center">
            No sales logged yet.
          </p>
        )}
      </div>
    </section>
  );
}

export function ClientSalesSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      <div className="h-4 w-16 bg-[#b2b2b1]/15 mb-3" />
      <div className="h-20 bg-[#f0eded]" />
      <div className="mt-3 space-y-2">
        <div className="h-16 bg-[#f0eded]" />
      </div>
    </section>
  );
}
