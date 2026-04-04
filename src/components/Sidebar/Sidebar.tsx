import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { TablaPosiciones } from '../TablaPosiciones';
import { Button } from '../Button';
import { DesktopSidebarBubble } from './DesktopSidebarBubble';
import { MobileSidebarButton } from './MobileSidebarButton';

const STORAGE_KEY = 'sidebar-collapsed';

type SidebarProps = {
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggle = () =>
    setCollapsed((prev) => {
      const nextValue = !prev;
      localStorage.setItem(STORAGE_KEY, String(nextValue));
      onCollapsedChange?.(nextValue);
      return nextValue;
    });

  useEffect(() => {
    onCollapsedChange?.(collapsed);
  }, [collapsed, onCollapsedChange]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <>
      <aside
        className={`hidden lg:block fixed right-4 xl:right-6 top-[7.5rem] bottom-6 z-30 transition-all duration-300 ${
          collapsed ? 'w-auto bottom-auto' : 'w-[21rem] xl:w-[24rem]'
        }`}
      >
        {collapsed ? (
          <DesktopSidebarBubble onClick={toggle} />
        ) : (
          <div className="h-full overflow-y-auto rounded-sm shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            <TablaPosiciones
              headerAction={(
                <Button
                  onClick={toggle}
                  variant="ghost"
                  size="icon"
                  aria-label="Achicar sidebar"
                  className="size-7 border border-boca-gold/15 text-text-nav hover:text-boca-gold hover:bg-white/5"
                >
                  <ChevronRight size={14} />
                </Button>
              )}
            />
          </div>
        )}
      </aside>

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
    </>
  );
}
