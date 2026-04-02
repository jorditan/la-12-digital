import type { VideoYoutube } from '../../services/apifootball';

interface CardVideoProps {
  video: VideoYoutube;
  className?: string;
  featured?: boolean;
}

export function CardVideo({ video, featured }: CardVideoProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex flex-col overflow-hidden rounded-sm transition-all duration-200 bg-boca-blue-light
        hover:border-boca-gold
        border-boca-border border-2 hover:shadow-sm
        focus-within:outline focus-within:outline-2 focus-within:outline-boca-gold
        ${featured ? 'h-full' : ''}
      `}
    >
      {/* Thumbnail — edge-to-edge, 16:9 en cards normales; flex-1 en featured */}
      <div className={`relative overflow-hidden ${featured ? 'flex-1 min-h-0' : 'aspect-video'}`}>
          <img
            src={video.thumbnail}
            alt={video.titulo}
            className="absolute inset-0 border-b-2 border-boca-border w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />

        {/* Duration badge — rojo estilo YouTube */}
        <span className="absolute bottom-2 right-2 bg-youtube-red text-white font-serif text-[11px] font-semibold px-1.5 py-0.5 rounded-sm tabular-nums">
          {video.duracion}
        </span>
      </div>

      {/* Título — blanco en default, dorado en hover */}
      <div className="px-3 py-3 shrink-0">
        <p className={`font-serif font-medium leading-[1.4] uppercase tracking-wide text-white transition-colors duration-200 line-clamp-3 ${featured ? 'text-xl' : 'text-md'}`}>
          {video.titulo}
        </p>
      </div>
    </a>
  );
}
