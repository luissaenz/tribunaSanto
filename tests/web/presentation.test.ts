import { describe, it, expect } from 'vitest';
import { ArticleRefSchema } from '../../src/domain/identity.js';
import { PublicationToWebPayloadSchema, type PublicationToWebPayload } from '../../src/contracts/index.js';
import { firstParagraph, parseArticleBody, readingMinutes, slugify } from '../../src/presentation/article-body.js';
import { HOME_ARITY, resolveHome, variantTake, type HomeComposition } from '../../src/presentation/composition.js';
import { editionInstant, newestFirst, relatedStories, sectionCounts } from '../../src/presentation/queries.js';
import { DEMO_NAMESPACE, routes } from '../../src/presentation/routes.js';
import { joinStories, RESERVED_DEMO_IDS, type StoryPresentation, type WebStory } from '../../src/presentation/story.js';
import { SECTION_IDS, TOPIC_IDS, sections, topics, type SectionId } from '../../src/presentation/taxonomy.js';
import { blockCatalog, pageFamilyBlocks } from '../../src/presentation/blocks.js';

// Historias sintéticas: la capa de presentación se prueba sin depender de fixtures demo.
const ref = (n: number) => ArticleRefSchema.parse(`018f2000-0000-7000-8000-${String(n).padStart(12, '0')}`);

function article(n: number, hour: number): PublicationToWebPayload {
  const at = `2026-09-30T${String(hour).padStart(2, '0')}:00:00-03:00`;
  return PublicationToWebPayloadSchema.parse({
    articleRef: ref(n),
    articleRevisionRef: `018f2000-0000-7000-8000-${String(n + 500).padStart(12, '0')}`,
    headline: `Titular sintético ${n}`,
    body: `Cuerpo ${n}.`,
    byline: 'Redacción de prueba',
    publishedAt: at,
    modifiedAt: at
  });
}

const layout: ReadonlyArray<readonly [SectionId, number]> = [
  ['primera', 5],
  ['mercado', 4],
  ['juveniles', 4],
  ['club', 4],
  ['ciudadela', 4],
  ['memoria', 3]
];

const articles: PublicationToWebPayload[] = [];
const presentation: StoryPresentation[] = [];
let n = 1;
for (const [sectionId, count] of layout) {
  for (let i = 0; i < count; i++, n++) {
    articles.push(article(n, n % 24));
    presentation.push({
      articleRef: articles[articles.length - 1].articleRef,
      demoId: `historia-${n}`,
      sectionId,
      topicIds: [TOPIC_IDS[n % TOPIC_IDS.length]],
      image: { src: '/demo/x.svg', alt: 'Ilustración', width: 800, height: 450 }
    });
  }
}
const stories: readonly WebStory[] = joinStories(articles, presentation);

const composition: HomeComposition = {
  lead: ref(1),
  trending: [ref(6), ref(10), ref(14), ref(18)],
  picks: [ref(7), ref(11), ref(15)],
  visual: [ref(19), ref(22)],
  primaryBand: [
    { sectionId: 'primera', variant: 'feature-list' },
    { sectionId: 'mercado', variant: 'feature-tiles' },
    { sectionId: 'juveniles', variant: 'headline-grid' },
    { sectionId: 'club', variant: 'list-feature' }
  ],
  secondaryBand: [
    { sectionId: 'ciudadela', variant: 'feature-list' },
    { sectionId: 'memoria', variant: 'feature-list' }
  ],
  latestCount: 9
};

describe('article body (DEMO-ONLY / PROVISIONAL convention)', () => {
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

  it('treats plain bodies as paragraphs and keeps markup as text', () => {
    expect(parseArticleBody('Uno.\n\nDos.').every((b) => b.type === 'paragraph')).toBe(true);
    expect(firstParagraph('## Título\n\nTexto.')).toBe('Texto.');
    expect(parseArticleBody('<script>alert(1)</script>')).toEqual([
      { type: 'paragraph', text: '<script>alert(1)</script>' }
    ]);
  });

  it('computes slugs and reading time', () => {
    expect(slugify('Qué se vive afuera')).toBe('que-se-vive-afuera');
    expect(readingMinutes('palabra '.repeat(401))).toBe(3);
    expect(readingMinutes('')).toBe(1);
  });
});

