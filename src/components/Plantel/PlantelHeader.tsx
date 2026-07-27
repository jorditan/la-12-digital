import { Shield } from 'lucide-react';

interface PlantelHeaderProps {
  totalCount: number;
}

export function PlantelHeader({ totalCount }: PlantelHeaderProps) {
  return (
    <div className="relative rounded-sm overflow-hidden bg-boca-blue border border-boca-gold/30 p-6 sm:p-8 mb-6 shadow-card">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-boca-gold/10 border border-boca-gold flex items-center justify-center shrink-0 shadow-md">
            <Shield className="w-8 h-8 sm:w-9 sm:h-9 text-boca-gold" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              Plantel Profesional
            </h1>
            <p className="text-boca-gold font-sans text-xs sm:text-sm mt-0.5">
              Club Atlético Boca Juniors — Primera División
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-4 bg-boca-blue-light px-5 py-2.5 rounded border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-xl font-bold font-serif text-boca-gold leading-tight">
                {totalCount}
              </span>
              <span className="text-[10px] font-sans text-text-muted uppercase tracking-wider">
                Integrantes
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
