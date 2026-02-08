import { FollowUpItem } from "./follow-up-item";

interface FollowUp {
  id: string;
  content: string;
  follow_up_date: string;
  clients: {
    id: string;
    name: string;
  };
}

interface FollowUpSectionProps {
  title: string;
  items: FollowUp[];
  isOverdue?: boolean;
}

export function FollowUpSection({
  title,
  items,
  isOverdue = false,
}: FollowUpSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
          {title}
        </h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <FollowUpItem
            key={item.id}
            noteId={item.id}
            clientId={(item.clients as unknown as { id: string }).id}
            clientName={(item.clients as unknown as { name: string }).name}
            content={item.content}
            followUpDate={item.follow_up_date}
            isOverdue={isOverdue}
          />
        ))}
      </div>
    </section>
  );
}
