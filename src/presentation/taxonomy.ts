// WEB.2 — Taxonomía de presentación PROVISIONAL / DEMO-ONLY.
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
}>;

export const sections: readonly Section[] = [
  {
    id: 'primera',
    label: 'Primera',
    slug: 'primera',
    description: 'Plantel profesional, entrenamientos y decisiones del cuerpo técnico.'
  },
  {
    id: 'mercado',
    label: 'Mercado',
    slug: 'mercado',
    description: 'Altas, bajas y movimientos del mercado de pases.'
  },
  {
    id: 'juveniles',
    label: 'Juveniles',
    slug: 'juveniles',
    description: 'Divisiones formativas y futbolistas que empujan desde abajo.'
  },
  {
    id: 'club',
    label: 'Club',
    slug: 'club',
    description: 'Vida institucional, socios y gestión.'
  },
  {
    id: 'ciudadela',
    label: 'La Ciudadela',
    slug: 'la-ciudadela',
    description: 'Estadio, hinchada y la experiencia de cada partido.'
  },
  {
    id: 'memoria',
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
  'historia'
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
  { id: 'historia', label: 'Historia', slug: 'historia' }
];

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
