import { type PlayerState, type GameState } from './types';
import { type CardState, PlayerCard } from './PlayerCard';

// ── Normalización de posición libre → 4 buckets ──────────────────────────────
type PosicionBucket = 'Delantero' | 'Mediocampista' | 'Defensor' | 'Arquero';
const POSICION_ORDER: PosicionBucket[] = ['Delantero', 'Mediocampista', 'Defensor', 'Arquero'];

const POSICION_KEYWORDS: Array<[PosicionBucket, string[]]> = [
  ['Arquero',       ['arquero', 'portero', 'golero']],
  ['Delantero',     ['delantero', 'centrodelantero', 'extremo', 'punta']],
  ['Defensor',      ['lateral', 'zaguero', 'stopper', 'defensor']],
];

function normalizePosicion(posicion: string): PosicionBucket {
  const p = posicion.toLowerCase();
  const match = POSICION_KEYWORDS.find(([, keywords]) => keywords.some(k => p.includes(k)));
  return match ? match[0] : 'Mediocampista';
}

function cardStateFor(player: PlayerState, gameState: GameState): CardState {
  if (player.guessed) return 'guessed';
  if (gameState === 'timeout') return 'missed';
  return 'hidden';
}

// ── Tarjeta compacta para la cancha ──────────────────────────────────────────

function PitchCard({ player, gameState }: { player: PlayerState; gameState: GameState }) {
  const state = cardStateFor(player, gameState);
  const words = player.name.split(' ');
  const lastName = words[words.length - 1] ?? player.name;

  const circleClass = {
    hidden:  'bg-boca-blue border-2 border-boca-gold/20 text-boca-gold/30',
    guessed: 'bg-status-win border-2 border-status-win text-green-200',
    missed:  'bg-status-loss border-2 border-status-loss text-red-200',
  }[state];

  const nameClass = {
    hidden:  'text-white/25',
    guessed: 'text-green-400',
    missed:  'text-red-400',
  }[state];

  return (
    <div className="flex flex-col items-center gap-1 w-14">
      <div className={[
        'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm',
        'transition-all duration-500',
        circleClass,
      ].join(' ')}>
        {state === 'hidden' ? '?' : lastName[0].toUpperCase()}
      </div>
      <span className={[
        'font-sans text-[10px] font-semibold text-center leading-tight w-full truncate transition-all duration-500',
        nameClass,
      ].join(' ')}>
        {state === 'hidden' ? '· · ·' : lastName}
      </span>
    </div>
  );
}

// ── SVG de líneas de cancha ───────────────────────────────────────────────────

function PitchLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 300 420"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Borde */}
      <rect x="10" y="10" width="280" height="400" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
      {/* Línea del medio */}
      <line x1="10" y1="210" x2="290" y2="210" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
      {/* Círculo central */}
      <circle cx="150" cy="210" r="36" fill="none" stroke="white" strokeOpacity="0.10" strokeWidth="1.5" />
      {/* Área grande top (ataque) */}
      <rect x="70" y="10" width="160" height="55" fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1.2" />
      {/* Área chica top */}
      <rect x="110" y="10" width="80" height="22" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
      {/* Área grande bottom (defensa) */}
      <rect x="70" y="355" width="160" height="55" fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1.2" />
      {/* Área chica bottom */}
      <rect x="110" y="388" width="80" height="22" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

interface FormacionPitchProps {
  players: PlayerState[];
  gameState: GameState;
}

export function FormacionPitch({ players, gameState }: FormacionPitchProps) {
  const titulares = players.filter(p => p.rol === 'Titular');
  const suplentes = players.filter(p => p.rol === 'Suplente');

  return (
    <div className="space-y-3">
      {/* Cancha */}
      <div
        className="relative rounded-sm overflow-hidden bg-pitch-field"
      >
        <PitchLines />

        <div className="relative z-10 flex flex-col gap-5 py-5 px-3">
          {POSICION_ORDER.map(pos => {
            const grupo = titulares.filter(p => normalizePosicion(p.posicion) === pos);
            if (grupo.length === 0) return null;
            return (
              <div key={pos} className="flex justify-center items-start gap-2 flex-wrap">
                {grupo.map((player, i) => (
                  <PitchCard key={i} player={player} gameState={gameState} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suplentes */}
      {suplentes.length > 0 && (
        <div>
          <p className="font-sans text-[10px] text-text-secondary uppercase tracking-widest mb-2">
            Suplentes
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {suplentes.map((p, i) => (
              <PlayerCard
                key={i}
                name={p.name}
                cardState={cardStateFor(p, gameState)}
                isSuplente
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
