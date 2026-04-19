import type { Idolo } from "../../data/idolos";

interface IdoloPlaceholderProps {
  idolo: Idolo;
  revealed: boolean;
}

export function IdoloPlaceholder({ idolo, revealed }: IdoloPlaceholderProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-boca-blue-light to-boca-blue select-none">
      {revealed ? (
        <>
          <span className="font-serif text-7xl font-bold text-boca-gold/40">
            {idolo.apellido[0]}
          </span>
          <span className="font-serif text-2xl font-bold text-white mt-2">
            {idolo.apodo}
          </span>
          <span className="text-sm text-text-secondary mt-1 font-sans text-center px-4">
            {idolo.posicion} · {idolo.periodos.join(", ")}
          </span>
        </>
      ) : (
        <>
          <span className="font-sans text-8xl text-boca-gold/10 font-bold leading-none">
            ?
          </span>
          <span className="text-xs text-boca-gold/30 mt-3 font-sans uppercase tracking-widest">
            {idolo.posicion}
          </span>
        </>
      )}
    </div>
  );
}
