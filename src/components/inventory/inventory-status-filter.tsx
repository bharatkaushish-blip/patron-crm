"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "not_for_sale", label: "Not for sale" },
];

export function InventoryStatusFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("status") || "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`/inventory?${params.toString()}`);
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => select(s.value)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            current === s.value
              ? "bg-indigo-600 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
