"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function EnquirySearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedValue) {
      params.set("q", debouncedValue);
    }
    router.replace(`/enquiries?${params.toString()}`);
  }, [debouncedValue, router]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9e9c9c]" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by client, artist, type, budget..."
        className="w-full border border-[#b2b2b1]/20 bg-[#fcf9f8] py-2.5 pl-10 pr-10 text-sm font-body placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none focus:ring-1 focus-visible:ring-[#735a3a]/40"
      />
      {value ? (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#9e9c9c] hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
