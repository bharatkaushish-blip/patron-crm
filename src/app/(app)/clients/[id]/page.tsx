import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Globe } from "lucide-react";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { NoteInput } from "@/components/notes/note-input";
import { NoteCard } from "@/components/notes/note-card";
import { SaleForm } from "@/components/sales/sale-form";
import { SaleCard } from "@/components/sales/sale-card";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";
import { EnquiryGroupCard } from "@/components/enquiries/enquiry-card";
import { getAvailableInventoryItems } from "@/lib/actions/inventory";
import { getOrgCurrency } from "@/lib/actions/settings";
import { formatCurrency } from "@/lib/format-currency";
import { extractRoleData, canMutate as canMutateCheck, canDelete as canDeleteCheck } from "@/lib/permissions";

export default async function ClientProfilePage({
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
    .then((res) => (res.error ? { data: null } : res));

  const { role, permissions: perms } = extractRoleData(roleProfile);
  const userCanMutate = canMutateCheck(role, perms);
  const userCanDelete = canDeleteCheck(role, perms);

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!client) notFound();

  // Fetch notes for this client
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("client_id", id)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  // Fetch enquiries for this client (join inventory for linked artwork title)
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*, inventory(title)")
    .eq("client_id", id)
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  // Fetch sales for this client
  const { data: sales } = await supabase
    .from("sales")
    .select("*")
    .eq("client_id", id)
    .eq("organization_id", profile.organization_id)
    .order("sale_date", { ascending: false });

  // Fetch available inventory items for linking and org currency
  const [inventoryItems, currency] = await Promise.all([
    getAvailableInventoryItems(),
    getOrgCurrency(),
  ]);

  // Active follow-up banner
  const activeFollowUp = notes?.find(
    (n) => n.follow_up_date && n.follow_up_status === "pending"
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          {client.photo_url ? (
            <img
              src={client.photo_url}
              alt={client.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-600">
              {client.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {client.name}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          {userCanMutate && (
            <Link
              href={`/clients/${id}/edit`}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Edit client"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
          {userCanDelete && <DeleteClientButton clientId={id} />}
        </div>
      </div>

      {/* Follow-up banner */}
      {activeFollowUp ? (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700">
          Follow-up due{" "}
          {new Date(activeFollowUp.follow_up_date + "T00:00:00").toLocaleDateString(
            "en-IN",
            { month: "short", day: "numeric" }
          )}
        </div>
      ) : null}

      {/* Contact info */}
      <div className="space-y-2 text-sm">
        {client.phone ? (
          <a
            href={`tel:${client.phone}`}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <Phone className="h-4 w-4 text-neutral-400" />
            {client.phone}
          </a>
        ) : null}
        {client.email ? (
          <a
            href={`mailto:${client.email}`}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
          >
            <Mail className="h-4 w-4 text-neutral-400" />
            {client.email}
          </a>
        ) : null}
        {client.location ? (
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="h-4 w-4 text-neutral-400" />
            {client.location}
          </div>
        ) : null}
        {client.country ? (
          <div className="flex items-center gap-2 text-neutral-600">
            <Globe className="h-4 w-4 text-neutral-400" />
            {client.country}
          </div>
        ) : null}
        {client.age_range ? (
          <div className="text-neutral-400 text-xs">Age: {client.age_range}</div>
        ) : null}
      </div>

      {/* Tags */}
      {client.tags && client.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {client.tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Notes section */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Notes
          {notes && notes.length > 0 ? (
            <span className="ml-2 text-neutral-400">({notes.length})</span>
          ) : null}
        </h2>

        {userCanMutate && <NoteInput clientId={id} />}

        <div className="mt-4 space-y-2">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                id={note.id}
                clientId={id}
                content={note.content}
                createdAt={note.created_at}
                followUpDate={note.follow_up_date}
                followUpStatus={note.follow_up_status}
                canEdit={userCanMutate}
                canDelete={userCanDelete}
              />
            ))
          ) : (
            <p className="text-sm text-neutral-400 py-4 text-center">
              No notes yet. Add your first note above.
            </p>
          )}
        </div>
      </section>

      {/* Enquiries section */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Enquiries
          {enquiries && enquiries.length > 0 ? (
            <span className="ml-2 text-neutral-400">({enquiries.length})</span>
          ) : null}
        </h2>

        {userCanMutate && <EnquiryForm clientId={id} inventoryItems={inventoryItems} />}

        <div className="mt-3">
          {enquiries && enquiries.length > 0 ? (
            <EnquiryGroupCard
              clientId={id}
              clientName={client.name}
              enquiries={enquiries.map((enq) => ({
                id: enq.id,
                clientId: id,
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
              canEdit={userCanMutate}
              canDelete={userCanDelete}
              inventoryItems={inventoryItems}
            />
          ) : (
            <p className="text-sm text-neutral-400 py-4 text-center">
              No enquiries yet.
            </p>
          )}
        </div>
      </section>

      {/* Sales section */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
          Sales
          {sales && sales.length > 0 ? (
            <span className="ml-2 text-neutral-400">
              ({sales.length}
              {sales.length > 0 ? (
                <> &middot; {formatCurrency(sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0), currency)}</>
              ) : null})
            </span>
          ) : null}
        </h2>

        {userCanMutate && <SaleForm clientId={id} inventoryItems={inventoryItems} />}

        <div className="mt-3 space-y-2">
          {sales && sales.length > 0 ? (
            sales.map((sale) => (
              <SaleCard
                key={sale.id}
                id={sale.id}
                clientId={id}
                artworkName={sale.artwork_name}
                artistName={sale.artist_name ?? null}
                amount={sale.amount}
                saleDate={sale.sale_date}
                notes={sale.notes}
                currency={currency}
                canEdit={userCanMutate}
                canDelete={userCanDelete}
                inventoryItems={inventoryItems}
                inventoryItemId={sale.inventory_item_id ?? null}
              />
            ))
          ) : (
            <p className="text-sm text-neutral-400 py-4 text-center">
              No sales logged yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
