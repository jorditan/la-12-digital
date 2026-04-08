import { useRef, useState, useCallback, useEffect } from 'react';

interface UseHorizontalScrollReturn {
  ref: React.RefObject<HTMLDivElement>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  stopDrag: () => void;
  checkScroll: () => void;
}

export function useHorizontalScroll(): UseHorizontalScrollReturn {
  const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const dragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const tolerance = 4;
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    // No interceptar clicks en elementos interactivos (links, botones)
    if ((e.target as Element).closest('a, button')) return;
    dragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !ref.current) return;
    ref.current.scrollLeft = scrollLeft.current - (e.clientX - startX.current);
  }, []);

  const stopDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  return { ref, canScrollLeft, canScrollRight, onPointerDown, onPointerMove, stopDrag, checkScroll };
}
