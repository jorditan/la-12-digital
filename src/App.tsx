import { useState } from 'react';
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

const STORAGE_KEY = 'sidebar-collapsed';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

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
      <Sidebar onCollapsedChange={setSidebarCollapsed} />
      <div
        className={[
          'w-full px-3 py-3 md:px-4 sm:px-6 sm:py-8 lg:px-10 transition-[margin] duration-300',
          sidebarCollapsed ? 'lg:mr-20 xl:mr-24' : 'lg:mr-[23rem] xl:mr-[27rem]',
        ].join(' ')}
      >
        <main className="w-full">
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 sm:items-stretch">
              <div className="min-w-0 sm:flex-1 flex flex-col">
                <BomboneraWidget />
              </div>
              <div className="min-w-0 sm:flex-1 flex flex-col">
                <UltimosPartidos />
              </div>
            </div>

            <ProximosPartidos />
          </div>

          <div className="mt-6 sm:mt-10">
            <Noticias />
          </div>
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
  );
}

export default App;
