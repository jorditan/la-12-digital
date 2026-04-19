import type { Dificultad } from "../../data/idolos";

const LABELS: Record<Dificultad, string> = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil",
  muy_dificil: "Muy difícil",
};

const CLASSES: Record<Dificultad, string> = {
  facil: "text-white/45 border-white/10",
  media: "text-white/60 border-white/15",
  dificil: "text-white/75 border-white/20",
  muy_dificil: "text-boca-gold/70 border-boca-gold/25 bg-boca-gold/5",
};

interface DificultadBadgeProps {
  dificultad: Dificultad;
}

export function DificultadBadge({ dificultad }: DificultadBadgeProps) {
  return (
    <span
      className={[
        "font-sans text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border shrink-0",
        CLASSES[dificultad],
      ].join(" ")}
    >
      {LABELS[dificultad]}
    </span>
  );
}
