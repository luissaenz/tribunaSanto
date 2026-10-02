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
  'utility-bar': ['utility-bar'],
  masthead: ['masthead'],
  'primary-nav': ['primary-nav'],
  breadcrumb: ['breadcrumb'],
  'site-footer': ['footer-columns'],
  'lead-story': ['lead-carousel'],
  trending: ['trending-thumbs'],
  'section-block': [
    'section-header',
    'story-feature',
    'story-accent-list',
    'story-thumb-grid',
    'story-headline-grid',
    'story-thumb-row'
  ],
  'latest-grid': ['latest-grid'],
  rail: ['sticky-rail'],
  'editor-picks': ['popular-numbered'],
  'compact-list': ['compact-dated-list'],
  'visual-stories': ['photo-cards'],
  'future-slot': [],
  'rail-recent-numbered': ['rail-numbered-trending'],
  'rail-section-index': ['rail-section-index'],
  'rail-latest': ['rail-latest'],
  'listing-header': ['listing-header', 'section-header'],
  'listing-feature': ['lead-carousel'],
  'river-list': ['river-list'],
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
  'mobile-menu-toggle': 'Requiere JS; la navegación mobile es una franja desplazable sin JS.',
  'search-toggle': 'Búsqueda fuera de alcance.',
  'ad-slot': 'Anuncios fuera de alcance.',
  'author-box': 'No existe entidad Person de autor en el payload; se evita una segunda fuente.',
  'stats-band': 'Cifras institucionales serían datos inventados.',
  'team-grid': 'Equipo/staff fuera de alcance; requiere datos reales.',
  form: 'Formularios (contacto, empleo) requieren backend.',
  'footer-newsletter': 'Newsletter funcional fuera de alcance.',
  'footer-social': 'No hay cuentas sociales oficiales definidas.',
  'back-to-top': 'Reemplazado por un ancla estática en el pie, sin JS.'
};
