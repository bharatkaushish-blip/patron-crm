"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, CalendarClock } from "lucide-react";
import { markFollowUpDone, rescheduleFollowUp } from "@/lib/actions/notes";
import { markEnquiryTimelineDone, rescheduleEnquiryTimeline } from "@/lib/actions/enquiries";
import { cn } from "@/lib/utils";

const avatarColors = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface FollowUpItemProps {
  noteId: string;
  clientId: string;
  clientName: string;
  content: string;
  followUpDate: string;
  isOverdue: boolean;
  canMutate?: boolean;
  type?: "note" | "enquiry";
}

export function FollowUpItem({
  noteId,
  clientId,
  clientName,
  content,
  followUpDate,
  isOverdue,
  canMutate = true,
  type = "note",
}: FollowUpItemProps) {
  const [isPending, startTransition] = useTransition();
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");

  function handleDone() {
    startTransition(async () => {
      if (type === "enquiry") {
        await markEnquiryTimelineDone(noteId);
      } else {
        await markFollowUpDone(noteId);
      }
    });
  }

  function handleReschedule() {
    if (!newDate) return;
    startTransition(async () => {
      if (type === "enquiry") {
        await rescheduleEnquiryTimeline(noteId, newDate);
      } else {
        await rescheduleFollowUp(noteId, newDate);
      }
      setShowReschedule(false);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-white p-4 transition-opacity",
        isOverdue ? "border-red-200" : "border-neutral-200",
        isPending && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          getAvatarColor(clientName)
        )}
      >
        {getInitials(clientName)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/clients/${clientId}`}
                className="text-sm font-semibold text-neutral-900 hover:underline"
              >
                {clientName}
              </Link>
              {type === "enquiry" && (
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                  Enquiry
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-neutral-500 line-clamp-2">
              {content}
            </p>
            {isOverdue && (
              <p className="mt-1 text-xs font-medium text-red-500">
                Overdue ·{" "}
                {new Date(followUpDate + "T00:00:00").toLocaleDateString(
                  "en-IN",
                  { month: "short", day: "numeric" }
                )}
              </p>
            )}
          </div>

          {canMutate && (
            <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                disabled={isPending}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                title="Reschedule"
              >
                <CalendarClock className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDone}
                disabled={isPending}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-green-50 hover:text-green-600"
                title="Mark done"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {showReschedule && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <button
              onClick={handleReschedule}
              disabled={!newDate || isPending}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Reschedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
