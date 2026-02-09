"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { updateEnquiry, deleteEnquiry } from "@/lib/actions/enquiries";

interface EnquiryCardProps {
  id: string;
  clientId: string;
  clientName?: string;
  size: string | null;
  budget: string | null;
  artist: string | null;
  timeline: string | null;
  workType: string | null;
  notes: string | null;
  createdAt: string;
  showClientName?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function EnquiryCard({
  id,
  clientId,
  clientName,
  size,
  budget,
  artist,
  timeline,
  workType,
  notes,
  createdAt,
  showClientName = false,
  canEdit = true,
  canDelete = true,
}: EnquiryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editSize, setEditSize] = useState(size || "");
  const [editBudget, setEditBudget] = useState(budget || "");
  const [editArtist, setEditArtist] = useState(artist || "");
  const [editTimeline, setEditTimeline] = useState(timeline || "");
  const [editWorkType, setEditWorkType] = useState(workType || "");
  const [editNotes, setEditNotes] = useState(notes || "");

  const showMenuButton = canEdit || canDelete;

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", id);
    formData.set("client_id", clientId);
    formData.set("size", editSize);
    formData.set("budget", editBudget);
    formData.set("artist", editArtist);
    formData.set("timeline", editTimeline);
    formData.set("work_type", editWorkType);
    formData.set("notes", editNotes);

    startTransition(async () => {
      await updateEnquiry(formData);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteEnquiry(id, clientId);
    });
  }

  const timelineLabel = timeline
    ? new Date(timeline + "T00:00:00").toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const fields = [
    { label: "Size", value: size },
    { label: "Budget", value: budget },
    { label: "Artist", value: artist },
    { label: "Timeline", value: timelineLabel },
    { label: "Type", value: workType },
  ].filter((f) => f.value);

  const dateLabel = new Date(createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2"
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            value={editSize}
            onChange={(e) => setEditSize(e.target.value)}
            placeholder="Size"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <input
            value={editBudget}
            onChange={(e) => setEditBudget(e.target.value)}
            placeholder="Budget"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={editArtist}
            onChange={(e) => setEditArtist(e.target.value)}
            placeholder="Artist"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <input
            value={editTimeline}
            onChange={(e) => setEditTimeline(e.target.value)}
            type="date"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <input
          value={editWorkType}
          onChange={(e) => setEditWorkType(e.target.value)}
          placeholder="Type of work"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes"
          rows={2}
          className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditSize(size || "");
              setEditBudget(budget || "");
              setEditArtist(artist || "");
              setEditTimeline(timeline || "");
              setEditWorkType(workType || "");
              setEditNotes(notes || "");
            }}
            className="rounded-md px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`rounded-lg border border-neutral-200 bg-white p-3 transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {showClientName && clientName ? (
            <a
              href={`/clients/${clientId}`}
              className="text-sm font-medium text-neutral-800 hover:underline"
            >
              {clientName}
            </a>
          ) : null}

          {fields.length > 0 ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {fields.map((f) => (
                <span key={f.label} className="text-xs text-neutral-600">
                  <span className="text-neutral-400">{f.label}:</span> {f.value}
                </span>
              ))}
            </div>
          ) : null}

          {notes ? (
            <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2">
              {notes}
            </p>
          ) : null}

          <p className="mt-1 text-[10px] text-neutral-400">{dateLabel}</p>
        </div>

        {showMenuButton && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-md p-1 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu ? (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                {canEdit && (
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
                )}
                {canDelete && (
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
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
