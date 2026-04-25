import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block type-caption text-text-muted lowercase tracking-wider pl-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={[
            "w-full bg-black/20 border border-boca-border rounded-sm px-3 py-2.5",
            "text-white placeholder:text-text-muted/40 outline-none",
            "focus:border-boca-gold/50 transition-colors",
            error ? "border-[#fca5a5]/50" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {error && (
          <p className="type-caption text-[#fca5a5] pl-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
