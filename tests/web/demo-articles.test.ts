import { describe, it, expect } from 'vitest';
import {
  demoArticles,
  demoStories
} from '../../src/data/demo-articles.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';

describe('WEB.1 demo fixtures invariants', () => {
  it('contains exactly seven contract-valid demo articles', () => {
    expect(demoArticles).toHaveLength(7);

    for (const article of demoArticles) {
      const result = PublicationToWebPayloadSchema.safeParse(article);
      expect(result.success).toBe(true);
    }
  });

  it('keeps editorial presentation outside the publication payload', () => {
    const forbiddenPresentationKeys = [
      'role',
      'demoId',
      'provisionalTag',
      'image',
      'category',
      'slug'
    ];

    for (const article of demoArticles) {
      const keys = Object.keys(article);
      for (const forbidden of forbiddenPresentationKeys) {
        expect(keys).not.toContain(forbidden);
      }
    }
  });

  it('uses exactly one lead three secondary and three latest placements', () => {
    const leadStories = demoStories.filter((s) => s.presentation.role === 'lead');
    const secondaryStories = demoStories.filter((s) => s.presentation.role === 'secondary');
    const latestStories = demoStories.filter((s) => s.presentation.role === 'latest');

    expect(leadStories).toHaveLength(1);
    expect(secondaryStories).toHaveLength(3);
    expect(latestStories).toHaveLength(3);
  });

  it('keeps demo ids and article refs unique', () => {
    const articleRefs = demoStories.map((s) => s.article.articleRef);
    const demoIds = demoStories.map((s) => s.presentation.demoId);

    expect(new Set(articleRefs).size).toBe(7);
    expect(new Set(demoIds).size).toBe(7);
  });

  it('maps every presentation to exactly one article', () => {
    expect(demoStories).toHaveLength(7);

    for (const story of demoStories) {
      expect(story.article.articleRef).toBe(story.presentation.articleRef);
    }
  });

  it('uses only local demo assets', () => {
    for (const story of demoStories) {
      expect(story.presentation.image.src.startsWith('/demo/')).toBe(true);
      expect(story.presentation.image.alt).toBeTruthy();
    }
  });
});
