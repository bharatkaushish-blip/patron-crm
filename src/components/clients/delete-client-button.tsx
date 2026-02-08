"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteClientAction } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteClientAction(clientId);
    });
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete this client?</span>
        <Button
          variant="danger"
          onClick={handleDelete}
          isLoading={isPending}
          className="text-xs px-3 py-1.5"
        >
          Yes, delete
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          className="text-xs px-3 py-1.5"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500"
      title="Delete client"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
