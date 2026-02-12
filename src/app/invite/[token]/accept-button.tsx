"use client";

import { useState, useTransition } from "react";
import { acceptInvitation } from "@/lib/actions/invitations";

export function AcceptButton({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    startTransition(async () => {
      try {
        await acceptInvitation(token);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isPending ? "Joining..." : "Accept invitation"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
