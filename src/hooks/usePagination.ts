import { useState } from "react";

interface UsePaginationReturn<T> {
  currentItems: T[];
  page: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  goTo: (page: number) => void;
  goNext: () => void;
  goPrev: () => void;
}

/**
 * Generic client-side pagination hook.
 *
 * @param items - The full array of items to paginate.
 * @param itemsPerPage - Number of items per page.
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number,
): UsePaginationReturn<T> {
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(items.length / itemsPerPage);
  const safePage = Math.min(page, Math.max(0, pageCount - 1));

  const currentItems = items.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage,
  );

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, pageCount - 1)));
  const goNext = () => goTo(safePage + 1);
  const goPrev = () => goTo(safePage - 1);

  return {
    currentItems,
    page: safePage,
    pageCount,
    canPrev: safePage > 0,
    canNext: safePage < pageCount - 1,
    goTo,
    goNext,
    goPrev,
  };
}
