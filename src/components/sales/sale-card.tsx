"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { updateSale, deleteSale } from "@/lib/actions/sales";
import { formatCurrency } from "@/lib/format-currency";

interface InventoryItem {
  id: string;
  title: string;
  artist: string | null;
  asking_price: number | null;
}

interface SaleCardProps {
  id: string;
  clientId: string;
  artworkName: string | null;
  artistName: string | null;
  amount: number | null;
  saleDate: string;
  notes: string | null;
  currency: string;
  canEdit?: boolean;
  canDelete?: boolean;
  inventoryItems?: InventoryItem[];
  inventoryItemId?: string | null;
}

export function SaleCard({
  id,
  clientId,
  artworkName,
  artistName,
  amount,
  saleDate,
  notes,
  currency,
  canEdit = true,
  canDelete = true,
  inventoryItems = [],
  inventoryItemId = null,
}: SaleCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editArtwork, setEditArtwork] = useState(artworkName || "");
  const [editArtist, setEditArtist] = useState(artistName || "");
  const [editAmount, setEditAmount] = useState(amount?.toString() || "");
  const [editDate, setEditDate] = useState(saleDate);
  const [editNotes, setEditNotes] = useState(notes || "");
  const [editInventoryItemId, setEditInventoryItemId] = useState(inventoryItemId || "");

  const showMenuButton = canEdit || canDelete;

  function handleInventorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = e.target.value;
    setEditInventoryItemId(itemId);
    if (itemId) {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (item) {
        setEditArtwork(item.title);
        setEditArtist(item.artist || "");
        if (item.asking_price) setEditAmount(item.asking_price.toString());
      }
    }
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("id", id);
    formData.set("client_id", clientId);
    formData.set("artwork_name", editArtwork);
    formData.set("artist_name", editArtist);
    formData.set("amount", editAmount);
    formData.set("sale_date", editDate);
    formData.set("notes", editNotes);
    if (editInventoryItemId) {
      formData.set("inventory_item_id", editInventoryItemId);
    }

    startTransition(async () => {
      await updateSale(formData);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSale(id, clientId);
    });
  }

  const dateLabel = new Date(saleDate + "T00:00:00").toLocaleDateString(
    "en-IN",
    { month: "short", day: "numeric", year: "numeric" }
  );

  // Find the linked inventory item title for view mode
  const linkedItem = inventoryItemId
    ? inventoryItems.find((i) => i.id === inventoryItemId)
    : null;

  if (isEditing) {
    return (
      <form
        onSubmit={handleSaveEdit}
        className="rounded-lg border border-neutral-200 bg-white p-3 space-y-2"
      >
        {inventoryItems.length > 0 && (
          <select
            value={editInventoryItemId}
            onChange={handleInventorySelect}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
        <div className="flex gap-3">
          <input
            value={editArtwork}
            onChange={(e) => setEditArtwork(e.target.value)}
            placeholder="Artwork name"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <input
            value={editArtist}
            onChange={(e) => setEditArtist(e.target.value)}
            placeholder="Artist name"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div className="flex gap-3">
          <input
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Amount"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <input
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            type="date"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <textarea
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
              setEditArtwork(artworkName || "");
              setEditArtist(artistName || "");
              setEditAmount(amount?.toString() || "");
              setEditDate(saleDate);
              setEditNotes(notes || "");
              setEditInventoryItemId(inventoryItemId || "");
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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700 truncate">
              {artworkName || "Untitled sale"}
              {artistName ? (
                <span className="font-normal text-neutral-400"> — {artistName}</span>
              ) : null}
            </p>
            {amount ? (
              <p className="text-sm font-medium text-neutral-900 shrink-0 ml-2">
                {formatCurrency(Number(amount), currency)}
              </p>
            ) : null}
          </div>
          {linkedItem && (
            <p className="mt-0.5 text-[10px] font-medium text-indigo-500">
              Linked to inventory
            </p>
          )}
          {notes ? (
            <p className="mt-1 text-xs text-neutral-500 line-clamp-2">
              {notes}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-neutral-400">{dateLabel}</p>
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
