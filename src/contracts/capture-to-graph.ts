import { z } from 'zod';
import { ExternalIdentitySchema } from '../domain/identity.js';
import { SourceDocumentSchema } from '../domain/source.js';

export const CaptureToGraphPayloadSchema = z.strictObject({
  document: SourceDocumentSchema,
  documentExternalIdentity: ExternalIdentitySchema.optional()
});

export type CaptureToGraphPayload =
  Readonly<z.infer<typeof CaptureToGraphPayloadSchema>>;
