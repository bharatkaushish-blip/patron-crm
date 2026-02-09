import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { getOrgArtists, getOrgMediums } from "@/lib/actions/inventory";

export default async function NewInventoryPage() {
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

  const [artistSuggestions, mediumSuggestions] = await Promise.all([
    getOrgArtists(),
    getOrgMediums(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/inventory"
          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Add artwork
        </h1>
      </div>

      <InventoryForm
        artistSuggestions={artistSuggestions}
        mediumSuggestions={mediumSuggestions}
      />
    </div>
  );
}
