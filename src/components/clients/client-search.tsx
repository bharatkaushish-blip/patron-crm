"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/lib/hooks/use-debounce";

export function ClientSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.push(`/clients?${params.toString()}`);
  }, [debouncedQuery, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e9c9c]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search clients..."
        className="w-full border border-[#b2b2b1]/20 bg-[#fcf9f8] py-2.5 pl-10 pr-4 text-sm font-body text-[#323233] placeholder:text-[#9e9c9c] focus:border-[#735a3a] focus:outline-none"
        autoFocus
      />
    </div>
  );
}
