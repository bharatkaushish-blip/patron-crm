import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";

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

  const orgId = profile.organization_id;

  let clients: any[] = [];
  let notes: any[] = [];
  let sales: any[] = [];

  if (query.length >= 2) {
    const pattern = `%${query}%`;

    // Search clients by name, email, phone, location, tags
    const { data: clientResults } = await supabase
      .from("clients")
      .select("id, name, location, tags, updated_at")
      .eq("organization_id", orgId)
      .eq("is_deleted", false)
      .or(
        `name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},location.ilike.${pattern}`
      )
      .order("updated_at", { ascending: false })
      .limit(10);

    // Also search by tag text (tags is a text[] column)
    const { data: tagResults } = await supabase
      .from("clients")
      .select("id, name, location, tags, updated_at")
      .eq("organization_id", orgId)
      .eq("is_deleted", false)
      .contains("tags", [query])
      .order("updated_at", { ascending: false })
      .limit(10);

    // Merge and deduplicate client results
    const clientMap = new Map<string, any>();
    for (const c of [...(clientResults || []), ...(tagResults || [])]) {
      if (!clientMap.has(c.id)) clientMap.set(c.id, c);
    }
    clients = Array.from(clientMap.values());

    // Search notes by content
    const { data: noteResults } = await supabase
      .from("notes")
      .select("id, content, client_id, created_at, clients!inner(name)")
      .eq("organization_id", orgId)
      .ilike("content", pattern)
      .order("created_at", { ascending: false })
      .limit(10);

    notes = noteResults || [];

    // Search sales by artwork name or notes
    const { data: saleResults } = await supabase
      .from("sales")
      .select(
        "id, artwork_name, amount, sale_date, notes, client_id, clients!inner(name)"
      )
      .eq("organization_id", orgId)
      .or(`artwork_name.ilike.${pattern},notes.ilike.${pattern}`)
      .order("sale_date", { ascending: false })
      .limit(10);

    sales = saleResults || [];
  }

  const totalResults = clients.length + notes.length + sales.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Search
      </h1>

      <div className="mt-4">
        <Suspense>
          <SearchInput />
        </Suspense>
      </div>

      {query.length >= 2 ? (
        <SearchResults
          query={query}
          clients={clients}
          notes={notes}
          sales={sales}
          totalResults={totalResults}
        />
      ) : query.length > 0 && query.length < 2 ? (
        <p className="mt-8 text-center text-sm text-neutral-400">
          Type at least 2 characters to search.
        </p>
      ) : (
        <p className="mt-8 text-center text-sm text-neutral-400">
          Search clients, notes, and sales.
        </p>
      )}
    </div>
  );
}
