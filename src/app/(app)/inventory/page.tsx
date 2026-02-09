import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { getInventoryItems } from "@/lib/actions/inventory";
import { getOrgCurrency } from "@/lib/actions/settings";
import { InventoryCard } from "@/components/inventory/inventory-card";
import { InventorySearchInput } from "@/components/inventory/inventory-search-input";
import { InventoryStatusFilter } from "@/components/inventory/inventory-status-filter";
import { InventoryCsvImport } from "@/components/inventory/inventory-csv-import";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const statusFilter = params.status || "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, permissions")
    .eq("id", user.id)
    .single()
    .then((res: any) => (res.error ? { data: null } : res));

  const { extractRoleData, canMutate, canSeePricing } = await import("@/lib/permissions");
  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutate(role, perms);
  const showPrice = canSeePricing(role, perms);

  const [allItems, currency] = await Promise.all([
    getInventoryItems(query || undefined),
    getOrgCurrency(),
  ]);
  let items = allItems;

  // Filter by status client-side (simple approach)
  if (statusFilter && statusFilter !== "all") {
    items = items.filter((item: any) => item.status === statusFilter);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Inventory
        </h1>
        {userCanMutate && (
          <div className="flex items-center gap-2">
            <InventoryCsvImport />
            <Link
              href="/inventory/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add artwork
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Suspense>
          <InventorySearchInput />
        </Suspense>
      </div>

      <div className="mt-3">
        <Suspense>
          <InventoryStatusFilter />
        </Suspense>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item: any) => (
            <InventoryCard
              key={item.id}
              id={item.id}
              title={item.title}
              artist={item.artist}
              imagePath={item.image_path}
              askingPrice={item.asking_price ? Number(item.asking_price) : null}
              status={item.status}
              currency={currency}
              showPrice={showPrice}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400 py-16 text-center">
          {query || statusFilter !== "all"
            ? "No artwork matching your filters."
            : "No artwork in your inventory yet. Add your first piece."}
        </p>
      )}
    </div>
  );
}
