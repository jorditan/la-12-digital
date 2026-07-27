import type { SlotCoordinate } from './types';
import type { PlantelJugador } from '../Plantel/types';
import { Plus, X } from 'lucide-react';

interface PosicionSpotProps {
  slot: SlotCoordinate;
  player: PlantelJugador | null;
  onSelect: (slot: SlotCoordinate) => void;
  onRemove: (slotId: string) => void;
}

export function PosicionSpot({
  slot,
  player,
  onSelect,
  onRemove,
}: PosicionSpotProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
      style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
    >
      {player ? (
        /* Slot Asignado */
        <div
          onClick={() => onSelect(slot)}
          className="relative flex flex-col items-center transition-transform duration-200 group-hover:scale-110"
        >
          {/* Ficha / Camiseta Dorada */}
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-boca-gold text-boca-blue border-2 border-white shadow-lg flex items-center justify-center font-serif font-bold text-base sm:text-lg relative overflow-hidden">
            #{player.number || '?'}
            {/* Botón rápido de remoción en hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(slot.id);
              }}
              className="absolute inset-0 bg-boca-blue/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              title="Quitar jugador"
            >
              <X size={16} className="text-boca-gold" />
            </button>
          </div>

          {/* Etiqueta de Nombre del Jugador */}
          <div className="mt-1 px-2 py-0.5 bg-boca-blue/90 border border-boca-gold/40 rounded text-center max-w-[90px] sm:max-w-[110px] shadow-md backdrop-blur-sm">
            <span className="block text-[11px] font-sans font-bold text-white leading-tight truncate">
              {player.name.split(' ').pop()}
            </span>
            <span className="block text-[9px] font-sans text-boca-gold font-semibold uppercase leading-none mt-0.5">
              {slot.name}
            </span>
          </div>
        </div>
      ) : (
        /* Slot Vacío (Invitación al clic) */
        <button
          type="button"
          onClick={() => onSelect(slot)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-boca-gold/70 bg-boca-blue/60 text-boca-gold hover:bg-boca-gold hover:text-boca-blue hover:border-solid hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-0.5 group/btn"
        >
          <Plus size={14} className="group-hover/btn:scale-125 transition-transform" />
          <span className="text-[10px] font-sans font-bold tracking-wider uppercase leading-none">
            {slot.name}
          </span>
        </button>
      )}
    </div>
  );
}
