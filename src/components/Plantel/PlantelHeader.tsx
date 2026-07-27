interface PlantelHeaderProps {
  totalCount: number;
  averageAge: number;
}

export function PlantelHeader({ totalCount, averageAge }: PlantelHeaderProps) {
  return (
    <div className="relative rounded-sm overflow-hidden bg-boca-blue border border-boca-gold/30 p-6 sm:p-8 shadow-card">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Plantel Profesional
            </h1>
            <p className="text-boca-gold font-sans text-sm sm:text-base mt-0.5">
              Club Atlético Boca Juniors — Primera División
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-6 bg-boca-blue-light px-6 py-3 rounded border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-2xl font-bold font-serif text-boca-gold leading-tight">
                {totalCount}
              </span>
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-semibold">
                Integrantes
              </span>
            </div>

            {averageAge > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <span className="block text-2xl font-bold font-serif text-boca-gold leading-tight">
                    {averageAge}{' '}
                    <span className="text-sm font-sans font-normal text-white/70">años</span>
                  </span>
                  <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-semibold">
                    Promedio Edad
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
