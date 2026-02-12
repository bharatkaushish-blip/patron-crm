import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { EnquirySearchInput } from "@/components/enquiries/enquiry-search-input";
import { EnquiryGrid } from "@/components/enquiries/enquiry-grid";
import { AddEnquiryForm } from "@/components/enquiries/add-enquiry-form";

export default async function EnquiriesPage({
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

  const { data: roleProfile } = await supabase
    .from("profiles")
    .select("role, permissions")
    .eq("id", user.id)
    .single()
    .then((res: any) => (res.error ? { data: null } : res));

  const { extractRoleData, canMutate, canDelete } = await import("@/lib/permissions");
  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutate(role, perms);
  const userCanDelete = canDelete(role, perms);

  let enquiries: any[] = [];

  if (query.length >= 2) {
    const pattern = `%${query}%`;

    // Search enquiry fields directly
    const { data: fieldResults } = await supabase
      .from("enquiries")
      .select("*, clients!inner(name)")
      .eq("organization_id", profile.organization_id)
      .or(
        `size.ilike.${pattern},budget.ilike.${pattern},artist.ilike.${pattern},timeline.ilike.${pattern},work_type.ilike.${pattern},notes.ilike.${pattern}`
      )
      .order("created_at", { ascending: false })
      .limit(50);

    // Search by client name separately
    const { data: clientResults } = await supabase
      .from("enquiries")
      .select("*, clients!inner(name)")
      .eq("organization_id", profile.organization_id)
      .ilike("clients.name" as any, pattern)
      .order("created_at", { ascending: false })
      .limit(50);

    // Merge and deduplicate
    const map = new Map<string, any>();
    for (const e of [...(fieldResults || []), ...(clientResults || [])]) {
      if (!map.has(e.id)) map.set(e.id, e);
    }
    enquiries = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else {
    const { data } = await supabase
      .from("enquiries")
      .select("*, clients!inner(name)")
      .eq("organization_id", profile.organization_id)
      .order("created_at", { ascending: false })
      .limit(50);
    enquiries = data || [];
  }

  // Normalize enquiry data for the grid component
  const normalizedEnquiries = enquiries.map((enq) => ({
    id: enq.id,
    client_id: enq.client_id,
    clientName: (enq.clients as any)?.name,
    size: enq.size,
    budget: enq.budget,
    artist: enq.artist,
    timeline: enq.timeline,
    work_type: enq.work_type,
    notes: enq.notes,
    created_at: enq.created_at,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Enquiries
      </h1>

      <div className="mt-4">
        <Suspense>
          <EnquirySearchInput />
        </Suspense>
      </div>

      {userCanMutate && (
        <div className="mt-4">
          <AddEnquiryForm />
        </div>
      )}

      <div className="mt-4">
        {normalizedEnquiries.length > 0 ? (
          <EnquiryGrid
            enquiries={normalizedEnquiries}
            canEdit={userCanMutate}
            canDelete={userCanDelete}
          />
        ) : (
          <p className="text-sm text-neutral-400 py-8 text-center">
            {query ? `No enquiries matching "${query}"` : "No enquiries yet."}
          </p>
        )}
      </div>
    </div>
  );
}
