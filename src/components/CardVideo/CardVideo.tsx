import type { VideoYoutube } from '../../services/apifootball';

interface CardVideoProps {
  video: VideoYoutube;
  className?: string;
}

export function CardVideo({ video, className = '' }: CardVideoProps) {
  return (
    <article
      className={[
        'group flex flex-col overflow-hidden px-2 py-2 rounded-sm transition-all duration-200',
        'hover:border-boca-gold',
        'hover:bg-boca-gold',
        'hover:bg-boca-gold',
        'hover:text-boca-blue',
        'focus-within:outline focus-within:outline-2 focus-within:outline-violet-500',
        'transition-[border-color] duration-200',
        className,
      ].join(' ')}
    >
      {/* Thumbnail — edge-to-edge, 16:9, sin padding ni marco */}
      <div className="relative aspect-video border-boca-gold border-2 overflow-hidden bg-boca-blue">
        <img
          src={video.thumbnail}
          alt={video.titulo}
          className="absolute inset-0 p-4 w-full h-full object-cover"
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
        <p className="font-serif font-medium text-lg leading-[1.4] uppercase tracking-wide text-white group-hover:text-boca-blue transition-colors duration-200 line-clamp-3">
          {video.titulo}
        </p>
      </div>
    </article>
  );
}
