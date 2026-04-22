/**
 * TIPOGRAFÍA - LA 12 DIGITAL
 * Sistema tipográfico: 80% Crimson Pro (tradición) + 20% Inter (modernidad)
 */

export const typography = {
  // Font Families
  fonts: {
    serif: '"Crimson Pro", Georgia, serif', // 80% del contenido
    sans: '"Geist", -apple-system, sans-serif', // 20% del contenido (UI elements)
  },

  // Font Sizes
  // Mínimos de legibilidad: body ≥ 16px; secundario ≥ 15px; labels ≥ 13px
  fontSize: {
    xs: "13px", // UI labels decorativos (badges, contadores) — era 12px
    sm: "15px", // Texto secundario, botones, tablas — era 14px
    base: "16px", // Texto cuerpo — mínimo absoluto para contenido legible
    md: "19px", // Títulos de card
    lg: "20px", // Títulos pequeños / stats
    xl: "26px", // Títulos de sección
    "2xl": "32px", // Títulos grandes
    "3xl": "40px", // Títulos hero
    "4xl": "48px", // Display
  },

  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2, // Títulos
    normal: 1.5, // Texto base
    relaxed: 1.75, // Texto largo
  },

  // Letter Spacing
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
  },
};

/**
 * GUÍA DE USO:
 *
 * CRIMSON PRO (Serif - 80%):
 * - Títulos de secciones: "La bombonera en vivo", "Noticias", "El canal de Boca"
 * - Nombres de equipos en partidos
 * - Títulos de noticias
 * - Textos de contenido largo
 * - Nombres de jugadores
 * - Mensajes del banner diario
 *
 * GEIST (Sans - 20%):
 * - Inputs de formulario
 * - Botones
 * - Números y estadísticas (fechas, temperaturas)
 * - Labels de UI
 * - Navegación
 * - Datos tabulares (tabla posiciones)
 *
 * EJEMPLOS:
 *
 * Título Sección:
 * font-family: ${typography.fonts.serif}
 * font-size: ${typography.fontSize.xl}
 * font-weight: ${typography.fontWeight.bold}
 *
 * Texto Base:
 * font-family: ${typography.fonts.serif}
 * font-size: ${typography.fontSize.base}
 * font-weight: ${typography.fontWeight.regular}
 *
 * Botón:
 * font-family: ${typography.fonts.sans}
 * font-size: ${typography.fontSize.sm}
 * font-weight: ${typography.fontWeight.medium}
 */

// Presets comunes
export const textStyles = {
  // Títulos de sección (Crimson Pro Bold) — 26px, era 24px
  sectionTitle: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.xl, // 26px
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: "-0.01em",
    color: "#FFD700", // Dorado
  },

  // Títulos de card (Crimson Pro SemiBold) — 19px, era 18px
  cardTitle: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.md, // 19px
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 1.45,
  },

  // Texto base (Crimson Pro Regular) — 16px sin cambio
  body: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: 1.6, // era 1.5 (normal), mejorado para legibilidad
  },

  // Caption (Crimson Pro Regular) — 16px (era 14px, igualado al body)
  caption: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.base, // 16px — era sm/14px
    fontWeight: typography.fontWeight.regular,
    lineHeight: 1.55,
  },

  // Botón (Geist Medium) — 15px (era 14px)
  button: {
    fontFamily: typography.fonts.sans,
    fontSize: "15px", // era sm/14px
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Números/Stats (Geist SemiBold) — 20px sin cambio
  stat: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
  },
};

/**
 * IMPORTS NECESARIOS EN HTML:
 *
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Geist:wght@100..900&display=swap" rel="stylesheet">
 */
