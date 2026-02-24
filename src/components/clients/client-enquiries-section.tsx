import { createClient } from "@/lib/supabase/server";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";
import { EnquiryGroupCard } from "@/components/enquiries/enquiry-card";
import { getAvailableInventoryItems } from "@/lib/actions/inventory";

export async function ClientEnquiriesSection({
  clientId,
  clientName,
  orgId,
  canEdit,
  canDelete,
}: {
  clientId: string;
  clientName: string;
  orgId: string;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const supabase = await createClient();

  const [{ data: enquiries }, inventoryItems] = await Promise.all([
    supabase
      .from("enquiries")
      .select("*, inventory(title)")
      .eq("client_id", clientId)
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    getAvailableInventoryItems(),
  ]);

  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Enquiries
        {enquiries && enquiries.length > 0 ? (
          <span className="ml-2 text-neutral-400">({enquiries.length})</span>
        ) : null}
      </h2>

      {canEdit && <EnquiryForm clientId={clientId} inventoryItems={inventoryItems} />}

      <div className="mt-3">
        {enquiries && enquiries.length > 0 ? (
          <EnquiryGroupCard
            clientId={clientId}
            clientName={clientName}
            enquiries={enquiries.map((enq) => ({
              id: enq.id,
              clientId: clientId,
              size: enq.size,
              budget: enq.budget,
              artist: enq.artist,
              timeline: enq.timeline,
              workType: enq.work_type,
              notes: enq.notes,
              createdAt: enq.created_at,
              inventoryItemId: enq.inventory_item_id ?? null,
              inventoryTitle: (enq.inventory as any)?.title ?? null,
            }))}
            canEdit={canEdit}
            canDelete={canDelete}
            inventoryItems={inventoryItems}
          />
        ) : (
          <p className="text-sm text-neutral-400 py-4 text-center">
            No enquiries yet.
          </p>
        )}
      </div>
    </section>
  );
}

export function ClientEnquiriesSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      <div className="h-4 w-24 bg-neutral-200 rounded mb-3" />
      <div className="h-20 bg-neutral-100 rounded-lg" />
      <div className="mt-3 space-y-2">
        <div className="h-16 bg-neutral-100 rounded-lg" />
      </div>
    </section>
  );
}
