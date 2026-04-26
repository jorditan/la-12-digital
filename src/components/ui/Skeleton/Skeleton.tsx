interface SkeletonBoxProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Generic pulsing rectangular placeholder.
 * Use `className` to set width, height, border-radius, etc.
 */
export function SkeletonBox({ className = "", style }: SkeletonBoxProps) {
  return (
    <div
      className={["animate-pulse bg-white/10 rounded-sm", className].join(" ")}
      style={style}
      aria-hidden="true"
    />
  );
}

interface SkeletonTextProps {
  width?: string;
  height?: string;
  className?: string;
}

/**
 * Single line of skeleton text.
 */
export function SkeletonText({
  width = "w-full",
  height = "h-3",
  className = "",
}: SkeletonTextProps) {
  return (
    <div
      className={[
        "animate-pulse bg-white/10 rounded",
        height,
        width,
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

interface SkeletonAvatarProps {
  size?: string;
  className?: string;
}

/**
 * Circular skeleton avatar placeholder.
 */
export function SkeletonAvatar({ size = "size-10", className = "" }: SkeletonAvatarProps) {
  return (
    <div
      className={[
        "animate-pulse bg-white/10 rounded-full shrink-0",
        size,
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}
