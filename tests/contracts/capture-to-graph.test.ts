import { describe, it, expect } from 'vitest';
import {
  CaptureToGraphPayloadSchema,
  type CaptureToGraphPayload
} from '../../src/contracts/index.js';
import {
  SOURCE_REF,
  SOURCE_DOCUMENT_REF,
  ARTICLE_REF,
  STORY_REF
} from '../domain/fixtures/refs.js';

describe('CAP -> GRF contract invariants', () => {
  const validSourceDocument = {
    kind: 'SOURCE_DOCUMENT' as const,
    ref: SOURCE_DOCUMENT_REF,
    sourceRef: SOURCE_REF,
    title: 'San Martín entrena en La Ciudadela',
    content: 'El plantel profesional completó una nueva jornada preparatoria.',
    publishedAt: '2026-10-02T10:00:00Z'
  };

  it('accepts a captured source document snapshot', () => {
    const payload = {
      document: validSourceDocument
    };

    const result = CaptureToGraphPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);

    if (result.success) {
      const typedPayload: CaptureToGraphPayload = result.data;
      expect(typedPayload.document.kind).toBe('SOURCE_DOCUMENT');
      expect(typedPayload.document.ref).toBe(SOURCE_DOCUMENT_REF);
      expect(typedPayload.documentExternalIdentity).toBeUndefined();
    }
  });

  it('accepts an optional document external identity', () => {
    const payload = {
      document: validSourceDocument,
      documentExternalIdentity: {
        provider: 'rss',
        externalId: 'item-123'
      }
    };

    const result = CaptureToGraphPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.documentExternalIdentity).toEqual({
        provider: 'rss',
        externalId: 'item-123'
      });
    }
  });

  it('rejects editorial data crossing CAP to GRF', () => {
    const withArticle = {
      document: validSourceDocument,
      article: {
        kind: 'ARTICLE',
        ref: ARTICLE_REF,
        storyRef: STORY_REF
      }
    };
    expect(CaptureToGraphPayloadSchema.safeParse(withArticle).success).toBe(false);

    const withStory = {
      document: validSourceDocument,
      story: {
        kind: 'STORY',
        ref: STORY_REF,
        workingTitle: 'Título no permitido',
        angle: 'Ángulo no permitido'
      }
    };
    expect(CaptureToGraphPayloadSchema.safeParse(withStory).success).toBe(false);
  });
});
