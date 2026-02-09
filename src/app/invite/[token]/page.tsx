import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { AcceptButton } from "./accept-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const adminClient = createAdminClient();

  // Fetch invitation
  const { data: invitation } = await adminClient
    .from("invitations")
    .select("id, email, status, expires_at, organization_id, organizations(name)")
    .eq("token", token)
    .single();

  if (!invitation) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Invalid invitation</h1>
          <p className="text-sm text-neutral-500">
            This invitation link is not valid.
          </p>
          <Link href="/login" className="text-sm font-medium text-neutral-900 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const isExpired =
    invitation.status === "expired" ||
    invitation.status === "accepted" ||
    new Date(invitation.expires_at) < new Date();

  if (isExpired) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Invitation expired</h1>
          <p className="text-sm text-neutral-500">
            This invitation has {invitation.status === "accepted" ? "already been used" : "expired"}.
          </p>
          <Link href="/login" className="text-sm font-medium text-neutral-900 hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const orgName = (invitation.organizations as unknown as { name: string })?.name || "a gallery";

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Join {orgName}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              You&apos;ve been invited to join <strong>{orgName}</strong> on Patron.
            </p>
          </div>
          <AcceptButton token={token} />
        </div>
      </div>
    );
  }

  // Not logged in
  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Join {orgName}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            You&apos;ve been invited to join <strong>{orgName}</strong> on Patron.
            Sign in or create an account to continue.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href={`/signup?invite=${token}`}
            className="block w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Create account
          </Link>
          <Link
            href={`/login?invite=${token}`}
            className="block w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
