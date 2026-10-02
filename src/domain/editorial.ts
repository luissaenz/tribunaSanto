import { z } from 'zod';
import { DomainRefSchema } from './shared.js';

export const StorySchema = z.object({
  kind: z.literal('STORY'),
  ref: DomainRefSchema,
  workingTitle: z.string().min(1),
  angle: z.string().min(1),
  eventRefs: z.array(DomainRefSchema).default([]),
  claimRefs: z.array(DomainRefSchema).default([]),
  entityRefs: z.array(DomainRefSchema).default([])
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
  ref: DomainRefSchema,
  storyRef: DomainRefSchema
});

export type Article = Readonly<z.infer<typeof ArticleSchema>>;

export const ArticleRevisionSchema = z.object({
  kind: z.literal('ARTICLE_REVISION'),
  ref: DomainRefSchema,
  articleRef: DomainRefSchema,
  revisionNumber: z.number().int().positive(),
  headline: z.string().min(1),
  dek: z.string().min(1).optional(),
  body: z.string().min(1),
  claimRefs: z.array(DomainRefSchema).default([])
});

export type ArticleRevision = Readonly<z.infer<typeof ArticleRevisionSchema>>;
