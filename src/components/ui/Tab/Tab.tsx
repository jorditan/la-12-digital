import { Button } from '../Button';

export interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface TabProps<T extends string> {
  options: readonly TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
}

export function Tab<T extends string>({
  options,
  value,
  onChange,
  className = '',
  fullWidth = false,
}: TabProps<T>) {
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
              'rounded-[2px] font-medium truncate',
              fullWidth ? 'flex-1' : '',
              isActive
                ? 'bg-boca-gold/20 text-boca-gold ring-1 ring-inset ring-boca-gold/35'
                : 'text-text-secondary hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
