import { Header } from './components/Header';
import { BannerMensaje } from './components/BannerMensaje';
import { UltimosPartidos } from './components/UltimosPartidos';
import { TablaPosiciones } from './components/TablaPosiciones';
import { BomboneraWidget } from './components/BomboneraWidget';
import { ProximosPartidos } from './components/ProximosPartidos';
import { Separator } from './components/Separator';
import { Noticias } from './components/Noticias';
import { CanalYoutube } from './components/CanalYoutube';

function App() {
  return (
    <div className="min-h-screen bg-boca-blue text-white font-serif">
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
          </aside>

        </div>
      </div>
    </div>
  );
}

export default App;
