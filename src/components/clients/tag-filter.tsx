"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: { tag: string; usage_count: number }[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];

  if (tags.length === 0) return null;

  function toggleTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get("tags")?.split(",").filter(Boolean) ?? [];

    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];

    if (next.length > 0) {
      params.set("tags", next.join(","));
    } else {
      params.delete("tags");
    }
    router.push(`/clients?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 15).map(({ tag }) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            activeTags.includes(tag)
              ? "bg-neutral-900 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
