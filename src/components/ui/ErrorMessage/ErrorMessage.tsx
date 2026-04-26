interface ErrorMessageProps {
  msg: string | null;
  className?: string;
}

/**
 * Inline field-level error with consistent styling across all forms.
 * Renders nothing when `msg` is null/empty.
 */
export function ErrorMessage({ msg, className = "" }: ErrorMessageProps) {
  if (!msg) return null;
  return (
    <p
      role="alert"
      className={[
        "type-caption text-status-negative mt-1.5",
        "border border-status-negative/30 rounded-sm px-3 py-1.5 bg-status-negative/5",
        className,
      ].join(" ")}
    >
      {msg}
    </p>
  );
}
