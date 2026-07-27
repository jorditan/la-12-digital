import type { TacticalFormation, LineupMap, SlotCoordinate } from './types';
import { PosicionSpot } from './PosicionSpot';

interface CanchaTacticaProps {
  formation: TacticalFormation;
  lineup: LineupMap;
  onSelectSlot: (slot: SlotCoordinate) => void;
  onRemovePlayer: (slotId: string) => void;
}

export function CanchaTactica({
  formation,
  lineup,
  onSelectSlot,
  onRemovePlayer,
}: CanchaTacticaProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-sm overflow-hidden bg-gradient-to-b from-emerald-950 via-boca-blue-dark to-emerald-950 border-2 border-boca-gold/40 shadow-2xl select-none">
      {/* Patrón de césped táctico */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Líneas tácticas de la cancha (Línea exterior, medio campo, área) */}
      <div className="absolute inset-4 border-2 border-white/20 pointer-events-none rounded-sm" />
      
      {/* Línea central */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-white/20 pointer-events-none" />
      
      {/* Círculo central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 border-2 border-white/20 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full pointer-events-none" />

      {/* Área chica / Grande del arco rival (Arriba) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-20 sm:h-24 border-2 border-t-0 border-white/20 pointer-events-none" />
      
      {/* Área chica / Grande del arco propio (Abajo) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-60 h-20 sm:h-24 border-2 border-b-0 border-white/20 pointer-events-none" />

      {/* Renderizado de Slots tácticos */}
      {formation.slots.map((slot) => (
        <PosicionSpot
          key={slot.id}
          slot={slot}
          player={lineup[slot.id] || null}
          onSelect={onSelectSlot}
          onRemove={onRemovePlayer}
        />
      ))}
    </div>
  );
}
