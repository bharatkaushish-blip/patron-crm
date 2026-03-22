import Link from "next/link";
import { User, StickyNote, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";

interface SearchResultsProps {
  query: string;
  clients: any[];
  notes: any[];
  sales: any[];
  totalResults: number;
  currency: string;
}

export function SearchResults({
  query,
  clients,
  notes,
  sales,
  totalResults,
  currency,
}: SearchResultsProps) {
  if (totalResults === 0) {
    return (
      <p className="mt-8 text-center text-sm font-body text-[#9e9c9c]">
        No results for &ldquo;{query}&rdquo;
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="text-xs font-body text-[#9e9c9c]">
        {totalResults} result{totalResults !== 1 ? "s" : ""}
      </p>

      {/* Clients */}
      {clients.length > 0 ? (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-medium font-serif uppercase tracking-wide text-[#5f5f5f] mb-2">
            <User className="h-3.5 w-3.5" />
            Clients ({clients.length})
          </h2>
          <div className="space-y-1">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between border border-[#b2b2b1]/15 bg-[#ffffff] px-3 py-2.5 hover:bg-[#f6f3f2] transition-colors"
              >
                <div>
                  <p className="text-sm font-medium font-body text-neutral-800">
                    {client.name}
                  </p>
                  {client.location ? (
                    <p className="text-xs font-body text-[#9e9c9c]">{client.location}</p>
                  ) : null}
                </div>
                {client.tags && client.tags.length > 0 ? (
                  <div className="flex gap-1">
                    {client.tags.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-[#f0eded] px-2 py-0.5 text-[10px] font-body text-[#5f5f5f]"
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
          <h2 className="flex items-center gap-2 text-xs font-medium font-serif uppercase tracking-wide text-[#5f5f5f] mb-2">
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
                  className="block border border-[#b2b2b1]/15 bg-[#ffffff] px-3 py-2.5 hover:bg-[#f6f3f2] transition-colors"
                >
                  <p className="text-sm font-body text-neutral-700 line-clamp-2">
                    {note.content}
                  </p>
                  <p className="mt-1 text-xs font-body text-[#9e9c9c]">
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
          <h2 className="flex items-center gap-2 text-xs font-medium font-serif uppercase tracking-wide text-[#5f5f5f] mb-2">
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
                  className="flex items-center justify-between border border-[#b2b2b1]/15 bg-[#ffffff] px-3 py-2.5 hover:bg-[#f6f3f2] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium font-body text-neutral-700">
                      {sale.artwork_name || "Untitled sale"}
                    </p>
                    <p className="text-xs font-body text-[#9e9c9c]">
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
                    <span className="text-sm font-medium font-body text-[#323233]">
                      {formatCurrency(Number(sale.amount), currency)}
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
