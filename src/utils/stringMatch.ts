/**
 * Normaliza un string para comparación insensible a diacríticos y case.
 * Usado en los juegos de ídolos y equipos.
 */
export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
