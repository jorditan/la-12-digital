import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../Button";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  minLength?: number;
  /** Optional helper rendered below the input (e.g. "N chars more") */
  hint?: React.ReactNode;
  className?: string;
  /** Shares show/hide state with another PasswordInput (controlled from outside) */
  show?: boolean;
  onToggleShow?: () => void;
  id?: string;
  name?: string;
  autoComplete?: string;
  required?: boolean;
}

/**
 * Reusable password input with show/hide toggle.
 * When `show`/`onToggleShow` are omitted the component manages its own state.
 */
export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  error,
  minLength,
  hint,
  className = "",
  show: showProp,
  onToggleShow,
  ...rest
}: PasswordInputProps) {
  const [ownShow, setOwnShow] = useState(false);
  const controlled = showProp !== undefined && onToggleShow !== undefined;
  const showPassword = controlled ? showProp! : ownShow;
  const toggleShow = controlled ? onToggleShow! : () => setOwnShow((v) => !v);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        className={[
          "w-full bg-boca-blue border rounded-sm px-3 py-2 pr-10 type-body text-white",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-boca-gold/50 transition-colors",
          error
            ? "border-status-negative focus-visible:border-status-negative"
            : "border-boca-border focus-visible:border-boca-gold",
          className,
        ].join(" ")}
        {...rest}
      />
      <Button
        type="button"
        onClick={toggleShow}
        variant="ghost"
        size="icon"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-nav"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </Button>
      {hint && <div className="mt-1">{hint}</div>}
    </div>
  );
}
