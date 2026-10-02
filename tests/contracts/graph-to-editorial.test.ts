import { describe, it, expect } from 'vitest';
import {
  GraphToEditorialPayloadSchema,
  type GraphToEditorialPayload
} from '../../src/contracts/index.js';
import {
  generateClaimRef,
  generateEntityRef,
  generateEventRef
} from '../../src/domain/index.js';
import {
  STORY_REF,
  CLAIM_REF,
  CLAIM_REF_2,
  ENTITY_REF,
  ENTITY_REF_2,
  EVENT_REF,
  RELATION_REF,
  SOURCE_DOCUMENT_REF
} from '../domain/fixtures/refs.js';

describe('GRF -> RED contract invariants', () => {
  const validEntity1 = {
    kind: 'ENTITY' as const,
    ref: ENTITY_REF,
    entityKind: 'TEAM' as const,
    name: 'San Martín de Tucumán'
  };

  const validEntity2 = {
    kind: 'ENTITY' as const,
    ref: ENTITY_REF_2,
    entityKind: 'STADIUM' as const,
    name: 'La Ciudadela'
  };

  const validEvent = {
    kind: 'EVENT' as const,
    ref: EVENT_REF,
    label: 'Firma de contrato de refuerzo',
    claimRefs: [CLAIM_REF],
    entityRefs: [ENTITY_REF],
    time: {
      type: 'INSTANT' as const,
      value: '2026-10-02T10:00:00Z'
    }
  };

  const validClaim1 = {
    kind: 'CLAIM' as const,
    ref: CLAIM_REF,
    subject: {
      kind: 'ENTITY' as const,
      ref: ENTITY_REF
    },
    predicate: 'founded_in',
    value: {
      type: 'TEXT' as const,
      value: '1909'
    },
    contextEntityRefs: [],
    evidence: [
      {
        type: 'SOURCE_DOCUMENT' as const,
        sourceDocumentRef: SOURCE_DOCUMENT_REF
      }
    ],
    epistemicState: 'FACT' as const
  };

  const validClaim2 = {
    kind: 'CLAIM' as const,
    ref: CLAIM_REF_2,
    subject: {
      kind: 'EVENT' as const,
      ref: EVENT_REF
    },
    predicate: 'held_at_venue',
    value: {
      type: 'ENTITY_REF' as const,
      ref: ENTITY_REF_2
    },
    contextEntityRefs: [ENTITY_REF],
    evidence: [
      {
        type: 'STRUCTURED_DATA' as const,
        source: 'afa-records',
        recordRef: 'rec-2026'
      }
    ],
    epistemicState: 'FACT' as const
  };

  const validStory = {
    kind: 'STORY' as const,
    ref: STORY_REF,
    workingTitle: 'Refuerzo clave para el Santo',
    angle: 'Impacto táctico del nuevo mediocampista',
    eventRefs: [EVENT_REF],
    claimRefs: [CLAIM_REF, CLAIM_REF_2],
    entityRefs: [ENTITY_REF, ENTITY_REF_2]
  };

  function createValidPayload(): GraphToEditorialPayload {
    return {
      story: validStory,
      claims: [validClaim1, validClaim2],
      entities: [validEntity1, validEntity2],
      events: [validEvent]
    };
  }

  it('accepts a self-contained editorial context', () => {
    const payload = createValidPayload();
    const result = GraphToEditorialPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.story.ref).toBe(STORY_REF);
      expect(result.data.claims).toHaveLength(2);
      expect(result.data.entities).toHaveLength(2);
      expect(result.data.events).toHaveLength(1);
    }
  });

  it('rejects missing claim snapshots referenced by the story', () => {
    const missingClaimRef = generateClaimRef();
    const payload = {
      ...createValidPayload(),
      story: {
        ...validStory,
        claimRefs: [...validStory.claimRefs, missingClaimRef]
      }
    };

    const result = GraphToEditorialPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects missing event snapshots referenced by the story', () => {
    const missingEventRef = generateEventRef();
    const payload = {
      ...createValidPayload(),
      story: {
        ...validStory,
        eventRefs: [...validStory.eventRefs, missingEventRef]
      }
    };

    const result = GraphToEditorialPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects missing entity snapshots referenced by the story', () => {
    const missingEntityRef = generateEntityRef();
    const payload = {
      ...createValidPayload(),
      story: {
        ...validStory,
        entityRefs: [...validStory.entityRefs, missingEntityRef]
      }
    };

    const result = GraphToEditorialPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects incomplete event dependencies', () => {
    const unlistedClaimRef = generateClaimRef();
    const payloadWithUnlistedClaimInEvent = {
      ...createValidPayload(),
      events: [
        {
          ...validEvent,
          claimRefs: [unlistedClaimRef]
        }
      ]
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse(payloadWithUnlistedClaimInEvent).success
    ).toBe(false);

    const unlistedEntityRef = generateEntityRef();
    const payloadWithUnlistedEntityInEvent = {
      ...createValidPayload(),
      events: [
        {
          ...validEvent,
          entityRefs: [unlistedEntityRef]
        }
      ]
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse(payloadWithUnlistedEntityInEvent).success
    ).toBe(false);
  });

  it('rejects incomplete claim subjects and entity references', () => {
    const unlistedEntityRef = generateEntityRef();
    const unlistedEventRef = generateEventRef();

    // 1. ClaimSubject ENTITY unlisted
    const claimWithUnlistedSubjectEntity = {
      ...validClaim1,
      subject: {
        kind: 'ENTITY' as const,
        ref: unlistedEntityRef
      }
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse({
        ...createValidPayload(),
        claims: [claimWithUnlistedSubjectEntity, validClaim2]
      }).success
    ).toBe(false);

    // 2. ClaimSubject EVENT unlisted
    const claimWithUnlistedSubjectEvent = {
      ...validClaim2,
      subject: {
        kind: 'EVENT' as const,
        ref: unlistedEventRef
      }
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse({
        ...createValidPayload(),
        claims: [validClaim1, claimWithUnlistedSubjectEvent]
      }).success
    ).toBe(false);

    // 3. contextEntityRefs unlisted
    const claimWithUnlistedContextEntity = {
      ...validClaim2,
      contextEntityRefs: [unlistedEntityRef]
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse({
        ...createValidPayload(),
        claims: [validClaim1, claimWithUnlistedContextEntity]
      }).success
    ).toBe(false);

    // 4. ClaimValue ENTITY_REF unlisted
    const claimWithUnlistedValueEntity = {
      ...validClaim2,
      value: {
        type: 'ENTITY_REF' as const,
        ref: unlistedEntityRef
      }
    };
    expect(
      GraphToEditorialPayloadSchema.safeParse({
        ...createValidPayload(),
        claims: [validClaim1, claimWithUnlistedValueEntity]
      }).success
    ).toBe(false);
  });

  it('rejects unresolved claim derivations', () => {
    const unlistedClaimRef = generateClaimRef();
    const derivedClaimRef = generateClaimRef();

    const derivedClaim = {
      kind: 'CLAIM' as const,
      ref: derivedClaimRef,
      subject: {
        kind: 'ENTITY' as const,
        ref: ENTITY_REF
      },
      predicate: 'projected_performance',
      value: {
        type: 'TEXT' as const,
        value: 'High'
      },
      contextEntityRefs: [],
      evidence: [
        {
          type: 'CLAIM_DERIVATION' as const,
          claimRefs: [unlistedClaimRef]
        }
      ],
      epistemicState: 'DERIVED_DATA' as const
    };

    const payload = {
      ...createValidPayload(),
      claims: [validClaim1, validClaim2, derivedClaim]
    };

    expect(GraphToEditorialPayloadSchema.safeParse(payload).success).toBe(false);
  });

  it('rejects epistemically invalid claims in editorial context', () => {
    const invalidHypothesisRef = generateClaimRef();

    // HYPOTHESIS with direct SOURCE_DOCUMENT evidence only (violates ClaimSchema epistemic invariant)
    const epistemicallyInvalidClaim = {
      kind: 'CLAIM' as const,
      ref: invalidHypothesisRef,
      subject: {
        kind: 'ENTITY' as const,
        ref: ENTITY_REF
      },
      predicate: 'unsupported_rumor',
      value: {
        type: 'TEXT' as const,
        value: 'Speculation'
      },
      contextEntityRefs: [],
      evidence: [
        {
          type: 'SOURCE_DOCUMENT' as const,
          sourceDocumentRef: SOURCE_DOCUMENT_REF
        }
      ],
      epistemicState: 'HYPOTHESIS' as const
    };

    const payload = {
      ...createValidPayload(),
      claims: [validClaim1, validClaim2, epistemicallyInvalidClaim]
    };

    const result = GraphToEditorialPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('rejects graph internals crossing into editorial context', () => {
    const payloadWithRelations = {
      ...createValidPayload(),
      relations: [
        {
          kind: 'RELATION',
          ref: RELATION_REF,
          predicate: 'plays_in',
          from: { kind: 'ENTITY', ref: ENTITY_REF },
          to: { kind: 'ENTITY', ref: ENTITY_REF_2 },
          epistemicState: 'FACT',
          evidence: [
            {
              type: 'STRUCTURED_DATA',
              source: 'afa',
              recordRef: 'rec-1'
            }
          ]
        }
      ]
    };

    expect(
      GraphToEditorialPayloadSchema.safeParse(payloadWithRelations).success
    ).toBe(false);
  });
});
