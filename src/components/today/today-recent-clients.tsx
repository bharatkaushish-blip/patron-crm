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
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        Recent Clients
      </h2>
      <div className="mt-3 space-y-2.5">
        {recentClients && recentClients.length > 0 ? (
          recentClients.map((client: any) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600">
                {getInitials(client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">
                  {client.name}
                </p>
                {client.location && (
                  <p className="text-xs text-neutral-400">
                    {client.location}
                  </p>
                )}
              </div>
              {client.tags && client.tags.length > 0 && (
                <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-medium text-indigo-700">
                  {client.tags[0]}
                </span>
              )}
            </Link>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-neutral-400">
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
      <div className="h-4 w-28 bg-neutral-200 rounded" />
      <div className="mt-3 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-neutral-200 rounded" />
              <div className="h-3 w-20 bg-neutral-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
