import { z } from 'zod';

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
