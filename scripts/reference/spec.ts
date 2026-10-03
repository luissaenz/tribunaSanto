// WEB.3 — Especificación de medición del golden master.
//
// Cada "parte" tiene un id estable compartido por la referencia y Tribuna Santo:
//   bloque | bloque/parte | bloque@slot | bloque@slot/parte
// En Tribuna el id se resuelve a `[data-block="bloque"][data-slot="slot"] [data-part="parte"]`.
// En la referencia se resuelve con el selector `ref` (tooling local: nunca se
// usa en el producto ni se versiona el corpus). Sólo se versionan las medidas.

export const VIEWPORTS = [375, 640, 768, 1024, 1280, 1440] as const;
export const BREAKPOINTS = [640, 768, 1024, 1280] as const;

export type PartSpec = Readonly<{
  id: string;
  /** Selector en el corpus de referencia. */
  ref: string;
  /** Selector adicional en Tribuna (se agrega al derivado del id). */
  tribunaSuffix?: string;
  /** La altura no depende del contenido editorial: se compara en px (±1). */
  fixedH?: boolean;
  /** La posición x depende del texto (p. ej. contenido centrado): no se compara. */
  freeX?: boolean;
  /** El ancho depende del texto: no se compara. */
  freeW?: boolean;
  /** No comparar estilos tipográficos (contenedores). */
  noType?: boolean;
}>;

export type SampleSpec = Readonly<{
  family: string;
  ref: string;
  tribuna: string;
  parts: readonly PartSpec[];
  /** Bloques cuyo orden DOM y visual se registra. */
  order?: readonly string[];
}>;

const c = (cls: string) => cls.split(' ').map((k) => `[class~="${k}"]`).join('');

const chrome: PartSpec[] = [
  { id: 'top-bar', ref: 'body > header > div:nth-child(1)', fixedH: true, noType: true },
  { id: 'top-bar/date', ref: '#topbar-date', freeW: true },
  { id: 'masthead', ref: 'body > header > div:nth-child(2)', fixedH: true, noType: true },
  { id: 'masthead/logo', ref: 'body > header img', fixedH: true, freeX: true },
  { id: 'masthead/name', ref: `body > header span${c('font-heading')}`, freeX: true, freeW: true },
  { id: 'masthead/tagline', ref: 'body > header p', freeX: true, freeW: true },
  { id: 'site-nav', ref: 'body > nav', fixedH: true, noType: true },
  { id: 'site-nav/links', ref: `body > nav ${c('lg:flex')}`, freeW: true },
  { id: 'site-nav/menu-toggle', ref: 'body > nav button[aria-label="Toggle menu"]', fixedH: true, noType: true },
  { id: 'site-nav/search-toggle', ref: 'body > nav button[aria-label="Search"]', fixedH: true, noType: true },
  { id: 'site-footer', ref: 'body > footer', noType: true },
  { id: 'site-footer/grid', ref: `body > footer ${c('grid md:grid-cols-3')}`, noType: true },
  { id: 'site-footer/brand-title', ref: 'body > footer h3', freeW: true },
  { id: 'site-footer/newsletter-input', ref: 'body > footer input[type="email"]', fixedH: true },
  { id: 'site-footer/newsletter-button', ref: 'body > footer form button', fixedH: true },
  { id: 'site-footer/copyright', ref: `body > footer ${c('border-t border-gray-800')}`, fixedH: true },
  { id: 'back-to-top', ref: 'body > button[aria-label="Back to top"]', fixedH: true, noType: true }
];

const sidebar: PartSpec[] = [
  { id: 'standard-sidebar', ref: `main aside ${c('sticky')}`, noType: true },
  { id: 'sidebar-trending/title', ref: `main aside h3${c('bg-red-600')}`, fixedH: true },
  { id: 'sidebar-trending/number', ref: `main aside span${c('text-3xl')}`, freeW: true },
  { id: 'sidebar-trending/item-title', ref: `main aside ${c('space-y-3')} h4`, freeW: true },
  { id: 'sidebar-categories/title', ref: `main aside ul${c('divide-y')}`, noType: true },
  { id: 'sidebar-categories/item', ref: `main aside ul${c('divide-y')} li a`, fixedH: true },
  { id: 'sidebar-categories/count', ref: `main aside ul${c('divide-y')} span${c('bg-black')}`, fixedH: true, freeX: true, freeW: true },
  { id: 'sidebar-latest/feature-media', ref: `main aside img${c('h-44')}`, fixedH: true },
  { id: 'sidebar-latest/thumb', ref: `main aside img${c('w-20')}`, fixedH: true },
  { id: 'sidebar-ad', ref: `main aside ${c('bg-gray-100')}`, fixedH: true, noType: true }
];

