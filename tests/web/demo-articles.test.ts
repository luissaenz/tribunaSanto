import { describe, it, expect } from 'vitest';
import { demoArticles, demoPresentation, demoStories } from '../../src/data/demo-articles.js';
import { demoHomeComposition } from '../../src/data/demo-home.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';
import { PRESENTATION_ONLY_KEYS, joinStories } from '../../src/presentation/story.js';
import { SECTION_IDS, TOPIC_IDS } from '../../src/presentation/taxonomy.js';
import { resolveHome } from '../../src/presentation/composition.js';

// WEB.2 reemplaza las invariantes de WEB.1 "exactamente 7 artículos" y
// "1 lead / 3 secondary / 3 latest" por 24 fixtures y reglas de composición.

const WEB1_STORIES = [
  'semana-clave-en-la-ciudadela',
  'variantes-en-el-mediocampo',
  'juveniles-ganan-espacio',
  'la-ciudadela-prepara-su-color',
  'trabajo-vespertino-con-pelota',
  'agenda-del-club',
  'claves-de-la-semana-del-santo'
];

describe('WEB.2 demo fixtures', () => {
  it('contains exactly 24 contract-valid demo articles', () => {
    expect(demoArticles).toHaveLength(24);
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
    expect(new Set(demoStories.map((s) => s.article.articleRef)).size).toBe(24);
    expect(new Set(demoStories.map((s) => s.presentation.demoId)).size).toBe(24);
    for (const story of demoStories) {
      expect(story.article.articleRef).toBe(story.presentation.articleRef);
    }
    expect(() => joinStories(demoArticles, demoPresentation.slice(1))).toThrow();
  });

  it('uses only local demo images with dimensions and alt text', () => {
    for (const { presentation } of demoStories) {
      expect(presentation.image.src.startsWith('/demo/')).toBe(true);
      expect(presentation.image.alt.trim()).not.toBe('');
      expect(presentation.image.width).toBeGreaterThan(0);
      expect(presentation.image.height).toBeGreaterThan(0);
    }
  });

  it('assigns every story a provisional section and at least one topic', () => {
    for (const { presentation } of demoStories) {
      expect(SECTION_IDS).toContain(presentation.sectionId);
      expect(presentation.topicIds.length).toBeGreaterThan(0);
      for (const topic of presentation.topicIds) expect(TOPIC_IDS).toContain(topic);
    }
    expect(new Set(demoStories.map((s) => s.presentation.sectionId)).size).toBe(6);
    expect(new Set(demoStories.flatMap((s) => s.presentation.topicIds)).size).toBe(10);
  });

  it('resolves a home composition that reaches all 24 stories', () => {
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
    expect(reached.size).toBe(24);
    expect(new Set([...home.primaryBand, ...home.secondaryBand].map((b) => b.variant)).size).toBe(4);
  });
});
