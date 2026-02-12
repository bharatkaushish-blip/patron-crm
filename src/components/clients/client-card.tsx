import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

interface ClientCardProps {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  photoUrl: string | null;
  tags: string[];
  updatedAt: string;
}

const avatarColors = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-pink-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function ClientCard({
  id,
  name,
  phone,
  email,
  location,
  photoUrl,
  tags,
  updatedAt,
}: ClientCardProps) {
  const timeAgo = getRelativeTime(updatedAt);
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/clients/${id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(name)}`}
          >
            {initial}
          </div>
        )}

        {/* Name + time */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {name}
            </p>
            <span className="shrink-0 text-[10px] text-neutral-400">
              {timeAgo}
            </span>
          </div>

          {/* Contact details */}
          <div className="mt-1.5 space-y-0.5">
            {phone ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Phone className="h-3 w-3 text-neutral-400" />
                <span className="truncate">{phone}</span>
              </div>
            ) : null}
            {email ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Mail className="h-3 w-3 text-neutral-400" />
                <span className="truncate">{email}</span>
              </div>
            ) : null}
            {location ? (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <MapPin className="h-3 w-3 text-neutral-400" />
                <span className="truncate">{location}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 ? (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">
              +{tags.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}
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
