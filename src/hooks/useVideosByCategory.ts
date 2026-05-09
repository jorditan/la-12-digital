import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchVideos, type VideoYoutube } from '../services/apifootball';
import {
  VIDEO_CREATORS,
  type Creator,
  type CreatorCategory,
  type CategoryTabId,
} from '../data/videoCreators';

type Estado = 'loading' | 'error' | 'ok';

interface UseVideosByCategoryResult {
  activeTab: CategoryTabId;
  setActiveTab: (tab: CategoryTabId) => void;
  videosByCreator: Record<string, VideoYoutube[]>;
  estado: Estado;
  retry: () => void;
  featuredVideos: VideoYoutube[];
  videosForCategory: (cat: CreatorCategory) => VideoYoutube[];
  creatorsForCategory: (cat: CreatorCategory) => Creator[];
}

export function useVideosByCategory(): UseVideosByCategoryResult {
  const [activeTab, setActiveTab] = useState<CategoryTabId>('destacados');
  const [videosByCreator, setVideosByCreator] = useState<Record<string, VideoYoutube[]>>({});
  const [estado, setEstado] = useState<Estado>('loading');

  const cargar = useCallback(() => {
    setEstado('loading');

    const promises = VIDEO_CREATORS.map((c) =>
      fetchVideos(c.handle)
        .then((videos) => ({ creatorId: c.id, videos }))
        .catch(() => ({ creatorId: c.id, videos: [] as VideoYoutube[] })),
    );

    Promise.all(promises)
      .then((results) => {
        const map: Record<string, VideoYoutube[]> = {};
        for (const r of results) {
          map[r.creatorId] = r.videos;
        }
        setVideosByCreator(map);
        setEstado('ok');
      })
      .catch(() => {
        setEstado('error');
      });
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const videosForCategory = useCallback(
    (cat: CreatorCategory): VideoYoutube[] => {
      const creators = VIDEO_CREATORS.filter((c) => c.categories.includes(cat));

      const allVideos = creators.flatMap(
        (c) => videosByCreator[c.id] ?? [],
      );

      return allVideos.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
    },
    [videosByCreator],
  );

  const creatorsForCategory = useCallback(
    (cat: CreatorCategory): Creator[] => {
      return VIDEO_CREATORS.filter((c) => c.categories.includes(cat));
    },
    [],
  );

  const featuredVideos = useMemo(() => {
    const selected: VideoYoutube[] = [];

    const sortedByCreator = VIDEO_CREATORS.map((creator) => ({
      creator,
      videos: (videosByCreator[creator.id] ?? [])
        .slice()
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    }));

    for (const { videos } of sortedByCreator) {
      if (videos.length > 0) {
        selected.push(videos[0]);
      }
    }

    if (selected.length < 9) {
      const remaining: VideoYoutube[] = [];
      for (const { videos } of sortedByCreator) {
        if (videos.length > 1) {
          remaining.push(videos[1]);
        }
      }
      remaining.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      while (selected.length < 9 && remaining.length > 0) {
        selected.push(remaining.shift()!);
      }
    }

    return selected;
  }, [videosByCreator]);

  return {
    activeTab,
    setActiveTab,
    videosByCreator,
    estado,
    retry: cargar,
    featuredVideos,
    videosForCategory,
    creatorsForCategory,
  };
}
