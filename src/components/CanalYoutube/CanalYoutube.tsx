import { useState, useEffect } from 'react';
import { Youtube, ChevronRight } from 'lucide-react';
import { useHorizontalScroll } from '../../hooks/useHorizontalScroll';
import { fetchVideos, type VideoYoutube } from '../../services/apifootball';
import { CANAL_DEFAULT, CANALES_YOUTUBE } from '../../data/canalesYoutube';
import { CardVideo } from '../CardVideo';

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
      {/* Header: icono + título + pills de canal + link al canal */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Youtube size={20} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight text-boca-gold tracking-tight">
            Videos bosteros
          </h2>
        </div>
        {/* Pills de canal */}
        <div className="flex flex-wrap gap-2">
          {CANALES_YOUTUBE.map(c => (
            <button
              key={c.handle}
              onClick={() => setCanal(c)}
              className={`
                font-sans text-xs font-medium px-3 py-1.5 rounded-full border transition-colors
                ${canal.handle === c.handle
                  ? 'bg-boca-gold text-boca-blue font-semibold border-boca-gold'
                  : 'border-boca-border text-text-nav hover:border-boca-gold/50 hover:text-boca-gold'}
              `}
            >
              {c.label}
            </button>
          ))}
        </div>
        <a
          href={`https://www.youtube.com/${canal.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start font-sans text-sm font-medium text-boca-gold border border-boca-gold/30 rounded-sm px-5 py-2 hover:bg-boca-gold/10 transition-colors"
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
          {/* Desktop: bento layout */}
          <div className="hidden sm:grid gap-3" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
            {/* Video destacado — ocupa 2 filas */}
            <div className="row-span-2 h-full">
              <CardVideo video={videos[0]} featured />
            </div>
            {/* Hasta 4 videos secundarios */}
            {videos.slice(1, 5).map(video => (
              <CardVideo key={video.id} video={video} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function VideoScrollRow({ videos }: { videos: VideoYoutube[] }) {
  const { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag } = useHorizontalScroll();

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
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
        <div className="pointer-events-none absolute left-0 top-0 h-[calc(100%-8px)] w-10 bg-gradient-to-r from-boca-blue to-transparent" />
      )}

      {/* Gradiente + hint derecho */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-[calc(100%-8px)] w-14 bg-gradient-to-l from-boca-blue to-transparent flex items-center justify-end pr-1">
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
