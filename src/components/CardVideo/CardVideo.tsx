import type { VideoYoutube } from "../../services/apifootball";
import { sanitizeExternalHref, sanitizeImageSrc } from "@/utils/urlSafety";

interface CardVideoProps {
  video: VideoYoutube;
  className?: string;
  featured?: boolean;
  compact?: boolean;
}

export function CardVideo({ video, featured, compact }: CardVideoProps) {
  const safeHref = sanitizeExternalHref(`https://www.youtube.com/watch?v=${video.id}`);
  const safeThumb = sanitizeImageSrc(video.thumbnail) ?? "/escudo_boca.png";

  if (!safeHref) return null;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex flex-col overflow-hidden rounded-sm transition-all duration-200 bg-boca-blue-light
        hover:border-boca-gold
        border-boca-border border-2 hover:shadow-sm
        focus-within:outline focus-within:outline-2 focus-within:outline-boca-gold
        ${featured ? "h-full" : ""}
        ${compact ? "h-full" : ""}
      `}
    >
      <div
        className={`relative overflow-hidden ${featured ? "flex-1 min-h-0" : "aspect-video"}`}
      >
        <img
          src={safeThumb}
          alt={video.titulo}
          className="absolute inset-0 border-b-2 border-boca-border w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />

        {/* Duration badge — rojo estilo YouTube */}
        <span className="absolute bottom-2 right-2 bg-youtube-red text-white type-ui-label px-1.5 py-0.5 rounded-sm tabular-nums">
          {video.duracion}
        </span>
      </div>

      {/* Título — blanco en default, dorado en hover */}
      <div className={`${compact ? "px-3 py-2.5" : "px-3 py-3"} shrink-0`}>
        <p
          className={`font-serif font-medium leading-[1.35] uppercase tracking-wide text-white transition-colors duration-200 ${compact ? "line-clamp-2 text-sm" : "line-clamp-3"} ${featured ? "text-xl" : ""}`}
        >
          {video.titulo}
        </p>
      </div>
    </a>
  );
}
