import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ClientCard } from "@/components/clients/client-card";
import { ClientSearch } from "@/components/clients/client-search";
import { TagFilter } from "@/components/clients/tag-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { Suspense } from "react";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) redirect("/onboarding");

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, permissions")
    .eq("id", user.id)
    .single()
    .then((res: any) => (res.error ? { data: null } : res));

  const { extractRoleData, canMutate } = await import("@/lib/permissions");
  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutate(role, perms);

  let query = supabase
    .from("clients")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .eq("is_deleted", false);

  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%,location.ilike.%${params.q}%`
    );
  }

  if (params.tags) {
    const tagList = params.tags.split(",").filter(Boolean);
    if (tagList.length > 0) {
      query = query.contains("tags", tagList);
    }
  }

  query = query.order("updated_at", { ascending: false }).limit(100);

  const { data: clients } = await query;

  const { data: tags } = await supabase.rpc("get_org_tags", {
    org_id: profile.organization_id,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Clients
        </h1>
        {userCanMutate && (
          <Link
            href="/clients/new"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Suspense>
          <ClientSearch />
        </Suspense>

        <Suspense>
          <TagFilter tags={(tags as { tag: string; usage_count: number }[]) ?? []} />
        </Suspense>
      </div>

      <div className="mt-4 space-y-2">
        {!clients || clients.length === 0 ? (
          <EmptyState
            title={params.q || params.tags ? "No clients found" : "No clients yet"}
            description={
              params.q || params.tags
                ? "Try a different search or filter."
                : "Add your first client to get started."
            }
            action={
              !params.q && !params.tags
                ? { label: "Add your first client", href: "/clients/new" }
                : undefined
            }
          />
        ) : (
          clients.map((client) => (
            <ClientCard
              key={client.id}
              id={client.id}
              name={client.name}
              location={client.location}
              tags={client.tags ?? []}
              updatedAt={client.updated_at}
            />
          ))
        )}
      </div>
    </div>
  );
}
