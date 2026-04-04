import { Button } from '../Button';

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  options: readonly SegmentedTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  className = '',
  fullWidth = false,
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={[
        'flex items-center gap-0.5 bg-boca-blue rounded-sm p-0.5 border border-boca-gold/10',
        fullWidth ? 'w-full' : 'w-fit',
        className,
      ].join(' ')}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            variant="ghost"
            size="xs"
            className={[
              'rounded-[2px] font-medium',
              fullWidth ? 'flex-1' : '',
              isActive
                ? 'bg-boca-gold/15 text-boca-gold'
                : 'text-text-secondary hover:text-white',
            ].join(' ')}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

