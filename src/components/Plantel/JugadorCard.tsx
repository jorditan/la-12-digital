import type { PlantelJugador } from './types';
import { formatHeight } from './utils';

interface JugadorCardProps {
  jugador: PlantelJugador;
  className?: string;
}

/**
 * JugadorCard V7 — Ficha técnica tokenizada sin emojis, tipografía de mínimo 14px
 *
 * Estructura:
 *   Card (bg-boca-blue-light, border border-boca-border, rounded-sm)
 *   ├── Cuerpo (px-5, pt-4, pb-4) → Dorsal del jugador + Ficha técnica (Edad, Altura/Nación)
 *   └── Footer Oscuro (bg-boca-blue, border-t border-boca-border, px-5 py-3.5)
 *       └── Nombre único del jugador (font-serif, text-base sm:text-lg)
 */
export function JugadorCard({ jugador, className = '' }: JugadorCardProps) {
  const formattedHeight = formatHeight(jugador.height);

  return (
    <article
      className={`
        group
        bg-boca-blue-light border border-boca-border rounded-sm
        flex flex-col justify-between overflow-hidden
        hover:border-boca-gold hover:shadow-card
        transition-[border-color,box-shadow] duration-300 h-full
        ${className}
      `}
    >
      {/* Cuerpo de la tarjeta */}
      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between select-none min-h-[115px]">
        {/* Fila superior: Dorsal del jugador (#) */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-serif font-bold  tracking-wider text-text-muted">
            Número
          </span>
          {jugador.number ? (
            <span className="font-serif font-bold text-lg text-boca-gold ">#{jugador.number}</span>
          ) : (
            <span className="text-sm font-sans text-text-muted italic">S/N</span>
          )}
        </div>

        {/* Ficha técnica: Edad y Altura (Mínimo 14px -> text-sm / text-base) */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-3 font-sans">
          {jugador.age > 0 ? (
            <div>
              <span className="block text-sm text-text-muted  font-serif tracking-wider font-medium">
                Edad
              </span>
              <span className="font-semibold text-base text-white">{jugador.age} años</span>
            </div>
          ) : (
            <div>
              <span className="block text-sm text-text-muted  font-serif tracking-wider font-medium">
                Rol
              </span>
              <span className="font-semibold text-base text-white">Técnico</span>
            </div>
          )}

          {formattedHeight ? (
            <div>
              <span className="block text-sm text-text-muted  font-serif tracking-wider font-medium">
                Altura
              </span>
              <span className="font-semibold text-base text-white">{formattedHeight}</span>
            </div>
          ) : (
            <div>
              <span className="block text-sm text-text-muted  font-serif tracking-wider font-medium">
                Nación
              </span>
              <span className="font-semibold text-sm text-white truncate block">
                {jugador.nationality || 'Argentina'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-boca-blue border-t border-boca-border px-5 py-3.5 shrink-0 w-full">
        <h3 className="font-serif font-bold text-xl sm:text-xl text-white tracking-wide leading-snug group-hover:text-boca-gold transition-colors truncate">
          {jugador.name}
        </h3>
      </div>
    </article>
  );
}
