import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { getInventoryItem } from "@/lib/actions/inventory";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrency } from "@/lib/format-currency";
import { DeleteInventoryButton } from "@/components/inventory/delete-inventory-button";
import { InventoryImage } from "@/components/inventory/inventory-image";
import { InventoryLinkedSales, InventoryLinkedSalesSkeleton } from "@/components/inventory/inventory-linked-sales";
import { InventoryLinkedEnquiries, InventoryLinkedEnquiriesSkeleton } from "@/components/inventory/inventory-linked-enquiries";
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
  sold: "bg-[#b2b2b1]/15 text-neutral-600",
  not_for_sale: "bg-[#f0eded] text-[#5f5f5f]",
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
            className="p-1.5 text-[#9e9c9c] hover:bg-[#f0eded] hover:text-neutral-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#323233]">
              {item.title}
            </h1>
            <span
              className={`mt-1 inline-block px-2.5 py-0.5 text-xs font-body font-medium ${
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
              className="p-1.5 text-[#9e9c9c] hover:bg-[#f0eded] hover:text-neutral-600"
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
          <div key={f.label} className="flex text-sm font-body">
            <span className="w-28 shrink-0 text-[#9e9c9c]">{f.label}</span>
            <span className="text-neutral-700">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Pricing */}
      {showPricing && priceFields.length > 0 && (
        <div className="mt-4 space-y-2">
          {priceFields.map((f) => (
            <div key={f.label} className="flex text-sm font-body">
              <span className="w-28 shrink-0 text-[#9e9c9c]">{f.label}</span>
              <span className="font-serif font-bold text-[#323233]">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="mt-4">
          <h2 className="text-sm font-body font-medium text-[#5f5f5f] uppercase tracking-wide mb-1">
            Notes
          </h2>
          <p className="text-sm font-body text-neutral-600 whitespace-pre-wrap">
            {item.notes}
          </p>
        </div>
      )}

      {/* Linked sales */}
      <Suspense fallback={<InventoryLinkedSalesSkeleton />}>
        <InventoryLinkedSales itemId={id} />
      </Suspense>

      {/* Linked enquiries */}
      <Suspense fallback={<InventoryLinkedEnquiriesSkeleton />}>
        <InventoryLinkedEnquiries itemId={id} />
      </Suspense>
    </div>
  );
}
