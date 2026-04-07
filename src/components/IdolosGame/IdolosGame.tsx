import { Star } from 'lucide-react';
import { Button } from '../Button';
import { GamePromoCard } from '../GamePromoCard/GamePromoCard';
import { GameModal } from './GameModal';
import { useIdolosGame } from './hooks/useIdolosGame';

export function IdolosGame() {
  const game = useIdolosGame();
  const { state, idolo, score, bgIdolo, startRound, closeModal } = game;

  return (
    <>
      <GamePromoCard
        backgroundImageUrl={bgIdolo.imageUrl}
        contentId="idoloJuego"
        score={score.total > 0 ? `${score.correct}/${score.total}` : null}
        title={(
          <p className="font-serif text-2xl font-bold text-white leading-tight">
            ¿Qué ídolo
            <span className="text-boca-gold"> es?</span>
          </p>
        )}
        decoration={[20, 16, 12].map((size, i) => (
          <Star
            key={i}
            size={size}
            className="text-boca-gold select-none shrink-0"
            style={{ opacity: 0.15 + i * 0.08 }}
            fill="currentColor"
          />
        ))}
        cta={(
          <Button
            onClick={state === 'waiting' ? startRound : closeModal}
            className="w-fit"
          >
            {state === 'waiting' ? 'Jugar' : '▶ Ver desafío'}
          </Button>
        )}
      />

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
