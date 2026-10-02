import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { demoStories } from '../../src/data/demo-articles.js';
import { firstParagraph } from '../../src/presentation/article-body.js';
import { pageFamilyBlocks, type OwnPageFamily } from '../../src/presentation/blocks.js';
import { routes } from '../../src/presentation/routes.js';
import { sections, topics } from '../../src/presentation/taxonomy.js';
import { distHtmlFiles, readDistPage, routeOf } from './dist.js';

const articleRoutes = demoStories.map((s) => routes.article(s));

/** Familia propia de cada ruta construida. */
function familyOf(route: string): OwnPageFamily {
  if (route === '/') return 'home';
  if (route.startsWith('/demo/')) return 'article';
  if (route.startsWith('/seccion/')) return 'section';
  if (route.startsWith('/tema/')) return 'topic';
  if (route.startsWith('/ultimas/')) return 'listing';
  return 'institutional';
}

function isSubsequence(expected: readonly string[], actual: readonly string[]): boolean {
  let i = 0;
  for (const id of actual) if (id === expected[i]) i++;
  return i === expected.length;
}

describe('WEB static render', () => {
  const pages = distHtmlFiles().map((file) => ({ route: routeOf(file), ...readDistPage(routeOf(file)) }));

  it('builds every page family', () => {
    const built = new Set(pages.map((p) => p.route));
    expect(built.has('/')).toBe(true);
    expect(built.has('/acerca/')).toBe(true);
    expect(built.has('/ultimas/')).toBe(true);
    expect(built.has('/ultimas/2/')).toBe(true);
    for (const route of articleRoutes) expect(built.has(route)).toBe(true);
    for (const section of sections) expect(built.has(routes.section(section.id))).toBe(true);
    for (const topic of topics) expect(built.has(routes.topic(topic.id))).toBe(true);
  });

  it('renders the block sequence declared for each page family', () => {
    for (const page of pages) {
      const family = familyOf(page.route);
      const actual = page.root.querySelectorAll('[data-block]').map((el) => el.getAttribute('data-block')!);
      expect(isSubsequence(pageFamilyBlocks[family], actual), `${page.route} (${family}): ${actual.join(' > ')}`).toBe(true);
    }
  });

  it('renders exactly one h1 and never skips heading levels', () => {
    for (const page of pages) {
      const headings = page.root.querySelectorAll('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));
      expect(headings.filter((l) => l === 1), page.route).toHaveLength(1);
      expect(headings[0], page.route).toBe(1);
      for (let i = 1; i < headings.length; i++) {
        expect(headings[i] - headings[i - 1], `${page.route} heading #${i}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('keeps the masthead as the home h1 and semantic landmarks', () => {
    const { root } = readDistPage('/');
    expect(root.querySelector('h1')?.text.trim()).toBe('Tribuna Santo');
    for (const landmark of ['header', 'nav', 'main', 'footer', 'aside']) {
      expect(root.querySelector(landmark), landmark).not.toBeNull();
    }
  });

  it('substantially increases home density over WEB.1', () => {
    const { root } = readDistPage('/');
    const articleLinks = new Set(
      root.querySelectorAll('main a[href^="/demo/"]').map((a) => a.getAttribute('href'))
    );
    // WEB.1 enlazaba 7 notas desde 3 bloques; WEB.2 enlaza todo el corpus demo.
    expect(articleLinks.size).toBe(demoStories.length);
    expect(root.querySelectorAll('main article').length).toBeGreaterThanOrEqual(40);
    expect(root.querySelectorAll('[data-block="section-block"]').length).toBe(sections.length);
    const variants = new Set(root.querySelectorAll('[data-block="section-block"]').map((b) => b.getAttribute('data-variant')));
    expect(variants.size).toBe(4);
  });

  it('renders the lead story before section blocks in DOM order', () => {
    const { html } = readDistPage('/');
    expect(html.indexOf('data-block="lead-story"')).toBeLessThan(html.indexOf('data-block="section-block"'));
    expect(html.indexOf('La Ciudadela se prepara para una semana clave')).toBeLessThan(html.indexOf('data-block="section-block"'));
  });

  it('renders article headline, dek, byline, time and body from the same payload', () => {
    for (const story of demoStories) {
      const { html, root } = readDistPage(routes.article(story));
      expect(root.querySelector('h1')?.text.trim()).toBe(story.article.headline);
      if (story.article.dek) expect(html).toContain(story.article.dek);
      expect(html).toContain(story.article.byline);
      expect(html).toContain(story.article.publishedAt);
      expect(root.querySelector('[data-block="article-body"]')?.text).toContain(firstParagraph(story.article.body));
      expect(root.querySelectorAll('a[href="/"]').length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders body subheadings as anchored h2 and quotes as blockquote', () => {
    const lead = demoStories[0];
    const { root } = readDistPage(routes.article(lead));
    const body = root.querySelector('[data-block="article-body"]')!;
    expect(body.querySelectorAll('h2[id]').map((h) => h.text.trim())).toEqual(['El plan de trabajo', 'Lo que se vive afuera']);
    expect(body.querySelector('blockquote')?.text).toContain('más de una respuesta preparada');
    expect(body.text).not.toContain('## ');
  });

  it('links tags to built topic pages and related stories to built articles', () => {
    for (const story of demoStories) {
      const { root } = readDistPage(routes.article(story));
      const tagHrefs = root.querySelectorAll('[data-block="article-tags"] a').map((a) => a.getAttribute('href'));
      expect(tagHrefs).toEqual(story.presentation.topicIds.map((t) => routes.topic(t)));
      const related = root.querySelectorAll('[data-block="related-stories"] h3 a').map((a) => a.getAttribute('href'));
      expect(related).not.toContain(routes.article(story));
    }
  });

  it('emits absolute, unique canonicals and social metadata', () => {
    const canonicals = pages.map((p) => p.root.querySelector('link[rel="canonical"]')?.getAttribute('href'));
    for (const [i, href] of canonicals.entries()) {
      expect(href, pages[i].route).toMatch(/^https:\/\//);
      expect(new URL(href!).pathname).toBe(pages[i].route);
    }
    expect(new Set(canonicals).size).toBe(pages.length);

    for (const page of pages) {
      expect(page.root.querySelector('meta[name="description"]')?.getAttribute('content'), page.route).toBeTruthy();
      expect(page.root.querySelector('meta[property="og:title"]'), page.route).not.toBeNull();
      expect(page.root.querySelector('meta[name="twitter:card"]'), page.route).not.toBeNull();
    }
  });

  it('gives every image explicit dimensions and alt text', () => {
    for (const page of pages) {
      for (const img of page.root.querySelectorAll('img')) {
        expect(img.getAttribute('width'), page.route).toBeTruthy();
        expect(img.getAttribute('height'), page.route).toBeTruthy();
        expect(img.getAttribute('alt')?.trim(), page.route).toBeTruthy();
      }
    }
  });

  it('ships no client JavaScript and no hydrated islands', () => {
    for (const page of pages) {
      expect(page.html).not.toContain('astro-island');
      expect(page.root.querySelectorAll('script:not([type="application/ld+json"])'), page.route).toHaveLength(0);
    }
  });

  it('keeps rendering escaped across every component', () => {
    const componentsDir = path.resolve(process.cwd(), 'src');
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.astro') ? [path.join(dir, e.name)] : []
      );
    for (const file of walk(componentsDir)) {
      expect(fs.readFileSync(file, 'utf-8'), file).not.toContain('set:html');
    }
  });

  it('does not emit NewsArticle structured data', () => {
    for (const page of pages) expect(page.html).not.toContain('NewsArticle');
  });

  it('renders future sports, metrics and graphics slots without fabricated values', () => {
    const { html, root } = readDistPage('/');
    expect(html).toContain('Próximo partido');
    expect(html).toContain('Tabla de posiciones');
    expect(html).toContain('Datos deportivos disponibles en próximos arcos.');
    const modules = new Set(root.querySelectorAll('[data-block="future-slot"]').map((s) => s.getAttribute('data-module')));
    expect(modules).toEqual(new Set(['DEP', 'MET', 'GRF']));

    for (const slot of root.querySelectorAll('[data-block="future-slot"]')) {
      expect(slot.text).not.toMatch(/\d/);
    }
    expect(html).not.toMatch(/Puntos:\s*\d+/);
    expect(html).not.toMatch(/Posición:\s*\d+/);
  });

  it('paginates the latest listing with consistent links', () => {
    const totalPages = Math.ceil(demoStories.length / 8);
    for (let page = 1; page <= totalPages; page++) {
      const { root } = readDistPage(routes.latest(page));
      expect(root.querySelector('[data-block="pagination"] [aria-current="page"]')?.text.trim()).toBe(String(page));
      expect(root.querySelectorAll('[data-block="river-list"] article').length).toBeGreaterThan(0);
    }
  });
});
