// src/styles/design-tokens.ts

export const tokens = {
  // Contenedores
  card: 'rounded-sm border border-boca-border bg-boca-blue-mid',
  cardHover: 'rounded-sm border border-boca-border bg-boca-blue-mid hover:border-boca-gold/40 transition-colors',

  // Tipografía
  textMuted: 'text-text-muted',
  textAccent: 'text-boca-gold',
  textBase: 'text-white',

  // Botones (h-10 garantiza altura uniforme)
  btnSecondary: 'h-10 flex items-center px-4 rounded-sm border border-boca-border text-text-muted hover:bg-boca-border/20 transition-colors',
  btnPrimary: 'h-10 flex items-center px-4 rounded-sm bg-boca-gold text-boca-blue font-bold hover:bg-boca-gold/90 transition-colors',

  // Divisores
  divider: 'border-boca-border',
} as const;
