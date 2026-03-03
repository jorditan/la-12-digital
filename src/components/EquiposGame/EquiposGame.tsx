import { Button } from '../Button';
import { GameModal } from './GameModal';
import { useEquiposGame } from './hooks/useEquiposGame';

export function EquiposGame() {
  const game = useEquiposGame();
  const { gameState, equipo, score, startGame, closeModal } = game;

  return (
    <>
      {/* Widget en el aside */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-[22px] leading-tight text-boca-gold">
            ¿Recordás el plantel?
          </h2>
          {score.total > 0 && (
            <span className="font-sans text-xs text-text-secondary tabular-nums">
              {score.guessed}/{score.total} ✓
            </span>
          )}
        </div>

        <div className="relative bg-boca-blue-light border border-boca-gold/10 rounded-sm overflow-hidden">
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
                ¿Podés completar el plantel?
              </p>
              <p className="font-sans text-xs text-text-secondary">
                {gameState === 'waiting'
                  ? '3 minutos para recordar a todos los jugadores'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡Desafío en curso!</span>
                }
              </p>
            </div>

            <Button
              size="md"
              variant={gameState === 'waiting' ? 'primary' : 'secondary'}
              onClick={gameState === 'waiting' ? startGame : closeModal}
            >
              {gameState === 'waiting' ? 'Jugar' : 'Ver desafío'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal — solo visible cuando el juego está activo */}
      {gameState !== 'waiting' && equipo && (
        <GameModal
          gameState={gameState}
          equipo={equipo}
          players={game.players}
          timer={game.timer}
          input={game.input}
          inputError={game.inputError}
          score={score}
          inputRef={game.inputRef}
          onInputChange={game.handleChange}
          onSubmit={game.handleSubmit}
          onClose={closeModal}
          onPlayNext={startGame}
        />
      )}
    </>
  );
}
