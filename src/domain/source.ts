import { z } from 'zod';
import {
  DomainRefSchema,
  InstantSchema
} from './shared.js';

export const SourceSchema = z.object({
  kind: z.literal('SOURCE'),
  ref: DomainRefSchema,
  name: z.string().min(1)
});

export type Source = Readonly<z.infer<typeof SourceSchema>>;

export const SourceDocumentSchema = z.object({
  kind: z.literal('SOURCE_DOCUMENT'),
  ref: DomainRefSchema,
  sourceRef: DomainRefSchema,
  title: z.string().min(1).optional(),
  content: z.string().min(1),
  publishedAt: InstantSchema.optional()
});

export type SourceDocument = Readonly<z.infer<typeof SourceDocumentSchema>>;
