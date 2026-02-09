"use client";

import { useTransition } from "react";
import { updateOrganization } from "@/lib/actions/settings";

const currencies = [
  { code: "INR", label: "INR (Indian Rupee)" },
  { code: "USD", label: "USD (US Dollar)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "GBP", label: "GBP (British Pound)" },
  { code: "AED", label: "AED (UAE Dirham)" },
  { code: "SGD", label: "SGD (Singapore Dollar)" },
  { code: "AUD", label: "AUD (Australian Dollar)" },
  { code: "JPY", label: "JPY (Japanese Yen)" },
  { code: "CHF", label: "CHF (Swiss Franc)" },
];

export function GallerySettings({ name, currency }: { name: string; currency: string }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateOrganization(formData);
    });
  }

  return (
    <section>
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Gallery
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Gallery name
          </label>
          <input
            name="name"
            type="text"
            defaultValue={name}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            defaultValue={currency}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
