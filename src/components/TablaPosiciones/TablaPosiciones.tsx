import { useEffect, useState } from 'react';
import { fetchStandings, BOCA_ID, type StandingRow } from '../../services/apifootball';
import { ESCUDO_VACIO } from '../../data/equipos';

type Estado = 'loading' | 'error' | 'ok';

export function TablaPosiciones() {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = () => {
    setEstado('loading');
    fetchStandings()
      .then((data) => {
        setRows(data);
        setEstado('ok');
      })
      .catch(() => setEstado('error'));
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <section aria-label="Tabla de posiciones">
      <div className="rounded-sm overflow-hidden ">
        {estado === 'loading' && <SkeletonTabla />}

        {estado === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
            <p className="font-sans text-sm text-text-secondary">
              No se pudo cargar la tabla
            </p>
            <button
              onClick={cargar}
              className="font-sans text-sm font-medium text-boca-gold rounded px-4 py-2 hover:bg-boca-gold/10 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {estado === 'ok' && (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="">
                  <th className="h-10 w-8 px-3 text-left align-middle font-sans text-sm font-medium uppercase tracking-wider text-text-secondary">
                    #
                  </th>
                  <th className="h-10 px-3 text-left align-middle font-sans text-sm font-medium tracking-wider text-text-secondary">
                    Equipos
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-sans text-sm font-medium uppercase tracking-wider text-boca-gold">
                    PTS
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-sans text-sm font-medium uppercase tracking-wider text-text-secondary">
                    PJ
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-sans text-sm font-medium uppercase tracking-wider text-text-secondary">
                    G
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-sans text-sm font-medium uppercase tracking-wider text-text-secondary">
                    E
                  </th>
                  <th className="h-10 px-2 text-center align-middle font-sans text-sm font-medium uppercase tracking-wider text-text-secondary">
                    P
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const esBoca = row.team.id === BOCA_ID;
                  return (
                    <tr
                      key={row.team.id}
                      className={[
                        'border-b border-boca-gold/5 transition-colors last:border-b-0',
                        'hover:bg-white/[0.03]',
                        esBoca
                          ? 'bg-boca-gold/[0.07] border-2 border-l-boca-gold hover:bg-boca-gold/[0.10]'
                          : '',
                      ].join(' ')}
                    >
                      <td className={`px-3 py-2.5 align-middle font-sans text-sm ${esBoca ? 'text-boca-gold font-semibold' : 'text-text-secondary'}`}>
                        {row.rank}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-2">
                          <img
                            src={row.team.logo}
                            alt={row.team.name}
                            width={16}
                            height={16}
                            className="shrink-0 object-contain"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO; }}
                          />
                          <span className={`font-sans text-sm truncate max-w-[110px] ${esBoca ? 'text-boca-gold font-semibold' : 'text-white'}`}>
                            {row.team.name}
                          </span>
                        </div>
                      </td>
                      <td className={`px-2 py-2.5 align-middle text-center font-sans text-sm font-semibold ${esBoca ? 'text-boca-gold' : 'text-white'}`}>
                        {row.points}
                      </td>
                      <td className="px-2 py-2.5 align-middle text-center font-sans text-sm text-text-secondary">
                        {row.all.played}
                      </td>
                      <td className="px-2 py-2.5 align-middle text-center font-sans text-sm text-text-secondary">
                        {row.all.win}
                      </td>
                      <td className="px-2 py-2.5 align-middle text-center font-sans text-sm text-text-secondary">
                        {row.all.draw}
                      </td>
                      <td className="px-2 py-2.5 align-middle text-center font-sans text-sm text-text-secondary">
                        {row.all.lose}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SkeletonTabla() {
  return (
    <div className="animate-pulse px-3 py-2 space-y-0">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-boca-gold/5 last:border-b-0">
          <div className="h-3 w-4 bg-white/10 rounded shrink-0" />
          <div className="size-4 bg-white/10 rounded shrink-0" />
          <div className="h-3 flex-1 bg-white/10 rounded" />
          <div className="h-3 w-6 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
          <div className="h-3 w-5 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