const pagination: PartSpec[] = [
  { id: 'pagination', ref: `main ${c('mt-10 border-t-2')}`, fixedH: true, freeW: true, noType: true },
  { id: 'pagination/current', ref: 'main a[aria-current="page"]', fixedH: true, freeX: true },
  { id: 'pagination/page', ref: `main ${c('mt-10')} a${c('w-9')}:not([aria-current])`, fixedH: true, freeX: true },
  { id: 'pagination/step', ref: `main ${c('mt-10')} a${c('px-4')}`, fixedH: true, freeX: true, freeW: true }
];

const river: PartSpec[] = [
  { id: 'river-list', ref: `main ${c('divide-y divide-gray-200')}`, noType: true },
  { id: 'river-list/media', ref: `main ${c('divide-y')} article img`, freeW: false },
  { id: 'river-list/kicker', ref: `main ${c('divide-y')} article span${c('text-red-600')}`, freeW: true },
  { id: 'river-list/title', ref: `main ${c('divide-y')} article h3`, freeW: true },
  { id: 'river-list/excerpt', ref: `main ${c('divide-y')} article p`, freeW: true },
  { id: 'river-list/meta', ref: `main ${c('divide-y')} article ${c('gap-3 text-xs')}`, freeW: true }
];

const sectionHeader = (scope: string, slot: string): PartSpec[] => [
  { id: `section-header@${slot}`, ref: `${scope} ${c('border-t-4 border-black')}`, fixedH: true, noType: true },
  { id: `section-header@${slot}/title`, ref: `${scope} ${c('border-t-4')} h2`, fixedH: true, freeW: true },
  { id: `section-header@${slot}/more`, ref: `${scope} ${c('border-t-4')} a`, fixedH: true, freeX: true, freeW: true }
];

const landingHero: PartSpec[] = [
  { id: 'landing-hero', ref: 'main > section:first-child', noType: true },
  { id: 'landing-hero/badge', ref: 'main > section:first-child span', fixedH: true, freeW: true },
  { id: 'landing-hero/title', ref: 'main > section:first-child h1', freeW: true },
  { id: 'landing-hero/lead', ref: 'main > section:first-child p', freeW: true }
];

const homeBand2 = 'main > div:nth-child(2)';
const homeBand3 = 'main > div:nth-child(3)';

