"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteInventoryItem } from "@/lib/actions/inventory";

export function DeleteInventoryButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteInventoryItem(itemId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
