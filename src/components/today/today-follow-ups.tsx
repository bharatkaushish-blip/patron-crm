import { createClient } from "@/lib/supabase/server";
import { FollowUpSection } from "./follow-up-section";
import { EmptyState } from "@/components/ui/empty-state";

function mapEnquiryToFollowUp(e: any) {
  const parts = [
    e.budget ? `Budget: ${e.budget}` : null,
    e.artist ? `Artist: ${e.artist}` : null,
  ].filter(Boolean);
  const content = e.notes || parts.join(" · ") || "Enquiry follow-up";
  return {
    id: e.id,
    content,
    follow_up_date: e.timeline,
    type: "enquiry" as const,
    clients: e.clients,
  };
}

export async function TodayFollowUps({
  orgId,
  canMutate,
}: {
  orgId: string;
  canMutate: boolean;
}) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: overdueNotes },
    { data: dueTodayNotes },
    { data: overdueEnquiries },
    { data: dueTodayEnquiries },
  ] = await Promise.all([
    supabase
      .from("notes")
      .select("id, content, follow_up_date, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .lt("follow_up_date", today)
      .order("follow_up_date", { ascending: true }),
    supabase
      .from("notes")
      .select("id, content, follow_up_date, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("follow_up_status", "pending")
      .eq("follow_up_date", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("enquiries")
      .select("id, notes, budget, artist, timeline, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .lt("timeline", today)
      .order("timeline", { ascending: true }),
    supabase
      .from("enquiries")
      .select("id, notes, budget, artist, timeline, clients!inner(id, name)")
      .eq("organization_id", orgId)
      .eq("timeline_status", "pending")
      .eq("timeline", today)
      .order("created_at", { ascending: false }),
  ]);

  const overdue = [
    ...(overdueNotes ?? []).map((n: any) => ({ ...n, type: "note" as const })),
    ...(overdueEnquiries ?? []).map(mapEnquiryToFollowUp),
  ];

  const dueToday = [
    ...(dueTodayNotes ?? []).map((n: any) => ({ ...n, type: "note" as const })),
    ...(dueTodayEnquiries ?? []).map(mapEnquiryToFollowUp),
  ];

  const hasFollowUps = overdue.length + dueToday.length > 0;

  if (!hasFollowUps) {
    return (
      <EmptyState
        title="All caught up!"
        description="No follow-ups due today. Add a client to get started."
        action={{ label: "Add a new client", href: "/clients/new" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FollowUpSection
        title="Overdue"
        items={overdue as never[]}
        isOverdue
        canMutate={canMutate}
      />
      <FollowUpSection
        title="Today's Follow-ups"
        items={dueToday as never[]}
        canMutate={canMutate}
      />
    </div>
  );
}

export function TodayFollowUpsSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-24 bg-[#b2b2b1]/15" />
      <div className="h-16 bg-[#f0eded]" />
      <div className="h-16 bg-[#f0eded]" />
      <div className="h-16 bg-[#f0eded]" />
    </div>
  );
}
