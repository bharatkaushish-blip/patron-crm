import Link from "next/link";
import { User, StickyNote, IndianRupee } from "lucide-react";

interface SearchResultsProps {
  query: string;
  clients: any[];
  notes: any[];
  sales: any[];
  totalResults: number;
}

export function SearchResults({
  query,
  clients,
  notes,
  sales,
  totalResults,
}: SearchResultsProps) {
  if (totalResults === 0) {
    return (
      <p className="mt-8 text-center text-sm text-neutral-400">
        No results for &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs text-neutral-400">
        {totalResults} result{totalResults !== 1 ? "s" : ""}
      </p>

      {/* Clients */}
      {clients.length > 0 ? (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
            <User className="h-3.5 w-3.5" />
            Clients ({clients.length})
          </h2>
          <div className="space-y-1">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {client.name}
                  </p>
                  {client.location ? (
                    <p className="text-xs text-neutral-400">{client.location}</p>
                  ) : null}
                </div>
                {client.tags && client.tags.length > 0 ? (
                  <div className="flex gap-1">
                    {client.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Notes */}
      {notes.length > 0 ? (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
            <StickyNote className="h-3.5 w-3.5" />
            Notes ({notes.length})
          </h2>
          <div className="space-y-1">
            {notes.map((note) => {
              const clientName =
                (note.clients as any)?.name || "Unknown client";
              return (
                <Link
                  key={note.id}
                  href={`/clients/${note.client_id}`}
                  className="block rounded-lg border border-neutral-200 bg-white px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <p className="text-sm text-neutral-700 line-clamp-2">
                    {note.content}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {clientName} &middot;{" "}
                    {new Date(note.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Sales */}
      {sales.length > 0 ? (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-neutral-500 mb-2">
            <IndianRupee className="h-3.5 w-3.5" />
            Sales ({sales.length})
          </h2>
          <div className="space-y-1">
            {sales.map((sale) => {
              const clientName =
                (sale.clients as any)?.name || "Unknown client";
              return (
                <Link
                  key={sale.id}
                  href={`/clients/${sale.client_id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-700">
                      {sale.artwork_name || "Untitled sale"}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {clientName} &middot;{" "}
                      {new Date(
                        sale.sale_date + "T00:00:00"
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {sale.amount ? (
                    <span className="text-sm font-medium text-neutral-900">
                      ₹{Number(sale.amount).toLocaleString("en-IN")}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
