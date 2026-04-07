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
  contentId,
  score,
  title,
  decoration,
  cta,
}: GamePromoCardProps) {
  return (
    <div className="mt-6 group">
      <div
        id={contentId}
        className="relative overflow-hidden rounded-sm"
        style={{ minHeight: '188px' }}
      >

        {/* ── Capa base ─────────────────────────────────────────────── */}
        <div className="absolute inset-0 bg-boca-blue-mid" />

        {/* ── Foto con diagonal clip ─────────────────────────────────── */}
        {backgroundImageUrl ? (
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              clipPath: 'polygon(42% 0, 100% 0, 100% 100%, 28% 100%)',
              opacity: 0.45,
            }}
            aria-hidden="true"
          />
        ) : (
          /* Sin foto: trama de rombos como fondo decorativo */
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 1px, transparent 1px, transparent 14px),' +
                'repeating-linear-gradient(-45deg, #FFD700 0px, #FFD700 1px, transparent 1px, transparent 14px)',
            }}
            aria-hidden="true"
          />
        )}

        {/* ── Gradientes de cohesión ────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-r from-boca-blue-mid via-boca-blue-mid/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-boca-blue/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(255,215,0,0.09),transparent_55%)]" />

        {/* ── Borde dorado superior ─────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-boca-gold/80 via-boca-gold/25 to-transparent" />

        {/* ── Borde perimetral con hover ────────────────────────────── */}
        <div className="absolute inset-0 rounded-sm ring-1 ring-inset ring-boca-gold/20 group-hover:ring-boca-gold/45 transition-all duration-300" />

        {/* ── Esquina decorativa (trama diagonal) ──────────────────── */}
        <div
          className="absolute top-0 right-0 w-28 h-28 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(-45deg, rgba(255,215,0,0.055) 0px, rgba(255,215,0,0.055) 1px, transparent 1px, transparent 6px)',
            clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
          }}
          aria-hidden="true"
        />

        {/* ── Contenido ─────────────────────────────────────────────── */}
        <div className="relative flex flex-col justify-between p-5 gap-3" style={{ minHeight: '188px' }}>

          {/* Fila 1: etiqueta + score */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-boca-gold/45">
              ● Desafío
            </span>

            {score && (
              <div className="flex items-center gap-1.5 bg-black/40 border border-boca-gold/30 rounded-[2px] px-2 py-0.5 backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-boca-gold animate-pulse shrink-0" />
                <span className="font-mono text-[11px] font-bold text-boca-gold tabular-nums tracking-widest">
                  {score}
                </span>
              </div>
            )}
          </div>

          {/* Fila 2: título */}
          <div className="flex-1 flex flex-col justify-center">
            {title}
          </div>

          {/* Fila 3: decoración + CTA */}
          <div className="flex items-end justify-between gap-3">
            {decoration && (
              <div className="flex items-center gap-1.5 opacity-60">
                {decoration}
              </div>
            )}
            <div className={!decoration ? 'w-full' : 'shrink-0'}>
              {cta}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
