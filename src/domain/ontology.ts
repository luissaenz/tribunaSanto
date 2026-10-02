import { z } from 'zod';
import { TemporalExtentSchema } from './shared.js';
import {
  EpistemicStateSchema,
  ClaimEvidenceSchema
} from './epistemology.js';
import {
  EntityRefSchema,
  EventRefSchema,
  RelationRefSchema,
  ClaimRefSchema,
  StoryRefSchema,
  ArticleRefSchema
} from './identity.js';

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
  ref: EntityRefSchema,
  entityKind: EntityKindSchema,
  name: z.string().min(1)
});

export type Entity = Readonly<z.infer<typeof EntitySchema>>;

export const EventSchema = z.object({
  kind: z.literal('EVENT'),
  ref: EventRefSchema,
  label: z.string().min(1),
  claimRefs: z.array(ClaimRefSchema).min(1),
  entityRefs: z.array(EntityRefSchema).default([]),
  time: TemporalExtentSchema.optional()
});

export type Event = Readonly<z.infer<typeof EventSchema>>;

export const RelationEndpointSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('ENTITY'),
    ref: EntityRefSchema
  }),
  z.object({
    kind: z.literal('EVENT'),
    ref: EventRefSchema
  }),
  z.object({
    kind: z.literal('STORY'),
    ref: StoryRefSchema
  }),
  z.object({
    kind: z.literal('ARTICLE'),
    ref: ArticleRefSchema
  })
]);

export type RelationEndpoint = Readonly<z.infer<typeof RelationEndpointSchema>>;

export const RelationSchema = z.object({
  kind: z.literal('RELATION'),
  ref: RelationRefSchema,
  predicate: z.string().min(1),
  from: RelationEndpointSchema,
  to: RelationEndpointSchema,
  epistemicState: EpistemicStateSchema,
  evidence: z.array(ClaimEvidenceSchema).min(1)
});

export type Relation = Readonly<z.infer<typeof RelationSchema>>;
