import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, organization_id, organizations(name, subscription_status, trial_ends_at)")
    .eq("id", user.id)
    .single();

  const org = profile?.organizations as unknown as {
    name: string;
    subscription_status: string;
    trial_ends_at: string;
  } | null;

  const orgName = org?.name ?? "My Gallery";

  const isExpired =
    org?.subscription_status === "expired" ||
    org?.subscription_status === "canceled" ||
    (org?.subscription_status === "trialing" &&
      org?.trial_ends_at &&
      new Date(org.trial_ends_at) < new Date());

  return (
    <div className="flex h-dvh flex-col md:flex-row">
      <DesktopSidebar orgName={orgName} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {isExpired ? (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center text-sm text-red-700">
            Your trial has expired. Data is read-only.{" "}
            <Link href="/settings" className="font-medium underline hover:text-red-800">
              Upgrade now
            </Link>
          </div>
        ) : null}
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
