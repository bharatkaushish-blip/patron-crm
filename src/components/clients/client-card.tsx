import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ClientCardProps {
  id: string;
  name: string;
  location: string | null;
  tags: string[];
  updatedAt: string;
}

export function ClientCard({ id, name, location, tags, updatedAt }: ClientCardProps) {
  const timeAgo = getRelativeTime(updatedAt);

  return (
    <Link
      href={`/clients/${id}`}
      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-900 truncate">{name}</p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {location ? (
            <span className="text-xs text-neutral-400">{location}</span>
          ) : null}
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 ? (
            <span className="text-xs text-neutral-400">
              +{tags.length - 3}
            </span>
          ) : null}
        </div>
      </div>
      <div className="ml-3 flex items-center gap-2">
        <span className="text-xs text-neutral-300">{timeAgo}</span>
        <ChevronRight className="h-4 w-4 text-neutral-300" />
      </div>
    </Link>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
