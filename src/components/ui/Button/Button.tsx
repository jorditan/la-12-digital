import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive"
  | "text";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  /** Fondo dorado, texto azul oscuro — acción principal */
  primary: [
    "bg-boca-gold text-boca-blue font-semibold",
    "border border-boca-gold",
    "hover:bg-boca-gold-dark hover:border-boca-gold-dark",
    "active:brightness-90",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),

  /** Contorno dorado, texto dorado — acción secundaria */
  secondary: [
    "bg-transparent text-boca-gold font-semibold",
    "border border-boca-gold",
    "hover:bg-boca-gold/10",
    "active:bg-boca-gold/20",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),

  /** Sin borde, texto dorado — acción terciaria / sutil */
  ghost: [
    "bg-transparent text-boca-gold font-medium",
    "border border-transparent",
    "hover:border-boca-gold/25 hover:bg-boca-gold/5",
    "active:bg-boca-gold/10",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),

  /** Contorno blanco/neutro — acción de descarte */
  outline: [
    "bg-transparent text-white font-medium",
    "border border-white/30",
    "hover:border-white/60 hover:bg-white/5",
    "active:bg-white/10",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),

  /** Fondo rojo — acción destructiva */
  destructive: [
    "bg-status-loss text-white font-semibold",
    "border border-status-loss",
    "hover:brightness-110 hover:border-status-loss",
    "active:brightness-90",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),

  /** Acción textual, sin caja visible por defecto */
  text: [
    "bg-transparent text-text-muted font-medium",
    "border border-transparent shadow-none",
    "hover:text-boca-gold hover:bg-transparent",
    "active:bg-transparent",
    "disabled:opacity-60 disabled:cursor-not-allowed",
  ].join(" "),
};

const SIZES: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs rounded-sm",
  sm: "px-3 py-1.5 text-xs rounded-sm",
  md: "px-4 py-2 text-sm rounded-sm",
  lg: "px-6 py-3 text-base rounded-sm",
  icon: "p-1.5 rounded-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-sans cursor-pointer",
        "transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boca-gold focus-visible:ring-offset-1 focus-visible:ring-offset-boca-blue",
        "active:scale-[0.97]",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
