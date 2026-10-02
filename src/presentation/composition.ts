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
  'feature-tiles',
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

/** Aridad fija de cada slot de portada. */
export const HOME_ARITY = {
  trending: 4,
  picks: 3,
  visual: 2,
  primaryBand: 4,
  secondaryBand: 2,
  latestCount: 9
} as const;

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

/**
 * Cuántas historias toma cada variante a partir de las disponibles en la sección
 * (más nuevas primero, sin la principal). Devuelve 0 si no alcanza el mínimo.
 *
 * - feature-list:  1 destacada + 2–4 en lista
 * - feature-tiles: 1 destacada + 2 ó 4 tiles (número par: la grilla 2×N nunca queda con huecos)
 * - headline-grid: 3 ó 6 titulares (múltiplo de 3: filas completas en la grilla de 3)
 * - list-feature:  2–4 en lista + 1 destacada
 */
export function variantTake(variant: SectionBlockVariant, available: number): number {
  switch (variant) {
    case 'feature-list':
    case 'list-feature':
      return available >= 3 ? Math.min(available, 5) : 0;
    case 'feature-tiles': {
      const tiles = Math.min(4, available - 1);
      return tiles >= 2 ? 1 + (tiles - (tiles % 2)) : 0;
    }
    case 'headline-grid': {
      const take = Math.min(6, available);
      return take >= 3 ? take - (take % 3) : 0;
    }
  }
}

export function resolveHome(stories: readonly WebStory[], composition: HomeComposition): ResolvedHome {
  for (const [slot, arity] of Object.entries(HOME_ARITY)) {
    const value = composition[slot as keyof typeof HOME_ARITY];
    const size = typeof value === 'number' ? value : value.length;
    if (size !== arity) throw new Error(`Home slot ${slot} must have ${arity} entries (got ${size})`);
  }

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
    const available = storiesInSection(pool, spec.sectionId);
    const take = variantTake(spec.variant, available.length);
    if (take === 0) {
      throw new Error(`Section block ${spec.sectionId} (${spec.variant}) lacks stories (${available.length})`);
    }
    return { ...spec, stories: available.slice(0, take) };
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
