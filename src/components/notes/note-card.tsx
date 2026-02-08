"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, Check, CalendarClock, X } from "lucide-react";
import { updateNote, deleteNote, markFollowUpDone, rescheduleFollowUp } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  id: string;
  clientId: string;
  content: string;
  createdAt: string;
  followUpDate: string | null;
  followUpStatus: string | null;
}

export function NoteCard({
  id,
  clientId,
  content,
  createdAt,
  followUpDate,
  followUpStatus,
}: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const isOverdue =
    followUpDate &&
    followUpStatus === "pending" &&
    new Date(followUpDate + "T00:00:00") < new Date(new Date().toISOString().split("T")[0] + "T00:00:00");

  function handleSaveEdit() {
    if (!editContent.trim()) return;
    startTransition(async () => {
      await updateNote(id, editContent.trim(), clientId);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteNote(id, clientId);
    });
  }

  function handleMarkDone() {
    startTransition(async () => {
      await markFollowUpDone(id, clientId);
    });
  }

  function handleReschedule() {
    if (!newDate) return;
    startTransition(async () => {
      await rescheduleFollowUp(id, newDate, clientId);
      setShowReschedule(false);
      setNewDate("");
    });
  }

  const dateLabel = new Date(createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-3 transition-opacity",
        followUpDate && followUpStatus === "pending"
          ? isOverdue
            ? "border-red-200"
            : "border-amber-200"
          : "border-neutral-200",
        isPending && "opacity-50"
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(content);
              }}
              className="rounded-md px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-neutral-700 whitespace-pre-wrap flex-1">
              {content}
            </p>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md p-1 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu ? (
                <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-400">
            <span>{dateLabel}</span>
            {followUpDate && followUpStatus === "pending" ? (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                  isOverdue
                    ? "bg-red-50 text-red-500"
                    : "bg-amber-50 text-amber-600"
                )}
              >
                Follow-up:{" "}
                {new Date(followUpDate + "T00:00:00").toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : null}
            {followUpDate && followUpStatus === "done" ? (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-600">
                <Check className="h-3 w-3" />
                Done
              </span>
            ) : null}
          </div>

          {/* Follow-up actions */}
          {followUpDate && followUpStatus === "pending" ? (
            <div className="mt-2 flex items-center gap-2 border-t border-neutral-100 pt-2">
              <button
                onClick={handleMarkDone}
                disabled={isPending}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-green-50 hover:text-green-600"
              >
                <Check className="h-3 w-3" />
                Done
              </button>
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                disabled={isPending}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
              >
                <CalendarClock className="h-3 w-3" />
                Reschedule
              </button>
            </div>
          ) : null}

          {showReschedule ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <button
                onClick={handleReschedule}
                disabled={!newDate || isPending}
                className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowReschedule(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
