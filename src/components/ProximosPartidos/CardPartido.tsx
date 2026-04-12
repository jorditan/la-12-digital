import { MapPin, History } from 'lucide-react';
import type { ProximoPartido } from '../../services/apifootball';
import { Badge } from '../ui/Badge';
import { ESCUDO_VACIO } from '../../data/equipos';
import { H2HModal } from './H2HModal';
import { useCardPartido } from './hooks/useCardPartido';
import { UrgencyBadge } from './UrgencyBadge';
import { formatFechaLarga } from './utils';

interface CardPartidoProps {
  partido: ProximoPartido;
}

export function CardPartido({ partido }: CardPartidoProps) {
  const {
    bocaEsLocal,
    rival,
    days,
    cardBorderClass,
    calendarHref,
    h2hOpen,
    openH2h,
    closeH2h,
  } = useCardPartido(partido);

  return (
    <>
      <article className={[
        'flex flex-col gap-3 p-4 bg-boca-blue-light border rounded-sm shrink-0 w-60 transition-colors',
        cardBorderClass,
      ].join(' ')}>
        {/* Ambos escudos VS */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center gap-1">
            <img src="/escudo_boca.png" alt="Boca Juniors" width={44} height={44} className="object-contain w-11 h-11" draggable={false} />
            <span className="font-sans text-[10px] text-white/50">Boca</span>
          </div>
          <span className="text-white/70 font-semibold text-xs">VS</span>
          <div className="flex flex-col items-center gap-1">
            <img
              src={rival.logo}
              alt={rival.name}
              width={36}
              height={36}
              className="object-contain w-9 h-9"
              draggable={false}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
            />
            <span className="font-sans text-[10px] text-white/50 truncate max-w-[60px] text-center">{rival.name}</span>
          </div>
        </div>

        {/* Badge Local/Visitante */}
        <Badge variant={bocaEsLocal ? 'local' : 'visitante'} className="w-fit text-[10px] px-2 py-px">
          {bocaEsLocal ? 'Local' : 'Visitante'}
        </Badge>

        {/* Fecha */}
        <p className="font-serif font-semibold text-base text-white leading-tight">
          {formatFechaLarga(partido.date)}
        </p>

        {/* Estadio */}
        {partido.venueName && (
          <div className="flex items-start gap-1">
            <MapPin size={11} className="shrink-0 text-white/40 mt-0.5" />
            <p className="font-sans text-[11px] text-white/50 leading-tight line-clamp-1">
              {partido.venueName}
            </p>
          </div>
        )}

        {/* Hora */}
        <p className="font-sans text-xs text-white/60 tabular-nums">
          {partido.time}
        </p>

        {/* Competición */}
        <Badge
          variant={partido.competition === 'Copa Libertadores' ? 'gold' : 'blue'}
          className="w-fit text-[10px] px-1.5 py-px"
        >
          {partido.competition}
        </Badge>

        {/* Footer: urgencia + acciones */}
        <div className="mt-auto pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {days >= 0 && days <= 7 && <UrgencyBadge days={days} />}
          </div>

          {/* Icon actions */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Google Calendar */}
            <a
              href={calendarHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Agregar partido a Google Calendar"
              className="group flex h-10 items-center gap-1.5 px-2 rounded-sm bg-white/[0.04] border border-white/[0.08] hover:bg-[#1a73e8]/10 hover:border-[#1a73e8]/30 transition-all duration-200 shrink-0"
            >
              <img
                src="/google_calendar_icon.png"
                alt=""
                aria-hidden="true"
                className="w-3.5 h-3.5 object-contain shrink-0"
              />
              <span className="font-sans text-[10px] text-white/35 group-hover:text-white/70 transition-colors whitespace-nowrap">
                Agregar al calendario
              </span>
            </a>

            {/* Historial H2H — icon + CSS tooltip */}
            <div className="relative group/tip">
              <button
                onClick={openH2h}
                aria-label={`Ver historial vs ${rival.name}`}
                className="flex items-center justify-center h-10 w-10 rounded-sm border bg-white/[0.04] border-white/[0.08] text-white/35 hover:bg-white/[0.07] hover:border-white/20 hover:text-white/60 transition-all duration-200"
              >
                <History size={12} />
              </button>
              <div className="pointer-events-none absolute bottom-full right-0 mb-1.5 z-20 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
                <div className="bg-boca-blue px-2 py-1 rounded-sm border border-boca-border whitespace-nowrap">
                  <span className="font-sans text-[10px] text-white/60">Últimos partidos contra {rival.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {h2hOpen && (
        <H2HModal
          onClose={closeH2h}
          rivalId={partido.rivalApiId}
          rivalName={rival.name}
        />
      )}
    </>
  );
}
