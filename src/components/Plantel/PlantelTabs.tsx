import type { PositionCategory, PositionTab } from './types';

interface PlantelTabsProps {
  tabs: PositionTab[];
  activeTab: PositionCategory;
  onSelectTab: (tab: PositionCategory) => void;
}

export function PlantelTabs({ tabs, activeTab, onSelectTab }: PlantelTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`
              px-3.5 py-1.5 rounded-sm text-xs font-sans font-semibold transition-all duration-200 shrink-0 flex items-center gap-1.5 border
              ${
                isActive
                  ? 'bg-boca-gold text-boca-blue border-boca-gold shadow-sm'
                  : 'bg-boca-blue-light/60 text-text-muted border-white/[0.08] hover:text-white hover:bg-boca-blue-light hover:border-white/20'
              }
            `}
          >
            <span>{tab.label}</span>
            <span
              className={`
                px-1.5 py-0.2 text-[10px] rounded font-bold
                ${isActive ? 'bg-boca-blue/15 text-boca-blue' : 'bg-white/10 text-white/70'}
              `}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
