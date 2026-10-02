import {
  SourceRefSchema,
  SourceDocumentRefSchema,
  ClaimRefSchema,
  EntityRefSchema,
  EventRefSchema,
  RelationRefSchema,
  StoryRefSchema,
  ArticleRefSchema,
  ArticleRevisionRefSchema
} from '../../../src/domain/index.js';

export const SOURCE_REF =
  SourceRefSchema.parse('018f0000-0000-7000-8000-000000000001');

export const SOURCE_DOCUMENT_REF =
  SourceDocumentRefSchema.parse('018f0000-0000-7000-8000-000000000002');

export const CLAIM_REF =
  ClaimRefSchema.parse('018f0000-0000-7000-8000-000000000003');

export const CLAIM_REF_2 =
  ClaimRefSchema.parse('018f0000-0000-7000-8000-000000000004');

export const ENTITY_REF =
  EntityRefSchema.parse('018f0000-0000-7000-8000-000000000005');

export const ENTITY_REF_2 =
  EntityRefSchema.parse('018f0000-0000-7000-8000-000000000006');

export const EVENT_REF =
  EventRefSchema.parse('018f0000-0000-7000-8000-000000000007');

export const RELATION_REF =
  RelationRefSchema.parse('018f0000-0000-7000-8000-000000000008');

export const STORY_REF =
  StoryRefSchema.parse('018f0000-0000-7000-8000-000000000009');

export const ARTICLE_REF =
  ArticleRefSchema.parse('018f0000-0000-7000-8000-00000000000a');

export const ARTICLE_REVISION_REF =
  ArticleRevisionRefSchema.parse('018f0000-0000-7000-8000-00000000000b');
