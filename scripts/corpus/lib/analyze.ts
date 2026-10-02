// WEB.2 — Análisis estructural del corpus de referencia `/web`.
//
// Este módulo sólo deduce estructura: familias de página, bloques y formas DOM.
// Nunca devuelve textos, imágenes ni código del corpus; los textos de headings
// se reducen a hashes para poder verificar que el producto no los reutiliza.

import crypto from 'node:crypto';
import { parse as parseHtml, type HTMLElement } from 'node-html-parser';

export const PAGE_FAMILIES = [
  'home',
  'category',
  'article',
  'tag',
  'author',
  'listing',
  'institutional'
] as const;

export type PageFamily = (typeof PAGE_FAMILIES)[number];

export const CORPUS_BLOCK_IDS = [
  'utility-bar',
  'masthead',
  'primary-nav',
  'mobile-menu-toggle',
  'search-toggle',
  'lead-carousel',
  'trending-thumbs',
  'section-header',
  'story-feature',
  'story-accent-list',
  'story-thumb-grid',
  'story-headline-grid',
  'story-thumb-row',
  'popular-numbered',
  'compact-dated-list',
  'photo-cards',
  'latest-grid',
  'pagination',
  'ad-slot',
  'sticky-rail',
  'breadcrumb',
  'article-hero',
  'article-meta',
  'article-body',
  'body-subheading',
  'body-quote',
  'body-list',
  'article-tags',
  'share-area',
  'related-articles',
  'rail-numbered-trending',
  'rail-section-index',
  'rail-latest',
  'listing-header',
  'river-list',
  'author-box',
  'page-hero-band',
  'stats-band',
  'team-grid',
  'form',
  'footer-columns',
  'footer-newsletter',
  'footer-social',
  'back-to-top'
] as const;

export type CorpusBlockId = (typeof CORPUS_BLOCK_IDS)[number];

export type PageAnalysis = Readonly<{
  path: string;
  family: PageFamily;
  paginated: boolean;
  pageNumber: number;
  blocks: readonly CorpusBlockId[];
  headings: Readonly<{ h1: number; h2: number; h3: number; h4: number }>;
  sections: number;
  asides: number;
  articleElements: number;
  interactiveComponents: number;
  headingHashes: readonly string[];
  cardShapes: readonly string[];
}>;

const cls = (el: HTMLElement): string => el.getAttribute('class') ?? '';
const hasCls = (el: HTMLElement, ...tokens: string[]): boolean => {
  const own = cls(el).split(/\s+/);
  return tokens.every((t) => own.includes(t));
};
const text = (el: HTMLElement): string => el.text.replace(/\s+/g, ' ').trim();
const headingText = (root: HTMLElement, re: RegExp): HTMLElement | undefined =>
  root.querySelectorAll('h2, h3').find((h) => re.test(text(h)));

