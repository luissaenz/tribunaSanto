// WEB.2 — Catálogo de bloques: tipo de página → bloques → componentes Astro.
//
// Es la versión ejecutable del mapa documentado en docs/web2/. Cada componente
// marca su raíz con `data-block="<id>"`; las pruebas verifican que cada página
// construida contenga sus bloques en orden y que cada bloque tenga evidencia
// en el inventario del corpus (o sea una extensión propia declarada).
//
// Los ids `corpus` refieren a bloques detectados por scripts/corpus/lib/analyze.ts.

export const OWN_PAGE_FAMILIES = ['home', 'section', 'topic', 'listing', 'article', 'institutional'] as const;
export type OwnPageFamily = (typeof OWN_PAGE_FAMILIES)[number];

export type BlockSpec = Readonly<{
  id: string;
  component: string;
  corpus: readonly string[];
  purpose: string;
}>;

export const blockCatalog = [
  { id: 'utility-bar', component: 'chrome/UtilityBar.astro', corpus: ['utility-bar'], purpose: 'Fecha de edición y lugar.' },
  { id: 'masthead', component: 'chrome/Masthead.astro', corpus: ['masthead'], purpose: 'Cabecera con marca provisional.' },
  { id: 'primary-nav', component: 'chrome/PrimaryNav.astro', corpus: ['primary-nav'], purpose: 'Secciones; fija en desktop, desplazable en mobile.' },
  { id: 'breadcrumb', component: 'chrome/Breadcrumb.astro', corpus: ['breadcrumb'], purpose: 'Ruta jerárquica.' },
  { id: 'site-footer', component: 'chrome/SiteFooter.astro', corpus: ['footer-columns'], purpose: 'Marca, columnas de enlaces y aviso.' },

  { id: 'lead-story', component: 'home/LeadStory.astro', corpus: ['lead-carousel'], purpose: 'Historia principal estática (reemplaza carrusel).' },
  { id: 'trending', component: 'home/TrendingList.astro', corpus: ['trending-thumbs'], purpose: 'Lista con miniaturas junto a la principal.' },
  { id: 'section-block', component: 'home/SectionBlock.astro', corpus: ['section-header', 'story-feature', 'story-accent-list', 'story-thumb-grid', 'story-headline-grid', 'story-thumb-row'], purpose: 'Bloque de sección con 4 variantes de composición.' },
  { id: 'latest-grid', component: 'home/LatestGrid.astro', corpus: ['latest-grid'], purpose: 'Grilla cronológica de últimas noticias.' },
  { id: 'editor-picks', component: 'rail/EditorPicks.astro', corpus: ['popular-numbered'], purpose: 'Selección editorial numerada (sin métricas de popularidad).' },
  { id: 'compact-list', component: 'rail/CompactList.astro', corpus: ['compact-dated-list'], purpose: 'Titulares con fecha de una sección.' },
  { id: 'visual-stories', component: 'rail/VisualStories.astro', corpus: ['photo-cards'], purpose: 'Historias con imagen dominante.' },
  { id: 'future-slot', component: 'rail/FutureSlot.astro', corpus: [], purpose: 'Hueco reservado para DEP/MET/GRF (extensión propia).' },

  { id: 'rail', component: 'layout/RailLayout.astro', corpus: ['sticky-rail'], purpose: 'Columna principal + columna lateral fija.' },
  { id: 'rail-recent-numbered', component: 'rail/NumberedList.astro', corpus: ['rail-numbered-trending'], purpose: 'Lo último, numerado.' },
  { id: 'rail-section-index', component: 'rail/SectionIndex.astro', corpus: ['rail-section-index'], purpose: 'Secciones con cantidad de notas.' },
  { id: 'rail-latest', component: 'rail/RailLatest.astro', corpus: ['rail-latest'], purpose: 'Una destacada y miniaturas.' },

  { id: 'listing-header', component: 'listing/ListingHeader.astro', corpus: ['listing-header', 'section-header'], purpose: 'H1 del listado y conteo.' },
  { id: 'listing-feature', component: 'listing/ListingFeature.astro', corpus: ['lead-carousel'], purpose: 'Destacada estática de la sección.' },
  { id: 'river-list', component: 'listing/RiverList.astro', corpus: ['river-list'], purpose: 'Río de notas imagen 1/3 + texto 2/3.' },
  { id: 'pagination', component: 'listing/Pagination.astro', corpus: ['pagination'], purpose: 'Paginación numerada estática.' },

  { id: 'article-hero', component: 'article/ArticleHero.astro', corpus: ['article-hero'], purpose: 'Imagen a sangre con antetítulo y H1.' },
  { id: 'article-meta', component: 'article/ArticleMeta.astro', corpus: ['article-meta'], purpose: 'Firma, fechas y tiempo de lectura.' },
  { id: 'article-body', component: 'article/ArticleBody.astro', corpus: ['article-body', 'body-subheading', 'body-quote'], purpose: 'Cuerpo con subtítulos y citas.' },
  { id: 'article-tags', component: 'article/ArticleTags.astro', corpus: ['article-tags'], purpose: 'Temas enlazados.' },
  { id: 'share-links', component: 'article/ShareLinks.astro', corpus: ['share-area'], purpose: 'Compartir sin JavaScript.' },
  { id: 'related-stories', component: 'article/RelatedStories.astro', corpus: ['related-articles'], purpose: 'Tres relacionadas.' },

  { id: 'page-hero', component: 'institutional/PageHero.astro', corpus: ['page-hero-band'], purpose: 'Banda de título institucional.' },
  { id: 'prose', component: 'institutional/Prose.astro', corpus: ['article-body', 'body-list'], purpose: 'Texto institucional angosto.' }
] as const satisfies readonly BlockSpec[];

