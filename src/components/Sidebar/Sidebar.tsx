import { useEffect, useState } from 'react';
import { TablaPosiciones } from '../TablaPosiciones';
import { MobileSidebarButton } from './MobileSidebarButton';

export function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="lg:hidden">
      <MobileSidebarButton onClick={() => setDrawerOpen(true)} />

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-boca-blue-mid border-t border-boca-border rounded-t-2xl max-h-[80vh] overflow-y-auto p-4 transition-transform duration-300 ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
        <TablaPosiciones />
      </div>
    </div>
  );
}
