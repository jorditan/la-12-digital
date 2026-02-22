/**
 * ESPACIADO - LA 12 DIGITAL
 * Sistema de espaciado basado en escala de 8px
 * Con valores históricos de Boca como easter eggs
 */

export const spacing = {
  // Escala base (múltiplos de 8)
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',

  // Valores históricos (Easter Eggs)
  historical: {
    'la-doce': '12px',      // La 12
    'diez': '10px',         // Número 10 de Riquelme
    'diecinueve': '19px',   // Año fundación 1905 (19+05)
  },
};

/**
 * GUÍA DE USO POR CONTEXTO:
 * 
 * PADDING EN CARDS:
 * - Small: 16px (spacing.4)
 * - Medium: 24px (spacing.6) ← Más común
 * - Large: 32px (spacing.8)
 * 
 * GAP ENTRE ELEMENTOS:
 * - Dentro de un componente: 8px (spacing.2)
 * - Entre componentes: 16px (spacing.4)
 * - Entre secciones: 24px (spacing.6)
 * - Entre bloques grandes: 48px (spacing.12)
 * 
 * PADDING VERTICAL EN TABLA:
 * - Row: 12px vertical (spacing.3) ← Espacioso y legible
 * - Header: 16px vertical (spacing.4) ← Un poco más
 * 
 * MARGINS:
 * - Entre widgets: 24px (spacing.6)
 * - Entre columnas layout: 32px (spacing.8)
 * 
 * BORDER RADIUS:
 * - Cards: 8px
 * - Botones: 6px
 * - Inputs: 6px
 * - Avatars: 50% (círculo)
 */

export const borderRadius = {
  none: '0',
  sm: '4px',
  DEFAULT: '6px',    // Botones, inputs
  md: '8px',         // Cards
  lg: '12px',        // Cards grandes
  xl: '16px',
  full: '9999px',    // Círculos, pills
};

/**
 * SHADOWS
 * Elevaciones sutiles con toque dorado en hovers
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
  lg: '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
  
  // Shadows dorados para hover
  goldSm: '0 2px 8px rgba(255, 215, 0, 0.15)',
  goldMd: '0 4px 12px rgba(255, 215, 0, 0.2)',
  goldLg: '0 8px 24px rgba(255, 215, 0, 0.25)',

  // Card hover (Figma: CardNoticia state=Hover)
  card: '0px 4px 6px -1px rgba(0,0,0,0.5), 0px 2px 4px -2px rgba(0,0,0,0.4)',
};

/**
 * Z-INDEX
 * Orden de apilamiento
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
};

/**
 * TRANSITIONS
 * Duraciones con easter eggs históricos
 */
export const transitions = {
  // Duraciones estándar
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  
  // Duraciones históricas (Easter Eggs)
  historical: {
    'fundacion': '190.5ms',  // 1905 (año fundación)
    'la-doce': '120ms',      // La 12
    'bicentenario': '2077ms', // 2077 (bicentenario futuro)
  },
  
  // Easing
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

/**
 * BREAKPOINTS (Responsive)
 */
export const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop small
  xl: '1280px',   // Desktop
  '2xl': '1440px', // Desktop large (diseño base)
};

/**
 * EJEMPLO DE USO EN TAILWIND CONFIG:
 * 
 * module.exports = {
 *   theme: {
 *     extend: {
 *       spacing: spacing,
 *       borderRadius: borderRadius,
 *       boxShadow: shadows,
 *       transitionDuration: transitions,
 *       screens: breakpoints,
 *     }
 *   }
 * }
 */
