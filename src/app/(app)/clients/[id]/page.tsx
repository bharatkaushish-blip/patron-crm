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
import { EnquiryCard } from "@/components/enquiries/enquiry-card";

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

  // Fetch enquiries for this client
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*")
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {client.name}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/clients/${id}/edit`}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            title="Edit client"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <DeleteClientButton clientId={id} />
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

        <NoteInput clientId={id} />

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

        <EnquiryForm clientId={id} />

        <div className="mt-3 space-y-2">
          {enquiries && enquiries.length > 0 ? (
            enquiries.map((enq) => (
              <EnquiryCard
                key={enq.id}
                id={enq.id}
                clientId={id}
                size={enq.size}
                budget={enq.budget}
                artist={enq.artist}
                timeline={enq.timeline}
                workType={enq.work_type}
                notes={enq.notes}
                createdAt={enq.created_at}
              />
            ))
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
                <> &middot; ₹{sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0).toLocaleString("en-IN")}</>
              ) : null})
            </span>
          ) : null}
        </h2>

        <SaleForm clientId={id} />

        <div className="mt-3 space-y-2">
          {sales && sales.length > 0 ? (
            sales.map((sale) => (
              <SaleCard
                key={sale.id}
                id={sale.id}
                clientId={id}
                artworkName={sale.artwork_name}
                amount={sale.amount}
                saleDate={sale.sale_date}
                notes={sale.notes}
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
