import { z } from 'zod';
import {
  InstantSchema,
  TemporalExtentSchema
} from './shared.js';
import {
  SourceDocumentRefSchema,
  ClaimRefSchema,
  EntityRefSchema,
  EventRefSchema,
  DomainRefSchema
} from './identity.js';

export const EpistemicStateSchema = z.enum([
  'FACT',
  'DERIVED_DATA',
  'CORRELATION',
  'HYPOTHESIS',
  'INTERPRETATION',
  'PREDICTION'
]);

export type EpistemicState = z.infer<typeof EpistemicStateSchema>;

export const ClaimValueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('TEXT'),
    value: z.string()
  }),
  z.object({
    type: z.literal('NUMBER'),
    value: z.number(),
    unit: z.string().min(1).optional()
  }),
  z.object({
    type: z.literal('BOOLEAN'),
    value: z.boolean()
  }),
  z.object({
    type: z.literal('INSTANT'),
    value: InstantSchema
  }),
  z.object({
    type: z.literal('INTERVAL'),
    start: InstantSchema,
    end: InstantSchema.optional()
  }),
  z.object({
    type: z.literal('ENTITY_REF'),
    ref: EntityRefSchema
  }),
  z.object({
    type: z.literal('COMPOSITE'),
    fields: z.record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null()
      ])
    )
  })
]);

export type ClaimValue = Readonly<z.infer<typeof ClaimValueSchema>>;

export const ClaimEvidenceSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('SOURCE_DOCUMENT'),
    sourceDocumentRef: SourceDocumentRefSchema
  }),
  z.object({
    type: z.literal('STRUCTURED_DATA'),
    source: z.string().min(1),
    recordRef: z.string().min(1)
  }),
  z.object({
    type: z.literal('CLAIM_DERIVATION'),
    claimRefs: z.array(ClaimRefSchema).min(1)
  }),
  z.object({
    type: z.literal('PROCESS'),
    process: z.string().min(1),
    inputRefs: z.array(DomainRefSchema).min(1)
  })
]);

export type ClaimEvidence = Readonly<z.infer<typeof ClaimEvidenceSchema>>;

export const ClaimSubjectSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('ENTITY'),
    ref: EntityRefSchema
  }),
  z.object({
    kind: z.literal('EVENT'),
    ref: EventRefSchema
  })
]);

export type ClaimSubject = Readonly<z.infer<typeof ClaimSubjectSchema>>;

const ClaimBaseSchema = z.object({
  kind: z.literal('CLAIM'),
  ref: ClaimRefSchema,
  subject: ClaimSubjectSchema,
  predicate: z.string().min(1),
  value: ClaimValueSchema,
  validTime: TemporalExtentSchema.optional(),
  contextEntityRefs: z.array(EntityRefSchema).default([]),
  evidence: z.array(ClaimEvidenceSchema).min(1),
  epistemicState: EpistemicStateSchema
});

export const ClaimSchema = ClaimBaseSchema.superRefine((claim, ctx) => {
  if (claim.epistemicState === 'FACT') {
    const hasDirect = claim.evidence.some(
      (e) => e.type === 'SOURCE_DOCUMENT' || e.type === 'STRUCTURED_DATA'
    );
    if (!hasDirect) {
      ctx.addIssue({
        code: 'custom',
        message: 'FACT requires at least one direct evidence (SOURCE_DOCUMENT or STRUCTURED_DATA)'
      });
    }
  } else {
    const hasDerivation = claim.evidence.some(
      (e) => e.type === 'CLAIM_DERIVATION' || e.type === 'PROCESS'
    );
    if (!hasDerivation) {
      ctx.addIssue({
        code: 'custom',
        message: `${claim.epistemicState} requires at least one derivation evidence (CLAIM_DERIVATION or PROCESS)`
      });
    }
  }
});

export type Claim = Readonly<z.infer<typeof ClaimSchema>>;
