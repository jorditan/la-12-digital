export function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse flex flex-col gap-3 p-4 bg-boca-blue-light border border-boca-gold/5 rounded-sm shrink-0 w-48"
        >
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-white/10 shrink-0" />
            <div className="h-3 flex-1 bg-white/10 rounded" />
          </div>
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-3 w-36 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
