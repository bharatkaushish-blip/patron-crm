import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAllOrganizations } from "@/lib/actions/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) redirect("/today");

  const orgs = await getAllOrganizations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-6">
        Admin Panel
      </h1>

      <div className="space-y-2">
        {orgs.map((org) => (
          <Link
            key={org.id}
            href={`/admin/orgs/${org.id}`}
            className="block rounded-lg border border-neutral-200 bg-white p-4 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-neutral-900">
                  {org.name}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {org.member_count} member{org.member_count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                  {org.subscription_status}
                </span>
                <p className="mt-0.5 text-[10px] text-neutral-400">
                  {new Date(org.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {orgs.length === 0 && (
          <p className="text-sm text-neutral-400 py-8 text-center">
            No organizations yet.
          </p>
        )}
      </div>
    </div>
  );
}
