export function Separator() {
  return (
    <>
      {/* Mobile: separador horizontal */}
      <div className="lg:hidden h-px w-full bg-boca-gold/50" />
      {/* Desktop: separador vertical */}
      <div className="hidden lg:block w-px self-stretch bg-boca-gold/50" />
    </>
  );
}
