import type { PlantelJugador } from './types';
import { formatHeight } from './utils';

interface JugadorCardProps {
  jugador: PlantelJugador;
  className?: string;
}

/**
 * JugadorCard V2
 *
 * Estructura:
 *   Card (bg-boca-blue-light, border border-boca-border, rounded-sm)
 *   ├── Cuerpo (px-5, pt-4, pb-3) → Dorsal del jugador + Ficha técnica (Edad, Altura)
 *   └── Footer Oscuro (bg-boca-blue, border-t border-boca-border, px-5 py-3.5)
 *       └── Nombre único del jugador (font-serif, text-white, line-clamp-1)
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
      <div className="flex-1 px-5 pt-4 pb-4 flex flex-col justify-between select-none min-h-[105px]">
        {/* Fila superior: Dorsal del jugador (#) */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-text-muted">
            Dorsal
          </span>
          {jugador.number ? (
            <span className="font-serif font-bold text-2xl text-boca-gold bg-boca-gold/10 px-2 py-0.5 rounded border border-boca-gold/20">
              #{jugador.number}
            </span>
          ) : (
            <span className="text-xs font-sans text-text-muted italic">S/N</span>
          )}
        </div>

        {/* Ficha técnica: Edad y Altura */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-xs font-sans">
          {jugador.age > 0 ? (
            <div>
              <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Edad
              </span>
              <span className="font-semibold text-white">{jugador.age} años</span>
            </div>
          ) : (
            <div>
              <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Rol
              </span>
              <span className="font-semibold text-white">Técnico</span>
            </div>
          )}

          {formattedHeight ? (
            <div>
              <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Altura
              </span>
              <span className="font-semibold text-white">{formattedHeight}</span>
            </div>
          ) : jugador.nationality ? (
            <div>
              <span className="block text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Nación
              </span>
              <span className="font-semibold text-white truncate block">{jugador.nationality}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer Oscuro con Nombre Único */}
      <div className="bg-boca-blue border-t border-boca-border px-5 py-3.5 shrink-0 w-full">
        <h3 className="font-serif font-bold text-base text-white tracking-wide leading-tight group-hover:text-boca-gold transition-colors truncate">
          {jugador.name}
        </h3>
      </div>
    </article>
  );
}
