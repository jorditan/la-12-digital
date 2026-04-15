import { Button } from '../ui/Button';
import { GamePromoCard } from '../GamePromoCard/GamePromoCard';
import { GameModal } from './GameModal';
import { useEquiposGame } from './hooks/useEquiposGame';

const JERSEY_NUMBER_CLASSES = [
  'text-4xl text-boca-gold/35',
  'text-3xl text-boca-gold/20',
  'text-2xl text-boca-gold/10',
  'text-2xl text-boca-gold/10',
] as const;

export function EquiposGame() {
  const game = useEquiposGame();
  const { gameState, equipo, score, startGame, closeModal } = game;

  return (
    <>
      <GamePromoCard
        contentId="equiposJuego"
        score={score.total > 0 ? `${score.guessed}/${score.total}` : null}
        title={(
          <p className="font-serif text-2xl font-bold text-white leading-tight">
            ¿Recordás
            <span className="text-boca-gold"> el plantel?</span>
          </p>
        )}
        decoration={[10, 9, 7, 11].map((n, i) => (
          <span
            key={i}
            className={`font-serif font-black leading-none select-none tabular-nums ${JERSEY_NUMBER_CLASSES[i]}`}
          >
            #{n}
          </span>
        ))}
        cta={(
          <Button
            className="w-fit"
            onClick={gameState === 'waiting' ? startGame : closeModal}
          >
            {gameState === 'waiting' ? 'Jugar' : '▶ Ver desafío'}
          </Button>
        )}
      />

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
