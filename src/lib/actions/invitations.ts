"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthContext, requireAdminRole } from "@/lib/auth-context";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserPermissions } from "@/lib/permissions";

export async function inviteUser(formData: FormData) {
  await requireAdminRole();
  const { userId, orgId } = await getAuthContext();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) throw new Error("Email is required");

  const permissions: UserPermissions = {
    can_delete: formData.get("can_delete") === "true",
    can_access_settings: formData.get("can_access_settings") === "true",
    can_see_pricing: formData.get("can_see_pricing") === "true",
    read_only: formData.get("read_only") === "true",
  };

  const adminClient = createAdminClient();

  const { data: invitation, error } = await adminClient
    .from("invitations")
    .insert({
      organization_id: orgId,
      email,
      permissions,
      invited_by: userId,
    })
    .select("token")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Get org name and inviter name for the email
  const { data: org } = await adminClient
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  const { data: inviter } = await adminClient
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .single();

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`;

  // Send invitation email via Resend
  let emailSent = false;
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const inviterName = inviter?.full_name || "Someone";
      const orgName = org?.name || "their gallery";

      await resend.emails.send({
        from: "Patron <invites@patroncollective.com>",
        to: email,
        subject: `${inviterName} invited you to ${orgName} on Patron`,
        text: `Hi,\n\n${inviterName} has invited you to join ${orgName} on Patron.\n\nAccept the invitation:\n${inviteUrl}\n\nThis invitation expires in 7 days.\n\n— Patron`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;border:1px solid #e5e5e5;padding:48px 40px;">
        <tr><td>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#171717;">
            <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on Patron.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr><td>
            <a href="${inviteUrl}" style="display:inline-block;background-color:#171717;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;padding:10px 24px;border-radius:8px;">
              Accept invitation
            </a>
          </td></tr></table>
          <p style="margin:0 0 4px;font-size:12px;color:#a3a3a3;">This invitation expires in 7 days.</p>
          <p style="margin:0;font-size:12px;color:#a3a3a3;">If you didn't expect this, you can ignore this email.</p>
        </td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:11px;color:#a3a3a3;">Patron</p>
    </td></tr>
  </table>
</body>
</html>`,
      });
      emailSent = true;
    } catch (err) {
      console.error("Failed to send invitation email:", err);
    }
  }

  revalidatePath("/settings");
  return { success: true, inviteUrl, emailSent };
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminClient = createAdminClient();

  // Fetch invitation
  const { data: invitation } = await adminClient
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invitation) {
    throw new Error("Invalid or expired invitation.");
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await adminClient
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", invitation.id);
    throw new Error("This invitation has expired.");
  }

  // Update user's profile to join the org
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      organization_id: invitation.organization_id,
      role: "user",
      permissions: invitation.permissions,
      invited_by: invitation.invited_by,
    })
    .eq("id", user.id);

  if (profileError) {
    throw new Error("Failed to join organization: " + profileError.message);
  }

  // Mark invitation as accepted
  await adminClient
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  redirect("/today");
}

export async function getTeamMembers() {
  await requireAdminRole();
  const { orgId } = await getAuthContext();

  const adminClient = createAdminClient();

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, role, is_superadmin, permissions, created_at")
    .eq("organization_id", orgId)
    .order("created_at");

  if (!profiles) return [];

  // Get emails for each profile
  const members = await Promise.all(
    profiles.map(async (profile) => {
      const {
        data: { user },
      } = await adminClient.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        email: user?.email || "",
      };
    })
  );

  return members;
}

export async function getPendingInvitations() {
  await requireAdminRole();
  const { orgId } = await getAuthContext();

  const adminClient = createAdminClient();

  const { data } = await adminClient
    .from("invitations")
    .select("id, email, permissions, status, created_at, expires_at")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function cancelInvitation(invitationId: string) {
  await requireAdminRole();
  const { orgId } = await getAuthContext();

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("invitations")
    .update({ status: "expired" })
    .eq("id", invitationId)
    .eq("organization_id", orgId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
}

export async function updateUserPermissions(
  userId: string,
  permissions: UserPermissions
) {
  await requireAdminRole();
  const { orgId } = await getAuthContext();

  const adminClient = createAdminClient();

  // Verify user is in same org
  const { data: target } = await adminClient
    .from("profiles")
    .select("organization_id, role")
    .eq("id", userId)
    .single();

  if (!target || target.organization_id !== orgId) {
    throw new Error("User not found in your organization.");
  }

  if (target.role !== "user") {
    throw new Error("Can only update permissions for users.");
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ permissions })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
}

export async function removeUserFromOrg(userId: string) {
  await requireAdminRole();
  const { orgId } = await getAuthContext();

  const adminClient = createAdminClient();

  // Verify user is in same org and is a 'user' role
  const { data: target } = await adminClient
    .from("profiles")
    .select("organization_id, role")
    .eq("id", userId)
    .single();

  if (!target || target.organization_id !== orgId) {
    throw new Error("User not found in your organization.");
  }

  if (target.role !== "user") {
    throw new Error("Can only remove users, not admins.");
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ organization_id: null, role: "admin", permissions: '{"can_delete":false,"can_access_settings":false,"can_see_pricing":false,"read_only":false}' })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
}
