"use client";

import { useState, useTransition, useEffect } from "react";
import { Trash2, Mail, X, Check, Link } from "lucide-react";
import {
  inviteUser,
  cancelInvitation,
  updateUserPermissions,
  removeUserFromOrg,
} from "@/lib/actions/invitations";
import type { UserPermissions } from "@/lib/permissions";

interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_superadmin: boolean;
  permissions: UserPermissions;
}

interface PendingInvite {
  id: string;
  email: string;
  permissions: UserPermissions;
  created_at: string;
}

interface TeamSectionProps {
  members: TeamMember[];
  pendingInvites: PendingInvite[];
  currentUserId: string;
}

export function TeamSection({
  members,
  pendingInvites,
  currentUserId,
}: TeamSectionProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [invitePerms, setInvitePerms] = useState<UserPermissions>({
    can_delete: false,
    can_access_settings: false,
    can_see_pricing: false,
    read_only: false,
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    const formData = new FormData();
    formData.set("email", inviteEmail);
    formData.set("can_delete", invitePerms.can_delete.toString());
    formData.set("can_access_settings", invitePerms.can_access_settings.toString());
    formData.set("can_see_pricing", invitePerms.can_see_pricing.toString());
    formData.set("read_only", invitePerms.read_only.toString());

    startTransition(async () => {
      const result = await inviteUser(formData);
      if (result?.error) {
        setToast("Failed to create invitation.");
        return;
      }
      setInviteEmail("");
      setShowInviteForm(false);
      setInvitePerms({
        can_delete: false,
        can_access_settings: false,
        can_see_pricing: false,
        read_only: false,
      });

      if (result?.inviteUrl && !result.emailSent) {
        try {
          await navigator.clipboard.writeText(result.inviteUrl);
          setToast("Invite link copied! Share it with your team member.");
        } catch {
          setToast("Invite created — copy the link from pending invitations.");
        }
      } else if (result?.emailSent) {
        setToast("Invitation email sent!");
      }
    });
  }

  function handleCancelInvite(id: string) {
    startTransition(async () => {
      await cancelInvitation(id);
    });
  }

  function handleTogglePermission(userId: string, currentPerms: UserPermissions, key: keyof UserPermissions) {
    const updated = { ...currentPerms, [key]: !currentPerms[key] };
    startTransition(async () => {
      await updateUserPermissions(userId, updated);
    });
  }

  function handleRemove(userId: string) {
    if (!confirm("Remove this user from your organization?")) return;
    startTransition(async () => {
      await removeUserFromOrg(userId);
    });
  }

  const userMembers = members.filter((m) => m.role === "user");
  const adminMembers = members.filter((m) => m.role !== "user");

  return (
    <section className="space-y-4">
      {/* Toast notification */}
      {toast && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 shrink-0" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Team</h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          Invite
        </button>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            <button
              onClick={() => setShowInviteForm(false)}
              className="p-2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-neutral-500">Permissions</p>
            {(
              [
                { key: "can_delete" as const, label: "Can delete" },
                { key: "can_access_settings" as const, label: "Can access settings" },
                { key: "can_see_pricing" as const, label: "Can see pricing" },
                { key: "read_only" as const, label: "Read only" },
              ] as const
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={invitePerms[key]}
                  onChange={() =>
                    setInvitePerms((p) => ({ ...p, [key]: !p[key] }))
                  }
                  className="rounded border-neutral-300"
                />
                {label}
              </label>
            ))}
          </div>
          <button
            onClick={handleInvite}
            disabled={isPending || !inviteEmail.trim()}
            className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {isPending ? "Sending..." : "Send invite"}
          </button>
        </div>
      )}

      {/* Admin members */}
      {adminMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Admins
          </p>
          {adminMembers.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {m.full_name || "Unnamed"}
                  {m.id === currentUserId && (
                    <span className="ml-1 text-xs text-neutral-400">(you)</span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">{m.email}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {m.is_superadmin ? "Superadmin" : "Admin"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* User members */}
      {userMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Users
          </p>
          {userMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {m.full_name || "Unnamed"}
                  </p>
                  <p className="text-xs text-neutral-500">{m.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={isPending}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                  title="Remove user"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "can_delete" as const, label: "Delete" },
                    { key: "can_access_settings" as const, label: "Settings" },
                    { key: "can_see_pricing" as const, label: "Pricing" },
                    { key: "read_only" as const, label: "Read-only" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleTogglePermission(m.id, m.permissions, key)}
                    disabled={isPending}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
                      m.permissions[key]
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    } ${isPending ? "opacity-50" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending invitations */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
            Pending invitations
          </p>
          {pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3"
            >
              <div>
                <p className="text-sm text-neutral-700">{inv.email}</p>
                <p className="text-[10px] text-neutral-400">
                  Invited{" "}
                  {new Date(inv.created_at).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => handleCancelInvite(inv.id)}
                disabled={isPending}
                className="text-xs text-neutral-400 hover:text-red-500"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
