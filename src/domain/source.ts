import { z } from 'zod';
import { InstantSchema } from './shared.js';
import {
  SourceRefSchema,
  SourceDocumentRefSchema
} from './identity.js';

export const SourceSchema = z.object({
  kind: z.literal('SOURCE'),
  ref: SourceRefSchema,
  name: z.string().min(1)
});

export type Source = Readonly<z.infer<typeof SourceSchema>>;

export const SourceDocumentSchema = z.object({
  kind: z.literal('SOURCE_DOCUMENT'),
  ref: SourceDocumentRefSchema,
  sourceRef: SourceRefSchema,
  title: z.string().min(1).optional(),
  content: z.string().min(1),
  publishedAt: InstantSchema.optional()
});

export type SourceDocument = Readonly<z.infer<typeof SourceDocumentSchema>>;
