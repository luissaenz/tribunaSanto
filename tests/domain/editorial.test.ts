import { describe, it, expect } from 'vitest';
import {
  EventSchema,
  StorySchema,
  ArticleSchema,
  ArticleRevisionSchema
} from '../../src/domain/index.js';

describe('Editorial domain invariants', () => {
  const validEvent = {
    kind: 'EVENT',
    ref: 'evt-1',
    label: 'Firma de nuevo contrato',
    claimRefs: ['claim-1']
  };

  const validStory = {
    kind: 'STORY',
    ref: 'sty-1',
    workingTitle: 'Refuerzo clave para el Santo',
    angle: 'Impacto táctico de la nueva incorporación',
    eventRefs: ['evt-1'],
    claimRefs: ['claim-1'],
    entityRefs: ['ent-player-1']
  };

  const validArticle = {
    kind: 'ARTICLE',
    ref: 'art-1',
    storyRef: 'sty-1'
  };

  const validRevision = {
    kind: 'ARTICLE_REVISION',
    ref: 'rev-1',
    articleRef: 'art-1',
    revisionNumber: 1,
    headline: 'San Martín confirmó su nuevo refuerzo',
    dek: 'El mediocampista selló su vínculo con el club hasta 2027.',
    body: 'En la sede de La Ciudadela se llevó a cabo la firma oficial...',
    claimRefs: ['claim-1']
  };

  it('keeps Event Story Article and ArticleRevision structurally distinct', () => {
    // All parse with their own schemas
    expect(EventSchema.safeParse(validEvent).success).toBe(true);
    expect(StorySchema.safeParse(validStory).success).toBe(true);
    expect(ArticleSchema.safeParse(validArticle).success).toBe(true);
    expect(ArticleRevisionSchema.safeParse(validRevision).success).toBe(true);

    // Structural cross-parsing must be rejected
    expect(StorySchema.safeParse(validEvent).success).toBe(false);
    expect(ArticleSchema.safeParse(validStory).success).toBe(false);
    expect(ArticleRevisionSchema.safeParse(validArticle).success).toBe(false);
    expect(EventSchema.safeParse(validRevision).success).toBe(false);
    expect(ArticleSchema.safeParse(validEvent).success).toBe(false);
    expect(StorySchema.safeParse(validRevision).success).toBe(false);
  });

  it('requires Story to have factual grounding', () => {
    // Story without eventRefs and without claimRefs must fail
    const ungroundedStory = {
      kind: 'STORY',
      ref: 'sty-unfounded',
      workingTitle: 'Historia sin fuentes',
      angle: 'Especulación pura',
      eventRefs: [],
      claimRefs: [],
      entityRefs: ['ent-1']
    };
    expect(StorySchema.safeParse(ungroundedStory).success).toBe(false);

    // Story with only eventRefs passes
    const storyWithEvent = {
      kind: 'STORY',
      ref: 'sty-event',
      workingTitle: 'Historia con evento',
      angle: 'Ángulo',
      eventRefs: ['evt-1'],
      claimRefs: [],
      entityRefs: []
    };
    expect(StorySchema.safeParse(storyWithEvent).success).toBe(true);

    // Story with only claimRefs passes
    const storyWithClaim = {
      kind: 'STORY',
      ref: 'sty-claim',
      workingTitle: 'Historia con claim',
      angle: 'Ángulo',
      eventRefs: [],
      claimRefs: ['claim-1'],
      entityRefs: []
    };
    expect(StorySchema.safeParse(storyWithClaim).success).toBe(true);
  });

  it('requires positive ArticleRevision numbers', () => {
    // Positive revisionNumber passes
    expect(ArticleRevisionSchema.safeParse(validRevision).success).toBe(true);

    // Zero revisionNumber fails
    const zeroRev = { ...validRevision, revisionNumber: 0 };
    expect(ArticleRevisionSchema.safeParse(zeroRev).success).toBe(false);

    // Negative revisionNumber fails
    const negativeRev = { ...validRevision, revisionNumber: -1 };
    expect(ArticleRevisionSchema.safeParse(negativeRev).success).toBe(false);

    // Non-integer revisionNumber fails
    const floatRev = { ...validRevision, revisionNumber: 1.5 };
    expect(ArticleRevisionSchema.safeParse(floatRev).success).toBe(false);
  });
});
