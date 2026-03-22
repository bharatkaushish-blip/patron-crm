import { FollowUpItem } from "./follow-up-item";

interface FollowUp {
  id: string;
  content: string;
  follow_up_date: string;
  type?: "note" | "enquiry";
  clients: {
    id: string;
    name: string;
  };
}

interface FollowUpSectionProps {
  title: string;
  items: FollowUp[];
  isOverdue?: boolean;
  canMutate?: boolean;
}

export function FollowUpSection({
  title,
  items,
  isOverdue = false,
  canMutate = true,
}: FollowUpSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-body text-sm font-medium text-[#5f5f5f] uppercase tracking-[0.2em]">
          {title}
        </h2>
        <span className="bg-[#f0eded] px-2 py-0.5 text-xs font-medium text-neutral-600">
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
            canMutate={canMutate}
            type={item.type ?? "note"}
          />
        ))}
      </div>
    </section>
  );
}
