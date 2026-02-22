/**
 * COLORES - LA 12 DIGITAL
 * Sistema de colores oficial del Club Atlético Boca Juniors
 * Basado en el design system documentado
 */

export const colors = {
  // Colores Primarios (Identidad Boca)
  primary: {
    blue: {
      DEFAULT: '#001529',    // Azul Boca principal
      dark: '#000B14',       // Azul más oscuro
      light: '#002140',      // Azul más claro (backgrounds)
    },
    gold: {
      DEFAULT: '#FFD700',    // Oro Boca
      light: '#FFC700',      // Oro hover
      dark: '#E5C100',       // Oro pressed
    },
  },

  // Colores de Estado (Resultados)
  status: {
    win: '#1A4D2E',         // Verde oscuro (victoria)
    loss: '#7A1F1F',        // Rojo oscuro (derrota)
    draw: '#4A5568',        // Gris neutral (empate)
    // Variantes sutiles para filas de tabla (baja saturación sobre fondo oscuro)
    winSubtle:  '#0E2B1A',  // Verde muy oscuro y suave (victoria en tabla)
    lossSubtle: '#2B1212',  // Rojo muy oscuro y suave (derrota en tabla)
    drawSubtle: '#1E2636',  // Gris azulado oscuro (empate en tabla)
  },

  // Backgrounds
  background: {
    primary: '#001529',      // Fondo principal
    secondary: '#002140',    // Fondo cards
    tertiary: '#003d5c',     // Fondo hover/elevado
    overlay: 'rgba(0, 21, 41, 0.95)',  // Overlay modal
  },

  // Textos
  text: {
    primary: '#FFFFFF',      // Texto principal
    secondary: '#8BA3C7',    // Texto secundario (WCAG AA)
    tertiary: '#6B8CAE',     // Texto terciario
    gold: '#FFD700',         // Texto dorado (títulos)
  },

  // Bordes
  border: {
    default: 'rgba(255, 215, 0, 0.15)',     // Border sutil
    hover: 'rgba(255, 215, 0, 0.35)',       // Border hover
    focus: 'rgba(255, 215, 0, 0.5)',        // Border focus
    highlight: 'rgba(255, 215, 0, 0.25)',   // Border destacado (Boca en tabla)
  },

  // Colores Históricos (Easter Eggs)
  historical: {
    'boca-1905': '#190500',  // Año fundación (en RGB components)
    'boca-1977': '#197700',  // Primera Libertadores
    'boca-2000': '#200000',  // Intercontinental vs Real Madrid
    'boca-2007': '#200700',  // Última Libertadores
  },

  // Banner amarillo
  banner: {
    yellow: '#FFD700',
    text: '#001529',         // Texto azul oscuro sobre amarillo
  },

  // Utilities
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

/**
 * USO:
 * 
 * CSS/Tailwind:
 * - bg-[colors.background.primary]
 * - text-[colors.text.gold]
 * - border-[colors.border.hover]
 * 
 * Styled Components:
 * - color: ${colors.primary.gold.DEFAULT};
 * - background: ${colors.background.secondary};
 */
