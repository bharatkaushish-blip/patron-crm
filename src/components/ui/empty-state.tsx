import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-bold text-[#323233] font-serif">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-[#5f5f5f] font-body">{description}</p>
      ) : null}
      {action ? (
        <Link href={action.href} className="mt-4">
          <Button variant="secondary">{action.label}</Button>
        </Link>
      ) : null}
    </div>
  );
}
