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

        <div className="relative bg-boca-blue-light border border-boca-gold/30 rounded-sm overflow-hidden shadow-[0_0_24px_rgba(255,193,7,0.06)] hover:border-boca-gold/60 transition-colors">
          {/* Overlay degradado */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #031428 40%, transparent 100%)' }}
            aria-hidden="true"
          />

          {/* Contenido */}
          <div className="relative flex flex-col items-center gap-4 py-8 px-4 text-center">
            <div className="space-y-2">
              <p className="font-serif text-xl font-bold text-white leading-snug">
                ¿Podés completar el plantel?
              </p>
              <p className="font-sans text-xs text-text-secondary">
                {gameState === 'waiting'
                  ? '11 titulares + suplentes · 3 minutos'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡Desafío en curso!</span>
                }
              </p>
              {gameState === 'waiting' && score.total > 0 && (
                <p className="font-sans text-[11px] text-boca-gold/70">
                  Último: {score.guessed}/{score.total} jugadores ✓
                </p>
              )}
            </div>

            <Button
              size="lg"
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
