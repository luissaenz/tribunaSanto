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
  it('builds exactly 45 static pages: 1 home, 24 articles, 6 sections, 10 topics, 3 latest, 1 about', () => {
    expect(pages).toHaveLength(45);
    const counts: Record<string, number> = {};
    for (const page of pages) counts[familyOf(page.route)] = (counts[familyOf(page.route)] ?? 0) + 1;
    expect(counts).toEqual({ home: 1, article: 24, section: 6, topic: 10, listing: 3, institutional: 1 });
    expect(latestPages).toBe(3);

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

  it('makes the home dense and reaches every demo story from it', () => {
    const { root } = readDistPage('/');
    const linked = new Set(root.querySelectorAll('main a[href^="/demo/"]').map((a) => a.getAttribute('href')));
    for (const story of demoStories) expect(linked.has(routes.article(story)), story.presentation.demoId).toBe(true);
    expect(root.querySelectorAll('main article').length).toBeGreaterThanOrEqual(40);

    const blocks = root.querySelectorAll('[data-block="section-block"]');
    expect(blocks).toHaveLength(6);
    expect(new Set(blocks.map((b) => b.getAttribute('data-variant')))).toEqual(
      new Set(['feature-list', 'feature-tiles', 'headline-grid', 'list-feature'])
    );
  });

  it('renders the lead story before section blocks in DOM order', () => {
    const { html } = readDistPage('/');
    const lead = html.indexOf('data-block="lead-story"');
    expect(lead).toBeGreaterThan(-1);
    expect(lead).toBeLessThan(html.indexOf('data-block="section-block"'));
    expect(html.indexOf(demoStories[0].article.headline)).toBeLessThan(html.indexOf('data-block="section-block"'));
  });

  it('renders article headline, dek, byline, time and body from the same payload', () => {
    for (const story of demoStories) {
      const { html, root } = readDistPage(routes.article(story));
      expect(root.querySelector('h1')?.text.trim()).toBe(story.article.headline);
      if (story.article.dek) expect(html).toContain(story.article.dek);
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
      const related = root.querySelectorAll('[data-block="related-stories"] h3 a').map((a) => a.getAttribute('href'));
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

  it('renders DEP, MET and GRF placeholders without values', () => {
    const { html, root } = readDistPage('/');
    expect(html).toContain('Próximo partido');
    expect(html).toContain('Tabla de posiciones');
    expect(html).toContain('Datos deportivos disponibles en próximos arcos.');
    const modules = root.querySelectorAll('[data-block="future-slot"]').map((s) => s.getAttribute('data-module'));
    expect(new Set(modules)).toEqual(new Set(['DEP', 'MET', 'GRF']));
    for (const slot of root.querySelectorAll('[data-block="future-slot"]')) expect(slot.text).not.toMatch(/\d/);
  });

  it('paginates the latest listing with a single current page', () => {
    for (let n = 1; n <= latestPages; n++) {
      const { root } = readDistPage(routes.latest(n));
      expect(root.querySelectorAll('[data-block="pagination"] [aria-current="page"]').map((e) => e.text.trim())).toEqual([String(n)]);
      expect(root.querySelectorAll('[data-block="river-list"] article').length).toBeGreaterThan(0);
    }
  });
});
