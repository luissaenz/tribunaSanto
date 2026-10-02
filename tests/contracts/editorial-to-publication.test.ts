import { describe, it, expect } from 'vitest';
import {
  EditorialToPublicationPayloadSchema,
  type EditorialToPublicationPayload
} from '../../src/contracts/index.js';
import {
  ARTICLE_REF,
  ARTICLE_REVISION_REF,
  CLAIM_REF,
  STORY_REF
} from '../domain/fixtures/refs.js';

describe('RED -> PUB contract invariants', () => {
  const validRevision = {
    kind: 'ARTICLE_REVISION' as const,
    ref: ARTICLE_REVISION_REF,
    articleRef: ARTICLE_REF,
    revisionNumber: 1,
    headline: 'San Martín confirmó su primer refuerzo para la temporada',
    dek: 'El mediocampista selló su vínculo contractual hasta diciembre de 2027.',
    body: 'En la sede oficial de La Ciudadela, la comisión directiva presentó formalmente...',
    claimRefs: [CLAIM_REF]
  };

  it('accepts an exact article revision with byline', () => {
    const payload = {
      revision: validRevision,
      byline: 'Tribuna Santo'
    };

    const result = EditorialToPublicationPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);

    if (result.success) {
      const typed: EditorialToPublicationPayload = result.data;
      expect(typed.revision.revisionNumber).toBe(1);
      expect(typed.revision.headline).toBe(validRevision.headline);
      expect(typed.byline).toBe('Tribuna Santo');
    }
  });

  it('rejects publication candidates without revision content', () => {
    const incompleteRevision = {
      ref: ARTICLE_REVISION_REF,
      articleRef: ARTICLE_REF
    };

    const payload = {
      revision: incompleteRevision,
      byline: 'Tribuna Santo'
    };

    const result = EditorialToPublicationPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects an empty byline', () => {
    const emptyByline = {
      revision: validRevision,
      byline: ''
    };
    expect(EditorialToPublicationPayloadSchema.safeParse(emptyByline).success).toBe(false);

    const whitespaceByline = {
      revision: validRevision,
      byline: '   '
    };
    expect(EditorialToPublicationPayloadSchema.safeParse(whitespaceByline).success).toBe(false);
  });

  it('rejects upstream knowledge leaking into publication', () => {
    const withClaims = {
      revision: validRevision,
      byline: 'Tribuna Santo',
      claims: [
        {
          ref: CLAIM_REF,
          predicate: 'founded_in'
        }
      ]
    };
    expect(EditorialToPublicationPayloadSchema.safeParse(withClaims).success).toBe(false);

    const withStory = {
      revision: validRevision,
      byline: 'Tribuna Santo',
      story: {
        ref: STORY_REF,
        workingTitle: 'Historia'
      }
    };
    expect(EditorialToPublicationPayloadSchema.safeParse(withStory).success).toBe(false);
  });
});
