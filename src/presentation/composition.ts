// WEB.3 — Composición de portada (réplica del golden master).
//
// La composición es un documento de presentación separado de las historias:
// referencia artículos por `articleRef` y secciones por id. Así la jerarquía
// editorial de la portada no contamina PublicationToWebPayload ni la
// presentación individual de cada historia.
//
// Banda 1: carrusel (3 slides) + tendencias (4).
// Banda 2: secciones A/B/C/D + rail (populares 3, titulares de una sección 4, publicidad).
// Banda 3: fotos (2) en el rail izquierdo + dos secciones A + últimas (9) + paginación.

import type { ArticleRef } from '../domain/identity.js';
import type { WebStory } from './story.js';
import type { SectionId } from './taxonomy.js';
import { newestFirst, storiesInSection } from './queries.js';

export type ReplicaHomeComposition = Readonly<{
  heroSlides: readonly ArticleRef[];
  trending: readonly ArticleRef[];
  band2: Readonly<{ a: SectionId; b: SectionId; c: SectionId; d: SectionId }>;
  popular: readonly ArticleRef[];
  sidebarSection: SectionId;
  photos: readonly ArticleRef[];
  band3: readonly [SectionId, SectionId];
  latestCount: number;
}>;

export const REPLICA_HOME_ARITY = {
  heroSlides: 3,
  trending: 4,
  popular: 3,
  photos: 2,
  latestCount: 9,
  sectionA: 5,
  sectionB: 5,
  sectionC: 6,
  sectionD: 5,
  sidebarSection: 4
} as const;

export type ResolvedReplicaHome = Readonly<{
  heroSlides: readonly WebStory[];
  trending: readonly WebStory[];
  band2: Readonly<{
    a: Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>;
    b: Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>;
    c: Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>;
    d: Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>;
  }>;
  popular: readonly WebStory[];
  sidebarSection: Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>;
  photos: readonly WebStory[];
  band3: readonly [
    Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>,
    Readonly<{ sectionId: SectionId; stories: readonly WebStory[] }>
  ];
  latest: readonly WebStory[];
}>;

/**
 * Resuelve la portada réplica. Como en el golden master, las secciones pueden
 * repetir notas del carrusel o de tendencias; cada sección aparece una sola vez
 * entre las bandas 2 y 3.
 */
export function resolveReplicaHome(stories: readonly WebStory[], composition: ReplicaHomeComposition): ResolvedReplicaHome {
  const exact = (slot: string, list: readonly unknown[], arity: number) => {
    if (list.length !== arity) throw new Error(`Home slot ${slot} must have ${arity} entries (got ${list.length})`);
  };
  exact('heroSlides', composition.heroSlides, REPLICA_HOME_ARITY.heroSlides);
  exact('trending', composition.trending, REPLICA_HOME_ARITY.trending);
  exact('popular', composition.popular, REPLICA_HOME_ARITY.popular);
  exact('photos', composition.photos, REPLICA_HOME_ARITY.photos);
  if (composition.latestCount !== REPLICA_HOME_ARITY.latestCount) throw new Error('latestCount must be 9');

  const sectionIds = [...Object.values(composition.band2), ...composition.band3];
  if (new Set(sectionIds).size !== sectionIds.length) throw new Error('A section can only appear once on the home page');

  const find = (ref: ArticleRef) => {
    const story = stories.find((s) => s.article.articleRef === ref);
    if (!story) throw new Error(`Composition references unknown article ${ref}`);
    return story;
  };
  const take = (sectionId: SectionId, count: number) => {
    const available = storiesInSection(stories, sectionId);
    if (available.length < count) throw new Error(`Section ${sectionId} needs ${count} stories (got ${available.length})`);
    return { sectionId, stories: available.slice(0, count) };
  };

  return {
    heroSlides: composition.heroSlides.map(find),
    trending: composition.trending.map(find),
    band2: {
      a: take(composition.band2.a, REPLICA_HOME_ARITY.sectionA),
      b: take(composition.band2.b, REPLICA_HOME_ARITY.sectionB),
      c: take(composition.band2.c, REPLICA_HOME_ARITY.sectionC),
      d: take(composition.band2.d, REPLICA_HOME_ARITY.sectionD)
    },
    popular: composition.popular.map(find),
    sidebarSection: take(composition.sidebarSection, REPLICA_HOME_ARITY.sidebarSection),
    photos: composition.photos.map(find),
    band3: [take(composition.band3[0], REPLICA_HOME_ARITY.sectionA), take(composition.band3[1], REPLICA_HOME_ARITY.sectionA)],
    latest: newestFirst(stories).slice(0, composition.latestCount)
  };
}
