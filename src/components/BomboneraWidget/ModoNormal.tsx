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
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3">
        <h2 className="type-section-title text-white">Días restantes para ir a la bombonera</h2>
      </div>

      <div className="px-6 pt-4 pb-6 flex flex-col gap-4 flex-1">

        {/* Match row — rival + countdown */}
        {proximoLocal && rival && diasHastaPartido !== null ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-boca-border-card flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={rival.logo}
                  alt={rival.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                />
              </div>
              <div>
                <p className="font-serif text-white font-semibold text-base leading-tight">vs {rival.name}</p>
                <p className="type-ui-label text-text-secondary mt-0.5 text-[10px]">
                  {formatFechaLarga(proximoLocal.date).toUpperCase()} · {proximoLocal.time} HS
                </p>
                <p className="type-ui-label text-text-secondary text-[10px]">
                  {proximoLocal.competition}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-boca-gold leading-none text-[2rem] font-sans">
                {diasHastaPartido}
              </p>
              <p className="type-ui-label text-text-secondary text-[10px]">
                {diasHastaPartido === 1 ? 'DÍA' : 'DÍAS'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-[3px] bg-white/5 flex-shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 bg-white/5 rounded" />
              <div className="h-2.5 w-24 bg-white/5 rounded" />
            </div>
          </div>
        )}

        {/* Separador + pronóstico */}
        <div>
          <div className="border-t border-boca-border-card mb-3" />

          <p className="type-ui-label text-text-secondary mb-3 text-sm tracking-[0.06em]">
            {matchForecast
              ? `Pronóstico para ese día · ${matchForecast.timeLabel} HS`
              : 'Pronóstico del estadio'}
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

          {slotMatch && <ConditionsBlock slot={slotMatch} />}
        </div>

        {/* Próximos partidos de local */}
        {proximosLocales.length > 0 && (
          <div>
            <div className="border-t border-boca-border-card mb-3" />
            <p className="type-ui-label font-serif text-text-secondary mb-2 text-xs tracking-[0.06em]">
              Próximos en casa
            </p>
            <div className="flex flex-col gap-1.5">
              {proximosLocales.map(p => {
                const rival = p.homeTeam.id === BOCA_ID ? p.awayTeam : p.homeTeam;
                return (
                  <div key={p.fixtureId} className="flex items-center gap-2.5 px-1">
                    <div className="w-6 h-6 rounded-[3px] bg-boca-border-card flex items-center justify-center flex-shrink-0">
                      <img
                        src={rival.logo}
                        alt={rival.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                      />
                    </div>
                    <p className="type-ui-label text-white flex-1 leading-none text-[11px]">
                      vs {rival.name}
                    </p>
                    <p className="type-ui-label text-text-secondary tabular-nums text-[10px]">
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
