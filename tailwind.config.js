/**
 * TAILWIND CONFIG - LA 12 DIGITAL
 * Configuración de Tailwind CSS con tokens del design system
 */

import { colors } from "./design-system/tokens/colors";
import { typography } from "./design-system/tokens/typography";
import {
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
} from "./design-system/tokens/spacing";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Colores personalizados
      colors: {
        "boca-blue": {
          DEFAULT: colors.primary.blue.DEFAULT,
          dark: colors.primary.blue.dark,
          light: colors.primary.blue.light,
        },
        "boca-gold": {
          DEFAULT: colors.primary.gold.DEFAULT,
          light: colors.primary.gold.light,
          dark: colors.primary.gold.dark,
        },
        "status-win": colors.status.win,
        "status-loss": colors.status.loss,
        "status-draw": colors.status.draw,
        "status-win-subtle": colors.status.winSubtle,
        "status-loss-subtle": colors.status.lossSubtle,
        "status-draw-subtle": colors.status.drawSubtle,
        "status-negative": colors.status.negative,
        "boca-blue-mid": colors.background.midCard,
        "boca-border": colors.border.subtle,
        "boca-border-card": colors.border.card,
        "text-nav": colors.text.nav,
        "text-on-gold": colors.text.onGold,
        "text-muted": colors.text.muted,
        "deco-star": colors.decorative.star,
        "pitch-green": colors.pitch.green,
        "pitch-green-dark": colors.pitch.greenDark,
        "bg-overlay-dark": colors.background.overlay,
        "youtube-red": colors.youtube.red,
        ...colors,
      },

      // Tipografía
      fontFamily: {
        serif: typography.fonts.serif.split(","),
        sans: typography.fonts.sans.split(","),
      },
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,

      // Espaciado
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      zIndex: zIndex,

      // Transiciones
      transitionDuration: {
        ...transitions,
        DEFAULT: transitions.normal,
      },
      transitionTimingFunction: transitions.easing,

      // Breakpoints
      screens: breakpoints,

      // Gradientes personalizados
      backgroundImage: {
        "banner-gradient":
          "linear-gradient(90deg, rgba(255,215,0,0.12) 0%, rgba(255,215,0,0.06) 50%, rgba(255,215,0,0.12) 100%)",
        "bombonera-overlay":
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,21,41,0.8) 100%)",
        "overlay-game":
          "linear-gradient(to top, #031428 40%, transparent 100%)",
        "pitch-field": "linear-gradient(180deg, #0d5c2a 0%, #0a4a22 100%)",
        "app-bg":
          "linear-gradient(166.99deg, #001529 1%, rgb(0,35,68) 72.17%, rgb(0,62,121) 101.68%, rgb(0,73,143) 111.31%)",
      },
    },
  },
  plugins: [],
};

/**
 * CLASES ÚTILES GENERADAS:
 *
 * Colores:
 * - bg-boca-blue
 * - text-boca-gold
 * - border-boca-gold
 *
 * Tipografía:
 * - font-serif (Crimson Pro)
 * - font-sans (Geist)
 * - text-base, text-lg, text-xl, etc.
 *
 * Espaciado:
 * - p-6 (24px padding)
 * - gap-4 (16px gap)
 * - m-12 (48px margin)
 *
 * Sombras:
 * - shadow-goldMd
 * - shadow-goldLg
 *
 * Responsive:
 * - sm:, md:, lg:, xl:, 2xl:
 *
 * EJEMPLO DE USO:
 *
 * <div className="bg-boca-blue text-boca-gold font-serif p-6 rounded-md shadow-goldMd hover:shadow-goldLg transition-all">
 *   Dale Booo!
 * </div>
 */
