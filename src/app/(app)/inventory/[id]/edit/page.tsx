import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInventoryItem, getOrgArtists, getOrgMediums } from "@/lib/actions/inventory";
import { InventoryForm } from "@/components/inventory/inventory-form";

export default async function EditInventoryPage({
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

  const [item, artistSuggestions, mediumSuggestions] = await Promise.all([
    getInventoryItem(id),
    getOrgArtists(),
    getOrgMediums(),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/inventory/${id}`}
          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Edit artwork
        </h1>
      </div>

      <InventoryForm
        item={item}
        artistSuggestions={artistSuggestions}
        mediumSuggestions={mediumSuggestions}
      />
    </div>
  );
}
