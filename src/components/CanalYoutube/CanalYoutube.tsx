import { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import { fetchVideos, type VideoYoutube } from '../../services/apifootball';
import { CANAL_DEFAULT, CANALES_YOUTUBE } from '../../data/canalesYoutube';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
            <Badge
              key={c.handle}
              onClick={() => setCanal(c)}
              selectable
              selected={canal.handle === c.handle}
              className="rounded-full"
            >
              {c.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Separador dorado */}
      <div className="w-full h-px bg-boca-gold/30 mb-4" />

      {estado === 'loading' && <SkeletonVideos />}

      {estado === 'error' && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="font-sans text-sm text-text-secondary">
            No se pudieron cargar los videos
          </p>
          <Button
            onClick={() => cargar(canal.handle)}
            variant="text"
            className="text-sm text-boca-gold rounded px-4 py-2 hover:bg-boca-gold/10"
          >
            Reintentar
          </Button>
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
            <VideoStack videos={videos} />
          </div>
          {/* Desktop: grid homogéneo, sin hero sobredimensionado */}
          <div className="hidden sm:grid grid-cols-3 xl:grid-cols-4 gap-3">
            {videos.slice(0, 12).map(video => (
              <CardVideo key={video.id} video={video} compact />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function VideoStack({ videos }: { videos: VideoYoutube[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="font-serif text-[12px] ">
          Desliza hacia abajo
        </p>
        <p className="font-serif text-[12px] text-text-secondary">
          {Math.min(videos.length, 8)} videos
        </p>
      </div>
      <div
        className="max-h-[32rem] space-y-3 overflow-y-auto overscroll-contain pr-1 snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {videos.slice(0, 8).map((video) => (
          <div key={video.id} className="snap-start">
            <CardVideo video={video} compact />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonVideos() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
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
