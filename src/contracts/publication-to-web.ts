import { z } from 'zod';
import {
  ArticleRefSchema,
  ArticleRevisionRefSchema
} from '../domain/identity.js';
import { InstantSchema } from '../domain/shared.js';

export const PublicationToWebPayloadSchema = z.strictObject({
  articleRef: ArticleRefSchema,
  articleRevisionRef: ArticleRevisionRefSchema,
  headline: z.string().min(1),
  dek: z.string().min(1).optional(),
  body: z.string().min(1),
  byline: z.string().trim().min(1),
  publishedAt: InstantSchema,
  modifiedAt: InstantSchema
});

export type PublicationToWebPayload =
  Readonly<z.infer<typeof PublicationToWebPayloadSchema>>;
