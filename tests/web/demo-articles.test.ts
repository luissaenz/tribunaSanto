import { describe, it, expect } from 'vitest';
import {
  demoArticles,
  demoPresentation,
  demoStories
} from '../../src/data/demo-articles.js';
import { demoHomeComposition } from '../../src/data/demo-home.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';
import { PRESENTATION_ONLY_KEYS, joinStories } from '../../src/presentation/story.js';
import { SECTION_IDS, TOPIC_IDS } from '../../src/presentation/taxonomy.js';
import { resolveHome } from '../../src/presentation/composition.js';

describe('WEB demo fixtures invariants', () => {
  it('contains only contract-valid demo articles', () => {
    expect(demoArticles.length).toBeGreaterThanOrEqual(20);

    for (const article of demoArticles) {
      expect(PublicationToWebPayloadSchema.safeParse(article).success).toBe(true);
    }
  });

  it('keeps the seven WEB.1 articles and their URLs stable', () => {
    const web1 = [
      'semana-clave-en-la-ciudadela',
      'variantes-en-el-mediocampo',
      'juveniles-ganan-espacio',
      'la-ciudadela-prepara-su-color',
      'trabajo-vespertino-con-pelota',
      'agenda-del-club',
      'claves-de-la-semana-del-santo'
    ];
    for (const [i, demoId] of web1.entries()) {
      const story = demoStories.find((s) => s.presentation.demoId === demoId);
      expect(story?.article.articleRef).toBe(`018f1000-0000-7000-8000-00000000010${i + 1}`);
    }
  });

  it('keeps editorial presentation outside the publication payload', () => {
    for (const article of demoArticles) {
      const keys = Object.keys(article);
      for (const forbidden of PRESENTATION_ONLY_KEYS) {
        expect(keys).not.toContain(forbidden);
      }
    }
  });

  it('keeps demo ids and article refs unique and joined one-to-one', () => {
    expect(new Set(demoStories.map((s) => s.article.articleRef)).size).toBe(demoArticles.length);
    expect(new Set(demoStories.map((s) => s.presentation.demoId)).size).toBe(demoArticles.length);

    for (const story of demoStories) {
      expect(story.article.articleRef).toBe(story.presentation.articleRef);
      expect(story.presentation.demoId).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('rejects presentation that does not match the articles', () => {
    expect(() => joinStories(demoArticles, demoPresentation.slice(1))).toThrow();
    expect(() => joinStories(demoArticles, [...demoPresentation.slice(1), demoPresentation[1]])).toThrow();
  });

  it('uses only local demo assets with dimensions and alt text', () => {
    for (const story of demoStories) {
      const { image } = story.presentation;
      expect(image.src.startsWith('/demo/')).toBe(true);
      expect(image.alt.trim()).not.toBe('');
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
  });

  it('assigns every story a known section and at least one known topic', () => {
    for (const story of demoStories) {
      expect(SECTION_IDS).toContain(story.presentation.sectionId);
      expect(story.presentation.topicIds.length).toBeGreaterThan(0);
      for (const topic of story.presentation.topicIds) {
        expect(TOPIC_IDS).toContain(topic);
      }
    }
  });

  it('resolves the demo home composition', () => {
    const home = resolveHome(demoStories, demoHomeComposition);
    expect(home.lead.article.headline).toBe('La Ciudadela se prepara para una semana clave');
    expect(home.primaryBand.length + home.secondaryBand.length).toBe(SECTION_IDS.length);
  });
});
