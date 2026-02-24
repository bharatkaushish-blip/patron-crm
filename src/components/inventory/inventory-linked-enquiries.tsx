import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export async function InventoryLinkedEnquiries({
  itemId,
}: {
  itemId: string;
}) {
  const supabase = await createClient();

  const { data: linkedEnquiries } = await supabase
    .from("enquiries")
    .select("id, artist, size, budget, client_id, clients(name), created_at")
    .eq("inventory_item_id", itemId)
    .order("created_at", { ascending: false });

  if (!linkedEnquiries || linkedEnquiries.length === 0) return null;

  return (
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
  );
}

export function InventoryLinkedEnquiriesSkeleton() {
  return (
    <section className="mt-8 animate-pulse">
      <div className="h-4 w-28 bg-neutral-200 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-16 bg-neutral-100 rounded-lg" />
      </div>
    </section>
  );
}
