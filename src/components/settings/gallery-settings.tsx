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
      <h2 className="text-sm font-body font-medium text-[#5f5f5f] uppercase tracking-wide mb-3">
        Gallery
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#b2b2b1]/15 bg-[#ffffff] p-4">
        <div>
          <label className="block text-sm font-body font-medium text-neutral-700 mb-1">
            Gallery name
          </label>
          <input
            name="name"
            type="text"
            defaultValue={name}
            required
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-body font-medium text-neutral-700 mb-1">
            Currency
          </label>
          <select
            name="currency"
            defaultValue={currency}
            className="w-full border border-[#b2b2b1]/20 px-3 py-2 text-sm font-body focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
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
          className="bg-[#735a3a] px-4 py-2 text-sm font-body font-medium text-white hover:bg-[#664e30] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}
