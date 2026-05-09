export type CreatorCategory = 'analisis' | 'tactica' | 'opinion' | 'reaccion' | 'oficial';

export interface Creator {
  id: string;
  name: string;
  handle: string;
  categories: CreatorCategory[];
  avatarUrl?: string;
}

export const VIDEO_CREATORS: Creator[] = [
  {
    id: 'davoo-xeneize',
    name: 'Davoo Xeneize',
    handle: '@davooxeneizeromand10s',
    categories: ['analisis', 'opinion'],
  },
  {
    id: 'bostero-sacado',
    name: 'Bostero Sacado',
    handle: '@BosteroSacado',
    categories: ['reaccion', 'opinion'],
  },
  {
    id: 'laboratorio-futbol',
    name: 'Laboratorio de Fútbol',
    handle: '@LaboratorioDeFutbol',
    categories: ['analisis', 'tactica'],
  },
  {
    id: 'luli-izcati',
    name: 'Luli Icazati',
    handle: '@luliicazati',
    categories: ['opinion', 'reaccion'],
  },
  {
    id: 'mundo-boca',
    name: 'Mundo Boca',
    handle: '@mundobocatv1',
    categories: ['analisis', 'oficial'],
  },
  {
    id: 'boca-oficial',
    name: 'El Canal de Boca',
    handle: '@ElCanaldeBoca',
    categories: ['oficial'],
  },
  {
    id: 'toto-bordieri',
    name: 'Toto Bordieri',
    handle: '@totobordierioficial',
    categories: ['opinion', 'analisis'],
  },
  {
    id: 'lucho-cofano',
    name: 'Lucho Cofano',
    handle: '@LuchoCofano',
    categories: ['reaccion', 'opinion'],
  },
  {
    id: 'diego-yudcovsky',
    name: 'Diego Yudcovsky',
    handle: '@DiegoYudcovsky',
    categories: ['analisis', 'opinion'],
  },
  {
    id: 'planeta-boca',
    name: 'Planeta Boca Juniors',
    handle: '@planetabocajuniors',
    categories: ['analisis', 'oficial'],
  },
  {
    id: 'cadena-xeneize',
    name: 'Cadena Xeneize',
    handle: '@CadenaXeneize',
    categories: ['opinion', 'reaccion'],
  },
];

export type CategoryTabId = 'destacados' | CreatorCategory;

export interface CategoryTabOption {
  value: CategoryTabId;
  label: string;
}

export const CATEGORY_TABS: readonly CategoryTabOption[] = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'analisis', label: 'Análisis' },
  { value: 'tactica', label: 'Táctica' },
  { value: 'opinion', label: 'Opinión' },
  { value: 'reaccion', label: 'Reacción' },
  { value: 'oficial', label: 'Oficial' },
];

export function getCreatorsForCategory(cat: CreatorCategory): Creator[] {
  return VIDEO_CREATORS.filter((c) => c.categories.includes(cat));
}

export function getCategoryLabel(cat: CreatorCategory): string {
  const tab = CATEGORY_TABS.find((t) => t.value === cat);
  return tab?.label ?? cat;
}
