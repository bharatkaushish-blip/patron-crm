"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { updateEnquiry, deleteEnquiry } from "@/lib/actions/enquiries";

interface InventoryItem {
  id: string;
  title: string;
  artist: string | null;
  dimensions: string | null;
}

export interface EnquiryItem {
  id: string;
  clientId: string;
  size: string | null;
  budget: string | null;
  artist: string | null;
  timeline: string | null;
  workType: string | null;
  notes: string | null;
  createdAt: string;
  inventoryItemId: string | null;
  inventoryTitle: string | null;
}

interface EnquiryRowProps {
  enquiry: EnquiryItem;
  canEdit: boolean;
  canDelete: boolean;
  isLast: boolean;
  inventoryItems?: InventoryItem[];
}

function EnquiryRow({ enquiry, canEdit, canDelete, isLast, inventoryItems = [] }: EnquiryRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editSize, setEditSize] = useState(enquiry.size || "");
  const [editBudget, setEditBudget] = useState(enquiry.budget || "");
  const [editArtist, setEditArtist] = useState(enquiry.artist || "");
  const [editTimeline, setEditTimeline] = useState(enquiry.timeline || "");
  const [editWorkType, setEditWorkType] = useState(enquiry.workType || "");
  const [editNotes, setEditNotes] = useState(enquiry.notes || "");
  const [editInventoryItemId, setEditInventoryItemId] = useState(enquiry.inventoryItemId || "");

  const showMenuButton = canEdit || canDelete;

  function handleInventorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = e.target.value;
    setEditInventoryItemId(itemId);
    if (itemId) {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (item) {
        if (item.artist) setEditArtist(item.artist);
        if (item.dimensions) setEditSize(item.dimensions);
      }
    }
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", enquiry.id);
    formData.set("client_id", enquiry.clientId);
    formData.set("size", editSize);
    formData.set("budget", editBudget);
    formData.set("artist", editArtist);
    formData.set("timeline", editTimeline);
    formData.set("work_type", editWorkType);
    formData.set("notes", editNotes);
    if (editInventoryItemId) {
      formData.set("inventory_item_id", editInventoryItemId);
    }

    startTransition(async () => {
      await updateEnquiry(formData);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteEnquiry(enquiry.id, enquiry.clientId);
    });
  }

  const fields = [
    { label: "Budget", value: enquiry.budget },
    { label: "Size", value: enquiry.size },
    { label: "Artist", value: enquiry.artist },
    { label: "Type", value: enquiry.workType },
  ].filter((f) => f.value);

  const timelineLabel = enquiry.timeline
    ? new Date(enquiry.timeline + "T00:00:00").toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const dateLabel = new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className={`py-3 space-y-2 ${!isLast ? "border-b border-neutral-100" : ""}`}
      >
        {inventoryItems.length > 0 && (
          <select
            value={editInventoryItemId}
            onChange={handleInventorySelect}
            className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="">Link artwork (optional)</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
                {item.artist ? ` — ${item.artist}` : ""}
              </option>
            ))}
          </select>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            value={editSize}
            onChange={(e) => setEditSize(e.target.value)}
            placeholder="Size"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <input
            value={editBudget}
            onChange={(e) => setEditBudget(e.target.value)}
            placeholder="Budget"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={editArtist}
            onChange={(e) => setEditArtist(e.target.value)}
            placeholder="Artist"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <input
            value={editTimeline}
            onChange={(e) => setEditTimeline(e.target.value)}
            type="date"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <input
          value={editWorkType}
          onChange={(e) => setEditWorkType(e.target.value)}
          placeholder="Type of work"
          className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes"
          rows={2}
          className="w-full resize-none rounded-md border border-neutral-300 px-3 py-1.5 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setEditSize(enquiry.size || "");
              setEditBudget(enquiry.budget || "");
              setEditArtist(enquiry.artist || "");
              setEditTimeline(enquiry.timeline || "");
              setEditWorkType(enquiry.workType || "");
              setEditNotes(enquiry.notes || "");
              setEditInventoryItemId(enquiry.inventoryItemId || "");
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
      className={`flex items-start justify-between gap-2 py-3 transition-opacity ${
        isPending ? "opacity-50" : ""
      } ${!isLast ? "border-b border-neutral-100" : ""}`}
    >
      <div className="min-w-0 flex-1">
        {enquiry.inventoryTitle && (
          <p className="text-xs font-medium text-indigo-600 mb-0.5">
            <span className="text-neutral-400">Artwork:</span> {enquiry.inventoryTitle}
          </p>
        )}

        {fields.length > 0 ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {fields.map((f) => (
              <span key={f.label} className="text-xs text-neutral-600">
                <span className="text-neutral-400">{f.label}:</span> {f.value}
              </span>
            ))}
          </div>
        ) : null}

        {timelineLabel ? (
          <p className="mt-0.5 text-xs text-neutral-500">
            <span className="text-neutral-400">Timeline:</span> {timelineLabel}
          </p>
        ) : null}

        {enquiry.notes ? (
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
            {enquiry.notes}
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
            <MoreHorizontal className="h-3.5 w-3.5" />
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
  );
}

// --- Grouped card: one card per client, multiple enquiries inside ---

const avatarColors = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface EnquiryGroupCardProps {
  clientId: string;
  clientName: string;
  enquiries: EnquiryItem[];
  canEdit: boolean;
  canDelete: boolean;
  inventoryItems?: InventoryItem[];
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function EnquiryGroupCard({
  clientId,
  clientName,
  enquiries,
  canEdit,
  canDelete,
  inventoryItems = [],
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: EnquiryGroupCardProps) {
  const initial = clientName.charAt(0).toUpperCase();

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Client header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(clientName)}`}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={`/clients/${clientId}`}
            className="text-sm font-semibold text-neutral-900 hover:underline truncate block"
          >
            {clientName}
          </a>
          <span className="text-[10px] text-neutral-400">
            {enquiries.length} enquir{enquiries.length === 1 ? "y" : "ies"}
          </span>
        </div>
      </div>

      {/* Enquiry rows */}
      <div>
        {enquiries.map((enq, idx) => (
          <EnquiryRow
            key={enq.id}
            enquiry={enq}
            canEdit={canEdit}
            canDelete={canDelete}
            isLast={idx === enquiries.length - 1}
            inventoryItems={inventoryItems}
          />
        ))}
      </div>
    </div>
  );
}