export function hashText(value: string): string {
  const normalized = value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

/**
 * Forma estructural de una tarjeta: etiquetas sin clases ni textos.
 * Ej.: "article>div(a(img))+h3(a)+p+div".
 */
export function cardShape(el: HTMLElement, depth = 0): string {
  const children = el.childNodes.filter(
    (n): n is HTMLElement => n.nodeType === 1 && !['svg', 'script'].includes((n as HTMLElement).tagName.toLowerCase())
  );
  const tag = el.tagName.toLowerCase();
  if (children.length === 0 || depth >= 3) return tag;
  const inner = children.map((c) => cardShape(c, depth + 1)).join('+');
  return depth === 0 ? `${tag}>${inner}` : `${tag}(${inner})`;
}

type Detector = (root: HTMLElement) => boolean;

const detectors: Record<CorpusBlockId, Detector> = {
  'utility-bar': (r) => {
    const first = r.querySelector('header')?.childNodes.find((n) => n.nodeType === 1) as HTMLElement | undefined;
    return Boolean(first && first.querySelectorAll('div').length >= 2 && /py-2/.test(cls(first)));
  },
  masthead: (r) => Boolean(r.querySelector('header a img') && r.querySelector('header p')),
  'primary-nav': (r) => r.querySelectorAll('nav a').length >= 5,
  'mobile-menu-toggle': (r) => Boolean(r.querySelector('nav [aria-label="Toggle menu"]')),
  'search-toggle': (r) => Boolean(r.querySelector('nav [aria-label="Search"]')),
  'lead-carousel': (r) =>
    r.querySelectorAll('[x-data]').some((el) => /current:/.test(el.getAttribute('x-data') ?? '')) &&
    r.querySelectorAll('button[aria-label]').some((b) => /slide/i.test(b.getAttribute('aria-label') ?? '')),
  'trending-thumbs': (r) => {
    const h = headingText(r, /trending/i);
    return Boolean(h && h.parentNode?.querySelector('article img'));
  },
  'section-header': (r) => sectionHeaders(r).length > 0,
  'story-feature': (r) =>
    r.querySelectorAll('article').some((a) => Boolean(a.querySelector('.aspect-video img')) && Boolean(a.querySelector('h3 + p'))),
  'story-accent-list': (r) => r.querySelectorAll('article').some((a) => hasCls(a, 'border-l-4')),
  'story-thumb-grid': (r) =>
    r.querySelectorAll('div').some(
      (d) => hasCls(d, 'grid', 'grid-cols-2') && d.querySelectorAll('article h4').length >= 4
    ),
  'story-headline-grid': (r) =>
    r.querySelectorAll('div').some(
      (d) =>
        hasCls(d, 'grid', 'lg:grid-cols-3') &&
        d.querySelectorAll('article').length >= 3 &&
        d.querySelectorAll('article img').length === 0
    ),
  'story-thumb-row': (r) =>
    r.querySelectorAll('article').some((a) => hasCls(a, 'flex', 'items-center') && Boolean(a.querySelector('img'))),
  'popular-numbered': (r) => {
    const h = headingText(r, /popular/i);
    return Boolean(h && /^1\./.test(text(h.parentNode?.querySelector('article h3') ?? h)));
  },
  'compact-dated-list': (r) =>
    r.querySelectorAll('aside article').some((a) => {
      const first = a.childNodes.find((n) => n.nodeType === 1) as HTMLElement | undefined;
      return Boolean(first && first.tagName === 'DIV' && a.querySelector('h3'));
    }),
  'photo-cards': (r) => Boolean(headingText(r, /photos/i)),
  'latest-grid': (r) =>
    sectionHeaders(r).some((h) => /latest/i.test(text(h))) &&
    r.querySelectorAll('section div').some((d) => hasCls(d, 'lg:grid-cols-3') && d.querySelectorAll('article img').length >= 6),
  pagination: (r) =>
    r.querySelectorAll('div').some((d) => hasCls(d, 'justify-center') && d.querySelectorAll('a').filter((a) => /^\d+$/.test(text(a))).length >= 1 && d.querySelectorAll('a').every((a) => /^(\d+|next|previous|prev)$/i.test(text(a)))),
  'ad-slot': (r) =>
    r.querySelectorAll('aside div').some((d) => {
      const kids = d.childNodes.filter((n) => n.nodeType === 1) as HTMLElement[];
      return kids.length === 1 && kids[0].tagName === 'IMG' && /bg-gray/.test(cls(d));
    }),
  'sticky-rail': (r) => r.querySelectorAll('aside > div').some((d) => hasCls(d, 'sticky')),
  breadcrumb: (r) =>
    r.querySelectorAll('main div').some((d) => {
      const links = d.childNodes.filter((n) => n.nodeType === 1 && (n as HTMLElement).tagName === 'A') as HTMLElement[];
      return links.length >= 1 && /^home$/i.test(text(links[0])) && Boolean(d.querySelector('span.font-semibold'));
    }),
  'article-hero': (r) => Boolean(r.querySelectorAll('main h1').find((h) => /text-white/.test(cls(h)))) && Boolean(r.querySelector('.post-content')),
  'article-meta': (r) => Boolean(r.querySelector('main a img.rounded-full')) && /min read/i.test(r.text),
  'article-body': (r) => Boolean(r.querySelector('.post-content')),
  'body-subheading': (r) => r.querySelectorAll('.post-content h2, .post-content h3').length > 0,
  'body-quote': (r) => r.querySelectorAll('.post-content blockquote').length > 0,
  'body-list': (r) => r.querySelectorAll('.post-content ul, .post-content ol').length > 0,
  'article-tags': (r) => r.querySelectorAll('span').some((s) => /^tags:$/i.test(text(s))),
  'share-area': (r) => r.querySelectorAll('span').some((s) => /^share:$/i.test(text(s))),
  'related-articles': (r) => sectionHeaders(r).some((h) => /related/i.test(text(h))),
  'rail-numbered-trending': (r) => r.querySelectorAll('aside article span').some((s) => /^0\d$/.test(text(s))),
  'rail-section-index': (r) => r.querySelectorAll('aside h3').some((h) => /categor/i.test(text(h))),
  'rail-latest': (r) => r.querySelectorAll('aside h3').some((h) => /latest/i.test(text(h))),
  'listing-header': (r) =>
    r.querySelectorAll('main h1').some((h) => !/text-white/.test(cls(h))) && !r.querySelector('.post-content') && river(r),
  'river-list': (r) => river(r),
  'author-box': (r) => r.querySelectorAll('main div').some((d) => hasCls(d, 'border', 'p-6') && Boolean(d.querySelector('img.rounded-full'))),
  'page-hero-band': (r) =>
    r.querySelectorAll('main section, main div').some((d) => hasCls(d, 'bg-black', 'overflow-hidden') && Boolean(d.querySelector('h1'))),
  'stats-band': (r) =>
    r.querySelectorAll('section').some((s) => s.querySelectorAll('h3').filter((h) => /^\d[\d.,]*[+%]?M?\+?$/.test(text(h))).length >= 3),
  'team-grid': (r) => r.querySelectorAll('div').some((d) => hasCls(d, 'grid', 'lg:grid-cols-4') && d.querySelectorAll('img.aspect-square').length >= 3),
  form: (r) => r.querySelectorAll('main form').length > 0,
  'footer-columns': (r) => r.querySelectorAll('footer ul').length >= 2,
  'footer-newsletter': (r) => Boolean(r.querySelector('footer form')),
  'footer-social': (r) => r.querySelectorAll('footer a[aria-label]').length >= 2,
  'back-to-top': (r) => Boolean(r.querySelector('[aria-label="Back to top"]'))
};

function sectionHeaders(root: HTMLElement): HTMLElement[] {
  return root
    .querySelectorAll('div')
    .filter((d) => hasCls(d, 'border-t-4', 'border-black'))
    .map((d) => d.querySelector('h1, h2, h3'))
    .filter((h): h is HTMLElement => Boolean(h));
}

function river(root: HTMLElement): boolean {
  return root
    .querySelectorAll('div')
    .some((d) => hasCls(d, 'divide-y') && d.querySelectorAll('article').filter((a) => hasCls(a, 'py-6')).length >= 1);
}

export function detectBlocks(root: HTMLElement): CorpusBlockId[] {
  return CORPUS_BLOCK_IDS.filter((id) => detectors[id](root));
}

function activePage(root: HTMLElement): number {
  for (const h of root.querySelectorAll('h1, h2')) {
    const m = /page\s+(\d+)/i.exec(text(h));
    if (m) return Number(m[1]);
  }
  return 1;
}

export function classifyPage(relPath: string, root: HTMLElement, blocks: readonly CorpusBlockId[]): PageFamily {
  const has = (id: CorpusBlockId) => blocks.includes(id);
  const normalized = relPath.replace(/\\/g, '/');

  if (has('article-body') && has('share-area')) return 'article';
  if (has('lead-carousel') && sectionHeaders(root).filter((h) => h.parentNode?.querySelector('a')).length >= 3) {
    return 'home';
  }
  if (has('river-list')) {
    if (has('author-box')) return 'author';
    const headingTexts = root.querySelectorAll('h1, h2, p').map(text).join(' | ');
    if (/tagged with|\btag:/i.test(headingTexts) || normalized.startsWith('tags/')) return 'tag';
    if (has('lead-carousel') || /category:/i.test(headingTexts)) return 'category';
    return 'listing';
  }
  return 'institutional';
}

export function analyzePage(relPath: string, html: string): PageAnalysis {
  const root = parseHtml(html);
  const blocks = detectBlocks(root);
  const family = classifyPage(relPath, root, blocks);
  const pageNumber = activePage(root);
  const count = (sel: string) => root.querySelectorAll(sel).length;

  return {
    path: relPath.replace(/\\/g, '/'),
    family,
    paginated: pageNumber > 1,
    pageNumber,
    blocks,
    headings: { h1: count('h1'), h2: count('h2'), h3: count('h3'), h4: count('h4') },
    sections: count('section'),
    asides: count('aside'),
    articleElements: count('article'),
    interactiveComponents: count('[x-data]'),
    headingHashes: [...new Set(root.querySelectorAll('h1, h2, h3, h4').map((h) => hashText(text(h))).filter(Boolean))],
    cardShapes: [...new Set(root.querySelectorAll('article').map((a) => cardShape(a)))]
  };
}
