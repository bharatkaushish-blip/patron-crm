"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, CalendarClock } from "lucide-react";
import { markFollowUpDone, rescheduleFollowUp } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";

interface FollowUpItemProps {
  noteId: string;
  clientId: string;
  clientName: string;
  content: string;
  followUpDate: string;
  isOverdue: boolean;
}

export function FollowUpItem({
  noteId,
  clientId,
  clientName,
  content,
  followUpDate,
  isOverdue,
}: FollowUpItemProps) {
  const [isPending, startTransition] = useTransition();
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");

  function handleDone() {
    startTransition(async () => {
      await markFollowUpDone(noteId);
    });
  }

  function handleReschedule() {
    if (!newDate) return;
    startTransition(async () => {
      await rescheduleFollowUp(noteId, newDate);
      setShowReschedule(false);
    });
  }

  const dateLabel = new Date(followUpDate + "T00:00:00").toLocaleDateString(
    "en-IN",
    { month: "short", day: "numeric" }
  );

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4 transition-opacity",
        isOverdue ? "border-red-200 bg-red-50/50" : "border-neutral-200",
        isPending && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/clients/${clientId}`}
            className="text-sm font-medium text-neutral-900 hover:underline"
          >
            {clientName}
          </Link>
          <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">
            {content}
          </p>
          <p
            className={cn(
              "mt-1.5 text-xs",
              isOverdue ? "text-red-500 font-medium" : "text-neutral-400"
            )}
          >
            {isOverdue ? `Overdue · ${dateLabel}` : dateLabel}
          </p>
        </div>

        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => setShowReschedule(!showReschedule)}
            disabled={isPending}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            title="Reschedule"
          >
            <CalendarClock className="h-4 w-4" />
          </button>
          <button
            onClick={handleDone}
            disabled={isPending}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-green-50 hover:text-green-600"
            title="Mark done"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showReschedule ? (
        <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <button
            onClick={handleReschedule}
            disabled={!newDate || isPending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Reschedule
          </button>
        </div>
      ) : null}
    </div>
  );
}
