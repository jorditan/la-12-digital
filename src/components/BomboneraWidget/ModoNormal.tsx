import { ESCUDO_VACIO } from '../../data/equipos';
import type { MatchForecast } from '../../services/weather';
import type { ProximoPartido } from '../../services/apifootball';
import { BOCA_ID } from '../../services/apifootball';
import { SkeletonBox, SkeletonText, SkeletonAvatar } from '../ui/Skeleton';
import { StatsGrid } from './StatsGrid';
import { ForecastRows } from './ForecastRows';
import { ConditionsBlock } from './ConditionsBlock';

function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  });
}

function formatFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

export function ModoNormal({
  proximoLocal,
  proximosLocales,
  diasHastaPartido,
  matchForecast,
  loading = true,
  error = null,
}: {
  proximoLocal: ProximoPartido | null;
  proximosLocales: ProximoPartido[];
  diasHastaPartido: number | null;
  matchForecast: MatchForecast | null;
  loading?: boolean;
  error?: string | null;
}) {
  const rival = proximoLocal
    ? proximoLocal.homeTeam.id === BOCA_ID
      ? proximoLocal.awayTeam
      : proximoLocal.homeTeam
    : null;

  const slotMatch = matchForecast?.slotMatch ?? null;

  return (
    <section
      aria-label="La Bombonera hoy"
      className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3">
        <h2 className="type-section-title text-white">Próximo partido en la Bombonera</h2>
      </div>

      <div className="px-6 pt-5 pb-6 flex flex-col gap-5 flex-1">
        {/* ── Contador + Rival ─────────────────────────────────────────── */}
        {proximoLocal && rival && diasHastaPartido !== null ? (
          <div className="flex gap-4 items-end">
            {/* Contador de días — protagonista visual */}
            <div className="bg-boca-gold-light/20 rounded-sm border-0.5 border-boca-gold  px-4 py-3 flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
              <p className="font-bold text-boca-gold font-serif leading-none text-7xl">
                {diasHastaPartido}
              </p>
              <p className="type-ui-label text-text-secondary font-serif mt-2  text-lg">
                {diasHastaPartido === 1 ? 'Día' : 'Días'}
              </p>
            </div>

            {/* Info del partido */}
            <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
              {/* Escudo + nombre del rival */}
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-sm bg-boca-border-card ring-1 ring-boca-border-card flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={rival.logo}
                    alt={rival.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-white font-semibold text-base leading-tight truncate">
                    vs {rival.name}
                  </p>
                </div>
              </div>

              {/* Fecha + hora como badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-sm px-2 py-0.5 type-ui-label text-text-secondary tracking-[0.05em]">
                  {formatFechaLarga(proximoLocal.date).toUpperCase()}
                </span>
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-sm px-2 py-0.5 type-ui-label text-boca-gold tracking-[0.05em]">
                  {proximoLocal.time} HS
                </span>
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-sm px-2 py-0.5 type-ui-label text-text-secondary tracking-[0.05em]">
                  {proximoLocal.competition}
                </span>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Skeleton mientras carga */
          <div className="flex items-stretch gap-4">
            <SkeletonBox className="min-w-[80px] min-h-[96px]" />
            <div className="flex flex-col justify-center gap-3 flex-1">
              <div className="flex items-center gap-2.5">
                <SkeletonAvatar size="w-12 h-12" className="rounded-sm" />
                <div className="flex flex-col gap-1.5">
                  <SkeletonText width="w-16" height="h-2" />
                  <SkeletonText width="w-28" height="h-3" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <SkeletonBox className="h-5 w-24" />
                <SkeletonBox className="h-5 w-14" />
              </div>
            </div>
          </div>
        ) : (
          /* Sin datos o error */
          <p className="font-sans text-sm text-white/50 py-2">
            {error ?? 'No hay próximos partidos en la Bombonera disponibles'}
          </p>
        )}

        {/* ── Pronóstico del partido ───────────────────────────────────── */}
        <div>
          <div className="border-t border-boca-border-card mb-4" />

          <p className="type-caption text-text-secondary mb-3 tracking-[0.10em]">
            {matchForecast
              ? `Condiciones climáticas · ${matchForecast.timeLabel} HS`
              : 'Condiciones climáticas del partido'}
          </p>

          {slotMatch ? (
            <div className="mb-3">
              <StatsGrid slot={slotMatch} />
            </div>
          ) : (
            <div className="flex gap-2 h-[90px] mb-3">
              <SkeletonBox className="bg-boca-gold/[0.07] border border-boca-gold/10 min-w-[88px]" />
              <SkeletonBox className="bg-boca-gold/[0.07] border border-boca-gold/10 flex-1" />
            </div>
          )}

          <ForecastRows forecast={matchForecast} />

          {slotMatch && (
            <div className="mt-3">
              <ConditionsBlock slot={slotMatch} />
            </div>
          )}
        </div>

        {/* ── Próximos en casa ─────────────────────────────────────────── */}
        {proximosLocales.length > 0 && (
          <div>
            <div className="border-t border-boca-border-card mb-3" />
            <p className="type-caption text-text-secondary mb-2.5 tracking-[0.10em]">
              Siguientes partidos
            </p>
            <div className="flex flex-col divide-y divide-boca-border-card/60">
              {proximosLocales.map((p) => {
                const rivalItem = p.homeTeam.id === BOCA_ID ? p.awayTeam : p.homeTeam;
                return (
                  <div
                    key={p.fixtureId}
                    className="flex items-center gap-2.5 py-1.5 first:pt-0 last:pb-0"
                  >
                    <div className="w-6 h-6 rounded-sm bg-boca-border-card flex items-center justify-center flex-shrink-0">
                      <img
                        src={rivalItem.logo}
                        alt={rivalItem.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
                        }}
                      />
                    </div>
                    <p className="type-ui-label text-text-nav flex-1 leading-none truncate">
                      vs {rivalItem.name}
                    </p>
                    <p className="type-ui-label text-text-secondary tabular-nums flex-shrink-0">
                      {formatFechaCorta(p.date)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
