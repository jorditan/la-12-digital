import { Tab, type TabOption } from '../Tab';

export type SegmentedTabOption<T extends string> = TabOption<T>;

interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
}

export function SegmentedTabs<T extends string>(props: SegmentedTabsProps<T>) {
  return <Tab {...props} />;
}
