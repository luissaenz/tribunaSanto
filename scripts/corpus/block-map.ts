// WEB.2/WEB.3 — Mapa evidencia del corpus → bloques propios.
//
// Vive en el tooling, no en el producto: puede importar `BlockId` del producto,
// pero el producto nunca importa este módulo. Cada bloque propio declara qué
// bloques detectados en el corpus (scripts/corpus/lib/analyze.ts) justifican su
// estructura, o se marca como extensión propia. Los bloques del corpus que
// no se reproducen quedan listados con su motivo (en WEB.3, ninguno).

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
  'category-header': ['listing-header'],
  'topic-header': ['listing-header'],
  'listing-title': ['section-header'],
  'author-box': ['author-box'],
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
  'share-bar': ['share-area'],
  'related-articles': ['related-articles'],
  'landing-hero': ['page-hero-band'],
  'legal-hero': ['page-hero-band'],
  'legal-prose': ['article-body', 'body-list'],
  mission: ['page-hero-band'],
  'stats-band': ['stats-band'],
  'team-grid': ['team-grid'],
  timeline: ['page-hero-band'],
  awards: ['stats-band'],
  'cta-split': ['footer-newsletter'],
  'contact-form': ['form'],
  'office-info': ['form'],
  'follow-us': ['footer-social'],
  'faq-accordion': ['form'],
  'job-board': ['form'],
  'hiring-steps': ['form'],
  'apply-form': ['form']
};

/** Bloques propios sin equivalente en el corpus (extensiones de Tribuna Santo). */
export const ownExtensions: readonly BlockId[] = [];

/** Bloques detectados en el corpus que no se reproducen, con motivo (WEB.3: ninguno). */
export const omittedCorpusBlocks: Readonly<Partial<Record<CorpusBlockId, string>>> = {
};
