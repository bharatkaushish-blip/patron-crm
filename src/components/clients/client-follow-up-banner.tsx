import { createClient } from "@/lib/supabase/server";

export async function ClientFollowUpBanner({
  clientId,
  orgId,
}: {
  clientId: string;
  orgId: string;
}) {
  const supabase = await createClient();

  const { data: followUp } = await supabase
    .from("notes")
    .select("follow_up_date")
    .eq("client_id", clientId)
    .eq("organization_id", orgId)
    .eq("follow_up_status", "pending")
    .not("follow_up_date", "is", null)
    .order("follow_up_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!followUp) return null;

  return (
    <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-700">
      Follow-up due{" "}
      {new Date(followUp.follow_up_date + "T00:00:00").toLocaleDateString(
        "en-IN",
        { month: "short", day: "numeric" }
      )}
    </div>
  );
}
