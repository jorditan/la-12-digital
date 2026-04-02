import { GameModal } from './GameModal';
import { useEquiposGame } from './hooks/useEquiposGame';

export function EquiposGame() {
  const game = useEquiposGame();
  const { gameState, equipo, score, startGame, closeModal } = game;

  return (
    <>
      {/* Widget en el aside */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-sm" style={{ minHeight: '180px' }}>
          {/* Fondo: textura pitch verde oscuro muy sutil */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 40px),
                repeating-linear-gradient(0deg, rgba(255,255,255,0.3) 0 1px, transparent 1px 40px)
              `,
              backgroundColor: '#0a2a0a'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-boca-blue via-boca-blue-mid to-boca-blue" />

          {/* Borde luminoso */}
          <div className="absolute inset-0 rounded-sm ring-1 ring-boca-gold/30 hover:ring-boca-gold/60 transition-all duration-300" />

          {/* Contenido */}
          <div className="relative flex flex-col gap-3 p-5">
            {/* Badge */}
            <div className="flex items-center justify-between">
              <span className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase text-boca-gold/70 border border-boca-gold/30 px-2 py-0.5 rounded-sm">
                MINIJUEGO
              </span>
              {score.total > 0 && (
                <span className="font-sans text-xs text-boca-gold tabular-nums font-bold">
                  {score.guessed}/{score.total}
                </span>
              )}
            </div>

            {/* Título */}
            <div>
              <p className="font-serif text-2xl font-bold text-white leading-tight">
                ¿Recordás<br/>
                <span className="text-boca-gold">el plantel?</span>
              </p>
              <p className="font-sans text-xs text-white/50 mt-1">
                {gameState === 'waiting'
                  ? '11 titulares + suplentes · 3 minutos'
                  : <span className="text-boca-gold font-semibold animate-pulse">¡En curso!</span>
                }
              </p>
            </div>

            {/* Números de camiseta decorativos */}
            <div className="flex gap-2 items-baseline">
              {[9, '?', '?', '?'].map((n, i) => (
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
            </div>

            {/* CTA */}
            <button
              onClick={gameState === 'waiting' ? startGame : closeModal}
              className="
                self-start font-sans text-sm font-bold px-5 py-2 rounded-sm
                bg-boca-gold text-boca-blue
                hover:brightness-110 active:scale-95
                transition-all duration-150
                shadow-[0_0_20px_rgba(255,215,0,0.3)]
              "
            >
              {gameState === 'waiting' ? '▶ Jugar' : '▶ Ver desafío'}
            </button>
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
