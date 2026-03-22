"use client";

import { useState, useTransition } from "react";
import { createEnquiry } from "@/lib/actions/enquiries";
import { Plus, X } from "lucide-react";

interface InventoryItem {
  id: string;
  title: string;
  artist: string | null;
  dimensions: string | null;
}

export function EnquiryForm({
  clientId,
  inventoryItems = [],
}: {
  clientId: string;
  inventoryItems?: InventoryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedItemId, setSelectedItemId] = useState("");
  const [artist, setArtist] = useState("");
  const [size, setSize] = useState("");

  function handleInventorySelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = e.target.value;
    setSelectedItemId(itemId);
    if (itemId) {
      const item = inventoryItems.find((i) => i.id === itemId);
      if (item) {
        if (item.artist) setArtist(item.artist);
        if (item.dimensions) setSize(item.dimensions);
      }
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("client_id", clientId);
    if (selectedItemId) {
      formData.set("inventory_item_id", selectedItemId);
    }

    startTransition(async () => {
      await createEnquiry(formData);
      form.reset();
      setIsOpen(false);
      setSelectedItemId("");
      setArtist("");
      setSize("");
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 border border-dashed border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-[#5f5f5f] hover:border-[#9e9c9c] hover:text-neutral-600 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add enquiry
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#b2b2b1]/15 bg-[#ffffff] p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium font-serif text-neutral-700">New enquiry</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 text-[#9e9c9c] hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {inventoryItems.length > 0 && (
        <div>
          <select
            value={selectedItemId}
            onChange={handleInventorySelect}
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-neutral-700 focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
          >
            <option value="">Suggest artwork (optional)</option>
            {inventoryItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
                {item.artist ? ` — ${item.artist}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          name="size"
          type="text"
          placeholder="Size (e.g. 4x6 ft)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
        />
        <input
          name="budget"
          type="text"
          placeholder="Budget (e.g. ₹2-5L)"
          className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="artist"
          type="text"
          placeholder="Artist preference"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
        />
        <div>
          <input
            name="timeline"
            type="date"
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body text-neutral-700 focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
          />
          <p className="mt-0.5 text-[10px] font-body text-[#9e9c9c]">Timeline / deadline</p>
        </div>
      </div>

      <input
        name="work_type"
        type="text"
        placeholder="Type of work (e.g. oil painting, sculpture)"
        className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
      />

      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={2}
        className="w-full resize-none border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#735a3a] px-4 py-2 text-sm font-medium font-body text-white hover:bg-[#664e30] disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save enquiry"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 text-sm font-body text-[#5f5f5f] hover:bg-[#f0eded]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
