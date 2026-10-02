import { describe, it, expect } from 'vitest';
import { firstParagraph, parseArticleBody, readingMinutes, slugify } from '../../src/presentation/article-body.js';
import { resolveHome, type HomeComposition } from '../../src/presentation/composition.js';
import { relatedStories, sectionCounts, editionInstant, newestFirst } from '../../src/presentation/queries.js';
import { routes } from '../../src/presentation/routes.js';
import { demoRef, demoStories } from '../../src/data/demo-articles.js';
import { demoHomeComposition } from '../../src/data/demo-home.js';

describe('article body structure', () => {
  it('parses paragraphs, subheadings and attributed quotes', () => {
    const blocks = parseArticleBody(`Primer párrafo
en dos líneas.

## Un subtítulo

> Una cita
> que sigue.
> — Fuente ficticia

## Un subtítulo

Cierre.`);

    expect(blocks).toEqual([
      { type: 'paragraph', text: 'Primer párrafo en dos líneas.' },
      { type: 'subheading', text: 'Un subtítulo', id: 'un-subtitulo' },
      { type: 'quote', text: 'Una cita que sigue.', attribution: 'Fuente ficticia' },
      { type: 'subheading', text: 'Un subtítulo', id: 'un-subtitulo-2' },
      { type: 'paragraph', text: 'Cierre.' }
    ]);
  });

  it('treats plain WEB.1 bodies as paragraphs only', () => {
    const blocks = parseArticleBody('Uno.\n\nDos.');
    expect(blocks.every((b) => b.type === 'paragraph')).toBe(true);
    expect(firstParagraph('## Título\n\nTexto.')).toBe('Texto.');
  });

  it('keeps markup-like text as plain text', () => {
    const [block] = parseArticleBody('<script>alert(1)</script>');
    expect(block).toEqual({ type: 'paragraph', text: '<script>alert(1)</script>' });
  });

  it('computes slugs and reading time', () => {
    expect(slugify('Qué se vive afuera')).toBe('que-se-vive-afuera');
    expect(readingMinutes('palabra '.repeat(401))).toBe(3);
    expect(readingMinutes('')).toBe(1);
  });
});

describe('home composition', () => {
  it('rejects unknown references and repeated lead', () => {
    const unknown: HomeComposition = { ...demoHomeComposition, lead: '018f1000-0000-7000-8000-000000000999' as HomeComposition['lead'] };
    expect(() => resolveHome(demoStories, unknown)).toThrow(/unknown article/);

    const repeated: HomeComposition = { ...demoHomeComposition, trending: [demoHomeComposition.lead] };
    expect(() => resolveHome(demoStories, repeated)).toThrow(/Lead story/);
  });

  it('rejects a section repeated across bands', () => {
    const duplicated: HomeComposition = {
      ...demoHomeComposition,
      secondaryBand: [{ sectionId: 'primera', variant: 'feature-list' }]
    };
    expect(() => resolveHome(demoStories, duplicated)).toThrow(/once/);
  });

  it('never repeats the lead inside section blocks and caps block size', () => {
    const home = resolveHome(demoStories, demoHomeComposition);
    for (const block of [...home.primaryBand, ...home.secondaryBand]) {
      expect(block.stories.map((s) => s.article.articleRef)).not.toContain(home.lead.article.articleRef);
      expect(block.stories.every((s) => s.presentation.sectionId === block.sectionId)).toBe(true);
      expect(block.stories.length).toBeGreaterThanOrEqual(3);
    }
    expect(home.latest).toEqual(newestFirst(demoStories).slice(0, demoHomeComposition.latestCount));
  });
});

describe('queries and routes', () => {
  it('ranks related stories by section, then topics, excluding the story itself', () => {
    const story = demoStories.find((s) => s.article.articleRef === demoRef(109))!;
    const related = relatedStories(demoStories, story, 3);
    expect(related).toHaveLength(3);
    expect(related.map((s) => s.article.articleRef)).not.toContain(story.article.articleRef);
    expect(related.every((s) => s.presentation.sectionId === 'mercado')).toBe(true);
  });

  it('counts stories per section and derives the edition from data, not the clock', () => {
    const total = sectionCounts(demoStories).reduce((sum, c) => sum + c.count, 0);
    expect(total).toBe(demoStories.length);
    expect(editionInstant(demoStories)).toBe('2026-10-02T12:00:00-03:00');
  });

  it('builds trailing-slash internal routes', () => {
    expect(routes.section('ciudadela')).toBe('/seccion/la-ciudadela/');
    expect(routes.topic('cuerpo-tecnico')).toBe('/tema/cuerpo-tecnico/');
    expect(routes.latest(1)).toBe('/ultimas/');
    expect(routes.latest(3)).toBe('/ultimas/3/');
  });
});
