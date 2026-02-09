import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrgMembers, changeUserRole } from "@/lib/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { RoleToggle } from "./role-toggle";

export default async function AdminOrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orgId } = await params;
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

  const adminClient = createAdminClient();
  const { data: org } = await adminClient
    .from("organizations")
    .select("name, subscription_status")
    .eq("id", orgId)
    .single();

  if (!org) redirect("/admin");

  const members = await getOrgMembers(orgId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {org.name}
          </h1>
          <span className="inline-block rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
            {org.subscription_status}
          </span>
        </div>
      </div>

      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Members ({members.length})
      </h2>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {member.full_name || "Unnamed"}
              </p>
              <p className="text-xs text-neutral-500">{member.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {member.is_superadmin ? (
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                  Superadmin
                </span>
              ) : (
                <RoleToggle userId={member.id} currentRole={member.role} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
