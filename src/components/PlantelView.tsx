import { useEffect, useState } from 'react';
import { getTeamSquad } from '../services/footballApiService';
import type { Squad, Player } from '../types/football';
import { Shield, User, Activity } from 'lucide-react';

export function PlantelView() {
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('todos');

  useEffect(() => {
    async function loadSquad() {
      try {
        setLoading(true);
        const data = await getTeamSquad();
        setSquad(data);
      } catch (err: any) {
        console.error('Error loading squad:', err);
        setError('No se pudo cargar el plantel profesional.');
      } finally {
        setLoading(false);
      }
    }
    loadSquad();
  }, []);

  const filterPlayers = (players: Player[]) => {
    if (activeTab === 'todos') return players;
    return players.filter((p) => {
      const pos = (p.birth?.place || '').toLowerCase(); // position group
      return pos.includes(activeTab);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-boca-blue to-boca-blue-dark border border-boca-gold/30 p-6 sm:p-10 mb-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-boca-gold/10 border-2 border-boca-gold flex items-center justify-center shrink-0 shadow-lg">
              <Shield className="w-10 h-10 text-boca-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                Plantel Profesional
              </h1>
              <p className="text-boca-gold font-sans text-sm sm:text-base mt-1">
                Club Atlético Boca Juniors — Primera División
              </p>
            </div>
          </div>
          {squad && (
            <div className="flex items-center gap-6 bg-boca-blue-dark/60 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
              <div className="text-center">
                <span className="block text-2xl font-bold text-boca-gold">{squad.players.length}</span>
                <span className="text-xs text-text-muted uppercase tracking-wider">Integrantes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'todos', label: 'Todos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-boca-gold text-boca-blue shadow-md'
                : 'bg-card-bg text-text-muted hover:text-white hover:bg-card-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card-bg rounded-xl p-6 border border-boca-border animate-pulse h-48">
              <div className="w-12 h-12 rounded-full bg-white/10 mb-4" />
              <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-card-bg rounded-xl p-8 border border-red-500/30 text-center max-w-md mx-auto my-12">
          <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-serif text-lg mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-boca-gold text-boca-blue font-semibold rounded-lg hover:bg-boca-gold-hover transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : squad && squad.players.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filterPlayers(squad.players).map((player) => (
            <div
              key={player.id}
              className="group bg-card-bg hover:bg-card-hover rounded-xl p-6 border border-boca-border hover:border-boca-gold/50 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-boca-blue/40 border border-boca-gold/30 flex items-center justify-center text-boca-gold font-bold">
                    <User className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-boca-gold transition-colors font-serif">
                  {player.name}
                </h3>
                {player.firstname && player.lastname && (
                  <p className="text-xs text-text-muted mt-0.5 font-sans">
                    {player.firstname} {player.lastname}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
                {player.age > 0 && <span>Edad: {player.age} años</span>}
                {player.nationality && <span>{player.nationality}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card-bg rounded-xl p-12 text-center border border-boca-border">
          <p className="text-text-muted font-serif text-lg">No hay datos del plantel disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}
