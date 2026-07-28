import { useArmaTu11 } from './hooks/useArmaTu11';
import { Resumen11Header } from './Resumen11Header';
import { FormacionSelector } from './FormacionSelector';
import { CanchaTactica } from './CanchaTactica';
import { SelectorJugadorModal } from './SelectorJugadorModal';
import { Activity, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function ArmaTu11View() {
  const {
    loading,
    error,
    reload,
    allPlayers,
    formationId,
    setFormationId,
    currentFormation,
    lineup,
    selectedSlot,
    setSelectedSlot,
    assignedPlayerIds,
    assignedCount,
    averageAge,
    assignPlayer,
    removePlayer,
    clearLineup,
  } = useArmaTu11();

  const handleShare = () => {
    if (assignedCount === 0) return;
    const lines = [
      `💙💛💙 Mi 11 Titular de Boca Juniors (${currentFormation.label}):`,
      ...currentFormation.slots.map((slot) => {
        const player = lineup[slot.id];
        return `${slot.name}: ${player ? `${player.name} (#${player.number || 'S/N'})` : 'Vacío'}`;
      }),
      averageAge > 0 ? `📊 Promedio de edad: ${averageAge} años` : '',
      'Armá el tuyo en la12digital.dev ⚽',
    ].filter(Boolean);

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('¡Alineación copiada al portapapeles!');
  };

  return (
    <div className="flex-1 min-w-0 px-3 py-3 sm:px-6 sm:py-8 lg:px-10 flex flex-col gap-4 sm:gap-8">
      {/* Banner de Cabecera con Insights */}
      <Resumen11Header
        assignedCount={assignedCount}
        averageAge={averageAge}
        formationLabel={currentFormation.label}
        onClear={clearLineup}
        onShare={handleShare}
      />

      {/* Selector de Esquema Táctico */}
      {!loading && !error && (
        <div className="flex items-center justify-between bg-boca-blue-mid border border-boca-border p-4 rounded-sm">
          <FormacionSelector formationId={formationId} onChange={setFormationId} />
          <span className="text-xs font-sans text-text-muted hidden sm:inline-block">
            Hacé clic en un puesto para asignar un jugador
          </span>
        </div>
      )}

      {/* Estado de carga */}
      {loading ? (
        <div className="w-full max-w-2xl mx-auto aspect-[3/4] sm:aspect-[4/5] rounded-sm bg-boca-blue-mid/40 border border-boca-border animate-pulse flex items-center justify-center">
          <span className="font-serif text-text-muted text-base">Cargando cancha táctica...</span>
        </div>
      ) : error ? (
        <div className="bg-boca-blue-mid border border-red-500/30 rounded-sm p-8 text-center max-w-md mx-auto my-8 shadow-card">
          <Activity size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-serif text-base mb-4">{error}</p>
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-boca-gold text-boca-blue font-sans text-sm font-bold rounded-sm hover:bg-boca-gold-hover transition-colors"
          >
            <RotateCcw size={16} />
            Reintentar
          </button>
        </div>
      ) : (
        /* Cancha Táctica Principal */
        <CanchaTactica
          formation={currentFormation}
          lineup={lineup}
          onSelectSlot={setSelectedSlot}
          onRemovePlayer={removePlayer}
        />
      )}

      {/* Modal de Selección de Jugador */}
      {selectedSlot && (
        <SelectorJugadorModal
          slot={selectedSlot}
          players={allPlayers}
          assignedPlayerIds={assignedPlayerIds}
          onSelectPlayer={(player) => assignPlayer(selectedSlot.id, player)}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
