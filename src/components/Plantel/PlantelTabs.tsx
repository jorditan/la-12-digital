import { SelectDropdown, type SelectOption } from '../ui/SelectDropdown';
import type { PositionCategory, PositionTab } from './types';

interface PlantelTabsProps {
  tabs: PositionTab[];
  activeTab: PositionCategory;
  onSelectTab: (tab: PositionCategory) => void;
}

export function PlantelTabs({ tabs, activeTab, onSelectTab }: PlantelTabsProps) {
  const options: SelectOption[] = tabs.map((t) => ({
    value: t.id,
    label: `${t.label} (${t.count})`,
  }));

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-sans text-text-muted font-medium shrink-0">
        Filtrar por posición:
      </span>
      <SelectDropdown
        options={options}
        value={activeTab}
        onChange={(val) => onSelectTab(val as PositionCategory)}
        className="w-60"
      />
    </div>
  );
}
