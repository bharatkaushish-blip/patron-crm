"use client";

import { useState, useTransition } from "react";
import { createEnquiry } from "@/lib/actions/enquiries";
import { Plus, X } from "lucide-react";

export function EnquiryForm({ clientId }: { clientId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("client_id", clientId);

    startTransition(async () => {
      await createEnquiry(formData);
      form.reset();
      setIsOpen(false);
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors w-full justify-center"
      >
        <Plus className="h-4 w-4" />
        Add enquiry
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-700">New enquiry</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 text-neutral-400 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="size"
          type="text"
          placeholder="Size (e.g. 4x6 ft)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <input
          name="budget"
          type="text"
          placeholder="Budget (e.g. ₹2-5L)"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          name="artist"
          type="text"
          placeholder="Artist preference"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <div>
          <input
            name="timeline"
            type="date"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <p className="mt-0.5 text-[10px] text-neutral-400">Timeline / deadline</p>
        </div>
      </div>

      <input
        name="work_type"
        type="text"
        placeholder="Type of work (e.g. oil painting, sculpture)"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
      />

      <textarea
        name="notes"
        placeholder="Notes (optional)"
        rows={2}
        className="w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save enquiry"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
