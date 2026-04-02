import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutList } from 'lucide-react';
import { TablaPosiciones } from '../TablaPosiciones';

const STORAGE_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = () =>
    setCollapsed(prev => {
      localStorage.setItem(STORAGE_KEY, String(!prev));
      return !prev;
    });

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      {/* ── DESKTOP: panel fixed ── */}
      <aside
        className={`
          hidden lg:flex flex-col fixed top-0 right-0 h-screen z-30
          bg-boca-blue border-l border-boca-border transition-all duration-300
          ${collapsed ? 'w-10' : 'w-80 xl:w-96'}
        `}
      >
        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
          className="absolute -left-3 top-20 z-10 w-6 h-6 rounded-full
            bg-boca-blue-light border border-boca-border
            flex items-center justify-center
            text-text-nav hover:text-boca-gold transition-colors"
        >
          {collapsed ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        <div className={`flex-1 overflow-y-auto p-4 ${collapsed ? 'hidden' : 'block'}`}>
          <TablaPosiciones />
        </div>
      </aside>

      {/* ── MOBILE: FAB + drawer ── */}
      <div className="lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ver tabla de posiciones"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full
            bg-boca-gold text-on-gold shadow-lg
            flex items-center justify-center"
        >
          <LayoutList size={20} />
        </button>

        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <div
          className={`
            fixed bottom-0 left-0 right-0 z-50
            bg-boca-blue border-t border-boca-border rounded-t-2xl
            max-h-[80vh] overflow-y-auto p-4
            transition-transform duration-300
            ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          <TablaPosiciones />
        </div>
      </div>
    </>
  );
}
