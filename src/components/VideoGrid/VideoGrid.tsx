import type { VideoYoutube } from '../../services/apifootball';
import { CardVideo } from '../CardVideo';
import { SkeletonBox, SkeletonText } from '../ui/Skeleton';

interface VideoGridProps {
  videos: VideoYoutube[];
  loading?: boolean;
  emptyMessage?: string;
}

export function VideoGrid({ videos, loading, emptyMessage }: VideoGridProps) {
  if (loading) {
    return <SkeletonGrid />;
  }

  if (videos.length === 0) {
    return (
      <p className="font-sans text-sm text-text-secondary py-10 text-center">
        {emptyMessage ?? 'No hay videos disponibles en esta categoría por ahora.'}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: scroll vertical con snap */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between px-1 mb-3">
          <p className="font-sans text-xs text-text-secondary">Deslizá para ver más</p>
          <p className="font-sans text-xs text-text-secondary">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          className="max-h-[32rem] space-y-3 overflow-y-auto overscroll-contain pr-1 snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {videos.map((video) => (
            <div key={video.id} className="snap-start">
              <CardVideo video={video} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-3">
        {videos.map((video) => (
          <CardVideo key={video.id} video={video} compact />
        ))}
      </div>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="rounded-sm overflow-hidden">
          <SkeletonBox className="aspect-video bg-white/10" />
          <div className="p-3 space-y-2">
            <SkeletonText width="w-full" height="h-3" />
            <SkeletonText width="w-2/3" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
