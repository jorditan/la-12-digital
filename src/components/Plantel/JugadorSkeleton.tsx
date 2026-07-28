/**
 * JugadorSkeleton V2 — Esqueleto de carga armónico con la tarjeta V2
 */
export function JugadorSkeleton() {
  return (
    <div className="bg-boca-blue-light/60 border border-boca-border rounded-sm flex flex-col justify-between overflow-hidden animate-pulse h-full min-h-[160px]">
      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-12 h-3 bg-white/10 rounded" />
          <div className="w-10 h-7 rounded bg-white/10" />
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2">
          <div className="h-6 bg-white/10 rounded" />
          <div className="h-6 bg-white/10 rounded" />
        </div>
      </div>
      <div className="bg-boca-blue border-t border-boca-border px-5 py-3.5 w-full">
        <div className="h-5 bg-white/10 rounded w-3/4" />
      </div>
    </div>
  );
}
