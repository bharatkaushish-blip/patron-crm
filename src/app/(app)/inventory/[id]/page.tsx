import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getInventoryItem } from "@/lib/actions/inventory";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrency } from "@/lib/format-currency";
import { DeleteInventoryButton } from "@/components/inventory/delete-inventory-button";
import { InventoryImage } from "@/components/inventory/inventory-image";
import { extractRoleData, canMutate, canDelete, canSeePricing } from "@/lib/permissions";

const statusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  not_for_sale: "Not for sale",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-neutral-200 text-neutral-600",
  not_for_sale: "bg-neutral-100 text-neutral-500",
};

export default async function InventoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutate(role, perms);
  const userCanDelete = canDelete(role, perms);
  const showPricing = canSeePricing(role, perms);

  const [item, currency] = await Promise.all([
    getInventoryItem(id),
    getOrgCurrency(),
  ]);
  if (!item) notFound();

  // Fetch linked sales
  const { data: linkedSales } = await supabase
    .from("sales")
    .select("id, artwork_name, amount, sale_date, client_id, clients(name)")
    .eq("inventory_item_id", id)
    .order("sale_date", { ascending: false });

  // Fetch linked enquiries
  const { data: linkedEnquiries } = await supabase
    .from("enquiries")
    .select("id, artist, size, budget, client_id, clients(name), created_at")
    .eq("inventory_item_id", id)
    .order("created_at", { ascending: false });

  const fields = [
    { label: "Artist", value: item.artist },
    { label: "Medium", value: item.medium },
    { label: "Dimensions", value: item.dimensions },
    { label: "Year", value: item.year?.toString() },
    {
      label: "Source",
      value:
        item.source === "consignment"
          ? `Consignment${item.consignor ? ` (${item.consignor})` : ""}`
          : "Owned",
    },
  ].filter((f) => f.value);

  const priceFields = [
    {
      label: "Asking price",
      value: item.asking_price
        ? formatCurrency(Number(item.asking_price), currency)
        : null,
    },
    {
      label: "Reserve price",
      value: item.reserve_price
        ? formatCurrency(Number(item.reserve_price), currency)
        : null,
    },
  ].filter((f) => f.value);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              {item.title}
            </h1>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusColors[item.status] || statusColors.available
              }`}
            >
              {statusLabels[item.status] || item.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {userCanMutate && (
            <Link
              href={`/inventory/${id}/edit`}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
          {userCanDelete && <DeleteInventoryButton itemId={id} />}
        </div>
      </div>

      {/* Image */}
      {item.image_path && (
        <div className="mb-6">
          <InventoryImage url={item.image_path} alt={item.title} />
        </div>
      )}

      {/* Details */}
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex text-sm">
            <span className="w-28 shrink-0 text-neutral-400">{f.label}</span>
            <span className="text-neutral-700">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      {showPricing && priceFields.length > 0 && (
        <div className="mt-4 space-y-2">
          {priceFields.map((f) => (
            <div key={f.label} className="flex text-sm">
              <span className="w-28 shrink-0 text-neutral-400">{f.label}</span>
              <span className="font-medium text-neutral-900">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="mt-4">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
            Notes
          </h2>
          <p className="text-sm text-neutral-600 whitespace-pre-wrap">
            {item.notes}
          </p>
        </div>
      )}

      {/* Linked sales */}
      {linkedSales && linkedSales.length > 0 && (
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
      )}

      {/* Linked enquiries */}
      {linkedEnquiries && linkedEnquiries.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
            Linked enquiries
          </h2>
          <div className="space-y-2">
            {linkedEnquiries.map((enq: any) => (
              <Link
                key={enq.id}
                href={`/clients/${enq.client_id}`}
                className="block rounded-lg border border-neutral-200 bg-white p-3 hover:bg-neutral-50 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-800">
                  {(enq.clients as any)?.name || "Client"}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {enq.artist && (
                    <span className="text-xs text-neutral-500">
                      Artist: {enq.artist}
                    </span>
                  )}
                  {enq.size && (
                    <span className="text-xs text-neutral-500">
                      Size: {enq.size}
                    </span>
                  )}
                  {enq.budget && (
                    <span className="text-xs text-neutral-500">
                      Budget: {enq.budget}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
