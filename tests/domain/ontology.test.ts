import { describe, it, expect } from 'vitest';
import {
  EntitySchema,
  EntityKindSchema,
  EventSchema,
  RelationSchema
} from '../../src/domain/index.js';
import {
  ENTITY_REF,
  ENTITY_REF_2,
  EVENT_REF,
  RELATION_REF,
  CLAIM_REF
} from './fixtures/refs.js';

describe('Ontology domain invariants', () => {
  it('accepts the base entity kinds and rejects unknown kinds', () => {
    const allowedKinds = [
      'PERSON',
      'ORGANIZATION',
      'TEAM',
      'COMPETITION',
      'LOCATION',
      'STADIUM',
      'TOPIC'
    ] as const;

    for (const kind of allowedKinds) {
      const entity = {
        kind: 'ENTITY',
        ref: ENTITY_REF,
        entityKind: kind,
        name: `Test ${kind}`
      };
      const res = EntitySchema.safeParse(entity);
      expect(res.success).toBe(true);
      expect(EntityKindSchema.safeParse(kind).success).toBe(true);
    }

    // Unknown kind rejected
    const unknownEntity = {
      kind: 'ENTITY',
      ref: ENTITY_REF,
      entityKind: 'TOURNAMENT_STAGE',
      name: 'Semifinales'
    };
    expect(EntitySchema.safeParse(unknownEntity).success).toBe(false);
    expect(EntityKindSchema.safeParse('TOURNAMENT_STAGE').success).toBe(false);
  });

  it('requires Event to be grounded in at least one Claim', () => {
    // Empty claimRefs must fail
    const ungroundedEvent = {
      kind: 'EVENT',
      ref: EVENT_REF,
      label: 'Entrenamiento matutino',
      claimRefs: [],
      entityRefs: [ENTITY_REF]
    };
    expect(EventSchema.safeParse(ungroundedEvent).success).toBe(false);

    // Event with at least one claimRef passes
    const groundedEvent = {
      kind: 'EVENT',
      ref: EVENT_REF,
      label: 'Entrenamiento matutino',
      claimRefs: [CLAIM_REF],
      entityRefs: [ENTITY_REF],
      time: {
        type: 'INSTANT',
        value: '2026-10-02T09:00:00Z'
      }
    };
    const res = EventSchema.safeParse(groundedEvent);
    expect(res.success).toBe(true);
  });

  it('requires Relation provenance and epistemic state', () => {
    const validRelation = {
      kind: 'RELATION',
      ref: RELATION_REF,
      predicate: 'plays_in',
      from: {
        kind: 'ENTITY',
        ref: ENTITY_REF
      },
      to: {
        kind: 'ENTITY',
        ref: ENTITY_REF_2
      },
      epistemicState: 'FACT',
      evidence: [
        {
          type: 'STRUCTURED_DATA',
          source: 'afa-registry',
          recordRef: 'contract-2026'
        }
      ]
    };

    // Valid relation passes
    expect(RelationSchema.safeParse(validRelation).success).toBe(true);

    // Missing evidence must fail
    const relationWithoutEvidence = {
      ...validRelation,
      evidence: []
    };
    expect(RelationSchema.safeParse(relationWithoutEvidence).success).toBe(false);

    // Unknown endpoint kind must fail
    const relationWithUnknownEndpoint = {
      ...validRelation,
      from: {
        kind: 'UNKNOWN_ENDPOINT',
        ref: ENTITY_REF
      }
    };
    expect(RelationSchema.safeParse(relationWithUnknownEndpoint).success).toBe(false);
  });
});
