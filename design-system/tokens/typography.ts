/**
 * TIPOGRAFÍA - LA 12 DIGITAL
 * Sistema tipográfico: 80% Crimson Pro (tradición) + 20% Inter (modernidad)
 */

export const typography = {
  // Font Families
  fonts: {
    serif: '"Crimson Pro", Georgia, serif',      // 80% del contenido
    sans: '"Geist", -apple-system, sans-serif',  // 20% del contenido (UI elements)
  },

  // Font Sizes
  fontSize: {
    xs: '12px',      // Captions, metadatos
    sm: '14px',      // Texto secundario
    base: '16px',    // Texto base
    md: '18px',      // Texto destacado
    lg: '20px',      // Títulos pequeños (secciones)
    xl: '24px',      // Títulos medianos
    '2xl': '32px',   // Títulos grandes
    '3xl': '40px',   // Títulos hero
    '4xl': '48px',   // Display
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
    tight: 1.2,      // Títulos
    normal: 1.5,     // Texto base
    relaxed: 1.75,   // Texto largo
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
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
  // Títulos de sección (Crimson Pro Bold)
  sectionTitle: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    color: '#FFD700', // Dorado
  },

  // Títulos de card (Crimson Pro SemiBold)
  cardTitle: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },

  // Texto base (Crimson Pro Regular)
  body: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },

  // Caption (Crimson Pro Regular)
  caption: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
  },

  // Botón (Inter Medium)
  button: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Números/Stats (Inter SemiBold)
  stat: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
};

/**
 * IMPORTS NECESARIOS EN HTML:
 * 
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 * <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&family=Geist:wght@100..900&display=swap" rel="stylesheet">
 */
