"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { GlowCard } from "@/components/ui/spotlight-card";

export function GlowPricingGrid() {
  const router = useRouter();

  return (
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Free Trial */}
      <GlowCard
        glowColor="blue"
        customSize
        className="!aspect-auto !grid-rows-none !p-8 !gap-0"
      >
        <div className="relative z-10">
          <p className="text-sm font-medium text-neutral-400">Free Trial</p>
          <p className="mt-4 text-4xl font-bold text-white">
            ₹0
            <span className="text-base font-normal text-neutral-500">
              {" "}/ 14 days
            </span>
          </p>
          <ul className="mt-8 space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Unlimited clients
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Notes & follow-ups
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Sales & enquiry tracking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> CSV import & export
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Email reminders
            </li>
          </ul>
          <button
            onClick={() => router.push("/signup")}
            className="mt-8 block w-full rounded-full border border-white/10 py-3 text-center text-sm font-medium text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Start free trial
          </button>
        </div>
      </GlowCard>

      {/* Pro */}
      <GlowCard
        glowColor="purple"
        customSize
        className="!aspect-auto !grid-rows-none !p-8 !gap-0"
      >
        <div className="relative z-10">
          <div className="absolute top-0 right-0 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-300">
            Coming soon
          </div>
          <p className="text-sm font-medium text-neutral-400">Pro</p>
          <p className="mt-4 text-4xl font-bold text-white">
            TBD
            <span className="text-base font-normal text-neutral-500">
              {" "}/ month
            </span>
          </p>
          <ul className="mt-8 space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Everything in Free
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Unlimited usage forever
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Priority support
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Team members
            </li>
            <li className="flex items-center gap-2">
              <span className="text-white">✓</span> Advanced analytics
            </li>
          </ul>
          <div className="mt-8 block w-full rounded-full border border-white/5 py-3 text-center text-sm text-neutral-500">
            Notify me
          </div>
        </div>
      </GlowCard>
    </div>
  );
}
