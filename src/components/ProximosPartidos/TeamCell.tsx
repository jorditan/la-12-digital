import { ESCUDO_VACIO } from "../../data/equipos";

interface TeamCellProps {
  logo: string;
  name: string;
  align: "left" | "right";
  bold: boolean;
}

export function TeamCell({ logo, name, align, bold }: TeamCellProps) {
  return (
    <div
      className={[
        "flex items-center gap-2",
        align === "right" ? "flex-row-reverse" : "",
      ].join(" ")}
    >
      <img
        src={logo}
        alt={name}
        className="w-[18px] h-[18px] object-contain shrink-0"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = ESCUDO_VACIO;
        }}
      />
      <span
        className={[
          "text-xs leading-tight",
          align === "right" ? "text-right" : "text-left",
          bold ? "font-semibold text-white" : "text-text-secondary",
        ].join(" ")}
        style={{ maxWidth: 110 }}
      >
        {name}
      </span>
    </div>
  );
}
