"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteInventoryItem } from "@/lib/actions/inventory";

export function DeleteInventoryButton({ itemId }: { itemId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;
    setIsPending(true);
    try {
      const result = await deleteInventoryItem(itemId);
      if (result?.error) {
        alert(result.error);
        setIsPending(false);
        return;
      }
      window.location.href = "/inventory";
    } catch {
      alert("Failed to delete artwork. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-[#9e9c9c] hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
