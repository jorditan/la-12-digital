import { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import { fetchVideos, type VideoYoutube } from '../../services/apifootball';
import { CANALES_YOUTUBE, CANAL_DEFAULT } from '../../data/canalesYoutube';
import { CardVideo } from '../CardVideo';
import { CanalSelector } from '../CanalSelector';

export function CanalYoutube() {
  const [canal, setCanal] = useState(CANAL_DEFAULT);
  const [videos, setVideos] = useState<VideoYoutube[]>([]);

  useEffect(() => {
    fetchVideos(canal.channelId).then(setVideos);
  }, [canal]);

  if (videos.length === 0) return null;

  return (
    <section aria-label="Videos de YouTube" className="w-full">
      {/* Fila 1: icono + título + link al canal */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex gap-4 items-center">
          <Youtube size={24} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[32px] leading-10 text-boca-gold tracking-tight">
            Videos bosteros
          </h2>
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

      {/* Fila 2: selector de canal */}
      <div className="mb-4">
        <CanalSelector
          canales={CANALES_YOUTUBE}
          selected={canal}
          onChange={setCanal}
        />
      </div>

      {/* Separador dorado */}
      <div className="w-full h-px bg-boca-gold/30 mb-4" />

      {/* Grid responsive: 1 col → 2 col (sm) → 3 col (lg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <CardVideo key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}
