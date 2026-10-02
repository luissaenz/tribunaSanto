import { z } from 'zod';
import {
  DomainRefSchema,
  TemporalExtentSchema
} from './shared.js';
import {
  EpistemicStateSchema,
  ClaimEvidenceSchema
} from './epistemology.js';

export const EntityKindSchema = z.enum([
  'PERSON',
  'ORGANIZATION',
  'TEAM',
  'COMPETITION',
  'LOCATION',
  'STADIUM',
  'TOPIC'
]);

export type EntityKind = z.infer<typeof EntityKindSchema>;

export const EntitySchema = z.object({
  kind: z.literal('ENTITY'),
  ref: DomainRefSchema,
  entityKind: EntityKindSchema,
  name: z.string().min(1)
});

export type Entity = Readonly<z.infer<typeof EntitySchema>>;

export const EventSchema = z.object({
  kind: z.literal('EVENT'),
  ref: DomainRefSchema,
  label: z.string().min(1),
  claimRefs: z.array(DomainRefSchema).min(1),
  entityRefs: z.array(DomainRefSchema).default([]),
  time: TemporalExtentSchema.optional()
});

export type Event = Readonly<z.infer<typeof EventSchema>>;

export const RelationEndpointSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('ENTITY'),
    ref: DomainRefSchema
  }),
  z.object({
    kind: z.literal('EVENT'),
    ref: DomainRefSchema
  }),
  z.object({
    kind: z.literal('STORY'),
    ref: DomainRefSchema
  }),
  z.object({
    kind: z.literal('ARTICLE'),
    ref: DomainRefSchema
  })
]);

export type RelationEndpoint = Readonly<z.infer<typeof RelationEndpointSchema>>;

export const RelationSchema = z.object({
  kind: z.literal('RELATION'),
  ref: DomainRefSchema,
  predicate: z.string().min(1),
  from: RelationEndpointSchema,
  to: RelationEndpointSchema,
  epistemicState: EpistemicStateSchema,
  evidence: z.array(ClaimEvidenceSchema).min(1)
});

export type Relation = Readonly<z.infer<typeof RelationSchema>>;
