import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { FollowUpSection } from "@/components/today/follow-up-section";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: overdue } = await supabase
    .from("notes")
    .select("id, content, follow_up_date, clients!inner(id, name)")
    .eq("organization_id", profile.organization_id)
    .eq("follow_up_status", "pending")
    .lt("follow_up_date", today)
    .order("follow_up_date", { ascending: true });

  const { data: dueToday } = await supabase
    .from("notes")
    .select("id, content, follow_up_date, clients!inner(id, name)")
    .eq("organization_id", profile.organization_id)
    .eq("follow_up_status", "pending")
    .eq("follow_up_date", today)
    .order("created_at", { ascending: false });

  const hasFollowUps =
    (overdue?.length ?? 0) + (dueToday?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
        Today
      </h1>

      <div className="mt-6 space-y-6">
        {!hasFollowUps ? (
          <EmptyState
            title="All caught up!"
            description="No follow-ups due today. Add a client to get started."
            action={{ label: "Add your first client", href: "/clients/new" }}
          />
        ) : (
          <>
            <FollowUpSection
              title="Overdue"
              items={(overdue as never[]) ?? []}
              isOverdue
            />
            <FollowUpSection
              title="Due today"
              items={(dueToday as never[]) ?? []}
            />
          </>
        )}
      </div>

      {/* Quick action buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2 md:bottom-6">
        <Link
          href="/clients/new"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800 transition-colors"
          title="Add client"
        >
          <UserPlus className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
