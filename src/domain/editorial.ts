import { z } from 'zod';
import {
  StoryRefSchema,
  ArticleRefSchema,
  ArticleRevisionRefSchema,
  EventRefSchema,
  ClaimRefSchema,
  EntityRefSchema
} from './identity.js';

export const StorySchema = z.object({
  kind: z.literal('STORY'),
  ref: StoryRefSchema,
  workingTitle: z.string().min(1),
  angle: z.string().min(1),
  eventRefs: z.array(EventRefSchema).default([]),
  claimRefs: z.array(ClaimRefSchema).default([]),
  entityRefs: z.array(EntityRefSchema).default([])
}).superRefine((story, ctx) => {
  if (
    story.eventRefs.length === 0 &&
    story.claimRefs.length === 0
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Story requires at least one event or claim'
    });
  }
});

export type Story = Readonly<z.infer<typeof StorySchema>>;

export const ArticleSchema = z.object({
  kind: z.literal('ARTICLE'),
  ref: ArticleRefSchema,
  storyRef: StoryRefSchema
});

export type Article = Readonly<z.infer<typeof ArticleSchema>>;

export const ArticleRevisionSchema = z.object({
  kind: z.literal('ARTICLE_REVISION'),
  ref: ArticleRevisionRefSchema,
  articleRef: ArticleRefSchema,
  revisionNumber: z.number().int().positive(),
  headline: z.string().min(1),
  dek: z.string().min(1).optional(),
  body: z.string().min(1),
  claimRefs: z.array(ClaimRefSchema).default([])
});

export type ArticleRevision = Readonly<z.infer<typeof ArticleRevisionSchema>>;