describe('story join', () => {
  it('rejects missing, reserved, malformed or off-namespace presentation', () => {
    expect(() => joinStories(articles, presentation.slice(1))).toThrow();
    for (const reserved of RESERVED_DEMO_IDS) {
      expect(() => joinStories(articles, [{ ...presentation[0], demoId: reserved }, ...presentation.slice(1)])).toThrow(/Reserved/);
    }
    expect(() => joinStories(articles, [{ ...presentation[0], demoId: 'Con Espacios' }, ...presentation.slice(1)])).toThrow(/Invalid/);
    const offNamespace = { ...presentation[0], image: { ...presentation[0].image, src: '/img/x.png' as `/demo/${string}` } };
    expect(() => joinStories(articles, [offNamespace, ...presentation.slice(1)])).toThrow(/outside/);
  });
});

describe('home composition', () => {
  it('enforces fixed slot arity', () => {
    expect(HOME_ARITY).toEqual({ trending: 4, picks: 3, visual: 2, primaryBand: 4, secondaryBand: 2, latestCount: 9 });
    expect(() => resolveHome(stories, { ...composition, picks: [ref(7)] })).toThrow(/picks/);
    expect(() => resolveHome(stories, { ...composition, latestCount: 3 })).toThrow(/latestCount/);
  });

  it('rejects unknown references, repeated lead and repeated sections', () => {
    expect(() => resolveHome(stories, { ...composition, lead: ref(999) })).toThrow(/unknown article/);
    expect(() =>
      resolveHome(stories, { ...composition, trending: [ref(1), ref(10), ref(14), ref(18)] })
    ).toThrow(/Lead story/);
    expect(() =>
      resolveHome(stories, {
        ...composition,
        secondaryBand: [
          { sectionId: 'primera', variant: 'feature-list' },
          { sectionId: 'memoria', variant: 'feature-list' }
        ]
      })
    ).toThrow(/once/);
  });

  it('sizes variants so grids never leave holes', () => {
    expect(variantTake('feature-tiles', 4)).toBe(3);
    expect(variantTake('feature-tiles', 5)).toBe(5);
    expect(variantTake('feature-tiles', 2)).toBe(0);
    expect(variantTake('headline-grid', 4)).toBe(3);
    expect(variantTake('headline-grid', 7)).toBe(6);
    expect(variantTake('feature-list', 3)).toBe(3);
    expect(variantTake('list-feature', 9)).toBe(5);
    expect(variantTake('list-feature', 2)).toBe(0);
  });

  it('never repeats the lead inside section blocks', () => {
    const home = resolveHome(stories, composition);
    for (const block of [...home.primaryBand, ...home.secondaryBand]) {
      expect(block.stories.map((s) => s.article.articleRef)).not.toContain(home.lead.article.articleRef);
      expect(block.stories.every((s) => s.presentation.sectionId === block.sectionId)).toBe(true);
    }
    expect(home.latest).toEqual(newestFirst(stories).slice(0, 9));
  });
});

describe('queries, routes and catalog', () => {
  it('ranks related stories by section and excludes the story itself', () => {
    const story = stories[1];
    const related = relatedStories(stories, story, 3);
    expect(related.map((s) => s.article.articleRef)).not.toContain(story.article.articleRef);
    expect(related.every((s) => s.presentation.sectionId === story.presentation.sectionId)).toBe(true);
  });

  it('counts per section and derives the edition from data, not the clock', () => {
    expect(sectionCounts(stories).reduce((sum, c) => sum + c.count, 0)).toBe(stories.length);
    expect(editionInstant(stories)).toBe(newestFirst(stories)[0].article.publishedAt);
  });

  it('keeps every non-home route inside the /demo/ namespace', () => {
    expect(routes.home()).toBe('/');
    const all = [
      routes.article(stories[0]),
      routes.about(),
      routes.latest(1),
      routes.latest(3),
      ...sections.map((s) => routes.section(s.id)),
      ...topics.map((t) => routes.topic(t.id))
    ];
    for (const route of all) {
      expect(route.startsWith(DEMO_NAMESPACE), route).toBe(true);
      expect(route.endsWith('/'), route).toBe(true);
    }
    expect(routes.section('ciudadela')).toBe('/demo/seccion/la-ciudadela/');
    expect(routes.latest(1)).toBe('/demo/ultimas/');
    expect(routes.latest(2)).toBe('/demo/ultimas/2/');
    expect(SECTION_IDS).toHaveLength(6);
    expect(TOPIC_IDS).toHaveLength(10);
  });

  it('declares block sequences only with catalog blocks', () => {
    const ids = new Set<string>(blockCatalog.map((b) => b.id));
    for (const sequence of Object.values(pageFamilyBlocks)) {
      for (const id of sequence) expect(ids.has(id), id).toBe(true);
    }
    expect(JSON.stringify(blockCatalog)).not.toMatch(/corpus/i);
  });
});