export const SAMPLES: readonly SampleSpec[] = [
  {
    family: 'home',
    ref: 'index.html',
    tribuna: '/',
    order: ['top-bar', 'masthead', 'site-nav', 'hero-carousel', 'trending', 'section-a@band2', 'section-b', 'section-c', 'section-d', 'home-rail', 'photos-rail', 'section-a@band3a', 'section-a@band3b', 'latest-grid', 'pagination', 'site-footer'],
    parts: [
      ...chrome,
      { id: 'hero-carousel', ref: `main > section:first-child ${c('lg:col-span-2')} > div`, fixedH: true, noType: true },
      { id: 'hero-carousel/overlay', ref: 'main > section:first-child div[x-show^="current"]:not([style*="none"]) > div', fixedH: true, noType: true, tribunaSuffix: '' },
      { id: 'hero-carousel/badge', ref: 'main > section:first-child div[x-show^="current"]:not([style*="none"]) span', fixedH: true, freeW: true },
      { id: 'hero-carousel/title', ref: 'main > section:first-child div[x-show^="current"]:not([style*="none"]) h2', freeW: true },
      { id: 'hero-carousel/excerpt', ref: 'main > section:first-child div[x-show^="current"]:not([style*="none"]) p', freeW: true },
      { id: 'hero-carousel/meta', ref: `main > section:first-child div[x-show^="current"]:not([style*="none"]) ${c('opacity-75')}`, freeW: true },
      { id: 'hero-carousel/prev', ref: 'main > section:first-child button[aria-label="Previous slide"]', fixedH: true, noType: true },
      { id: 'hero-carousel/next', ref: 'main > section:first-child button[aria-label="Next slide"]', fixedH: true, freeX: false, noType: true },
      { id: 'hero-carousel/dots', ref: `main > section:first-child ${c('bottom-4')}`, fixedH: true, noType: true },
      { id: 'hero-carousel/dot-active', ref: `main > section:first-child button[aria-label="Go to slide 1"]`, fixedH: true, freeX: true, noType: true },
      { id: 'hero-carousel/dot', ref: `main > section:first-child button[aria-label="Go to slide 2"]`, fixedH: true, freeX: true, noType: true },
      { id: 'trending', ref: 'main > section:first-child > div > div:nth-child(2)', noType: true },
      { id: 'trending/title', ref: 'main > section:first-child h3', fixedH: true },
      { id: 'trending/thumb', ref: `main > section:first-child article ${c('w-24')}`, noType: true },
      { id: 'trending/item-title', ref: 'main > section:first-child article h4', freeW: true },
      { id: 'trending/excerpt', ref: 'main > section:first-child article p', freeW: true },
      { id: 'section-a@band2', ref: `${homeBand2} section:nth-of-type(1)`, noType: true },
      ...sectionHeader(`${homeBand2} section:nth-of-type(1)`, 'band2'),
      { id: 'section-a@band2/feature-media', ref: `${homeBand2} section:nth-of-type(1) ${c('aspect-video')}`, fixedH: true, noType: true },
      { id: 'section-a@band2/feature-title', ref: `${homeBand2} section:nth-of-type(1) h3`, freeW: true },
      { id: 'section-a@band2/feature-excerpt', ref: `${homeBand2} section:nth-of-type(1) article p`, freeW: true },
      { id: 'section-a@band2/list-item', ref: `${homeBand2} section:nth-of-type(1) article${c('border-l-4')}`, noType: true },
      { id: 'section-a@band2/list-title', ref: `${homeBand2} section:nth-of-type(1) article${c('border-l-4')} h4`, freeW: true },
      { id: 'section-b', ref: `${homeBand2} section:nth-of-type(2)`, noType: true },
      { id: 'section-b/tile', ref: `${homeBand2} section:nth-of-type(2) ${c('grid-cols-2')} > article`, noType: true },
      { id: 'section-b/tile-media', ref: `${homeBand2} section:nth-of-type(2) ${c('grid-cols-2')} ${c('aspect-video')}`, fixedH: true, noType: true },
      { id: 'section-b/tile-title', ref: `${homeBand2} section:nth-of-type(2) h4`, freeW: true },
      { id: 'section-c', ref: `${homeBand2} section:nth-of-type(3)`, noType: true },
      { id: 'section-c/item', ref: `${homeBand2} section:nth-of-type(3) article`, noType: true },
      { id: 'section-c/item-title', ref: `${homeBand2} section:nth-of-type(3) article h3`, freeW: true },
      { id: 'section-c/item-excerpt', ref: `${homeBand2} section:nth-of-type(3) article p`, freeW: true },
      { id: 'section-d', ref: `${homeBand2} section:nth-of-type(4)`, noType: true },
      { id: 'section-d/list-item', ref: `${homeBand2} section:nth-of-type(4) article${c('flex')}`, noType: true },
      { id: 'section-d/thumb', ref: `${homeBand2} section:nth-of-type(4) article${c('flex')} img`, fixedH: true, freeX: true, noType: true },
      { id: 'section-d/feature-title', ref: `${homeBand2} section:nth-of-type(4) h3`, freeW: true },
      { id: 'home-rail', ref: `${homeBand2} aside > div`, noType: true },
      { id: 'popular-news', ref: `${homeBand2} aside ${c('bg-black p-6')}`, noType: true },
      { id: 'popular-news/title', ref: `${homeBand2} aside ${c('bg-black')} h2`, fixedH: true },
      { id: 'popular-news/item-title', ref: `${homeBand2} aside ${c('bg-black')} h3`, freeW: true },
      { id: 'popular-news/excerpt', ref: `${homeBand2} aside ${c('bg-black')} p`, freeW: true },
      { id: 'section-headlines', ref: `${homeBand2} aside > div > div:nth-child(2)`, noType: true },
      { id: 'section-headlines/title', ref: `${homeBand2} aside > div > div:nth-child(2) h2`, fixedH: true },
      { id: 'section-headlines/item', ref: `${homeBand2} aside > div > div:nth-child(2) article`, noType: true },
      { id: 'section-headlines/item-title', ref: `${homeBand2} aside > div > div:nth-child(2) article h3`, freeW: true },
      { id: 'home-ad', ref: `${homeBand2} aside ${c('bg-gray-200')}`, fixedH: true, noType: true },
      { id: 'photos-rail', ref: `${homeBand3} aside > div`, noType: true },
      { id: 'photos', ref: `${homeBand3} aside ${c('relative')}`, noType: true },
      { id: 'photos/title', ref: `${homeBand3} aside h2`, fixedH: true },
      { id: 'photos/item', ref: `${homeBand3} aside article`, noType: true },
      { id: 'photos/media', ref: `${homeBand3} aside article img`, fixedH: true, noType: true },
      { id: 'photos/kicker', ref: `${homeBand3} aside article span`, freeW: true },
      { id: 'photos/item-title', ref: `${homeBand3} aside article h3`, freeW: true },
      { id: 'section-a@band3a', ref: `${homeBand3} section:nth-of-type(1)`, noType: true },
      { id: 'section-a@band3b', ref: `${homeBand3} section:nth-of-type(2)`, noType: true },
      { id: 'latest-grid', ref: `${homeBand3} ${c('lg:col-span-3')} > div > section`, noType: true },
      { id: 'latest-grid/card', ref: `${homeBand3} ${c('lg:col-span-3')} > div > section article`, noType: true },
      { id: 'latest-grid/media', ref: `${homeBand3} ${c('lg:col-span-3')} > div > section ${c('aspect-video')}`, fixedH: true, noType: true },
      { id: 'latest-grid/title', ref: `${homeBand3} ${c('lg:col-span-3')} > div > section h3`, freeW: true },
      ...pagination
    ]
  },
  {
    family: 'section',
    ref: 'technology.html',
    tribuna: '/demo/seccion/juveniles/',
    order: ['site-nav', 'category-header', 'hero-carousel', 'river-list', 'pagination', 'standard-sidebar', 'site-footer'],
    parts: [
      ...chrome.filter((p) => p.id === 'site-nav' || p.id === 'site-footer'),
      { id: 'site-nav/link-active', ref: `body > nav ${c('lg:flex')} a${c('text-red-500')}`, freeW: true, freeX: true },
      { id: 'category-header', ref: `main ${c('lg:col-span-3')} > div > div:first-child`, fixedH: true, noType: true },
      { id: 'category-header/title', ref: 'main h1', fixedH: true, freeW: true },
      { id: 'category-header/count', ref: `main ${c('lg:col-span-3')} > div > div:first-child span`, freeX: true, freeW: true },
      { id: 'hero-carousel', ref: `main ${c('lg:col-span-3')} ${c('aspect-4/3.5')}`, fixedH: true, noType: true },
      { id: 'hero-carousel/overlay', ref: `main div[x-show^="current"]:not([style*="none"]) > div`, fixedH: true, noType: true },
      { id: 'hero-carousel/badge', ref: `main div[x-show^="current"]:not([style*="none"]) span`, fixedH: true, freeW: true },
      { id: 'hero-carousel/title', ref: `main div[x-show^="current"]:not([style*="none"]) h2`, freeW: true },
      { id: 'hero-carousel/excerpt', ref: `main div[x-show^="current"]:not([style*="none"]) p`, freeW: true },
      { id: 'hero-carousel/meta', ref: `main div[x-show^="current"]:not([style*="none"]) ${c('opacity-70')}`, freeW: true },
      { id: 'hero-carousel/dot-active', ref: 'main button[aria-label="Slide 1"]', fixedH: true, freeX: true, noType: true },
      { id: 'hero-carousel/dot', ref: 'main button[aria-label="Slide 2"]', fixedH: true, freeX: true, noType: true },
      { id: 'hero-carousel/prev', ref: 'main button[aria-label="Previous"]', fixedH: true, noType: true },
      ...sectionHeader(`main section`, 'river'),
      ...river,
      ...pagination,
      ...sidebar
    ]
  },
  {
    family: 'section-two-slides',
    ref: 'politics.html',
    tribuna: '/demo/seccion/primera/',
    parts: [
      { id: 'hero-carousel/dot-active', ref: 'main button[aria-label="Slide 1"]', fixedH: true, freeX: true, noType: true },
      { id: 'hero-carousel/dot', ref: 'main button[aria-label="Slide 2"]', fixedH: true, freeX: true, noType: true }
    ]
  },
  {
    family: 'section-page',
    ref: 'technology/2.html',
    tribuna: '/demo/seccion/juveniles/2/',
    parts: [{ id: 'listing-title', ref: `main ${c('border-t-4')} h2`, fixedH: true, freeW: true }, ...river, ...pagination, ...sidebar]
  },
  {
    family: 'article',
    ref: 'technology-ai-transportation.html',
    tribuna: '/demo/la-ciudadela-prepara-su-color/',
    order: ['site-nav', 'breadcrumb', 'article-hero', 'article-meta', 'article-body', 'article-tags', 'share-bar', 'related-articles', 'standard-sidebar', 'site-footer'],
    parts: [
      ...chrome,
      { id: 'breadcrumb', ref: `main > div${c('bg-gray-100')}`, fixedH: true, noType: true },
      { id: 'breadcrumb/link', ref: `main > div${c('bg-gray-100')} a`, fixedH: true, freeW: true },
      { id: 'breadcrumb/current', ref: `main > div${c('bg-gray-100')} span`, fixedH: true, freeX: true, freeW: true },
      { id: 'article-hero', ref: `main > div${c('aspect-4/3')}`, fixedH: true, noType: true },
      { id: 'article-hero/overlay', ref: `main > div${c('aspect-4/3')} > div`, fixedH: true, noType: true },
      { id: 'article-hero/badge', ref: `main > div${c('aspect-4/3')} a`, fixedH: true, freeW: true },
      { id: 'article-hero/title', ref: 'main h1', freeW: true },
      { id: 'article-meta', ref: `main > div${c('border-b')}${c('bg-white')}`, fixedH: true, noType: true },
      { id: 'article-meta/avatar', ref: `main > div${c('bg-white')} img`, fixedH: true },
      { id: 'article-meta/author', ref: `main > div${c('bg-white')} a span`, freeW: true },
      { id: 'article-meta/separator', ref: `main > div${c('bg-white')} span${c('sm:block')}`, freeX: true },
      { id: 'article-meta/date', ref: `main > div${c('bg-white')} ${c('gap-1.5')}`, freeX: true, freeW: true },
      { id: 'article-meta/reading', ref: `main > div${c('bg-white')} ${c('max-sm:hidden')}`, freeX: true, freeW: true },
      { id: 'article-body', ref: `main ${c('post-content')}`, noType: false },
      { id: 'article-body/h2', ref: `main ${c('post-content')} h2`, freeW: false },
      { id: 'article-body/p', ref: `main ${c('post-content')} p` },
      { id: 'article-body/blockquote', ref: `main ${c('post-content')} blockquote` },
      { id: 'article-tags', ref: `main ${c('lg:col-span-3')} > div:nth-child(2)`, noType: true },
      { id: 'article-tags/label', ref: `main ${c('lg:col-span-3')} > div:nth-child(2) span`, fixedH: true, freeW: true },
      { id: 'article-tags/tag', ref: `main ${c('lg:col-span-3')} > div:nth-child(2) a`, fixedH: true, freeX: true, freeW: true },
      { id: 'share-bar', ref: 'main [x-data*="copied"]', noType: true },
      { id: 'share-bar/label', ref: 'main [x-data*="copied"] > span', fixedH: true, freeW: true },
      { id: 'share-bar/facebook', ref: 'main [x-data*="copied"] a:nth-of-type(1)', fixedH: true, freeX: true, freeW: true },
      { id: 'share-bar/whatsapp', ref: 'main [x-data*="copied"] a:nth-of-type(3)', fixedH: true, freeX: true, freeW: true },
      { id: 'share-bar/copy', ref: 'main [x-data*="copied"] button', fixedH: true, freeX: true, freeW: true },
      { id: 'related-articles', ref: `main ${c('lg:col-span-3')} > section`, noType: true },
      { id: 'related-articles/media', ref: `main ${c('lg:col-span-3')} > section ${c('aspect-video')}`, fixedH: true, noType: true },
      { id: 'related-articles/kicker', ref: `main ${c('lg:col-span-3')} > section article span`, freeW: true },
      { id: 'related-articles/title', ref: `main ${c('lg:col-span-3')} > section h3`, freeW: true },
      ...sectionHeader(`main ${c('lg:col-span-3')} > section`, 'related'),
      ...sidebar
    ]
  },
  {
    family: 'topic',
    ref: 'tags/ai.html',
    tribuna: '/demo/tema/tactica/',
    parts: [
      { id: 'topic-header/title', ref: 'main h1', freeX: true, freeW: true },
      { id: 'topic-header/count', ref: `main ${c('lg:col-span-3')} > p`, freeW: true },
      ...sectionHeader('main section', 'river'),
      ...river,
      ...sidebar
    ]
  },
  {
    family: 'topic-page',
    ref: 'tags/technology/2.html',
    tribuna: '/demo/tema/entrenamiento/2/',
    parts: [{ id: 'listing-title', ref: `main ${c('border-t-4')} h2`, fixedH: true, freeW: true }, ...river, ...pagination]
  },
  {
    family: 'author',
    ref: 'author/john-smith.html',
    tribuna: '/demo/autor/martina-quiroga/',
    parts: [
      { id: 'author-box', ref: `main ${c('bg-gray-50')}`, noType: true },
      { id: 'author-box/avatar', ref: `main ${c('bg-gray-50')} img`, fixedH: true },
      { id: 'author-box/name', ref: `main ${c('bg-gray-50')} h1`, freeX: true, freeW: true },
      { id: 'author-box/role', ref: `main ${c('bg-gray-50')} span${c('bg-red-600')}`, fixedH: true, freeX: true, freeW: true },
      { id: 'author-box/bio', ref: `main ${c('bg-gray-50')} p`, freeW: true },
      { id: 'author-box/social', ref: `main ${c('bg-gray-50')} a`, fixedH: true, freeX: true },
      ...sectionHeader('main section', 'river'),
      ...river,
      ...pagination
    ]
  },
  {
    family: 'author-page',
    ref: 'author/john-smith/2.html',
    tribuna: '/demo/autor/martina-quiroga/2/',
    parts: [{ id: 'author-box', ref: `main ${c('bg-gray-50')}`, noType: true }, ...pagination]
  },
  {
    family: 'listing',
    ref: 'page.html',
    tribuna: '/demo/ultimas/',
    parts: [{ id: 'listing-title', ref: `main ${c('border-t-4')} h2`, fixedH: true, freeW: true }, ...river, ...pagination, ...sidebar]
  },
  {
    family: 'listing-last',
    ref: 'page/5.html',
    tribuna: '/demo/ultimas/5/',
    parts: [...pagination]
  },
  {
    family: 'about',
    ref: 'about.html',
    tribuna: '/demo/acerca/',
    parts: [
      ...landingHero,
      { id: 'mission/media', ref: 'main main section:nth-of-type(1) img', fixedH: true, noType: true },
      { id: 'mission/badge', ref: `main main ${c('-bottom-4')}`, fixedH: true, freeW: true },
      { id: 'mission/text', ref: `main main section:nth-of-type(1) ${c('space-y-4')}`, freeW: false },
      { id: 'stats-band', ref: 'main main section:nth-of-type(2)', noType: true },
      { id: 'stats-band/cell', ref: 'main main section:nth-of-type(2) > div > div', fixedH: true, noType: true },
      { id: 'stats-band/value', ref: 'main main section:nth-of-type(2) h3', fixedH: true, freeX: true, freeW: true },
      { id: 'stats-band/label', ref: 'main main section:nth-of-type(2) h3 + div', freeX: true, freeW: true },
      { id: 'team-grid/card', ref: `main main ${c('group')}`, noType: true },
      { id: 'team-grid/photo', ref: `main main ${c('group')} img`, fixedH: true, noType: true },
      { id: 'team-grid/name', ref: `main main ${c('group')} h3`, freeW: true },
      { id: 'team-grid/role', ref: `main main ${c('group')} > span`, freeW: true },
      { id: 'timeline/line', ref: `main main ${c('w-0.5')}`, noType: true },
      { id: 'timeline/dot', ref: `main main ${c('ring-4')}`, fixedH: true, noType: true },
      { id: 'timeline/year', ref: `main main ${c('text-4xl')}`, freeX: true, freeW: true },
      { id: 'awards', ref: `main main section${c('bg-gray-50')}`, noType: true },
      { id: 'awards/icon', ref: `main main section${c('bg-gray-50')} ${c('w-10 h-10')}`, fixedH: true, noType: true },
      { id: 'awards/title', ref: `main main section${c('bg-gray-50')} h5`, freeW: true },
      { id: 'cta-split/newsletter', ref: `main main section:last-child > div:first-child`, noType: true },
      { id: 'cta-split/careers', ref: `main main section:last-child > div:last-child`, noType: true },
      { id: 'cta-split/input', ref: 'main main section:last-child input', fixedH: true, freeW: true },
      { id: 'cta-split/button', ref: 'main main section:last-child button', fixedH: true, freeX: true, freeW: true }
    ]
  },
  {
    family: 'contact',
    ref: 'contact.html',
    tribuna: '/demo/contacto/',
    parts: [
      ...landingHero,
      { id: 'contact-form', ref: 'main main form', noType: true },
      { id: 'contact-form/label', ref: 'main main form label', freeW: true },
      { id: 'contact-form/input', ref: 'main main form input[type="text"]', fixedH: true },
      { id: 'contact-form/select', ref: 'main main form select', fixedH: true },
      { id: 'contact-form/textarea', ref: 'main main form textarea', fixedH: true },
      { id: 'contact-form/attachment', ref: `main main form label${c('border-dashed')}`, fixedH: true, noType: true },
      { id: 'contact-form/submit', ref: 'main main form button[type="submit"]', fixedH: true, freeW: true },
      { id: 'office-info/icon', ref: `main main ${c('w-8 h-8')}`, fixedH: true, noType: true },
      { id: 'follow-us/item', ref: `main main a${c('p-3')}`, fixedH: true, noType: true },
      { id: 'faq-accordion', ref: 'main main section[x-data]', noType: true },
      { id: 'faq-accordion/question', ref: 'main main section[x-data] button', fixedH: true, noType: true },
      { id: 'faq-accordion/question-text', ref: 'main main section[x-data] button > span:first-child', freeW: true }
    ]
  },
  {
    family: 'careers',
    ref: 'careers.html',
    tribuna: '/demo/empleos/',
    parts: [
      ...landingHero,
      { id: 'job-board', ref: '#open-roles', noType: true },
      { id: 'job-board/count', ref: `#open-roles ${c('border-t-4')} > span`, freeX: true, freeW: true },
      { id: 'job-board/filter-active', ref: '#open-roles button:first-child', fixedH: true, freeW: true },
      { id: 'job-board/filter', ref: '#open-roles button:nth-child(2)', fixedH: true, freeX: true, freeW: true },
      { id: 'job-board/job', ref: `#open-roles ${c('py-5')}`, noType: true },
      { id: 'job-board/job-title', ref: '#open-roles h3', freeW: true },
      { id: 'hiring-steps', ref: `#apply ${c('bg-black')}`, noType: true },
      { id: 'hiring-steps/number', ref: `#apply ${c('bg-black')} span`, freeW: true },
      { id: 'apply-form', ref: '#apply form', noType: true },
      { id: 'apply-form/submit', ref: '#apply form button[type="submit"]', fixedH: true }
    ]
  },
  {
    family: 'legal',
    ref: 'privacy.html',
    tribuna: '/demo/privacidad/',
    parts: [
      { id: 'breadcrumb', ref: `main > div${c('bg-gray-100')}`, fixedH: true, noType: true },
      { id: 'breadcrumb/inner', ref: `main > div${c('bg-gray-100')} > div`, fixedH: true, noType: true },
      { id: 'legal-hero', ref: `main > div${c('bg-fixed')}`, noType: true },
      { id: 'legal-hero/badge', ref: `main > div${c('bg-fixed')} span`, fixedH: true, freeW: true },
      { id: 'legal-hero/title', ref: `main > div${c('bg-fixed')} h1`, freeW: true },
      { id: 'legal-hero/updated', ref: `main > div${c('bg-fixed')} ${c('border-t')}`, fixedH: true },
      { id: 'legal-prose', ref: `main main ${c('post-content')}`, noType: false },
      { id: 'legal-prose/h2', ref: `main main ${c('post-content')} h2` },
      { id: 'legal-prose/li', ref: `main main ${c('post-content')} li` }
    ]
  }
];

/** Id de parte → selector en Tribuna Santo. */
export function tribunaSelector(part: PartSpec): string {
  const [blockAndSlot, sub] = part.id.split('/');
  const [block, slot] = blockAndSlot.split('@');
  const root = slot ? `[data-block="${block}"][data-slot="${slot}"]` : `[data-block="${block}"]`;
  const base = sub ? `${root} [data-part="${sub}"]` : root;
  return part.tribunaSuffix ? `${base}${part.tribunaSuffix}` : base;
}
