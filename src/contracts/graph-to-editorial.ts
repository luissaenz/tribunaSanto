import { z } from 'zod';
import { ClaimSchema } from '../domain/epistemology.js';
import {
  EntitySchema,
  EventSchema
} from '../domain/ontology.js';
import { StorySchema } from '../domain/editorial.js';

export const GraphToEditorialPayloadSchema = z.strictObject({
  story: StorySchema,
  claims: z.array(ClaimSchema).min(1),
  entities: z.array(EntitySchema).default([]),
  events: z.array(EventSchema).default([])
}).superRefine((payload, ctx) => {
  const claimRefSet = new Set(payload.claims.map((c) => c.ref));
  const entityRefSet = new Set(payload.entities.map((e) => e.ref));
  const eventRefSet = new Set(payload.events.map((e) => e.ref));

  for (const claimRef of payload.story.claimRefs) {
    if (!claimRefSet.has(claimRef)) {
      ctx.addIssue({
        code: 'custom',
        message: `Story references ClaimRef ${claimRef} not present in claims snapshot`,
        path: ['story', 'claimRefs']
      });
    }
  }

  for (const eventRef of payload.story.eventRefs) {
    if (!eventRefSet.has(eventRef)) {
      ctx.addIssue({
        code: 'custom',
        message: `Story references EventRef ${eventRef} not present in events snapshot`,
        path: ['story', 'eventRefs']
      });
    }
  }

  for (const entityRef of payload.story.entityRefs) {
    if (!entityRefSet.has(entityRef)) {
      ctx.addIssue({
        code: 'custom',
        message: `Story references EntityRef ${entityRef} not present in entities snapshot`,
        path: ['story', 'entityRefs']
      });
    }
  }

  for (let i = 0; i < payload.events.length; i++) {
    const event = payload.events[i];
    for (const claimRef of event.claimRefs) {
      if (!claimRefSet.has(claimRef)) {
        ctx.addIssue({
          code: 'custom',
          message: `Event ${event.ref} references ClaimRef ${claimRef} not present in claims snapshot`,
          path: ['events', i, 'claimRefs']
        });
      }
    }
    for (const entityRef of event.entityRefs) {
      if (!entityRefSet.has(entityRef)) {
        ctx.addIssue({
          code: 'custom',
          message: `Event ${event.ref} references EntityRef ${entityRef} not present in entities snapshot`,
          path: ['events', i, 'entityRefs']
        });
      }
    }
  }

  for (let i = 0; i < payload.claims.length; i++) {
    const claim = payload.claims[i];

    if (claim.subject.kind === 'ENTITY') {
      if (!entityRefSet.has(claim.subject.ref)) {
        ctx.addIssue({
          code: 'custom',
          message: `Claim ${claim.ref} subject references EntityRef ${claim.subject.ref} not present in entities snapshot`,
          path: ['claims', i, 'subject']
        });
      }
    } else if (claim.subject.kind === 'EVENT') {
      if (!eventRefSet.has(claim.subject.ref)) {
        ctx.addIssue({
          code: 'custom',
          message: `Claim ${claim.ref} subject references EventRef ${claim.subject.ref} not present in events snapshot`,
          path: ['claims', i, 'subject']
        });
      }
    }

    for (const contextRef of claim.contextEntityRefs) {
      if (!entityRefSet.has(contextRef)) {
        ctx.addIssue({
          code: 'custom',
          message: `Claim ${claim.ref} context references EntityRef ${contextRef} not present in entities snapshot`,
          path: ['claims', i, 'contextEntityRefs']
        });
      }
    }

    if (claim.value.type === 'ENTITY_REF') {
      if (!entityRefSet.has(claim.value.ref)) {
        ctx.addIssue({
          code: 'custom',
          message: `Claim ${claim.ref} value references EntityRef ${claim.value.ref} not present in entities snapshot`,
          path: ['claims', i, 'value']
        });
      }
    }

    for (const evidence of claim.evidence) {
      if (evidence.type === 'CLAIM_DERIVATION') {
        for (const derivedRef of evidence.claimRefs) {
          if (!claimRefSet.has(derivedRef)) {
            ctx.addIssue({
              code: 'custom',
              message: `Claim ${claim.ref} evidence derivation references ClaimRef ${derivedRef} not present in claims snapshot`,
              path: ['claims', i, 'evidence']
            });
          }
        }
      }
    }
  }
});

export type GraphToEditorialPayload =
  Readonly<z.infer<typeof GraphToEditorialPayloadSchema>>;
