import { ESCUDO_VACIO } from '../../data/equipos';
import type { MatchForecast } from '../../services/weather';
import type { ProximoPartido } from '../../services/apifootball';
import { BOCA_ID } from '../../services/apifootball';
import { SkeletonBox, SkeletonText, SkeletonAvatar } from '../ui/Skeleton';
import { StatsGrid } from './StatsGrid';
import { ForecastRows } from './ForecastRows';
import { ConditionsBlock } from './ConditionsBlock';
import { Badge } from '../ui/Badge';

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
            {/* Info del partido */}
            <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
              {/* Escudo + nombre del rival */}
              <div className="flex items-center gap-2.5">
                <div className="w-24 h-24 p-4 rounded-sm bg-boca-border-card ring-1 ring-boca-border-card flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={rival.logo}
                    alt={rival.name}
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="min-w-0 flex items-center flex-row gap-4">
                    <p className="font-serif text-white font-semibold text-lg leading-tight truncate">
                      vs {rival.name} en
                    </p>

                    <div className="flex flex-row gap-4 items-center leading-none justify-center flex-shrink-0 min-w-[80px]">
                      <p className="font-bold md:p-2 p-1 bg-boca-blue-dark/20 border border-boca-gold/40 rounded-sm text-boca-gold font-serif leading-none text-xl md:text-5xl">
                        {diasHastaPartido}
                      </p>
                      <p className="type-ui-label text-white font-serif mt-2 text-lg">
                        {diasHastaPartido === 1 ? 'Día' : 'Días'}
                      </p>
                    </div>
                  </div>
                  {/* Fecha + hora como badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>
                      {formatFechaLarga(proximoLocal.date).charAt(0).toUpperCase() +
                        formatFechaLarga(proximoLocal.date).slice(1)}
                    </Badge>
                    <Badge>{proximoLocal.time}</Badge>
                    <Badge
                      variant={proximoLocal.competition === 'Copa Libertadores' ? 'gold' : 'blue'}
                      className="px-1.5 whitespace-nowrap"
                    >
                      {proximoLocal.competition}
                    </Badge>
                  </div>
                </div>
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
