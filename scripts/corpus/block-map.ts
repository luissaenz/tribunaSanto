// WEB.2 — Mapa evidencia del corpus → bloques propios.
//
// Vive en el tooling, no en el producto: puede importar `BlockId` del producto,
// pero el producto nunca importa este módulo. Cada bloque propio declara qué
// bloques detectados en el corpus (scripts/corpus/lib/analyze.ts) justifican su
// estructura, o se marca como extensión propia. Los bloques del corpus que
// WEB.2 decide no reproducir quedan listados con su motivo.

import type { BlockId } from '../../src/presentation/blocks.js';
import type { CorpusBlockId } from './lib/analyze.js';

export const blockEvidence: Record<BlockId, readonly CorpusBlockId[]> = {
  'top-bar': ['utility-bar'],
  masthead: ['masthead'],
  'site-nav': ['primary-nav', 'mobile-menu-toggle', 'search-toggle'],
  breadcrumb: ['breadcrumb'],
  'site-footer': ['footer-columns', 'footer-newsletter', 'footer-social'],
  'back-to-top': ['back-to-top'],
  'section-header': ['section-header'],
  'hero-carousel': ['lead-carousel'],
  trending: ['trending-thumbs'],
  'section-a': ['story-feature', 'story-accent-list'],
  'section-b': ['story-feature', 'story-thumb-grid'],
  'section-c': ['story-headline-grid'],
  'section-d': ['story-thumb-row', 'story-feature'],
  'home-rail': ['sticky-rail'],
  'popular-news': ['popular-numbered'],
  'section-headlines': ['compact-dated-list'],
  'home-ad': ['ad-slot'],
  'photos-rail': ['sticky-rail'],
  photos: ['photo-cards'],
  'latest-grid': ['latest-grid'],
  rail: ['sticky-rail'],
  'future-slot': [],
  'rail-recent-numbered': ['rail-numbered-trending'],
  'rail-section-index': ['rail-section-index'],
  'rail-latest': ['rail-latest'],
  'category-header': ['listing-header'],
  'topic-header': ['listing-header'],
  'listing-title': ['section-header'],
  'river-list': ['river-list'],
  'standard-sidebar': ['sticky-rail'],
  'sidebar-trending': ['rail-numbered-trending'],
  'sidebar-categories': ['rail-section-index'],
  'sidebar-latest': ['rail-latest'],
  'sidebar-ad': ['ad-slot'],
  pagination: ['pagination'],
  'article-hero': ['article-hero'],
  'article-meta': ['article-meta'],
  'article-body': ['article-body', 'body-subheading', 'body-quote'],
  'article-tags': ['article-tags'],
  'share-links': ['share-area'],
  'related-stories': ['related-articles'],
  'page-hero': ['page-hero-band'],
  prose: ['article-body', 'body-list']
};

/** Bloques propios sin equivalente en el corpus (extensiones de Tribuna Santo). */
export const ownExtensions: readonly BlockId[] = ['future-slot'];

/** Bloques detectados en el corpus que WEB.2 no reproduce, con motivo. */
export const omittedCorpusBlocks: Readonly<Partial<Record<CorpusBlockId, string>>> = {
  'author-box': 'No existe entidad Person de autor en el payload; se evita una segunda fuente.',
  'stats-band': 'Cifras institucionales serían datos inventados.',
  'team-grid': 'Equipo/staff fuera de alcance; requiere datos reales.',
  form: 'Formularios (contacto, empleo) requieren backend.'
};
