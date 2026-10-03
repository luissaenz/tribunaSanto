// WEB.2 — Catálogo de bloques propios: tipo de página → bloques → componentes Astro.
//
// Sólo contiene bloques de Tribuna Santo. La evidencia del corpus de referencia
// (qué bloque observado justifica cada uno) vive fuera del producto, en
// scripts/corpus/block-map.ts. Cada componente marca su raíz con
// `data-block="<id>"` y las pruebas verifican las secuencias declaradas aquí.

export const OWN_PAGE_FAMILIES = ['home', 'section', 'section-page', 'topic', 'topic-page', 'listing', 'article', 'institutional'] as const;
export type OwnPageFamily = (typeof OWN_PAGE_FAMILIES)[number];

export type BlockSpec = Readonly<{
  id: string;
  component: string;
  purpose: string;
}>;

export const blockCatalog = [
  { id: 'top-bar', component: 'chrome/TopBar.astro', purpose: 'Fecha dinámica y clima demo.' },
  { id: 'masthead', component: 'chrome/Masthead.astro', purpose: 'Logo, nombre y lema.' },
  { id: 'site-nav', component: 'chrome/SiteNav.astro', purpose: 'Navegación sticky, hamburguesa y búsqueda.' },
  { id: 'breadcrumb', component: 'chrome/Breadcrumb.astro', purpose: 'Ruta jerárquica.' },
  { id: 'site-footer', component: 'chrome/SiteFooter.astro', purpose: 'Marca, redes, columnas, newsletter demo y copyright.' },
  { id: 'back-to-top', component: 'chrome/BackToTop.astro', purpose: 'Botón fijo para volver arriba.' },
  { id: 'section-header', component: 'ui/SectionHeader.astro', purpose: 'Encabezado de bloque en caja negra.' },

  { id: 'hero-carousel', component: 'ui/Carousel.astro', purpose: 'Carrusel con autoplay, indicadores, flechas y swipe.' },
  { id: 'trending', component: 'home/TrendingThumbs.astro', purpose: 'Tendencias con miniatura junto al carrusel.' },
  { id: 'section-a', component: 'home/SectionA.astro', purpose: 'Destacada + titulares con filete izquierdo.' },
  { id: 'section-b', component: 'home/SectionB.astro', purpose: 'Destacada + grilla 2×2 de miniaturas.' },
  { id: 'section-c', component: 'home/SectionC.astro', purpose: 'Seis titulares con extracto en grilla.' },
  { id: 'section-d', component: 'home/SectionD.astro', purpose: 'Lista con miniatura a la derecha + destacada.' },
  { id: 'home-rail', component: 'home/PopularNews.astro', purpose: 'Rail sticky de portada.' },
  { id: 'popular-news', component: 'home/PopularNews.astro', purpose: 'Populares numeradas en caja negra.' },
  { id: 'section-headlines', component: 'home/SectionHeadlines.astro', purpose: 'Titulares de una sección con fecha.' },
  { id: 'home-ad', component: 'ui/AdSlot.astro', purpose: 'Publicidad 300×250 demo.' },
  { id: 'photos-rail', component: 'home/PhotoStories.astro', purpose: 'Rail sticky de fotos.' },
  { id: 'photos', component: 'home/PhotoStories.astro', purpose: 'Notas con imagen dominante.' },
  { id: 'latest-grid', component: 'home/LatestGrid.astro', purpose: 'Grilla de últimas noticias.' },

  { id: 'rail', component: 'layout/RailLayout.astro', purpose: 'Columna principal + columna lateral.' },
  { id: 'future-slot', component: 'rail/FutureSlot.astro', purpose: 'Hueco reservado para DEP/MET/GRF.' },
  { id: 'rail-recent-numbered', component: 'rail/NumberedList.astro', purpose: 'Lo último, numerado.' },
  { id: 'rail-section-index', component: 'rail/SectionIndex.astro', purpose: 'Secciones con cantidad de notas.' },
  { id: 'rail-latest', component: 'rail/RailLatest.astro', purpose: 'Una destacada y miniaturas.' },

  { id: 'category-header', component: 'listing/CategoryHeader.astro', purpose: 'H1 de sección en caja negra y conteo.' },
  { id: 'topic-header', component: 'listing/TopicHeader.astro', purpose: 'H1 de tema centrado y conteo.' },
  { id: 'listing-title', component: 'ui/SectionHeader.astro', purpose: 'Título H1 de listados paginados.' },
  { id: 'river-list', component: 'listing/RiverList.astro', purpose: 'Río de notas imagen 1/3 + texto 2/3.' },
  { id: 'pagination', component: 'ui/Pagination.astro', purpose: 'Paginación en cajas con anterior/siguiente.' },
  { id: 'standard-sidebar', component: 'sidebar/StandardSidebar.astro', purpose: 'Sidebar sticky de páginas internas.' },
  { id: 'sidebar-trending', component: 'sidebar/SidebarTrending.astro', purpose: 'Tendencias numeradas 01–05.' },
  { id: 'sidebar-categories', component: 'sidebar/SidebarCategories.astro', purpose: 'Secciones con emoji y conteo.' },
  { id: 'sidebar-latest', component: 'sidebar/SidebarLatest.astro', purpose: 'Una destacada y tres miniaturas.' },
  { id: 'sidebar-ad', component: 'ui/AdSlot.astro', purpose: 'Publicidad 300×250 demo.' },

  { id: 'article-hero', component: 'article/ArticleHero.astro', purpose: 'Imagen con antetítulo, H1 y bajada.' },
  { id: 'article-meta', component: 'article/ArticleMeta.astro', purpose: 'Firma, fechas y tiempo de lectura.' },
  { id: 'article-body', component: 'article/ArticleBody.astro', purpose: 'Cuerpo con subtítulos y citas.' },
  { id: 'article-tags', component: 'article/ArticleTags.astro', purpose: 'Temas enlazados.' },
  { id: 'share-links', component: 'article/ShareLinks.astro', purpose: 'Compartir sin JavaScript.' },
  { id: 'related-stories', component: 'article/RelatedStories.astro', purpose: 'Tres relacionadas.' },

  { id: 'page-hero', component: 'institutional/PageHero.astro', purpose: 'Banda de título institucional.' },
  { id: 'prose', component: 'institutional/Prose.astro', purpose: 'Texto institucional angosto.' }
] as const satisfies readonly BlockSpec[];

