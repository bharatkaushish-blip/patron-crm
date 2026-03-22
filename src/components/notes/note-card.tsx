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
  canEdit?: boolean;
  canDelete?: boolean;
}

export function NoteCard({
  id,
  clientId,
  content,
  createdAt,
  followUpDate,
  followUpStatus,
  canEdit = true,
  canDelete = true,
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

  const showMenuButton = canEdit || canDelete;

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
        "border bg-[#ffffff] p-3 transition-opacity",
        followUpDate && followUpStatus === "pending"
          ? isOverdue
            ? "border-red-200"
            : "border-amber-200"
          : "border-[#b2b2b1]/15",
        isPending && "opacity-50"
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full resize-none border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="bg-[#735a3a] px-3 py-1.5 text-xs font-medium font-body text-white hover:bg-[#664e30]"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(content);
              }}
              className="px-3 py-1.5 text-xs font-body text-[#5f5f5f] hover:bg-[#f0eded]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-body text-neutral-700 whitespace-pre-wrap flex-1">
              {content}
            </p>
            {showMenuButton && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-[#b2b2b1]/20 hover:bg-[#f0eded] hover:text-[#5f5f5f]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showMenu ? (
                  <div className="absolute right-0 top-full z-10 mt-1 w-32 border border-[#b2b2b1]/15 bg-[#ffffff] py-1 shadow-lg">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-body text-neutral-600 hover:bg-[#f6f3f2]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-body text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs font-body text-[#9e9c9c]">
            <span>{dateLabel}</span>
            {followUpDate && followUpStatus === "pending" ? (
              <span
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 font-medium",
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
              <span className="flex items-center gap-1 bg-green-50 px-2 py-0.5 font-medium text-green-600">
                <Check className="h-3 w-3" />
                Done
              </span>
            ) : null}
          </div>

          {/* Follow-up actions */}
          {followUpDate && followUpStatus === "pending" && canEdit ? (
            <div className="mt-2 flex items-center gap-2 border-t border-[#f0eded] pt-2">
              <button
                onClick={handleMarkDone}
                disabled={isPending}
                className="flex items-center gap-1 px-2 py-1 text-xs font-body text-[#5f5f5f] hover:bg-green-50 hover:text-green-600"
              >
                <Check className="h-3 w-3" />
                Done
              </button>
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                disabled={isPending}
                className="flex items-center gap-1 px-2 py-1 text-xs font-body text-[#5f5f5f] hover:bg-[#f0eded]"
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
                className="border border-[#b2b2b1]/20 px-2 py-1 text-xs font-body focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
              />
              <button
                onClick={handleReschedule}
                disabled={!newDate || isPending}
                className="bg-[#735a3a] px-2.5 py-1 text-xs font-medium font-body text-white hover:bg-[#664e30] disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setShowReschedule(false)}
                className="p-1 text-[#9e9c9c] hover:text-neutral-600"
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
