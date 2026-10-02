// WEB.2 — Composición de portada.
//
// La composición es un documento de presentación separado de las historias:
// referencia artículos por `articleRef` y elige variantes de bloque. Así la
// jerarquía editorial de la portada no contamina PublicationToWebPayload ni la
// presentación individual de cada historia.

import type { ArticleRef } from '../domain/identity.js';
import type { WebStory } from './story.js';
import type { SectionId } from './taxonomy.js';
import { excluding, newestFirst, storiesInSection } from './queries.js';

export const SECTION_BLOCK_VARIANTS = [
  'feature-list',
  'feature-quad',
  'headline-grid',
  'list-feature'
] as const;
export type SectionBlockVariant = (typeof SECTION_BLOCK_VARIANTS)[number];

export type SectionBlockSpec = Readonly<{
  sectionId: SectionId;
  variant: SectionBlockVariant;
}>;

export type HomeComposition = Readonly<{
  lead: ArticleRef;
  trending: readonly ArticleRef[];
  picks: readonly ArticleRef[];
  visual: readonly ArticleRef[];
  primaryBand: readonly SectionBlockSpec[];
  secondaryBand: readonly SectionBlockSpec[];
  latestCount: number;
}>;

export type ResolvedSectionBlock = Readonly<{
  sectionId: SectionId;
  variant: SectionBlockVariant;
  stories: readonly WebStory[];
}>;

export type ResolvedHome = Readonly<{
  lead: WebStory;
  trending: readonly WebStory[];
  picks: readonly WebStory[];
  visual: readonly WebStory[];
  primaryBand: readonly ResolvedSectionBlock[];
  secondaryBand: readonly ResolvedSectionBlock[];
  latest: readonly WebStory[];
}>;

/** Cantidad de historias que consume cada variante (1 destacada + secundarias). */
export const VARIANT_CAPACITY: Record<SectionBlockVariant, number> = {
  'feature-list': 5,
  'feature-quad': 5,
  'headline-grid': 6,
  'list-feature': 5
};

const MIN_BLOCK_STORIES = 3;

export function resolveHome(stories: readonly WebStory[], composition: HomeComposition): ResolvedHome {
  const find = (ref: ArticleRef) => {
    const story = stories.find((s) => s.article.articleRef === ref);
    if (!story) throw new Error(`Composition references unknown article ${ref}`);
    return story;
  };

  const lead = find(composition.lead);
  const trending = composition.trending.map(find);
  if (trending.some((s) => s.article.articleRef === lead.article.articleRef)) {
    throw new Error('Lead story cannot repeat inside trending');
  }

  const sectionIds = [...composition.primaryBand, ...composition.secondaryBand].map((b) => b.sectionId);
  if (new Set(sectionIds).size !== sectionIds.length) {
    throw new Error('A section can only appear once on the home page');
  }

  // Los bloques de sección no repiten la historia principal.
  const pool = excluding(stories, [lead]);
  const resolveBlock = (spec: SectionBlockSpec): ResolvedSectionBlock => {
    const blockStories = storiesInSection(pool, spec.sectionId).slice(0, VARIANT_CAPACITY[spec.variant]);
    if (blockStories.length < MIN_BLOCK_STORIES) {
      throw new Error(`Section block ${spec.sectionId} needs at least ${MIN_BLOCK_STORIES} stories`);
    }
    return { ...spec, stories: blockStories };
  };

  return {
    lead,
    trending,
    picks: composition.picks.map(find),
    visual: composition.visual.map(find),
    primaryBand: composition.primaryBand.map(resolveBlock),
    secondaryBand: composition.secondaryBand.map(resolveBlock),
    latest: newestFirst(stories).slice(0, composition.latestCount)
  };
}
