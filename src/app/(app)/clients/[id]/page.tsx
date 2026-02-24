import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Globe } from "lucide-react";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { ClientFollowUpBanner } from "@/components/clients/client-follow-up-banner";
import { ClientNotesSection, ClientNotesSkeleton } from "@/components/clients/client-notes-section";
import { ClientEnquiriesSection, ClientEnquiriesSkeleton } from "@/components/clients/client-enquiries-section";
import { ClientSalesSection, ClientSalesSkeleton } from "@/components/clients/client-sales-section";
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
    .select("organization_id, role, permissions")
    .eq("id", user.id)
    .single()
    .then((res) => (res.error ? { data: null } : res));

  if (!profile?.organization_id) redirect("/onboarding");

  const orgId = profile.organization_id;
  const { role, permissions: perms } = extractRoleData(profile);
  const userCanMutate = canMutateCheck(role, perms);
  const userCanDelete = canDeleteCheck(role, perms);

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();

  if (!client) notFound();

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
      <Suspense>
        <ClientFollowUpBanner clientId={id} orgId={orgId} />
      </Suspense>

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

      {/* Notes */}
      <Suspense fallback={<ClientNotesSkeleton />}>
        <ClientNotesSection
          clientId={id}
          orgId={orgId}
          canEdit={userCanMutate}
          canDelete={userCanDelete}
        />
      </Suspense>

      {/* Enquiries */}
      <Suspense fallback={<ClientEnquiriesSkeleton />}>
        <ClientEnquiriesSection
          clientId={id}
          clientName={client.name}
          orgId={orgId}
          canEdit={userCanMutate}
          canDelete={userCanDelete}
        />
      </Suspense>

      {/* Sales */}
      <Suspense fallback={<ClientSalesSkeleton />}>
        <ClientSalesSection
          clientId={id}
          orgId={orgId}
          canEdit={userCanMutate}
          canDelete={userCanDelete}
        />
      </Suspense>
    </div>
  );
}
