import type { Noticia } from '../../services/apifootball';

interface NoticiaCardProps {
  noticia: Noticia;
  className?: string;
}

/**
 * CardNoticia — Figma node 48-809
 *
 * Default : borde #00396e, sin sombra
 * Hover   : borde boca-gold (se funde con el fondo), sombra oscura shadow-card
 *
 * Estructura:
 *   Card (bg-gold, pt-3, px-0, h-282)
 *   ├── Image Container (px-4, flex-1) → fondo dorado actúa de marco
 *   │   └── <img> object-cover, absolute fill
 *   └── Footer (bg-#002140, border-b #003d7a, px-6 pt-6 pb-3)
 *       └── Título (serif regular 16px, leading-6, #e0e7ff)
 */
export function NoticiaCard({ noticia, className = '' }: NoticiaCardProps) {
  return (
    <article
      className={`
        group
        bg-boca-gold border border-[#00396e] rounded-sm
        h-[282px] flex flex-col justify-between overflow-hidden
        pt-3 px-0
        hover:border-boca-gold hover:shadow-card
        transition-[border-color,box-shadow] duration-300 
        ${className}
      `}
    >
      {/* Zona de imagen — px-4 en el outer expone el fondo dorado como marco lateral.
          El div inner es el contexto de posicionamiento para que inset-0 respete el padding. */}
      <div className="flex-1 min-h-0 px-4 flex flex-col">
        <div className="flex-1 relative min-h-0 w-full">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Footer oscuro con título */}
      <div className="bg-[#002140] border-b border-[#003d7a] px-6 pt-6 pb-3 shrink-0 w-full">
        <p className="font-serif font-normal text-base text-[#e0e7ff] leading-6 tracking-normal line-clamp-2">
          {noticia.titulo}
        </p>
      </div>
    </article>
  );
}
