// WEB.2 — Modelo de presentación de una historia.
//
// Una WebStory une el payload canónico (PublicationToWebPayload, sin modificar)
// con metadata que es SÓLO presentación: slug demo, sección, temas e imagen.
// La composición de páginas (qué historia va en qué bloque) vive aparte, en
// composition.ts, para no acoplar rol editorial a la historia.

import type { PublicationToWebPayload } from '../contracts/index.js';
import type { SectionId, TopicId } from './taxonomy.js';

export type StoryImage = Readonly<{
  src: `/demo/${string}`;
  alt: string;
  width: number;
  height: number;
}>;

export type StoryPresentation = Readonly<{
  articleRef: PublicationToWebPayload['articleRef'];
  demoId: string;
  sectionId: SectionId;
  topicIds: readonly TopicId[];
  image: StoryImage;
}>;

export type WebStory = Readonly<{
  article: PublicationToWebPayload;
  presentation: StoryPresentation;
}>;

/** Claves que nunca pueden aparecer dentro del payload canónico. */
export const PRESENTATION_ONLY_KEYS = [
  'demoId',
  'sectionId',
  'topicIds',
  'image',
  'role',
  'slot',
  'category',
  'slug',
  'tags',
  'kicker'
] as const;

/**
 * demoIds que colisionarían con rutas estáticas del namespace /demo/
 * (/demo/seccion/, /demo/tema/, /demo/ultimas/, /demo/acerca/).
 */
export const RESERVED_DEMO_IDS = ['seccion', 'tema', 'ultimas', 'acerca'] as const;

const DEMO_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function joinStories(
  articles: readonly PublicationToWebPayload[],
  presentation: readonly StoryPresentation[]
): readonly WebStory[] {
  const refs = new Set(articles.map((a) => a.articleRef));
  const demoIds = new Set(presentation.map((p) => p.demoId));

  if (refs.size !== articles.length) throw new Error('Duplicate articleRef in articles');
  if (demoIds.size !== presentation.length) throw new Error('Duplicate demoId in presentation');
  if (presentation.length !== articles.length) {
    throw new Error('Every article needs exactly one presentation entry');
  }
  for (const p of presentation) {
    if (!DEMO_ID_PATTERN.test(p.demoId)) throw new Error(`Invalid demoId: ${p.demoId}`);
    if ((RESERVED_DEMO_IDS as readonly string[]).includes(p.demoId)) {
      throw new Error(`Reserved demoId: ${p.demoId}`);
    }
    if (!p.image.src.startsWith('/demo/')) throw new Error(`Image outside /demo/: ${p.image.src}`);
  }

  return articles.map((article) => {
    const matches = presentation.filter((p) => p.articleRef === article.articleRef);
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one presentation for ${article.articleRef}`);
    }
    return { article, presentation: matches[0] };
  });
}
