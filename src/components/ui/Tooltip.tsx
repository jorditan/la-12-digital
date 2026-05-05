import { ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GAP = 8;

export const Tooltip = ({ children, content, className = '', position = 'top' }: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = () => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    switch (position) {
      case 'top':
        top = r.top - GAP;
        left = r.left + r.width / 2;
        break;
      case 'bottom':
        top = r.bottom + GAP;
        left = r.left + r.width / 2;
        break;
      case 'left':
        top = r.top + r.height / 2;
        left = r.left - GAP;
        break;
      case 'right':
        top = r.top + r.height / 2;
        left = r.right + GAP;
        break;
    }
    setCoords({ top, left });
    setVisible(true);
  };

  const transformMap: Record<string, string> = {
    top: 'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
    left: 'translateX(-100%) translateY(-50%)',
    right: 'translateY(-50%)',
  };

  return (
    <div
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible &&
        coords &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999]"
            style={{ top: coords.top, left: coords.left, transform: transformMap[position] }}
          >
            <div className="bg-boca-gold border border-boca-gold px-2 py-1 rounded-sm shadow-xl whitespace-nowrap">
              <span className="type-caption font-sans text-sm text-boca-blue font-semibold tracking-tight">
                {content}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
