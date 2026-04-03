import { Button } from '../Button';
import { GamePromoCard } from '../GamePromoCard/GamePromoCard';
import { GameModal } from './GameModal';
import { useEquiposGame } from './hooks/useEquiposGame';

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
        decoration={[9, '?', '?', '?'].map((n, i) => (
          <span
            key={i}
            className={`font-serif font-black leading-none select-none ${
              i === 0
                ? 'text-4xl text-boca-gold/30'
                : 'text-2xl text-boca-gold/10'
            }`}
          >
            {n}
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
