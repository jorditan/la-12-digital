import { useState, useEffect, useRef } from 'react';
import { Youtube, ChevronRight } from 'lucide-react';
import { fetchVideos, type VideoYoutube } from '../../services/apifootball';
import { CANAL_DEFAULT, CANALES_YOUTUBE } from '../../data/canalesYoutube';
import { CardVideo } from '../CardVideo';
import { CanalSelector } from '../CanalSelector';

type Estado = 'loading' | 'error' | 'ok';

export function CanalYoutube() {
  const [canal, setCanal] = useState(CANAL_DEFAULT);
  const [videos, setVideos] = useState<VideoYoutube[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = (handle: string) => {
    setEstado('loading');
    fetchVideos(handle)
      .then((data) => { setVideos(data); setEstado('ok'); })
      .catch(() => setEstado('error'));
  };

  useEffect(() => { cargar(canal.handle); }, [canal]);

  return (
    <section aria-label="Videos de YouTube" className="w-full">
      {/* Fila 1: icono + título + selector + link al canal */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
          <Youtube size={24} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight sm:leading-10 text-boca-gold tracking-tight">
            Videos bosteros
          </h2>
          <CanalSelector
            canales={CANALES_YOUTUBE}
            selected={canal}
            onChange={setCanal}
          />
        </div>

        <a
          href={`https://www.youtube.com/${canal.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-sans text-sm font-medium text-boca-gold border border-boca-gold/30 rounded-sm px-5 py-2 hover:bg-boca-gold/10 transition-colors"
        >
          Ver canal →
        </a>
      </div>

      {/* Separador dorado */}
      <div className="w-full h-px bg-boca-gold/30 mb-4" />

      {estado === 'loading' && <SkeletonVideos />}

      {estado === 'error' && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="font-sans text-sm text-text-secondary">
            No se pudieron cargar los videos
          </p>
          <button
            onClick={() => cargar(canal.handle)}
            className="font-sans text-sm font-medium text-boca-gold rounded px-4 py-2 hover:bg-boca-gold/10 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {estado === 'ok' && videos.length === 0 && (
        <p className="font-sans text-sm text-white/50 py-8 text-center">
          No hay videos disponibles
        </p>
      )}

      {estado === 'ok' && videos.length > 0 && (
        <>
          {/* Mobile: scroll horizontal con fade + hint */}
          <div className="sm:hidden">
            <VideoScrollRow videos={videos} />
          </div>
          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <CardVideo key={video.id} video={video} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function VideoScrollRow({ videos }: { videos: VideoYoutube[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = () => {
    if (!ref.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(sl > 4);
    setCanScrollRight(sl + clientWidth < scrollWidth - 4);
  };

  useEffect(() => { checkScroll(); }, [videos]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = ref.current!.scrollLeft;
    ref.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    ref.current!.scrollLeft = scrollLeft.current - (e.clientX - startX.current);
  };

  const stopDrag = () => { dragging.current = false; };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        onScroll={checkScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
      >
        {videos.map((video) => (
          <div key={video.id} className="shrink-0 w-64">
            <CardVideo video={video} />
          </div>
        ))}
      </div>

      {/* Gradiente izquierdo */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-10 bg-gradient-to-r from-[#001529] to-transparent" />
      )}

      {/* Gradiente + hint derecho */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-14 bg-gradient-to-l from-[#001529] to-transparent flex items-center justify-end pr-1">
          <ChevronRight size={18} className="text-boca-gold/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}

function SkeletonVideos() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="rounded-sm overflow-hidden bg-white/5">
          <div className="aspect-video bg-white/10" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
