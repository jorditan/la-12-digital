import { useState, useEffect } from 'react';
import { Youtube } from 'lucide-react';
import { fetchVideos, type VideoYoutube } from '../../services/apifootball';
import { CardVideo } from '../CardVideo';

export function CanalYoutube() {
  const [videos, setVideos] = useState<VideoYoutube[]>([]);

  useEffect(() => {
    fetchVideos().then(setVideos);
  }, []);

  if (videos.length === 0) return null;

  return (
    <section aria-label="Canal de YouTube" className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className='flex gap-4 items-center'>
          <Youtube size={24} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[32px] leading-10 text-boca-gold tracking-tight">
            El canal de Boca
          </h2>
        </div>

      {/* Link al canal */}
        <div className="flex justify-center">
          <a
            href="https://www.youtube.com/@ElCanaldeBoca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm font-medium text-boca-gold border border-boca-gold/30 rounded-sm px-5 py-2 hover:bg-boca-gold/10 transition-colors"
          >
            Ver canal completo →
          </a>
        </div>
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
