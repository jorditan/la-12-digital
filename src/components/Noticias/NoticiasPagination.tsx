import { Star } from 'lucide-react';
import { Button } from '../ui/Button';

interface NoticiasPaginationProps {
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function NoticiasPagination({
  pageCount,
  currentPage,
  onPageChange,
}: NoticiasPaginationProps) {
  const maxVisible = 7;
  const pages: (number | string)[] = [];

  if (pageCount <= maxVisible) {
    for (let i = 0; i < pageCount; i++) pages.push(i);
  } else {
    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible;

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(0, end - maxVisible);
    }

    if (start > 0) {
      pages.push(0);
      if (start > 1) pages.push('prev-dots');
    }

    for (let i = start; i < end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (end < pageCount) {
      if (end < pageCount - 1) pages.push('next-dots');
      pages.push(pageCount - 1);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4">
      {pages.map((p, i) => {
        if (typeof p === 'string') {
          return (
            <span key={`dots-${i}`} className="text-white/20 px-1">
              ...
            </span>
          );
        }

        const isActive = p === currentPage;

        return (
          <Button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-label={`Ir a página ${p + 1}`}
            variant="ghost"
            size="icon"
            className="w-8 h-8 relative flex items-center justify-center group/star p-0"
          >
            <Star
              size={16}
              fill={isActive ? 'currentColor' : 'none'}
              stroke={isActive ? 'currentColor' : 'white'}
              strokeWidth={isActive ? 0 : 1.5}
              className={`transition-all duration-300 text-boca-gold ${
                isActive ? 'opacity-100 scale-110' : 'opacity-30 group-hover/star:opacity-100'
              }`}
            />
          </Button>
        );
      })}
    </div>
  );
}