export type BlockId = (typeof blockCatalog)[number]['id'];

const chrome = ['top-bar', 'masthead', 'site-nav'] as const satisfies readonly BlockId[];
const standardRail = ['rail-recent-numbered', 'rail-section-index', 'rail-latest'] as const satisfies readonly BlockId[];
const sidebar = ['standard-sidebar', 'sidebar-trending', 'sidebar-categories', 'sidebar-latest', 'sidebar-ad'] as const satisfies readonly BlockId[];

/** Secuencia mínima (en orden DOM) de bloques que cada familia debe renderizar. */
export const pageFamilyBlocks: Record<OwnPageFamily, readonly BlockId[]> = {
  home: [
    ...chrome,
    'hero-carousel',
    'trending',
    'section-a',
    'section-b',
    'section-c',
    'section-d',
    'home-rail',
    'popular-news',
    'section-headlines',
    'home-ad',
    'photos-rail',
    'photos',
    'section-a',
    'section-a',
    'latest-grid',
    'pagination',
    'site-footer',
    'back-to-top'
  ],
  section: [...chrome, 'category-header', 'hero-carousel', 'section-header', 'river-list', ...sidebar, 'site-footer', 'back-to-top'],
  'section-page': [...chrome, 'section-header', 'listing-title', 'river-list', 'pagination', ...sidebar, 'site-footer', 'back-to-top'],
  topic: [...chrome, 'topic-header', 'section-header', 'river-list', ...sidebar, 'site-footer', 'back-to-top'],
  'topic-page': [...chrome, 'section-header', 'listing-title', 'river-list', 'pagination', ...sidebar, 'site-footer', 'back-to-top'],
  listing: [...chrome, 'section-header', 'listing-title', 'river-list', 'pagination', ...sidebar, 'site-footer', 'back-to-top'],
  article: [
    ...chrome,
    'breadcrumb',
    'article-hero',
    'article-meta',
    'rail',
    'article-body',
    'article-tags',
    'share-links',
    'related-stories',
    ...standardRail,
    'future-slot',
    'site-footer',
    'back-to-top'
  ],
  institutional: [...chrome, 'breadcrumb', 'page-hero', 'prose', 'site-footer', 'back-to-top']
};
