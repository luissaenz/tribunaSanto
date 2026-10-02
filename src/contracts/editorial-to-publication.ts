import { z } from 'zod';
import { ArticleRevisionSchema } from '../domain/editorial.js';

export const EditorialToPublicationPayloadSchema = z.strictObject({
  revision: ArticleRevisionSchema,
  byline: z.string().trim().min(1)
});

export type EditorialToPublicationPayload =
  Readonly<z.infer<typeof EditorialToPublicationPayloadSchema>>;
