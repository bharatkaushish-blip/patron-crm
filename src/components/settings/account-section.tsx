"use client";

import { useTransition } from "react";
import { signOut } from "@/lib/actions/auth";

interface AccountSectionProps {
  subscriptionStatus: string;
  trialEndsAt: string;
}

export function AccountSection({
  subscriptionStatus,
  trialEndsAt,
}: AccountSectionProps) {
  const [isPending, startTransition] = useTransition();

  const trialEnd = trialEndsAt ? new Date(trialEndsAt) : null;
  const daysLeft = trialEnd
    ? Math.max(
        0,
        Math.ceil(
          (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const isTrialing = subscriptionStatus === "trialing";
  const isActive = subscriptionStatus === "active";

  const statusLabel = isTrialing
    ? daysLeft > 0
      ? `Trial (${daysLeft} day${daysLeft !== 1 ? "s" : ""} left)`
      : "Trial expired"
    : isActive
      ? "Active"
      : subscriptionStatus;

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <section>
      <h2 className="text-sm font-body font-medium text-[#5f5f5f] uppercase tracking-wide mb-3">
        Account
      </h2>
      <div className="border border-[#b2b2b1]/15 bg-[#ffffff] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body font-medium text-neutral-700">Subscription</p>
            <p className="text-xs font-body text-[#9e9c9c]">{statusLabel}</p>
          </div>
          {/* Billing integration (Razorpay) coming soon */}
        </div>

        <div className="border-t border-[#f0eded] pt-4">
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="border border-red-200 px-4 py-2 text-sm font-body font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </section>
  );
}