export type BlockId = (typeof blockCatalog)[number]['id'];

const chromeStart = ['utility-bar', 'masthead', 'primary-nav'] as const satisfies readonly BlockId[];
const standardRail = ['rail', 'rail-recent-numbered', 'rail-section-index', 'rail-latest'] as const satisfies readonly BlockId[];

/** Secuencia mínima (en orden DOM) de bloques que cada familia debe renderizar. */
export const pageFamilyBlocks: Record<OwnPageFamily, readonly BlockId[]> = {
  home: [
    ...chromeStart,
    'lead-story',
    'trending',
    'rail',
    'section-block',
    'editor-picks',
    'future-slot',
    'compact-list',
    'rail',
    'visual-stories',
    'future-slot',
    'section-block',
    'latest-grid',
    'pagination',
    'site-footer'
  ],
  section: [...chromeStart, 'breadcrumb', ...standardRail.slice(0, 1), 'listing-header', 'listing-feature', 'river-list', ...standardRail.slice(1), 'site-footer'],
  topic: [...chromeStart, 'breadcrumb', ...standardRail.slice(0, 1), 'listing-header', 'river-list', ...standardRail.slice(1), 'site-footer'],
  listing: [...chromeStart, 'breadcrumb', ...standardRail.slice(0, 1), 'listing-header', 'river-list', 'pagination', ...standardRail.slice(1), 'site-footer'],
  article: [
    ...chromeStart,
    'breadcrumb',
    'article-hero',
    'article-meta',
    'rail',
    'article-body',
    'article-tags',
    'share-links',
    'related-stories',
    ...standardRail.slice(1),
    'future-slot',
    'site-footer'
  ],
  institutional: [...chromeStart, 'breadcrumb', 'page-hero', 'prose', 'site-footer']
};

/**
 * Bloques detectados en el corpus que WEB.2 decide NO reproducir, con motivo.
 * Junto con blockCatalog, cubre todos los bloques del inventario.
 */
export const omittedCorpusBlocks: Readonly<Record<string, string>> = {
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
