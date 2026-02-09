export function InventoryImage({ url, alt }: { url: string; alt: string }) {
  return (
    <img
      src={url}
      alt={alt}
      className="w-full rounded-lg object-contain max-h-96 bg-neutral-50"
    />
  );
}
