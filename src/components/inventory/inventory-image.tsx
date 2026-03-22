export function InventoryImage({ url, alt }: { url: string; alt: string }) {
  return (
    <img
      src={url}
      alt={alt}
      className="w-full object-contain max-h-96 bg-[#f6f3f2]"
    />
  );
}
