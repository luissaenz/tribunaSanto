import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { demoStories } from '../../src/data/demo-articles.js';
import { firstParagraph } from '../../src/presentation/article-body.js';
import { pageFamilyBlocks } from '../../src/presentation/blocks.js';
import { LATEST_PAGE_SIZE, routes } from '../../src/presentation/routes.js';
import { sections, topics } from '../../src/presentation/taxonomy.js';
import { familyOf, isSubsequence, readDistPage, readDistPages, walkFiles } from '../support/dist.js';

// Reemplaza la suite estática de WEB.1: conserva sus invariantes (H1, landmarks,
// principal antes que secundarias, cuerpo desde el payload, vuelta a portada,
// sin islas, sin set:html, sin NewsArticle, placeholders sin datos) y agrega
// estructura por familia, densidad y paginación.

const pages = readDistPages();
const latestPages = Math.ceil(demoStories.length / LATEST_PAGE_SIZE);

describe('WEB.2 static render', () => {
  it('builds one static page per family route derived from demo data', () => {
    const counts: Record<string, number> = {};
    for (const page of pages) counts[familyOf(page.route)] = (counts[familyOf(page.route)] ?? 0) + 1;
    expect(counts).toEqual({
      home: 1,
      article: demoStories.length,
      section: sections.length,
      'section-page': 2,
      topic: topics.length,
      'topic-page': 1,
      author: 7,
      listing: latestPages,
      about: 1,
      contact: 1,
      careers: 1,
      legal: 3
    });

    const built = new Set(pages.map((p) => p.route));
    for (const story of demoStories) expect(built.has(routes.article(story))).toBe(true);
    for (const section of sections) expect(built.has(routes.section(section.id))).toBe(true);
    for (const topic of topics) expect(built.has(routes.topic(topic.id))).toBe(true);
    for (let n = 1; n <= latestPages; n++) expect(built.has(routes.latest(n))).toBe(true);
    expect(built.has(routes.about())).toBe(true);
  });

  it('renders the block sequence declared for each page family', () => {
    for (const page of pages) {
      const family = familyOf(page.route);
      const actual = page.root.querySelectorAll('[data-block]').map((el) => el.getAttribute('data-block')!);
      expect(isSubsequence(pageFamilyBlocks[family], actual), `${page.route} (${family}): ${actual.join(' > ')}`).toBe(true);
    }
  });

  it('renders exactly one h1 per page and never skips heading levels', () => {
    for (const page of pages) {
      const levels = page.root.querySelectorAll('h1, h2, h3, h4, h5, h6').map((h) => Number(h.tagName[1]));
      expect(levels.filter((l) => l === 1), page.route).toHaveLength(1);
      expect(levels[0], page.route).toBe(1);
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i] - levels[i - 1], `${page.route} heading #${i}`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('uses the masthead as home h1 and keeps semantic landmarks', () => {
    const { root } = readDistPage('/');
    expect(root.querySelector('h1')?.text.trim()).toBe('Tribuna Santo');
    for (const landmark of ['header', 'nav', 'main', 'footer', 'aside']) {
      expect(root.querySelector(landmark), landmark).not.toBeNull();
    }
  });

  it('renders the golden-master home: carousel, four section layouts, rails, photos and latest', () => {
    const { root } = readDistPage('/');
    const slides = root.querySelectorAll('[data-block="hero-carousel"] [data-part="slide"]');
    expect(slides).toHaveLength(3);
    for (const slide of slides) expect(slide.querySelector('h2 a')?.getAttribute('href')).toMatch(/^\/demo\//);
    expect(root.querySelector('[data-block="hero-carousel"]')?.getAttribute('x-data')).toBe('carousel(3)');
    for (const block of ['trending', 'section-b', 'section-c', 'section-d', 'popular-news', 'section-headlines', 'home-ad', 'photos', 'latest-grid']) {
      expect(root.querySelectorAll(`[data-block="${block}"]`), block).toHaveLength(1);
    }
    expect(root.querySelectorAll('[data-block="section-a"]').map((b) => b.getAttribute('data-slot'))).toEqual(['band2', 'band3a', 'band3b']);
    expect(root.querySelectorAll('[data-block="latest-grid"] article')).toHaveLength(9);
    expect(root.querySelectorAll('main article').length).toBeGreaterThanOrEqual(40);
  });

  it('keeps the carousel first and the photos rail before band-3 sections in DOM order', () => {
    const { html } = readDistPage('/');
    expect(html.indexOf('data-block="hero-carousel"')).toBeLessThan(html.indexOf('data-block="section-a"'));
    expect(html.indexOf('data-block="photos-rail"')).toBeLessThan(html.indexOf('data-slot="band3a"'));
    expect(html.indexOf(demoStories[0].article.headline)).toBeLessThan(html.indexOf('data-block="section-a"'));
  });

  it('renders article headline, dek, byline, time and body from the same payload', () => {
    for (const story of demoStories) {
      const { html, root } = readDistPage(routes.article(story));
      expect(root.querySelector('h1')?.text.trim()).toBe(story.article.headline);
      // Golden master: la bajada no se muestra en el hero; queda en la meta description.
      if (story.article.dek) expect(root.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(story.article.dek);
      expect(html).toContain(story.article.byline);
      expect(html).toContain(`datetime="${story.article.publishedAt}"`);
      expect(root.querySelector('[data-block="article-body"]')?.text).toContain(firstParagraph(story.article.body));
      expect(root.querySelectorAll('a[href="/"]').length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders the demo body convention as anchored h2 and blockquote', () => {
    const { root } = readDistPage(routes.article(demoStories[0]));
    const body = root.querySelector('[data-block="article-body"]')!;
    expect(body.querySelectorAll('h2[id]').map((h) => h.text.trim())).toEqual(['El plan de trabajo', 'Lo que se vive afuera']);
    expect(body.querySelector('blockquote')?.text).toContain('más de una respuesta preparada');
    expect(body.text).not.toMatch(/(^|\s)## /);
  });

  it('links topics to built topic pages and related stories to other articles', () => {
    for (const story of demoStories) {
      const { root } = readDistPage(routes.article(story));
      const tagHrefs = root.querySelectorAll('[data-block="article-tags"] a').map((a) => a.getAttribute('href'));
      expect(tagHrefs).toEqual(story.presentation.topicIds.map((t) => routes.topic(t)));
      const related = root.querySelectorAll('[data-block="related-articles"] h3 a').map((a) => a.getAttribute('href'));
      expect(related.length).toBeGreaterThan(0);
      expect(related).not.toContain(routes.article(story));
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

  it('emits no hydrated Astro islands', () => {
    for (const page of pages) expect(page.html, page.route).not.toContain('astro-island');
  });

  it('never renders raw HTML from components', () => {
    const astroFiles = walkFiles(path.resolve(process.cwd(), 'src')).filter((f) => f.endsWith('.astro'));
    expect(astroFiles.length).toBeGreaterThan(30);
    for (const file of astroFiles) expect(fs.readFileSync(file, 'utf-8'), file).not.toContain('set:html');
  });

  it('does not emit NewsArticle structured data', () => {
    for (const page of pages) expect(page.html, page.route).not.toContain('NewsArticle');
  });

  it('paginates the latest listing with a single current page', () => {
    for (let n = 1; n <= latestPages; n++) {
      const { root } = readDistPage(routes.latest(n));
      expect(root.querySelectorAll('[data-block="pagination"] [aria-current="page"]').map((e) => e.text.replace(/\s+/g, ' ').trim())).toEqual([`Página ${n}`]);
      expect(root.querySelectorAll('[data-block="river-list"] article').length).toBeGreaterThan(0);
    }
  });
});
