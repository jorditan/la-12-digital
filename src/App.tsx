import { Header } from './components/Header';
import { BannerMensaje } from './components/BannerMensaje';
import { UltimosPartidos } from './components/UltimosPartidos';
import { TablaPosiciones } from './components/TablaPosiciones';
import { BomboneraWidget } from './components/BomboneraWidget';
import { ProximosPartidos } from './components/ProximosPartidos';
import { Separator } from './components/Separator';
import { Noticias } from './components/Noticias';
import { CanalYoutube } from './components/CanalYoutube';
import { IdolosGame } from './components/IdolosGame';

function App() {
  return (
    <div
      className="min-h-screen text-white font-serif relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(166.99deg, #001529 1%, rgb(0,35,68) 72.17%, rgb(0,62,121) 101.68%, rgb(0,73,143) 111.31%)',
      }}
    >
      {/* ── Estrella decorativa de fondo (motivo Boca) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{
            width: '680px',
            height: '680px',
            right: '-120px',
            top: '50%',
            transform: 'translateY(-30%) rotate(15deg)',
            opacity: 0.035,
            fill: '#4a9edd',
          }}
        >
          <polygon points="100,0 122,69 194,69 137,112 159,181 100,138 41,181 63,112 6,69 78,69" />
        </svg>
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{
            width: '320px',
            height: '320px',
            left: '-60px',
            bottom: '8%',
            transform: 'rotate(-10deg)',
            opacity: 0.025,
            fill: '#4a9edd',
          }}
        >
          <polygon points="100,0 122,69 194,69 137,112 159,181 100,138 41,181 63,112 6,69 78,69" />
        </svg>
      </div>
      <Header />
      <BannerMensaje />
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* items-start permite que el aside sea sticky (no se estira al alto de main) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-stretch lg:items-start">

          {/* Main: todo el contenido desplazable */}
          <main className="w-full flex-1 min-w-0 lg:pr-8">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-8">
              <div className="sm:flex-1 min-w-0">
                <BomboneraWidget />
              </div>
              <div className="sm:flex-1 min-w-0">
                <UltimosPartidos />
              </div>
            </div>
            <ProximosPartidos />
            <div className="mt-10">
              <Noticias />
            </div>
            <div className="mt-10">
              <CanalYoutube />
            </div>
          </main>

          {/* Separator tiene self-stretch internamente, se estira al alto de main */}
          <Separator />

          {/* Aside: sticky en desktop — se queda fijo mientras main scrollea */}
          <aside className="w-full lg:w-auto shrink-0 lg:pl-8 self-start lg:sticky lg:top-6">
            <TablaPosiciones />
            <IdolosGame />
          </aside>

        </div>
      </div>
    </div>
  );
}

export default App;
