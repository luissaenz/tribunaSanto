import { z } from 'zod';

export const DomainRefSchema = z.string().min(1).brand<'DomainRef'>();

export type DomainRef = z.infer<typeof DomainRefSchema>;

export const InstantSchema = z.string().datetime({ offset: true });

export const TemporalExtentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('INSTANT'),
    value: InstantSchema
  }),
  z.object({
    type: z.literal('INTERVAL'),
    start: InstantSchema,
    end: InstantSchema.optional()
  })
]);

export type TemporalExtent = Readonly<z.infer<typeof TemporalExtentSchema>>;
