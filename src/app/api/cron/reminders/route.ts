import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Get all pending follow-ups due today or overdue
  const { data: followUps } = await supabase
    .from("notes")
    .select(
      "id, content, follow_up_date, client_id, organization_id, clients!inner(name)"
    )
    .eq("follow_up_status", "pending")
    .lte("follow_up_date", today);

  if (!followUps || followUps.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  // Group follow-ups by organization
  const byOrg = new Map<string, typeof followUps>();
  for (const fu of followUps) {
    const existing = byOrg.get(fu.organization_id) || [];
    existing.push(fu);
    byOrg.set(fu.organization_id, existing);
  }

  let sent = 0;

  for (const [orgId, orgFollowUps] of byOrg) {
    // Get profiles for this org to find email + reminder preferences
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, reminder_time")
      .eq("organization_id", orgId);

    if (!profiles || profiles.length === 0) continue;

    for (const profile of profiles) {
      // Get the user's email from auth
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(profile.id);
      if (!user?.email) continue;

      const lines = orgFollowUps.map((fu) => {
        const clientName = (fu.clients as any)?.name || "Unknown";
        const isOverdue = fu.follow_up_date < today;
        const label = isOverdue ? "OVERDUE" : "Due today";
        const snippet =
          fu.content.length > 80
            ? fu.content.slice(0, 80) + "…"
            : fu.content;
        return `• [${label}] ${clientName}: ${snippet}`;
      });

      const count = orgFollowUps.length;

      try {
        await resend.emails.send({
          from: "Patron <reminders@patron.app>",
          to: user.email,
          subject: `You have ${count} follow-up${count > 1 ? "s" : ""} today`,
          text: `Hi ${profile.full_name || "there"},\n\nYou have ${count} follow-up${count > 1 ? "s" : ""} due:\n\n${lines.join("\n")}\n\nOpen Patron to manage them: ${process.env.NEXT_PUBLIC_APP_URL}/today\n\n— Patron`,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder to ${user.email}:`, err);
      }
    }
  }

  return NextResponse.json({ sent });
}
