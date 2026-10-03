import { describe, it, expect } from 'vitest';
import { demoArticles, demoPresentation, demoStories } from '../../src/data/demo-articles.js';
import { demoHomeComposition } from '../../src/data/demo-home.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';
import { PRESENTATION_ONLY_KEYS, joinStories } from '../../src/presentation/story.js';
import { SECTION_IDS, TOPIC_IDS } from '../../src/presentation/taxonomy.js';
import { resolveHome } from '../../src/presentation/composition.js';
import { demoAuthors } from '../../src/data/demo-authors.js';
import { storiesByAuthor, storiesInSection, storiesWithTopic } from '../../src/presentation/queries.js';
import { PAGE_SIZE } from '../../src/presentation/pagination.js';

// WEB.3 amplía las fixtures de WEB.2 a 40 notas (la densidad del golden master):
// refs 101–124 estables, 125–140 nuevas, 4 firmas ficticias y 24 temas.

const WEB1_STORIES = [
  'semana-clave-en-la-ciudadela',
  'variantes-en-el-mediocampo',
  'juveniles-ganan-espacio',
  'la-ciudadela-prepara-su-color',
  'trabajo-vespertino-con-pelota',
  'agenda-del-club',
  'claves-de-la-semana-del-santo'
];

describe('WEB.3 demo fixtures', () => {
  it('contains exactly 40 contract-valid demo articles with stable refs 101-140', () => {
    expect(demoArticles).toHaveLength(40);
    expect(demoArticles.map((a) => a.articleRef.slice(-3))).toEqual(Array.from({ length: 40 }, (_, i) => String(101 + i)));
    for (const article of demoArticles) {
      expect(PublicationToWebPayloadSchema.safeParse(article).success).toBe(true);
    }
  });

  it('keeps the seven WEB.1 articleRefs and demoIds stable', () => {
    for (const [i, demoId] of WEB1_STORIES.entries()) {
      const story = demoStories.find((s) => s.presentation.demoId === demoId);
      expect(story?.article.articleRef, demoId).toBe(`018f1000-0000-7000-8000-00000000010${i + 1}`);
      expect(story?.article.articleRevisionRef, demoId).toBe(`018f1000-0000-7000-8000-00000000020${i + 1}`);
    }
  });

  it('keeps editorial presentation outside the publication payload', () => {
    const contractKeys = Object.keys(PublicationToWebPayloadSchema.shape);
    for (const article of demoArticles) {
      for (const key of Object.keys(article)) expect(contractKeys).toContain(key);
      for (const forbidden of PRESENTATION_ONLY_KEYS) expect(Object.keys(article)).not.toContain(forbidden);
    }
  });

  it('joins articles and presentation one-to-one with unique ids', () => {
    expect(new Set(demoStories.map((s) => s.article.articleRef)).size).toBe(40);
    expect(new Set(demoStories.map((s) => s.presentation.demoId)).size).toBe(40);
    for (const story of demoStories) {
      expect(story.article.articleRef).toBe(story.presentation.articleRef);
    }
    expect(() => joinStories(demoArticles, demoPresentation.slice(1))).toThrow();
  });

  it('uses only local demo images with dimensions and alt text', () => {
    for (const { presentation } of demoStories) {
      expect(presentation.image.src.startsWith('/demo/img/')).toBe(true);
      expect(presentation.image.width / presentation.image.height).toBeCloseTo(800 / 533, 3);
      expect(presentation.image.alt.trim()).not.toBe('');
      expect(presentation.image.width).toBeGreaterThan(0);
      expect(presentation.image.height).toBeGreaterThan(0);
    }
  });

  it('assigns every story a section and exactly three distinct topics', () => {
    for (const { presentation } of demoStories) {
      expect(SECTION_IDS).toContain(presentation.sectionId);
      expect(new Set(presentation.topicIds).size).toBe(3);
      for (const topic of presentation.topicIds) expect(TOPIC_IDS).toContain(topic);
    }
  });

  it('distributes sections like the golden master (9/7/6/6/6/6, two paginated)', () => {
    const counts = Object.fromEntries(SECTION_IDS.map((id) => [id, storiesInSection(demoStories, id).length]));
    expect(counts).toEqual({ primera: 6, mercado: 6, juveniles: 9, club: 6, ciudadela: 6, memoria: 7 });
    expect(SECTION_IDS.filter((id) => counts[id] > PAGE_SIZE.section)).toEqual(['juveniles', 'memoria']);
  });

  it('distributes 24 topics: one paginated (>= 9), one with a single story, the rest 2-6', () => {
    const counts = TOPIC_IDS.map((id) => storiesWithTopic(demoStories, id).length);
    expect(TOPIC_IDS).toHaveLength(24);
    expect(counts.filter((c) => c >= 9)).toHaveLength(1);
    expect(counts.filter((c) => c === 1)).toHaveLength(1);
    expect(counts.filter((c) => c > 1 && c < 9).every((c) => c >= 2 && c <= 6)).toBe(true);
    expect(TOPIC_IDS.filter((id) => storiesWithTopic(demoStories, id).length > PAGE_SIZE.topic)).toEqual(['entrenamiento']);
  });

  it('signs every story with one of four fictitious authors (11/11/10/8)', () => {
    expect(demoAuthors).toHaveLength(4);
    const counts = demoAuthors.map((a) => storiesByAuthor(demoStories, a.byline).length);
    expect(counts).toEqual([11, 11, 10, 8]);
    expect(counts.filter((c) => c > PAGE_SIZE.author)).toHaveLength(3);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(demoStories.length);
  });

  it('keeps the temporary WEB.2 home composition resolvable during the migration', () => {
    const home = resolveHome(demoStories, demoHomeComposition);
    const reached = new Set(
      [
        home.lead,
        ...home.trending,
        ...home.picks,
        ...home.visual,
        ...home.latest,
        ...[...home.primaryBand, ...home.secondaryBand].flatMap((b) => b.stories)
      ].map((s) => s.article.articleRef)
    );
    expect(reached.size).toBeGreaterThanOrEqual(24);
    expect(new Set([...home.primaryBand, ...home.secondaryBand].map((b) => b.variant)).size).toBe(4);
  });
});
