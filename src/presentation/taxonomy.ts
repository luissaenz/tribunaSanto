// WEB.2/WEB.3 — Taxonomía de presentación PROVISIONAL / DEMO-ONLY.
//
// Secciones y temas existen sólo para organizar la navegación y la composición
// de la web demo bajo /demo/. No forman parte de PublicationToWebPayload ni
// constituyen la taxonomía editorial definitiva (fuera de alcance de WEB.2).
// Sus slugs no son URLs permanentes.

export const SECTION_IDS = ['primera', 'mercado', 'juveniles', 'club', 'ciudadela', 'memoria'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type Section = Readonly<{
  id: SectionId;
  label: string;
  slug: string;
  description: string;
  /** Marcador visual del índice lateral de categorías (golden master: emoji por categoría). */
  emoji: string;
}>;

export const sections: readonly Section[] = [
  {
    id: 'primera',
    emoji: '⚽',
    label: 'Primera',
    slug: 'primera',
    description: 'Plantel profesional, entrenamientos y decisiones del cuerpo técnico.'
  },
  {
    id: 'mercado',
    emoji: '📝',
    label: 'Mercado',
    slug: 'mercado',
    description: 'Altas, bajas y movimientos del mercado de pases.'
  },
  {
    id: 'juveniles',
    emoji: '🌱',
    label: 'Juveniles',
    slug: 'juveniles',
    description: 'Divisiones formativas y futbolistas que empujan desde abajo.'
  },
  {
    id: 'club',
    emoji: '🏛',
    label: 'Club',
    slug: 'club',
    description: 'Vida institucional, socios y gestión.'
  },
  {
    id: 'ciudadela',
    emoji: '🏟',
    label: 'La Ciudadela',
    slug: 'la-ciudadela',
    description: 'Estadio, hinchada y la experiencia de cada partido.'
  },
  {
    id: 'memoria',
    emoji: '📜',
    label: 'Memoria',
    slug: 'memoria',
    description: 'Historia y relatos del club.'
  }
];

export const TOPIC_IDS = [
  'entrenamiento',
  'tactica',
  'cuerpo-tecnico',
  'inferiores',
  'refuerzos',
  'estadio',
  'hinchas',
  'socios',
  'agenda',
  'historia',
  'reserva',
  'pretemporada',
  'contratos',
  'prestamos',
  'arqueros',
  'mediocampo',
  'pelota-parada',
  'infraestructura',
  'sede',
  'banderas',
  'radio',
  'archivo',
  'viajes',
  'salud'
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

export type Topic = Readonly<{
  id: TopicId;
  label: string;
  slug: string;
}>;

export const topics: readonly Topic[] = [
  { id: 'entrenamiento', label: 'Entrenamiento', slug: 'entrenamiento' },
  { id: 'tactica', label: 'Táctica', slug: 'tactica' },
  { id: 'cuerpo-tecnico', label: 'Cuerpo técnico', slug: 'cuerpo-tecnico' },
  { id: 'inferiores', label: 'Inferiores', slug: 'inferiores' },
  { id: 'refuerzos', label: 'Refuerzos', slug: 'refuerzos' },
  { id: 'estadio', label: 'Estadio', slug: 'estadio' },
  { id: 'hinchas', label: 'Hinchas', slug: 'hinchas' },
  { id: 'socios', label: 'Socios', slug: 'socios' },
  { id: 'agenda', label: 'Agenda', slug: 'agenda' },
  { id: 'historia', label: 'Historia', slug: 'historia' },
  { id: 'reserva', label: 'Reserva', slug: 'reserva' },
  { id: 'pretemporada', label: 'Pretemporada', slug: 'pretemporada' },
  { id: 'contratos', label: 'Contratos', slug: 'contratos' },
  { id: 'prestamos', label: 'Préstamos', slug: 'prestamos' },
  { id: 'arqueros', label: 'Arqueros', slug: 'arqueros' },
  { id: 'mediocampo', label: 'Mediocampo', slug: 'mediocampo' },
  { id: 'pelota-parada', label: 'Pelota parada', slug: 'pelota-parada' },
  { id: 'infraestructura', label: 'Infraestructura', slug: 'infraestructura' },
  { id: 'sede', label: 'Sede', slug: 'sede' },
  { id: 'banderas', label: 'Banderas', slug: 'banderas' },
  { id: 'radio', label: 'Radio', slug: 'radio' },
  { id: 'archivo', label: 'Archivo', slug: 'archivo' },
  { id: 'viajes', label: 'Viajes', slug: 'viajes' },
  { id: 'salud', label: 'Salud', slug: 'salud' }
];

/** Orden de la navegación principal y del pie (golden master: orden propio de cada lista). */
export const NAV_SECTION_ORDER: readonly SectionId[] = ['primera', 'mercado', 'club', 'juveniles', 'ciudadela', 'memoria'];
export const FOOTER_SECTION_ORDER: readonly SectionId[] = ['primera', 'mercado', 'juveniles', 'club', 'ciudadela', 'memoria'];
/** Orden del índice lateral de categorías. */
export const SIDEBAR_SECTION_ORDER: readonly SectionId[] = ['juveniles', 'primera', 'ciudadela', 'club', 'memoria', 'mercado'];

export function getSection(id: SectionId): Section {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}

export function getTopic(id: TopicId): Topic {
  const topic = topics.find((t) => t.id === id);
  if (!topic) throw new Error(`Unknown topic: ${id}`);
  return topic;
}
