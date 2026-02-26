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

        <div className="relative bg-boca-blue-light border border-boca-gold/10 rounded-sm overflow-hidden">
          {/* Imagen borroneada de fondo */}
          {bgIdolo.imageUrl && (
            <div
              className="absolute inset-0 scale-110 blur-md opacity-20 bg-center bg-cover bg-no-repeat pointer-events-none"
              style={{ backgroundImage: `url(${bgIdolo.imageUrl})` }}
              aria-hidden="true"
            />
          )}
          {/* Overlay degradado */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #031428 30%, transparent 100%)' }}
            aria-hidden="true"
          />

          {/* Contenido */}
          <div className="relative flex flex-col items-center gap-4 py-6 px-4 text-center">
            <div className="space-y-1">
              <p className="font-serif text-lg font-semibold text-white leading-snug">
                ¿Podés adivinar al ídolo?
              </p>
              <p className="font-sans text-xs text-text-secondary">
                {state === 'waiting'
                  ? 'Pistas, temporizador y foto borroneada'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡Desafío en curso!</span>
                }
              </p>
            </div>

            <Button
              size="md"
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
