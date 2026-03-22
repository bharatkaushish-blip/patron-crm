export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#f0eded] px-4 py-3">
      <p className="text-xs text-[#5f5f5f] uppercase tracking-wide font-body">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#323233] font-serif">{value}</p>
    </div>
  );
}
