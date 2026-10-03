// WEB.3 — Catálogo de bloques propios: tipo de página → bloques → componentes Astro.
//
// Sólo contiene bloques de Tribuna Santo. La evidencia del corpus de referencia
// (qué bloque observado justifica cada uno) vive fuera del producto, en
// scripts/corpus/block-map.ts. Cada componente marca su raíz con
// `data-block="<id>"` y las pruebas verifican las secuencias declaradas aquí.

export const OWN_PAGE_FAMILIES = ['home', 'section', 'section-page', 'topic', 'topic-page', 'author', 'listing', 'article', 'about', 'contact', 'careers', 'legal'] as const;
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

  { id: 'category-header', component: 'listing/CategoryHeader.astro', purpose: 'H1 de sección en caja negra y conteo.' },
  { id: 'topic-header', component: 'listing/TopicHeader.astro', purpose: 'H1 de tema centrado y conteo.' },
  { id: 'listing-title', component: 'ui/SectionHeader.astro', purpose: 'Título H1 de listados paginados.' },
  { id: 'author-box', component: 'listing/AuthorBox.astro', purpose: 'Autor ficticio: avatar, rol, bio y redes.' },
  { id: 'river-list', component: 'listing/RiverList.astro', purpose: 'Río de notas imagen 1/3 + texto 2/3.' },
  { id: 'pagination', component: 'ui/Pagination.astro', purpose: 'Paginación en cajas con anterior/siguiente.' },
  { id: 'standard-sidebar', component: 'sidebar/StandardSidebar.astro', purpose: 'Sidebar sticky de páginas internas.' },
  { id: 'sidebar-trending', component: 'sidebar/SidebarTrending.astro', purpose: 'Tendencias numeradas 01–05.' },
  { id: 'sidebar-categories', component: 'sidebar/SidebarCategories.astro', purpose: 'Secciones con emoji y conteo.' },
  { id: 'sidebar-latest', component: 'sidebar/SidebarLatest.astro', purpose: 'Una destacada y tres miniaturas.' },
  { id: 'sidebar-ad', component: 'ui/AdSlot.astro', purpose: 'Publicidad 300×250 demo.' },

  { id: 'article-hero', component: 'article/ArticleHero.astro', purpose: 'Hero a sangre con sección y H1.' },
  { id: 'article-meta', component: 'article/ArticleMeta.astro', purpose: 'Autor con avatar, fecha y lectura.' },
  { id: 'article-body', component: 'article/ArticleBody.astro', purpose: 'Cuerpo editorial con subtítulos y citas.' },
  { id: 'article-tags', component: 'article/ArticleTags.astro', purpose: 'Temas enlazados.' },
  { id: 'share-bar', component: 'article/ShareBar.astro', purpose: 'Compartir con URL real y copiar enlace.' },
  { id: 'related-articles', component: 'article/RelatedGrid.astro', purpose: 'Tres relacionadas.' },

  { id: 'landing-hero', component: 'institutional/LandingHero.astro', purpose: 'Hero institucional con imagen y velo.' },
  { id: 'legal-hero', component: 'institutional/LegalHero.astro', purpose: 'Hero legal con fondo fijo.' },
  { id: 'legal-prose', component: 'institutional/LegalProse.astro', purpose: 'Texto legal post-content.' },
  { id: 'mission', component: 'institutional/Mission.astro', purpose: 'Misión con imagen y etiqueta.' },
  { id: 'stats-band', component: 'institutional/StatsBand.astro', purpose: 'Cifras demo.' },
  { id: 'team-grid', component: 'institutional/TeamGrid.astro', purpose: 'Equipo ficticio.' },
  { id: 'timeline', component: 'institutional/Timeline.astro', purpose: 'Historia alternada.' },
  { id: 'awards', component: 'institutional/Awards.astro', purpose: 'Reconocimientos demo.' },
  { id: 'cta-split', component: 'institutional/CtaSplit.astro', purpose: 'Newsletter demo y empleos.' },
  { id: 'contact-form', component: 'institutional/ContactForm.astro', purpose: 'Formulario demo con campo condicional.' },
  { id: 'office-info', component: 'institutional/OfficeInfo.astro', purpose: 'Datos de la redacción demo.' },
  { id: 'follow-us', component: 'institutional/FollowUs.astro', purpose: 'Redes demo.' },
  { id: 'faq-accordion', component: 'institutional/FaqAccordion.astro', purpose: 'Preguntas frecuentes en acordeón.' },
  { id: 'job-board', component: 'institutional/JobBoard.astro', purpose: 'Búsquedas con filtros y acordeón.' },
  { id: 'hiring-steps', component: 'institutional/HiringSteps.astro', purpose: 'Pasos del proceso.' },
  { id: 'apply-form', component: 'institutional/ApplyForm.astro', purpose: 'Postulación demo.' }
] as const satisfies readonly BlockSpec[];

export type BlockId = (typeof blockCatalog)[number]['id'];

const chrome = ['top-bar', 'masthead', 'site-nav'] as const satisfies readonly BlockId[];
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
  author: [...chrome, 'author-box', 'section-header', 'river-list', ...sidebar, 'site-footer', 'back-to-top'],
  listing: [...chrome, 'section-header', 'listing-title', 'river-list', 'pagination', ...sidebar, 'site-footer', 'back-to-top'],
  article: [
    ...chrome,
    'breadcrumb',
    'article-hero',
    'article-meta',
    'article-body',
    'article-tags',
    'share-bar',
    'related-articles',
    'section-header',
    ...sidebar,
    'site-footer',
    'back-to-top'
  ],
  about: [...chrome, 'landing-hero', 'mission', 'stats-band', 'team-grid', 'timeline', 'awards', 'cta-split', 'site-footer', 'back-to-top'],
  contact: [...chrome, 'landing-hero', 'contact-form', 'office-info', 'follow-us', 'faq-accordion', 'site-footer', 'back-to-top'],
  careers: [...chrome, 'landing-hero', 'job-board', 'hiring-steps', 'apply-form', 'site-footer', 'back-to-top'],
  legal: [...chrome, 'breadcrumb', 'legal-hero', 'legal-prose', 'site-footer', 'back-to-top']
};
