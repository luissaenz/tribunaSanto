import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

const UuidV7Schema = z.uuidv7();

export const SourceRefSchema = UuidV7Schema.brand<'SourceRef'>();
export type SourceRef = z.infer<typeof SourceRefSchema>;

export const SourceDocumentRefSchema = UuidV7Schema.brand<'SourceDocumentRef'>();
export type SourceDocumentRef = z.infer<typeof SourceDocumentRefSchema>;

export const ClaimRefSchema = UuidV7Schema.brand<'ClaimRef'>();
export type ClaimRef = z.infer<typeof ClaimRefSchema>;

export const EntityRefSchema = UuidV7Schema.brand<'EntityRef'>();
export type EntityRef = z.infer<typeof EntityRefSchema>;

export const EventRefSchema = UuidV7Schema.brand<'EventRef'>();
export type EventRef = z.infer<typeof EventRefSchema>;

export const RelationRefSchema = UuidV7Schema.brand<'RelationRef'>();
export type RelationRef = z.infer<typeof RelationRefSchema>;

export const StoryRefSchema = UuidV7Schema.brand<'StoryRef'>();
export type StoryRef = z.infer<typeof StoryRefSchema>;

export const ArticleRefSchema = UuidV7Schema.brand<'ArticleRef'>();
export type ArticleRef = z.infer<typeof ArticleRefSchema>;

export const ArticleRevisionRefSchema = UuidV7Schema.brand<'ArticleRevisionRef'>();
export type ArticleRevisionRef = z.infer<typeof ArticleRevisionRefSchema>;

export const DomainRefSchema = z.union([
  SourceRefSchema,
  SourceDocumentRefSchema,
  ClaimRefSchema,
  EntityRefSchema,
  EventRefSchema,
  RelationRefSchema,
  StoryRefSchema,
  ArticleRefSchema,
  ArticleRevisionRefSchema
]);

export type DomainRef = z.infer<typeof DomainRefSchema>;

export function generateSourceRef(): SourceRef {
  return SourceRefSchema.parse(uuidv7());
}

export function generateSourceDocumentRef(): SourceDocumentRef {
  return SourceDocumentRefSchema.parse(uuidv7());
}

export function generateClaimRef(): ClaimRef {
  return ClaimRefSchema.parse(uuidv7());
}

export function generateEntityRef(): EntityRef {
  return EntityRefSchema.parse(uuidv7());
}

export function generateEventRef(): EventRef {
  return EventRefSchema.parse(uuidv7());
}

export function generateRelationRef(): RelationRef {
  return RelationRefSchema.parse(uuidv7());
}

export function generateStoryRef(): StoryRef {
  return StoryRefSchema.parse(uuidv7());
}

export function generateArticleRef(): ArticleRef {
  return ArticleRefSchema.parse(uuidv7());
}

export function generateArticleRevisionRef(): ArticleRevisionRef {
  return ArticleRevisionRefSchema.parse(uuidv7());
}

export const ExternalIdentitySchema = z.object({
  provider: z.string().min(1),
  externalId: z.string().min(1)
});

export type ExternalIdentity = Readonly<z.infer<typeof ExternalIdentitySchema>>;
