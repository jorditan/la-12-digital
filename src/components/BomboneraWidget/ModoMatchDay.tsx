import { ESCUDO_VACIO } from '../../data/equipos';
import type { MatchForecast } from '../../services/weather';
import type { ProximoPartido } from '../../services/apifootball';
import { BOCA_ID } from '../../services/apifootball';
import { StatsGrid } from './StatsGrid';
import { ForecastRows } from './ForecastRows';
import { ConditionsBlock } from './ConditionsBlock';

export function ModoMatchDay({
  proximoLocal,
  matchForecast,
}: {
  proximoLocal: ProximoPartido;
  matchForecast: MatchForecast | null;
}) {
  const rival = proximoLocal.homeTeam.id === BOCA_ID
    ? proximoLocal.awayTeam
    : proximoLocal.homeTeam;

  const now = new Date();
  const matchDate = new Date(proximoLocal.date);
  const isToday =
    matchDate.getFullYear() === now.getFullYear() &&
    matchDate.getMonth() === now.getMonth() &&
    matchDate.getDate() === now.getDate();

  const slotMatch = matchForecast?.slotMatch ?? null;

  return (
    <section
      aria-label="Partido en casa hoy"
      className="relative bg-boca-blue-light border border-boca-gold/30 rounded-sm overflow-hidden flex flex-col h-full shadow-[0_0_24px_rgba(255,193,7,0.06)] hover:border-boca-gold/60 transition-colors"
    >
      <div className="border-b border-boca-gold/15 px-6 pt-6 pb-3 flex items-center justify-between">
        <h2 className="type-section-title text-white">La Bombonera hoy</h2>
        <span className="type-ui-label inline-flex items-center px-2 py-px rounded-sm bg-boca-gold/25 text-boca-gold border border-boca-gold/30">
          EN CASA
        </span>
      </div>

      <div className="px-6 pt-4 pb-6 flex flex-col gap-3 flex-1">

        {/* Partido destacado */}
        <div className="bg-boca-gold/[0.07] border border-boca-gold/15 rounded-sm px-4 py-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[3px] bg-boca-blue flex items-center justify-center flex-shrink-0">
                <img src="/escudo_boca.png" alt="Boca Juniors" className="w-6 h-6 object-contain" />
              </div>
              <span className="type-ui-label text-text-secondary">vs</span>
              <div className="w-8 h-8 rounded-[3px] bg-boca-border-card flex items-center justify-center flex-shrink-0">
                <img
                  src={rival.logo}
                  alt={rival.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                />
              </div>
              <div>
                <p className="font-serif text-white font-semibold text-base leading-tight">{rival.name}</p>
                <p className="type-ui-label text-text-secondary mt-0.5 text-sm">
                  {isToday ? 'Hoy' : 'Mañana'} · {proximoLocal.time} hs · {proximoLocal.competition}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats + label */}
        {slotMatch ? (
          <>
            <p className="type-ui-label font-serif text-text-secondary text-sm tracking-[0.06em]">
              Pronóstico para ese día · {matchForecast!.timeLabel} HS
            </p>
            <StatsGrid slot={slotMatch} />
          </>
        ) : (
          <div className="flex gap-2 h-[90px]">
            <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm min-w-[88px] animate-pulse" />
            <div className="bg-boca-gold/[0.07] border border-boca-gold/10 rounded-sm flex-1 animate-pulse" />
          </div>
        )}

        <div className="border-t border-boca-gold/10" />

        <ForecastRows forecast={matchForecast} />

        {slotMatch && <ConditionsBlock slot={slotMatch} />}

      </div>
    </section>
  );
}
