import { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex gap-4 items-center">
          <Youtube size={24} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[32px] leading-10 text-boca-gold tracking-tight">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <CardVideo key={video.id} video={video} />
          ))}
        </div>
      )}
    </section>
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
