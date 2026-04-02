import { ESCUDO_VACIO } from '../../data/equipos';
import type { MatchForecast } from '../../services/weather';
import type { ProximoPartido } from '../../services/apifootball';
import { BOCA_ID } from '../../services/apifootball';
import { StatsGrid } from './StatsGrid';
import { ForecastRows } from './ForecastRows';
import { ConditionsBlock } from './ConditionsBlock';

function formatFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

function formatFechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function ModoNormal({
  proximoLocal,
  proximosLocales,
  diasHastaPartido,
  matchForecast,
}: {
  proximoLocal: ProximoPartido | null;
  proximosLocales: ProximoPartido[];
  diasHastaPartido: number | null;
  matchForecast: MatchForecast | null;
}) {
  const rival = proximoLocal
    ? (proximoLocal.homeTeam.id === BOCA_ID ? proximoLocal.awayTeam : proximoLocal.homeTeam)
    : null;

  const slotMatch = matchForecast?.slotMatch ?? null;

  return (
    <section
      aria-label="La Bombonera hoy"
      className="bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3">
        <h2 className="font-serif font-bold italic text-2xl leading-tight text-white">Días restantes para ir a la bombonera</h2>
      </div>

      <div className="px-6 pt-5 pb-6 flex flex-col gap-5 flex-1">

        {/* ── Contador + Rival ─────────────────────────────────────────── */}
        {proximoLocal && rival && diasHastaPartido !== null ? (
          <div className="flex items-stretch gap-4">

            {/* Contador de días — protagonista visual */}
            <div className="bg-boca-gold/5 border border-boca-gold/10 rounded-md px-4 py-3 flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
              <p className="font-bold text-boca-gold leading-none text-7xl font-sans tabular-nums">
                {diasHastaPartido}
              </p>
              <p className="type-ui-label text-text-secondary mt-2 text-[10px] tracking-[0.14em]">
                {diasHastaPartido === 1 ? 'DÍA' : 'DÍAS'}
              </p>
            </div>

            {/* Info del partido */}
            <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
              {/* Escudo + nombre del rival */}
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-[4px] bg-boca-border-card ring-1 ring-boca-border-card flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={rival.logo}
                    alt={rival.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="type-ui-label text-text-secondary text-[10px] tracking-[0.08em] mb-0.5">
                    PRÓXIMO LOCAL
                  </p>
                  <p className="font-serif text-white font-semibold text-base leading-tight truncate">
                    vs {rival.name}
                  </p>
                </div>
              </div>

              {/* Fecha + hora como badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-[3px] px-2 py-0.5 type-ui-label text-text-secondary text-[10px] tracking-[0.05em]">
                  {formatFechaLarga(proximoLocal.date).toUpperCase()}
                </span>
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-[3px] px-2 py-0.5 type-ui-label text-boca-gold text-[10px] tracking-[0.05em]">
                  {proximoLocal.time} HS
                </span>
                <span className="inline-flex items-center bg-boca-border-card/80 border border-boca-border rounded-[3px] px-2 py-0.5 type-ui-label text-text-secondary text-[10px] tracking-[0.05em]">
                  {proximoLocal.competition}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Skeleton — refleja nuevo layout */
          <div className="flex items-stretch gap-4 animate-pulse">
            <div className="bg-white/5 rounded-md min-w-[80px] min-h-[96px]" />
            <div className="flex flex-col justify-center gap-3 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-[4px] bg-white/5 flex-shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 w-16 bg-white/5 rounded" />
                  <div className="h-3.5 w-28 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="h-5 w-24 bg-white/5 rounded-[3px]" />
                <div className="h-5 w-14 bg-white/5 rounded-[3px]" />
              </div>
            </div>
          </div>
        )}

        {/* ── Pronóstico del partido ───────────────────────────────────── */}
        <div>
          <div className="border-t border-boca-border-card mb-4" />

          <p className="type-ui-label text-text-secondary mb-3 text-[10px] tracking-[0.10em]">
            {matchForecast
              ? `CONDICIONES DEL DÍA DEL PARTIDO · ${matchForecast.timeLabel} HS`
              : 'CONDICIONES DEL DÍA DEL PARTIDO'}
          </p>

          {slotMatch ? (
            <div className="mb-3">
              <StatsGrid slot={slotMatch} />
            </div>
          ) : (
            <div className="flex gap-2 h-[90px] mb-3">
              <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm min-w-[88px] animate-pulse" />
              <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm flex-1 animate-pulse" />
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
            <p className="type-ui-label text-text-secondary mb-2.5 text-[10px] tracking-[0.10em]">
              PRÓXIMOS EN CASA
            </p>
            <div className="flex flex-col divide-y divide-boca-border-card/60">
              {proximosLocales.map(p => {
                const rivalItem = p.homeTeam.id === BOCA_ID ? p.awayTeam : p.homeTeam;
                return (
                  <div key={p.fixtureId} className="flex items-center gap-2.5 py-1.5 first:pt-0 last:pb-0">
                    <div className="w-6 h-6 rounded-[3px] bg-boca-border-card flex items-center justify-center flex-shrink-0">
                      <img
                        src={rivalItem.logo}
                        alt={rivalItem.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                      />
                    </div>
                    <p className="type-ui-label text-text-nav flex-1 leading-none text-[11px] truncate">
                      vs {rivalItem.name}
                    </p>
                    <p className="type-ui-label text-text-secondary tabular-nums text-[10px] flex-shrink-0">
                      {formatFechaCorta(p.date).toUpperCase()}
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
