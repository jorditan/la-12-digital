import { useEffect, useState } from 'react';
import { getSofaScoreLastFixtures, getSofaScoreNextFixtures } from '../services/sofascoreService';
import type { ProcessedFixture } from '../types/football';

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const resultBorder: Record<string, string> = {
  win:       'border-green-500',
  loss:      'border-red-500',
  draw:      'border-gray-500',
  scheduled: 'border-boca-gold',
};

const resultLabel: Record<string, string> = {
  win:       'Victoria',
  loss:      'Derrota',
  draw:      'Empate',
  scheduled: 'Programado',
};

const resultBg: Record<string, string> = {
  win:       'bg-green-500/10 text-green-400',
  loss:      'bg-red-500/10 text-red-400',
  draw:      'bg-gray-500/10 text-gray-400',
  scheduled: 'bg-boca-gold/10 text-boca-gold',
};

export function SofaScoreAPITest() {
  const [lastMatches, setLastMatches]   = useState<ProcessedFixture[]>([]);
  const [nextMatches, setNextMatches]   = useState<ProcessedFixture[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSofaScoreLastFixtures(5),
      getSofaScoreNextFixtures(4),
    ])
      .then(([last, next]) => {
        setLastMatches(last);
        setNextMatches(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error('[SofaScoreAPITest]', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse flex items-center gap-3 p-6 rounded-sm bg-white/5">
        <div className="h-4 w-4 rounded-full bg-boca-gold/40" />
        <p className="font-sans text-sm text-white/50">Conectando con SofaScore API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-sm border border-red-500/30 bg-red-500/10">
        <p className="font-sans text-sm font-semibold text-red-400 mb-1">Error al conectar con SofaScore</p>
        <p className="font-mono text-xs text-red-300/70">{error}</p>
        <p className="font-sans text-xs text-white/40 mt-3">
          Verificar: ¿El servidor Vite está corriendo? ¿El proxy /sofascore-api está configurado?
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Banner de conexión */}
      <div className="flex items-center gap-3 p-4 rounded-sm bg-green-500/10 border border-green-500/30">
        <span className="text-green-400 text-lg">✅</span>
        <div>
          <p className="font-sans text-sm font-semibold text-green-400">
            Conectado con SofaScore API — Boca ID: 3202
          </p>
          <p className="font-sans text-xs text-white/40 mt-0.5">
            Caché activo · 2h · {lastMatches.length} partidos recientes · {nextMatches.length} próximos
          </p>
        </div>
      </div>

      {/* Últimos partidos */}
      <section>
        <h2 className="font-serif font-semibold text-lg text-white mb-4">
          Últimos 5 partidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {lastMatches.map(p => (
            <article
              key={p.id}
              className={`flex flex-col gap-3 p-4 rounded-sm bg-white/[0.04] border-l-4 ${resultBorder[p.result]}`}
            >
              {/* Equipos */}
              <div className="flex flex-col gap-1">
                <p className={`font-sans text-xs font-semibold leading-tight ${p.isBocaHome ? 'text-boca-gold' : 'text-white'}`}>
                  {p.homeTeam}
                </p>
                <p className="font-sans text-[10px] text-white/40">vs</p>
                <p className={`font-sans text-xs font-semibold leading-tight ${!p.isBocaHome ? 'text-boca-gold' : 'text-white'}`}>
                  {p.awayTeam}
                </p>
              </div>

              {/* Score */}
              {p.homeScore !== null && p.awayScore !== null && (
                <p className="font-serif text-2xl font-bold text-white tabular-nums">
                  {p.homeScore} - {p.awayScore}
                </p>
              )}

              {/* Resultado + Fecha */}
              <div className="flex flex-col gap-1.5">
                <span className={`inline-block self-start font-sans text-[10px] font-semibold px-2 py-0.5 rounded-sm ${resultBg[p.result]}`}>
                  {resultLabel[p.result]}
                </span>
                <p className="font-sans text-[11px] text-white/40">
                  {formatDate(p.date)}
                </p>
                {p.venue && (
                  <p className="font-sans text-[10px] text-white/30 leading-tight line-clamp-1">
                    {p.venue}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Próximos partidos */}
      <section>
        <h2 className="font-serif font-semibold text-lg text-white mb-4">
          Próximos 4 partidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nextMatches.map(p => (
            <article
              key={p.id}
              className="flex flex-col gap-3 p-4 rounded-sm bg-white/[0.04] border border-boca-gold/20 hover:border-boca-gold/40 transition-colors"
            >
              {/* Local/Visitante badge */}
              <span className="self-start font-sans text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-boca-gold/10 text-boca-gold">
                {p.isBocaHome ? '🏠 Local' : '✈️ Visitante'}
              </span>

              {/* Equipos */}
              <div className="flex flex-col gap-1">
                <p className={`font-sans text-xs font-semibold leading-tight ${p.isBocaHome ? 'text-boca-gold' : 'text-white'}`}>
                  {p.homeTeam}
                </p>
                <p className="font-sans text-[10px] text-white/40">vs</p>
                <p className={`font-sans text-xs font-semibold leading-tight ${!p.isBocaHome ? 'text-boca-gold' : 'text-white'}`}>
                  {p.awayTeam}
                </p>
              </div>

              {/* Fecha + hora */}
              <div className="flex flex-col gap-0.5">
                <p className="font-serif text-sm font-semibold text-white">
                  {formatDate(p.date)}
                </p>
                <p className="font-sans text-xs text-white/50 tabular-nums">
                  {formatTime(p.date)} hs
                </p>
              </div>

              {p.venue && (
                <p className="font-sans text-[10px] text-white/30 leading-tight line-clamp-1">
                  {p.venue}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <p className="font-sans text-xs text-white/25">
        Datos provistos por SofaScore · Caché de 2 horas en localStorage · Boca Juniors ID 3202
      </p>
    </div>
  );
}
