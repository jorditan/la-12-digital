export type TrofeoType =
  | "Libertadores"
  | "Intercontinental"
  | "Sudamericana"
  | "Recopa";

interface TrofeoIconProps {
  type?: TrofeoType;
  className?: string;
}

const TROFEO_CONFIG: Record<
  TrofeoType,
  { src: string; count: number; label: string }
> = {
  Libertadores: {
    src: "/copa_libertadores.png",
    count: 6,
    label: "6 Copas Libertadores",
  },
  Intercontinental: {
    src: "/copa_intercontinental.png",
    count: 3,
    label: "3 Copas Intercontinentales",
  },
  Sudamericana: {
    src: "/copa_sudamericana.png",
    count: 2,
    label: "2 Copas Sudamericanas",
  },
  Recopa: {
    src: "/recopa_sudamericana.png",
    count: 4,
    label: "4 Recopas Sudamericanas",
  },
};

export function TrofeoIcon({
  type = "Libertadores",
  className,
}: TrofeoIconProps) {
  const { src, count, label } = TROFEO_CONFIG[type];

  return (
    <div
      role="img"
      aria-label={label}
      className={`flex items-center gap-1 ${className ?? ""}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <img key={i} src={src} alt="" className="h-4 w-auto" />
      ))}
    </div>
  );
}
