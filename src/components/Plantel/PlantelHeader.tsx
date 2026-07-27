import { Shield } from 'lucide-react';

interface PlantelHeaderProps {
  totalCount: number;
  averageAge: number;
}

export function PlantelHeader({ totalCount, averageAge }: PlantelHeaderProps) {
  return (
    <div className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden mb-2 sm:mb-4 shadow-card">
      <div className="border-b border-boca-border-card px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-boca-gold/10 border border-boca-gold/30 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-boca-gold" />
          </div>
          <div>
            <h1 className="type-section-title text-white">
              Plantel Profesional
            </h1>
            <p className="font-sans text-xs sm:text-sm text-text-muted mt-0.5">
              Club Atlético Boca Juniors — Primera División
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-6 bg-boca-blue px-5 py-2.5 rounded-sm border border-boca-border-card shrink-0">
            <div className="text-center">
              <span className="block font-serif font-bold text-xl text-boca-gold leading-tight">
                {totalCount}
              </span>
              <span className="text-xs font-sans text-text-muted uppercase tracking-wider font-semibold">
                Integrantes
              </span>
            </div>

            {averageAge > 0 && (
              <>
                <div className="w-px h-7 bg-white/10" />
                <div className="text-center">
                  <span className="block font-serif font-bold text-xl text-boca-gold leading-tight">
                    {averageAge} <span className="text-xs font-sans font-normal text-white/70">años</span>
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
