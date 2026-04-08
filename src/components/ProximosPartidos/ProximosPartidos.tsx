import { useEffect, useState } from 'react';
import { MapPin, ChevronRight, LayoutGrid, List, Download } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { fetchUpcomingMatches, BOCA_ID, type ProximoPartido } from '../../services/apifootball';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { ESCUDO_VACIO } from '../../data/equipos';
import { FixtureTable } from './FixtureTable';
import { buildGCalLink, downloadIcsFile } from '../../utils/calendarLink';

type Vista = 'cards' | 'tabla';

type Estado = 'loading' | 'error' | 'ok';

function formatFecha(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

function getDaysUntil(isoDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const matchDate = new Date(isoDate);
  matchDate.setHours(0, 0, 0, 0);
  return Math.round((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProximosPartidos() {
  const [partidos, setPartidos] = useState<ProximoPartido[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');
  const [vista, setVista] = useState<Vista>('cards');

  const cargar = () => {
    setEstado('loading');
    fetchUpcomingMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <section aria-label="Próximos partidos" className='bg-boca-blue-mid border border-boca-border rounded-sm overflow-hidden flex flex-col'>
       {/* Header */}
      <div className="border-b border-boca-border-card px-6 pt-6 pb-3 flex items-center justify-between gap-3">
        <h2 className="type-section-title text-white">
          Próximos partidos
        </h2>

        {/* Controles de header */}
        {estado === 'ok' && partidos.length > 0 && (
          <div className="flex items-center gap-2">
            {/* Exportar .ics */}
            <Button
              onClick={() => downloadIcsFile(partidos)}
              variant="ghost"
              size="icon"
              aria-label="Descargar todos los partidos como .ics"
              title="Exportar al calendario (.ics)"
              className="text-text-secondary hover:text-boca-gold transition-colors"
            >
              <Download size={14} />
            </Button>

            {/* Toggle de vista */}
            <div className="flex items-center gap-0.5 bg-boca-blue rounded-sm p-0.5 border border-boca-gold/10">
            <Button
              aria-label="Vista tarjetas"
              onClick={() => setVista('cards')}
              variant="ghost"
              size="icon"
              className={[
                'rounded-[2px] transition-colors',
                vista === 'cards'
                  ? 'bg-boca-gold/15 text-boca-gold'
                  : 'text-text-secondary hover:text-white',
              ].join(' ')}
            >
              <LayoutGrid size={14} />
            </Button>
            <Button
              aria-label="Vista tabla"
              onClick={() => setVista('tabla')}
              variant="ghost"
              size="icon"
              className={[
                'rounded-[2px] transition-colors',
                vista === 'tabla'
                  ? 'bg-boca-gold/15 text-boca-gold'
                  : 'text-text-secondary hover:text-white',
              ].join(' ')}
            >
              <List size={14} />
            </Button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        {estado === 'loading' && <SkeletonRow />}

        {estado === 'error' && (
          <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
            <p className="font-sans text-sm text-text-secondary flex-1">
              No se pudieron cargar los próximos partidos
            </p>
            <Button
              onClick={cargar}
              variant="text"
              className="type-button text-boca-gold border border-boca-gold/30 rounded px-3 py-1.5 hover:bg-boca-gold/10 shrink-0"
            >
              Reintentar
            </Button>
          </div>
        )}

        {estado === 'ok' && partidos.length === 0 && (
          <p className="font-sans text-sm text-white/50 py-6 text-center">
            No hay próximos partidos disponibles
          </p>
        )}

        {estado === 'ok' && partidos.length > 0 && vista === 'cards' && (
          <ScrollRow partidos={partidos} />
        )}

        {estado === 'ok' && partidos.length > 0 && vista === 'tabla' && (
          <FixtureTable partidos={partidos} />
        )}
      </div>
    </section>
  );
}

// ── Fila scrolleable con drag ─────────────────────────────────────────────────

function ScrollRow({ partidos }: { partidos: ProximoPartido[] }) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } = useHorizontalScroll();

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {partidos.map((p) => (
          <CardPartido key={p.fixtureId} partido={p} />
        ))}
      </div>

      {/* Gradiente izquierdo */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-12 bg-gradient-to-r from-boca-blue-mid to-transparent" />
      )}

      {/* Gradiente + hint derecho */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-16 bg-gradient-to-l from-boca-blue-mid to-transparent flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}

// ── Card individual ───────────────────────────────────────────────────────────

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0) return null;
  if (days === 0) return (
    <div className="inline-flex items-center justify-center text-center gap-1 px-2 py-0.5 rounded-sm bg-boca-gold text-boca-blue text-[10px] font-bold uppercase tracking-wide">
      <span className="size-1.5 rounded-full text-center bg-boca-blue animate-pulse" />
      <span className='text-center'>
        ¡HOY!
      </span>
    </div>
  );
  if (days === 1) return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-boca-gold/20 text-boca-gold text-[10px] font-semibold uppercase tracking-wide border border-boca-gold/30">
      Mañana
    </span>
  );
  if (days <= 7) return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm bg-white/5 text-white/60 text-[10px] font-medium uppercase tracking-wide border border-white/10">
      En {days} días
    </span>
  );
  return null;
}

function CardPartido({ partido }: { partido: ProximoPartido }) {
  const bocaEsLocal = partido.homeTeam.id === BOCA_ID;
  const rival = bocaEsLocal ? partido.awayTeam : partido.homeTeam;
  const days = getDaysUntil(partido.date);
  const isUrgent = days >= 0 && days <= 1;

  return (
    <article className={[
      'flex flex-col gap-3 p-4 bg-boca-blue-light border rounded-sm shrink-0 w-60 transition-colors',
      isUrgent
        ? 'border-boca-gold/40 hover:border-boca-gold/60'
        : 'border-boca-gold/10 hover:border-boca-gold/25',
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
        {formatFecha(partido.date)}
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

      {/* Footer: urgencia + calendario */}
      <div className="mt-auto pt-2.5 border-t justify-center border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          {days >= 0 && days <= 7 && <UrgencyBadge days={days} />}
        </div>
        <a
          href={buildGCalLink(partido)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Agregar partido a Google Calendar"
          className="group flex items-center gap-1.5 px-2 py-1 rounded-sm bg-white/[0.04] border border-white/[0.08] hover:bg-[#1a73e8]/10 hover:border-[#1a73e8]/30 transition-all duration-200 shrink-0"
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
      </div>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse flex flex-col gap-3 p-4 bg-boca-blue-light border border-boca-gold/5 rounded-sm shrink-0 w-48"
        >
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-full bg-white/10 shrink-0" />
            <div className="h-3 flex-1 bg-white/10 rounded" />
          </div>
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-3 w-36 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
