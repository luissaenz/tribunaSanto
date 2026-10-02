import { describe, it, expect } from 'vitest';
import {
  ClaimRefSchema,
  EntityRefSchema,
  DomainRefSchema,
  ExternalIdentitySchema,
  type ClaimRef,
  type DomainRef,
  type Event,
  generateSourceRef,
  generateSourceDocumentRef,
  generateClaimRef,
  generateEntityRef,
  generateEventRef,
  generateRelationRef,
  generateStoryRef,
  generateArticleRef,
  generateArticleRevisionRef,
  SourceRefSchema,
  SourceDocumentRefSchema,
  EventRefSchema,
  RelationRefSchema,
  StoryRefSchema,
  ArticleRefSchema,
  ArticleRevisionRefSchema
} from '../../src/domain/index.js';
import {
  EVENT_REF,
  CLAIM_REF,
  STORY_REF
} from './fixtures/refs.js';

describe('Global identity invariants', () => {
  it('accepts UUIDv7 internal refs and rejects invalid UUIDs', () => {
    const validUuidV7 = '018f0000-0000-7000-8000-000000000003';
    const validResult = ClaimRefSchema.safeParse(validUuidV7);
    expect(validResult.success).toBe(true);

    const invalidResult = ClaimRefSchema.safeParse('not-a-uuid');
    expect(invalidResult.success).toBe(false);
  });

  it('rejects non-v7 UUIDs as internal refs', () => {
    const uuidV4 = '550e8400-e29b-41d4-a716-446655440000';
    const result = ClaimRefSchema.safeParse(uuidV4);
    expect(result.success).toBe(false);
  });

  it('rejects external identifiers as internal refs', () => {
    const externalId1 = EntityRefSchema.safeParse('club-211');
    expect(externalId1.success).toBe(false);

    const externalId2 = EntityRefSchema.safeParse('provider:211');
    expect(externalId2.success).toBe(false);
  });

  it('generates valid UUIDv7 references centrally', () => {
    const generators = [
      { gen: generateSourceRef, schema: SourceRefSchema },
      { gen: generateSourceDocumentRef, schema: SourceDocumentRefSchema },
      { gen: generateClaimRef, schema: ClaimRefSchema },
      { gen: generateEntityRef, schema: EntityRefSchema },
      { gen: generateEventRef, schema: EventRefSchema },
      { gen: generateRelationRef, schema: RelationRefSchema },
      { gen: generateStoryRef, schema: StoryRefSchema },
      { gen: generateArticleRef, schema: ArticleRefSchema },
      { gen: generateArticleRevisionRef, schema: ArticleRevisionRefSchema }
    ];

    for (const { gen, schema } of generators) {
      const ref = gen();
      expect(typeof ref).toBe('string');
      expect(schema.safeParse(ref).success).toBe(true);
      expect(DomainRefSchema.safeParse(ref).success).toBe(true);
    }
  });

  it('keeps reference concepts distinct at compile time', () => {
    const claimRef = ClaimRefSchema.parse('018f0000-0000-7000-8000-000000000003');
    const storyRef = StoryRefSchema.parse('018f0000-0000-7000-8000-000000000009');

    const validClaimRef: ClaimRef = claimRef;
    expect(validClaimRef).toBe(claimRef);

    // @ts-expect-error StoryRef must not be assignable to ClaimRef
    const invalidClaimRef: ClaimRef = storyRef;
    expect(invalidClaimRef).toBeDefined();

    const validEvent: Event = {
      kind: 'EVENT',
      ref: EVENT_REF,
      label: 'Evento válido',
      claimRefs: [CLAIM_REF],
      entityRefs: []
    };
    expect(validEvent).toBeDefined();

    const storyRefForInvalidEvent = STORY_REF;

    const invalidEvent: Event = {
      kind: 'EVENT',
      ref: EVENT_REF,
      label: 'Evento inválido',
      // @ts-expect-error Event.claimRefs must only accept ClaimRef
      claimRefs: [storyRefForInvalidEvent],
      entityRefs: []
    };
    expect(invalidEvent).toBeDefined();
  });

  it('allows typed refs in polymorphic DomainRef contexts', () => {
    const sourceRef = generateSourceRef();
    const claimRef = generateClaimRef();
    const entityRef = generateEntityRef();

    const domainRef1: DomainRef = sourceRef;
    const domainRef2: DomainRef = claimRef;
    const domainRef3: DomainRef = entityRef;

    expect(DomainRefSchema.safeParse(domainRef1).success).toBe(true);
    expect(DomainRefSchema.safeParse(domainRef2).success).toBe(true);
    expect(DomainRefSchema.safeParse(domainRef3).success).toBe(true);
  });

  it('keeps provider inside external identity', () => {
    const externalA = ExternalIdentitySchema.parse({
      provider: 'provider-a',
      externalId: '211'
    });

    const externalB = ExternalIdentitySchema.parse({
      provider: 'provider-b',
      externalId: '211'
    });

    expect(externalA.provider).toBe('provider-a');
    expect(externalB.provider).toBe('provider-b');
    expect(externalA).not.toEqual(externalB);
  });

  it('rejects incomplete external identities', () => {
    expect(ExternalIdentitySchema.safeParse({ externalId: '211' }).success).toBe(false);
    expect(ExternalIdentitySchema.safeParse({ provider: 'provider-a' }).success).toBe(false);
    expect(ExternalIdentitySchema.safeParse({ provider: '', externalId: '211' }).success).toBe(false);
    expect(ExternalIdentitySchema.safeParse({ provider: 'provider-a', externalId: '' }).success).toBe(false);
  });
});
