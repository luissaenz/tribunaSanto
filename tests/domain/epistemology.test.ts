import { describe, it, expect } from 'vitest';
import {
  ClaimSchema,
  ClaimValueSchema,
  EpistemicStateSchema
} from '../../src/domain/index.js';

describe('Epistemic domain invariants', () => {
  const baseClaim = {
    kind: 'CLAIM',
    ref: 'claim-1',
    subject: {
      kind: 'ENTITY',
      ref: 'ent-san-martin'
    },
    predicate: 'founded_in',
    value: {
      type: 'TEXT',
      value: '1909'
    },
    contextEntityRefs: ['ent-tucuman']
  };

  it('rejects FACT without direct evidence', () => {
    // FACT with only PROCESS evidence must fail
    const factWithProcess = {
      ...baseClaim,
      epistemicState: 'FACT',
      evidence: [
        {
          type: 'PROCESS',
          process: 'ner-extractor',
          inputRefs: ['doc-raw-text']
        }
      ]
    };
    const processResult = ClaimSchema.safeParse(factWithProcess);
    expect(processResult.success).toBe(false);

    // FACT with only CLAIM_DERIVATION must also fail
    const factWithDerivation = {
      ...baseClaim,
      epistemicState: 'FACT',
      evidence: [
        {
          type: 'CLAIM_DERIVATION',
          claimRefs: ['claim-0']
        }
      ]
    };
    expect(ClaimSchema.safeParse(factWithDerivation).success).toBe(false);

    // FACT with direct SOURCE_DOCUMENT evidence passes
    const factWithSourceDoc = {
      ...baseClaim,
      epistemicState: 'FACT',
      evidence: [
        {
          type: 'SOURCE_DOCUMENT',
          sourceDocumentRef: 'doc-acta-fundacion'
        }
      ]
    };
    const validResult = ClaimSchema.safeParse(factWithSourceDoc);
    expect(validResult.success).toBe(true);

    // FACT with direct STRUCTURED_DATA evidence passes
    const factWithStructured = {
      ...baseClaim,
      epistemicState: 'FACT',
      evidence: [
        {
          type: 'STRUCTURED_DATA',
          source: 'afa-official-records',
          recordRef: 'rec-1909-001'
        }
      ]
    };
    expect(ClaimSchema.safeParse(factWithStructured).success).toBe(true);
  });

  it('requires derivation evidence for inferential claims', () => {
    const inferentialStates = [
      'HYPOTHESIS',
      'INTERPRETATION',
      'PREDICTION',
      'DERIVED_DATA',
      'CORRELATION'
    ] as const;

    for (const state of inferentialStates) {
      // Direct evidence only must fail for inferential claims
      const withDirectOnly = {
        ...baseClaim,
        epistemicState: state,
        evidence: [
          {
            type: 'SOURCE_DOCUMENT',
            sourceDocumentRef: 'doc-opinion-piece'
          }
        ]
      };
      const directResult = ClaimSchema.safeParse(withDirectOnly);
      expect(directResult.success).toBe(false);

      // Derivation evidence passes
      const withDerivation = {
        ...baseClaim,
        epistemicState: state,
        evidence: [
          {
            type: 'CLAIM_DERIVATION',
            claimRefs: ['claim-premise-1']
          }
        ]
      };
      expect(ClaimSchema.safeParse(withDerivation).success).toBe(true);

      // Process evidence passes
      const withProcess = {
        ...baseClaim,
        epistemicState: state,
        evidence: [
          {
            type: 'PROCESS',
            process: 'correlation-engine',
            inputRefs: ['claim-1', 'claim-2']
          }
        ]
      };
      expect(ClaimSchema.safeParse(withProcess).success).toBe(true);
    }
  });

  it('accepts every supported ClaimValue and rejects unknown value kinds', () => {
    const validValues = [
      { type: 'TEXT', value: 'San Martín' },
      { type: 'NUMBER', value: 42, unit: 'points' },
      { type: 'BOOLEAN', value: true },
      { type: 'INSTANT', value: '2026-10-02T12:00:00Z' },
      { type: 'INTERVAL', start: '2026-10-02T10:00:00Z', end: '2026-10-02T12:00:00Z' },
      { type: 'ENTITY_REF', ref: 'ent-123' },
      {
        type: 'COMPOSITE',
        fields: {
          standing: 'first',
          score: 3,
          active: true,
          notes: null
        }
      }
    ];

    for (const val of validValues) {
      const result = ClaimValueSchema.safeParse(val);
      expect(result.success).toBe(true);
    }

    // Unknown value kind rejected
    const unknownValue = {
      type: 'SPORT_SCORE',
      home: 2,
      away: 1
    };
    const invalidResult = ClaimValueSchema.safeParse(unknownValue);
    expect(invalidResult.success).toBe(false);
  });

  it('rejects invalid epistemic states', () => {
    const invalidStateResult = EpistemicStateSchema.safeParse('CERTAIN');
    expect(invalidStateResult.success).toBe(false);

    const validStates = [
      'FACT',
      'DERIVED_DATA',
      'CORRELATION',
      'HYPOTHESIS',
      'INTERPRETATION',
      'PREDICTION'
    ];
    for (const s of validStates) {
      expect(EpistemicStateSchema.safeParse(s).success).toBe(true);
    }
  });
});
