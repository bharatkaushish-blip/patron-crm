import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";

export default async function EditClientPage({
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

  const { data: tags } = await supabase.rpc("get_org_tags", {
    org_id: profile.organization_id,
  });

  const existingTags = (tags ?? []).map(
    (t: { tag: string }) => t.tag
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/clients/${id}`}
          className="p-1.5 text-[#9e9c9c] hover:bg-[#f0eded] hover:text-neutral-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold font-serif tracking-tight text-[#323233]">
          Edit client
        </h1>
      </div>

      <ClientForm client={client} existingTags={existingTags} />
    </div>
  );
}
