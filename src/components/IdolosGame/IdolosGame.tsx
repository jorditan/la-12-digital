import { GameModal } from './GameModal';
import { useIdolosGame } from './hooks/useIdolosGame';

export function IdolosGame() {
  const game = useIdolosGame();
  const { state, idolo, score, bgIdolo, startRound, closeModal } = game;

  return (
    <>
      {/* Widget en el aside */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-sm" style={{ minHeight: '180px' }}>
          {/* Fondo: imagen borroneada del ídolo */}
          {bgIdolo.imageUrl && (
            <div
              className="absolute inset-0 scale-110 blur-lg opacity-25 bg-center bg-cover bg-no-repeat"
              style={{ backgroundImage: `url(${bgIdolo.imageUrl})` }}
              aria-hidden="true"
            />
          )}

          {/* Overlay oscuro con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-boca-blue via-boca-blue/80 to-transparent" />

          {/* Borde luminoso dorado */}
          <div className="absolute inset-0 rounded-sm ring-1 ring-boca-gold/30 hover:ring-boca-gold/60 transition-all duration-300" />

          {/* Scanlines sutiles */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
              backgroundSize: '100% 3px'
            }}
          />

          {/* Contenido */}
          <div className="relative flex flex-col gap-3 p-5">
            {/* Badge "MINIJUEGO" */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-boca-gold/70 border border-boca-gold/30 px-2 py-0.5 rounded-sm">
                MINIJUEGO
              </span>
              {score.total > 0 && (
                <span className="font-sans text-xs text-boca-gold tabular-nums font-bold">
                  {score.correct}/{score.total}
                </span>
              )}
            </div>

            {/* Título dramático */}
            <div>
              <p className="font-serif text-2xl font-bold text-white leading-tight">
                ¿Qué ídolo<br/>
                <span className="text-boca-gold">es?</span>
              </p>
              <p className="font-sans text-xs text-white/50 mt-1">
                {state === 'waiting'
                  ? 'Pistas + temporizador · foto borroneada'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡En curso!</span>
                }
              </p>
            </div>

            {/* Signos de pregunta decorativos */}
            <div className="flex gap-2 items-center">
              {['?', '?', '?'].map((q, i) => (
                <span
                  key={i}
                  className="font-serif text-3xl font-black text-boca-gold/20 leading-none select-none"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {q}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={state === 'waiting' ? startRound : closeModal}
              className="
                self-start font-sans text-sm font-bold px-5 py-2 rounded-sm
                bg-boca-gold text-boca-blue
                hover:brightness-110 active:scale-95
                transition-all duration-150
                shadow-[0_0_20px_rgba(255,215,0,0.3)]
              "
            >
              {state === 'waiting' ? '▶ Jugar' : '▶ Ver desafío'}
            </button>
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
