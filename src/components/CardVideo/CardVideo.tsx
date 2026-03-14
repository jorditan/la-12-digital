import type { VideoYoutube } from '../../services/apifootball';

interface CardVideoProps {
  video: VideoYoutube;
  className?: string;
}

export function CardVideo({ video }: CardVideoProps) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group flex flex-col overflow-hidden rounded-sm transition-all duration-200 bg-[#002140] 
        hover:border-boca-gold
        border-[#00396e] border-2 hover:shadow-sm
        focus-within:outline focus-within:outline-2 focus-within:outline-boca-gold
      "
    >
      {/* Thumbnail — edge-to-edge, 16:9, sin padding ni marco */}
      <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.titulo}
            className="absolute inset-0 border-b-2 border-[#00396e] w-full h-full object-cover"
            loading="lazy"
            draggable={false}
          />

        {/* Duration badge — rojo estilo YouTube */}
        <span className="absolute bottom-2 right-2 bg-[#cc0000] text-white font-serif text-[11px] font-semibold px-1.5 py-0.5 rounded-sm tabular-nums">
          {video.duracion}
        </span>
      </div>

      {/* Título — blanco en default, dorado en hover */}
      <div className="px-3 py-3">
        <p className="font-serif font-medium text-md leading-[1.4] uppercase tracking-wide text-white  transition-colors duration-200 line-clamp-3">
          {video.titulo}
        </p>
      </div>
    </a>
  );
}
