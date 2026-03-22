import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function TodayRecentClients({ orgId }: { orgId: string }) {
  const supabase = await createClient();

  const { data: recentClients } = await supabase
    .from("clients")
    .select("id, name, location, tags")
    .eq("organization_id", orgId)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <h2 className="font-body text-xs font-semibold text-[#9e9c9c] uppercase tracking-[0.2em]">
        Recent Clients
      </h2>
      <div className="mt-3 space-y-2.5">
        {recentClients && recentClients.length > 0 ? (
          recentClients.map((client: any) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center gap-3 border border-[#b2b2b1]/15 bg-[#fcf9f8] p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f0eded] text-sm font-semibold text-neutral-600">
                {getInitials(client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-body text-sm font-semibold text-[#323233]">
                  {client.name}
                </p>
                {client.location && (
                  <p className="font-body text-xs text-[#9e9c9c]">
                    {client.location}
                  </p>
                )}
              </div>
              {client.tags && client.tags.length > 0 && (
                <span className="shrink-0 bg-[#735a3a]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#735a3a]">
                  {client.tags[0]}
                </span>
              )}
            </Link>
          ))
        ) : (
          <p className="py-8 text-center font-body text-sm text-[#9e9c9c]">
            No clients yet.
          </p>
        )}
      </div>
    </div>
  );
}

export function TodayRecentClientsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-28 bg-[#b2b2b1]/15" />
      <div className="mt-3 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border border-[#b2b2b1]/15 bg-[#fcf9f8] p-4"
          >
            <div className="h-10 w-10 shrink-0 bg-[#b2b2b1]/15" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-[#b2b2b1]/15" />
              <div className="h-3 w-20 bg-[#f0eded]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
