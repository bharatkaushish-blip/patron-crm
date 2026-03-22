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
      <h2 className="text-sm font-body font-medium text-[#5f5f5f] uppercase tracking-wide mb-3">
        Linked enquiries
      </h2>
      <div className="space-y-2">
        {linkedEnquiries.map((enq: any) => (
          <Link
            key={enq.id}
            href={`/clients/${enq.client_id}`}
            className="block border border-[#b2b2b1]/15 bg-[#ffffff] p-3 hover:bg-[#f6f3f2] transition-colors"
          >
            <span className="text-sm font-body font-medium text-neutral-800">
              {(enq.clients as any)?.name || "Client"}
            </span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {enq.artist && (
                <span className="text-xs font-body text-[#5f5f5f]">
                  Artist: {enq.artist}
                </span>
              )}
              {enq.size && (
                <span className="text-xs font-body text-[#5f5f5f]">
                  Size: {enq.size}
                </span>
              )}
              {enq.budget && (
                <span className="text-xs font-body text-[#5f5f5f]">
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
      <div className="h-4 w-28 bg-[#b2b2b1]/15 mb-3" />
      <div className="space-y-2">
        <div className="h-16 bg-[#f0eded]" />
      </div>
    </section>
  );
}
