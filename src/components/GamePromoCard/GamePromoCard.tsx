import type { ReactNode } from 'react';

type GamePromoCardProps = {
  backgroundImageUrl?: string | null;
  backgroundOpacity?: string;
  contentId?: string;
  score?: string | null;
  title: ReactNode;
  decoration?: ReactNode;
  cta: ReactNode;
};

export function GamePromoCard({
  backgroundImageUrl,
  backgroundOpacity = 'opacity-25',
  contentId,
  score,
  title,
  decoration,
  cta,
}: GamePromoCardProps) {
  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-sm" style={{ minHeight: '180px' }}>
        {backgroundImageUrl && (
          <div
            className={`absolute inset-0 scale-110 blur-lg bg-center bg-cover bg-no-repeat ${backgroundOpacity}`}
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            aria-hidden="true"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-boca-blue via-boca-blue/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,193,7,0.18),transparent_40%)]" />
        <div className="absolute inset-0 rounded-sm ring-1 ring-boca-gold/30 hover:ring-boca-gold/60 transition-all duration-300" />

        <div
          id={contentId}
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
        />

        <div className="relative flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div />
            {score && (
              <span className="font-sans text-xs text-boca-gold tabular-nums font-bold">
                {score}
              </span>
            )}
          </div>

          <div>
            {title}
          </div>

          {decoration && (
            <div className="flex items-center gap-2">
              {decoration}
            </div>
          )}

          {cta}
        </div>
      </div>
    </div>
  );
}
