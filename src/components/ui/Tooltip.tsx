import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ children, content, className = '', position = 'top' }: TooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={`relative group/tooltip inline-block ${className}`}>
      {children}
      <div
        className={`pointer-events-none absolute z-50 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 ${positionClasses[position]}`}
      >
        <div className="bg-boca-gold border border-boca-gold px-2 py-1 rounded-sm shadow-xl whitespace-nowrap">
          <span className="type-caption font-sans text-sm text-boca-blue font-semibold tracking-tight">
            {content}
          </span>
        </div>
      </div>
    </div>
  );
};
