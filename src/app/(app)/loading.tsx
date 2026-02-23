export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 animate-pulse">
      <div className="h-8 w-48 bg-neutral-200 rounded mb-6" />
      <div className="space-y-4">
        <div className="h-20 bg-neutral-100 rounded-lg" />
        <div className="h-20 bg-neutral-100 rounded-lg" />
        <div className="h-20 bg-neutral-100 rounded-lg" />
        <div className="h-20 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  );
}
