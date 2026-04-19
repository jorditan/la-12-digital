/**
 * Canales de YouTube relacionados con Boca Juniors.
 * channelId se usa para la YouTube Data API v3.
 * En modo mock, los channelId no se utilizan.
 */

export interface CanalYoutube {
  id: string; // slug único
  label: string; // nombre en el selector
  handle: string; // '@handle' para construir la URL del canal
  channelId: string; // Channel ID para YouTube Data API v3
}

export const CANALES_YOUTUBE: CanalYoutube[] = [
  {
    id: "boca-oficial",
    label: "El Canal de Boca",
    handle: "@ElCanaldeBoca",
    channelId: "UCxwHmLY33JYIbyfew-kW7dQ",
  },
  {
    id: "toto-bordieri",
    label: "Toto Bordieri",
    handle: "@totobordierioficial",
    channelId: "",
  },
  {
    id: "lucho-cofano",
    label: "Lucho Cofano",
    handle: "@LuchoCofano",
    channelId: "",
  },
  {
    id: "yudcovsky",
    label: "Diego Yudcovsky",
    handle: "@DiegoYudcovsky",
    channelId: "",
  },
  {
    id: "planeta-boca",
    label: "Planeta Boca Juniors",
    handle: "@planetabocajuniors",
    channelId: "",
  },
  {
    id: "cadena-xeneize",
    label: "Cadena Xeneize",
    handle: "@CadenaXeneize",
    channelId: "",
  },
];

export const CANAL_DEFAULT = CANALES_YOUTUBE[0];
