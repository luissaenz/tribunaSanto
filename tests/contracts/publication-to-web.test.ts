import { describe, it, expect } from 'vitest';
import {
  PublicationToWebPayloadSchema,
  type PublicationToWebPayload
} from '../../src/contracts/index.js';
import {
  type ArticleRef,
  type ArticleRevisionRef
} from '../../src/domain/index.js';
import {
  ARTICLE_REF,
  ARTICLE_REVISION_REF,
  CLAIM_REF,
  STORY_REF
} from '../domain/fixtures/refs.js';

describe('PUB -> WEB contract invariants', () => {
  function createValidPayload(): PublicationToWebPayload {
    return {
      articleRef: ARTICLE_REF,
      articleRevisionRef: ARTICLE_REVISION_REF,
      headline: 'San Martín confirmó su primer refuerzo para la temporada',
      dek: 'El mediocampista selló su vínculo contractual hasta diciembre de 2027.',
      body: 'En la sede oficial de La Ciudadela, la comisión directiva presentó formalmente...',
      byline: 'Tribuna Santo',
      publishedAt: '2026-10-02T12:00:00Z',
      modifiedAt: '2026-10-02T12:30:00Z'
    };
  }

  it('accepts a self-contained renderable public payload', () => {
    const payload = createValidPayload();
    const result = PublicationToWebPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);

    if (result.success) {
      const typed: PublicationToWebPayload = result.data;
      expect(typed.articleRef).toBe(ARTICLE_REF);
      expect(typed.articleRevisionRef).toBe(ARTICLE_REVISION_REF);
      expect(typed.headline).toBe(payload.headline);
      expect(typed.body).toBe(payload.body);
      expect(typed.byline).toBe('Tribuna Santo');
      expect(typed.publishedAt).toBe('2026-10-02T12:00:00Z');
      expect(typed.modifiedAt).toBe('2026-10-02T12:30:00Z');
    }
  });

  it('rejects public payloads without renderable body', () => {
    const payloadWithoutBody = {
      articleRef: ARTICLE_REF,
      articleRevisionRef: ARTICLE_REVISION_REF,
      headline: 'San Martín confirmó su primer refuerzo',
      byline: 'Tribuna Santo',
      publishedAt: '2026-10-02T12:00:00Z',
      modifiedAt: '2026-10-02T12:30:00Z'
    };

    const result = PublicationToWebPayloadSchema.safeParse(payloadWithoutBody);
    expect(result.success).toBe(false);
  });

  it('rejects upstream domain references in web payload', () => {
    const payload = createValidPayload();

    const withStoryRef = {
      ...payload,
      storyRef: STORY_REF
    };
    expect(PublicationToWebPayloadSchema.safeParse(withStoryRef).success).toBe(false);

    const withClaimRefs = {
      ...payload,
      claimRefs: [CLAIM_REF]
    };
    expect(PublicationToWebPayloadSchema.safeParse(withClaimRefs).success).toBe(false);
  });

  it('keeps article and revision reference types distinct at compile time', () => {
    const articleRef: ArticleRef = ARTICLE_REF;
    expect(articleRef).toBe(ARTICLE_REF);

    // @ts-expect-error ArticleRevisionRef must not be assignable to ArticleRef
    const invalidArticleRef: ArticleRef = ARTICLE_REVISION_REF;
    expect(invalidArticleRef).toBeDefined();

    const revisionRef: ArticleRevisionRef = ARTICLE_REVISION_REF;
    expect(revisionRef).toBe(ARTICLE_REVISION_REF);

    // @ts-expect-error ArticleRef must not be assignable to ArticleRevisionRef
    const invalidRevisionRef: ArticleRevisionRef = ARTICLE_REF;
    expect(invalidRevisionRef).toBeDefined();
  });

  it('does not introduce routing SEO or taxonomy fields', () => {
    const payload = createValidPayload();

    expect(
      PublicationToWebPayloadSchema.safeParse({
        ...payload,
        canonicalUrl: 'https://tribunasanto.local/noticias/refuerzo'
      }).success
    ).toBe(false);

    expect(
      PublicationToWebPayloadSchema.safeParse({
        ...payload,
        category: 'Futbol Masculino'
      }).success
    ).toBe(false);

    expect(
      PublicationToWebPayloadSchema.safeParse({
        ...payload,
        seo: { title: 'SEO Title' }
      }).success
    ).toBe(false);
  });
});
