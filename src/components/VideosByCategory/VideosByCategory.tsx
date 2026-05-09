import { Youtube } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tab } from '../ui/Tab';
import { VideoGrid } from '../VideoGrid';
import { useVideosByCategory } from '../../hooks/useVideosByCategory';
import { CATEGORY_TABS } from '../../data/videoCreators';
import type { CreatorCategory } from '../../data/videoCreators';

export function VideosByCategory() {
  const {
    activeTab,
    setActiveTab,
    estado,
    retry,
    featuredVideos,
    videosForCategory,
  } = useVideosByCategory();

  const isDestacados = activeTab === 'destacados';

  return (
    <section aria-label="Videos Bosteros" className="w-full">
      {/* Header: icono + título + tabs */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Youtube size={32} className="text-boca-gold shrink-0" />
          <h2 className="font-serif font-bold text-[22px] sm:text-[32px] leading-tight text-boca-gold tracking-tight">
            Videos bosteros
          </h2>
        </div>

        <Tab
          options={CATEGORY_TABS}
          value={activeTab}
          onChange={setActiveTab}
          className="self-start"
        />
      </div>

      {/* Separador dorado */}
      <div className="w-full h-px bg-boca-gold/30 mb-4" />

      {/* Estado loading: skeletons */}
      {estado === 'loading' && <VideoGrid videos={[]} loading />}

      {/* Estado error */}
      {estado === 'error' && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="font-sans text-sm text-text-secondary">No se pudieron cargar los videos</p>
          <Button
            onClick={retry}
            variant="text"
            className="text-sm text-boca-gold rounded px-4 py-2 hover:bg-boca-gold/10"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Estado ok */}
      {estado === 'ok' && (
        <>
          {isDestacados ? (
            <VideoGrid
              videos={featuredVideos}
              emptyMessage="No hay videos destacados disponibles por ahora."
            />
          ) : (
            <VideoGrid
              videos={videosForCategory(activeTab as CreatorCategory)}
              emptyMessage="No hay videos disponibles en esta categoría por ahora."
            />
          )}
        </>
      )}
    </section>
  );
}
