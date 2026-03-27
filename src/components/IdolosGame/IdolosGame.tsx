import { Button } from '../Button';
import { GameModal } from './GameModal';
import { useIdolosGame } from './hooks/useIdolosGame';

export function IdolosGame() {
  const game = useIdolosGame();
  const { state, idolo, score, bgIdolo, startRound, closeModal } = game;

  return (
    <>
      {/* Widget en el aside */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-[22px] leading-tight text-boca-gold">
            ¿Qué ídolo es?
          </h2>
          {score.total > 0 && (
            <span className="font-sans text-xs text-text-secondary tabular-nums">
              {score.correct}/{score.total} ✓
            </span>
          )}
        </div>

        <div className="relative bg-boca-blue-light border border-boca-gold/30 rounded-sm overflow-hidden shadow-[0_0_24px_rgba(255,193,7,0.06)] hover:border-boca-gold/60 transition-colors">
          {/* Imagen borroneada de fondo */}
          {bgIdolo.imageUrl && (
            <div
              className="absolute inset-0 scale-110 blur-md opacity-30 bg-center bg-cover bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url(${bgIdolo.imageUrl})` }}
              aria-hidden="true"
            />
          )}
          {/* Overlay degradado */}
          <div
            className="absolute inset-0 pointer-events-none bg-overlay-game"
            aria-hidden="true"
          />

          {/* Contenido */}
          <div className="relative flex flex-col items-center gap-4 py-8 px-4 text-center">
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-white leading-snug">
                ¿Podés adivinar al ídolo?
              </p>
              <p className="font-sans text-xs text-text-secondary">
                {state === 'waiting'
                  ? 'Pistas, temporizador y foto borroneada'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡Desafío en curso!</span>
                }
              </p>
              {state === 'waiting' && score.total > 0 && (
                <p className="font-sans text-[11px] text-boca-gold/70">
                  Último: {score.correct}/{score.total} correctos ✓
                </p>
              )}
            </div>

            <Button
              size="lg"
              variant={state === 'waiting' ? 'primary' : 'secondary'}
              onClick={state === 'waiting' ? startRound : closeModal}
            >
              {state === 'waiting' ? 'Jugar' : 'Ver desafío'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal — solo visible cuando el juego está activo */}
      {state !== 'waiting' && idolo && (
        <GameModal
          state={state}
          idolo={idolo}
          timer={game.timer}
          visibleClues={game.visibleClues}
          input={game.input}
          inputError={game.inputError}
          score={score}
          inputRef={game.inputRef}
          onInputChange={game.handleChange}
          onSubmit={game.handleSubmit}
          onClose={closeModal}
          onPlayNext={startRound}
        />
      )}
    </>
  );
}
