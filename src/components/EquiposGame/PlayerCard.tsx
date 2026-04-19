export type CardState = "hidden" | "guessed" | "missed";

interface PlayerCardProps {
  name: string;
  cardState: CardState;
  isSuplente?: boolean;
}

const CARD_STYLES: Record<CardState, string> = {
  hidden: "bg-boca-blue-light border border-boca-gold/10 text-boca-gold/20",
  guessed: "bg-status-win-subtle border border-status-win text-green-400",
  missed: "bg-status-loss-subtle border border-status-loss text-red-400",
};

export function PlayerCard({ name, cardState, isSuplente }: PlayerCardProps) {
  const revealed = cardState !== "hidden";
  return (
    <div
      className={[
        "relative rounded-sm px-2 py-2 flex items-center justify-center min-h-[44px]",
        "transition-all duration-500",
        CARD_STYLES[cardState],
      ].join(" ")}
    >
      {revealed ? (
        <span className="font-sans text-xs font-semibold text-center leading-tight">
          {name}
        </span>
      ) : (
        <span className="font-bold text-base select-none">?</span>
      )}
      {revealed && isSuplente && (
        <span className="absolute top-0.5 right-1 font-sans text-[8px] font-bold opacity-50 leading-none">
          SUP
        </span>
      )}
    </div>
  );
}
