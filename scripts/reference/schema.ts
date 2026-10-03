// WEB.3 — Esquema del contrato derivado del golden master (docs/web3/reference-contract.json).
// Sólo admite ids, números, booleanos y tokens normalizados: nunca HTML, CSS o JS del corpus.

import { z } from 'zod';

const token = z.string().regex(/^[\w\s().,%#/@-]*$/, 'tokens normalizados sin marcado ni código');

export const MeasurementSchema = z.strictObject({
  present: z.boolean(),
  visible: z.boolean(),
  display: token.optional(),
  position: token.optional(),
  top: z.number().nullable().optional(),
  zIndex: token.optional(),
  x: z.number().optional(),
  w: z.number().optional(),
  h: z.number().optional(),
  aspect: z.number().optional(),
  font: z.enum(['heading', 'body', 'other']).optional(),
  fontSize: z.number().optional(),
  fontWeight: token.optional(),
  fontStyle: token.optional(),
  lineHeight: z.number().nullable().optional(),
  letterSpacing: z.number().nullable().optional(),
  textTransform: token.optional(),
  color: token.optional(),
  bg: token.optional(),
  bgImage: z.enum(['none', 'gradient', 'url']).optional(),
  bgAttachment: token.optional(),
  borders: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  borderColor: token.nullable().optional(),
  radius: z.number().optional(),
  opacity: z.number().optional(),
  columns: z.number().nullable().optional(),
  gap: z.number().nullable().optional(),
  objectFit: token.optional()
});

export const PartFlagsSchema = z.strictObject({
  fixedH: z.boolean(),
  freeX: z.boolean(),
  freeW: z.boolean(),
  noType: z.boolean()
});

export const SampleContractSchema = z.strictObject({
  family: z.string().regex(/^[a-z-]+$/),
  tribuna: z.string().regex(/^\/[a-z0-9/-]*$/),
  flags: z.record(z.string(), PartFlagsSchema),
  viewports: z.record(
    z.string().regex(/^\d+$/),
    z.strictObject({
      parts: z.record(z.string(), MeasurementSchema),
      domOrder: z.array(z.string()),
      visualOrder: z.array(z.string())
    })
  )
});

export const InteractionContractSchema = z.strictObject({
  carousel: z.strictObject({
    homeSlides: z.number().int(),
    categorySlides: z.number().int(),
    categoryTwoSlideVariant: z.number().int(),
    intervalMs: z.number(),
    loops: z.boolean(),
    fadeMs: z.number(),
    fadeEasing: token,
    fadeProperty: token,
    controlTransitionMs: z.number(),
    dragThresholdPx: z.number(),
    dragBelowThresholdChanges: z.boolean(),
    pausesOnHover: z.boolean(),
    manualNavigationRestartsTimer: z.boolean(),
    arrowsOpacityIdle: z.number(),
    arrowsOpacityHover: z.number(),
    dotActiveWidth: z.number(),
    dotWidth: z.number(),
    dotHeight: z.number()
  }),
  nav: z.strictObject({
    hamburgerBelowPx: z.number(),
    menuPanelPosition: token,
    menuPanelBelowNav: z.boolean(),
    menuMaxHeightVh: z.number(),
    menuClosesOnOutsideClick: z.boolean(),
    searchFocusesInput: z.boolean(),
    searchBarInFlow: z.boolean(),
    stickyTop: z.number(),
    zIndex: token
  }),
  backToTop: z.strictObject({
    thresholdPx: z.number(),
    rightPx: z.number(),
    bottomPx: z.number(),
    size: z.number(),
    smoothScroll: z.boolean()
  }),
  copyLink: z.strictObject({ feedbackMs: z.number() }),
  faq: z.strictObject({ items: z.number().int(), singleOpen: z.boolean(), enterMs: z.number() }),
  careers: z.strictObject({
    jobs: z.number().int(),
    filters: z.number().int(),
    perFilter: z.array(z.number().int()),
    singleOpen: z.boolean()
  }),
  contact: z.strictObject({ subjects: z.number().int(), conditionalSubjectIndexes: z.array(z.number().int()), resetsAfterSend: z.boolean() }),
  sidebarStickyTop: z.number(),
  truncation: z.record(z.string(), z.number().int())
});

export const ReferenceContractSchema = z.strictObject({
  version: z.literal(1),
  corpus: z.strictObject({ html: z.literal(183), commit: z.string().regex(/^[0-9a-f]{40}$/) }),
  breakpoints: z.array(z.number().int()),
  viewports: z.array(z.number().int()),
  samples: z.array(SampleContractSchema),
  interactions: InteractionContractSchema
});

export type ReferenceContract = z.infer<typeof ReferenceContractSchema>;
export type InteractionContract = z.infer<typeof InteractionContractSchema>;
