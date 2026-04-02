import { Header } from './components/Header';
import { BannerMensaje } from './components/BannerMensaje';
import { UltimosPartidos } from './components/UltimosPartidos';
import { BomboneraWidget } from './components/BomboneraWidget';
import { ProximosPartidos } from './components/ProximosPartidos';
import { Noticias } from './components/Noticias';
import { CanalYoutube } from './components/CanalYoutube';
import { IdolosGame } from './components/IdolosGame';
import { EquiposGame } from './components/EquiposGame';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <div
      className="min-h-screen text-white font-serif relative overflow-x-hidden bg-app-bg"
    >
      {/* ── Estrella decorativa de fondo (motivo Boca) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute opacity-[0.035] fill-deco-star"
          style={{
            width: '680px',
            height: '680px',
            right: '-120px',
            top: '50%',
            transform: 'translateY(-30%) rotate(15deg)',
          }}
        >
          <polygon points="100,0 122,69 194,69 137,112 159,181 100,138 41,181 63,112 6,69 78,69" />
        </svg>
        <svg
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute opacity-[0.025] fill-deco-star"
          style={{
            width: '320px',
            height: '320px',
            left: '-60px',
            bottom: '8%',
            transform: 'rotate(-10deg)',
          }}
        >
          <polygon points="100,0 122,69 194,69 137,112 159,181 100,138 41,181 63,112 6,69 78,69" />
        </svg>
      </div>
      <Header />
      <BannerMensaje />
      <Sidebar />
      <div className="w-full px-3 md:px-4 sm:px-6 py-3 sm:py-8 lg:mr-80 xl:mr-96">
        <main className="w-full">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-5 sm:mb-8">
            <div className="sm:flex-1 min-w-0">
              <BomboneraWidget />
            </div>
            <div className="sm:flex-1 min-w-0">
              <UltimosPartidos />
            </div>
          </div>
          <ProximosPartidos />
          <div className="mt-6 sm:mt-10">
            <Noticias />
          </div>
          {/* ── Minijuegos ── */}
          <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <IdolosGame />
            <EquiposGame />
          </div>
          <div className="mt-6 sm:mt-10">
            <CanalYoutube />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
