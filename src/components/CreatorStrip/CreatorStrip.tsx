import type { Creator } from '../../data/videoCreators';

interface CreatorStripProps {
  creators: Creator[];
}

export function CreatorStrip({ creators }: CreatorStripProps) {
  if (creators.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="font-sans text-xs text-text-secondary mb-2 uppercase tracking-wider">
        Creadores en esta categoría
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="flex items-center gap-2 shrink-0 rounded-sm bg-boca-blue-light border border-boca-border px-2 py-1.5"
          >
            <div className="w-7 h-7 rounded-full bg-boca-gold/20 border border-boca-gold/30 flex items-center justify-center shrink-0">
              <span className="font-sans text-xs font-semibold text-boca-gold">
                {creator.name.charAt(0)}
              </span>
            </div>
            <span className="font-sans text-sm text-white truncate max-w-[140px]">
              {creator.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
