import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";

interface InventoryCardProps {
  id: string;
  title: string;
  artist: string | null;
  imagePath: string | null;
  askingPrice: number | null;
  status: string;
  currency: string;
  showPrice?: boolean;
}

const statusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  not_for_sale: "Not for sale",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-700",
  sold: "bg-[#b2b2b1]/15 text-neutral-600",
  not_for_sale: "bg-[#f0eded] text-[#5f5f5f]",
};

export function InventoryCard({
  id,
  title,
  artist,
  imagePath,
  askingPrice,
  status,
  currency,
  showPrice = true,
}: InventoryCardProps) {
  return (
    <Link
      href={`/inventory/${id}`}
      className="group block overflow-hidden border border-[#b2b2b1]/15 bg-[#ffffff] transition-shadow hover:shadow-md"
    >
      <div className="aspect-square bg-[#f0eded] relative overflow-hidden">
        {imagePath ? (
          <img
            src={imagePath}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-[#b2b2b1]/20" />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-body font-medium ${
            statusColors[status] || statusColors.available
          }`}
        >
          {statusLabels[status] || status}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-serif font-medium text-[#323233] truncate">
          {title}
        </h3>
        {artist && (
          <p className="mt-0.5 text-xs font-body text-[#5f5f5f] truncate">{artist}</p>
        )}
        {showPrice && askingPrice != null && (
          <p className="mt-1 text-sm font-body font-medium text-neutral-700">
            {formatCurrency(askingPrice, currency)}
          </p>
        )}
      </div>
    </Link>
  );
}
