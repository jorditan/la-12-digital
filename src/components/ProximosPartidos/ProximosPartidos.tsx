import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { fetchUpcomingMatches, BOCA_ID, type ProximoPartido } from '../../services/apifootball';
import { Badge } from '../Badge';

type Estado = 'loading' | 'error' | 'ok';

function formatFecha(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

export function ProximosPartidos() {
  const [partidos, setPartidos] = useState<ProximoPartido[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchUpcomingMatches()
      .then((data) => { setPartidos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(); }, []);

  return (
    <section aria-label="Próximos partidos" className='bg-[#031d46] border border-[#00396e] rounded-sm overflow-hidden flex flex-col'>
       {/* Header */}
      <div className="border-b border-[#003d7a] px-6 pt-6 pb-3">
        <h2 className="type-section-title text-white">
          Próximos partidos
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        {estado === 'loading' && <SkeletonRow />}

        {estado === 'error' && (
          <div className="flex items-center gap-3 py-6 px-4 bg-boca-blue-light rounded-sm border border-boca-gold/10">
            <p className="font-sans text-sm text-text-secondary flex-1">
              No se pudieron cargar los próximos partidos
            </p>
            <button
              onClick={cargar}
              className="type-button text-boca-gold border border-boca-gold/30 rounded px-3 py-1.5 hover:bg-boca-gold/10 transition-colors shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}

        {estado === 'ok' && (
          <ScrollRow partidos={partidos} />
        )}
      </div>
    </section>
  );
}

// ── Fila scrolleable con drag ─────────────────────────────────────────────────

function ScrollRow({ partidos }: { partidos: ProximoPartido[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = ref.current!.scrollLeft;
    ref.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - startX.current;
    ref.current!.scrollLeft = scrollLeft.current - delta;
  };

  const stopDrag = () => { dragging.current = false; };

  return (
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
  );
}

// ── Card individual ───────────────────────────────────────────────────────────

function CardPartido({ partido }: { partido: ProximoPartido }) {
  const bocaEsLocal = partido.homeTeam.id === BOCA_ID;
  const rival = bocaEsLocal ? partido.awayTeam : partido.homeTeam;

  return (
    <article className="flex flex-col gap-3 p-4 bg-boca-blue-light border border-boca-gold/10 rounded-sm shrink-0 w-60 hover:border-boca-gold/25 transition-colors">
      {/* Rival + L/V */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={rival.logo}
            alt={rival.name}
            width={20}
            height={20}
            className="shrink-0 object-contain"
            draggable={false}
          />
          <span className="type-card-title text-white truncate">{rival.name}</span>
        </div>
        <Badge variant="blue" className="shrink-0 text-[10px] px-1.5 py-px">
          {bocaEsLocal ? 'L' : 'V'}
        </Badge>
      </div>

      {/* Fecha */}
      <p className="font-serif font-semibold text-base text-white leading-tight">
        {formatFecha(partido.date)}
      </p>

      {/* Estadio + hora */}
      <div className="flex items-start gap-1">
        <MapPin size={11} className="shrink-0 text-white/40 mt-0.5" />
        <p className="font-sans text-[11px] text-white/50 leading-tight line-clamp-2">
          {partido.venueName} · {partido.time}
        </p>
      </div>

      {/* Competición */}
      <Badge variant="blue" className="w-fit text-[10px] px-1.5 py-px">
        {partido.competition}
      </Badge>
    </article>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 4 }, (_, i) => (
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
