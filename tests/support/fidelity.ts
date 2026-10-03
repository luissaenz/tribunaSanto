// WEB.3 — Comparador puro de fidelidad contra docs/web3/reference-contract.json.
// No lee el corpus: sólo el contrato versionado y las mediciones de Tribuna Santo.

import fs from 'node:fs';
import path from 'node:path';
import { ReferenceContractSchema, type InteractionContract, type ReferenceContract } from '../../scripts/reference/schema.js';
import type { Measurement, PageMeasurement } from '../../scripts/reference/measure.js';

export const CONTRACT_FILE = path.resolve(process.cwd(), 'docs/web3/reference-contract.json');

export function readContract(): ReferenceContract {
  return ReferenceContractSchema.parse(JSON.parse(fs.readFileSync(CONTRACT_FILE, 'utf-8')));
}

/** Tolerancias normativas de WEB.3. */
export const TOLERANCE = {
  px: 1,
  ratio: 0.015,
  opacity: 0.01,
  autoplayMs: 150
} as const;

type Flags = ReferenceContract['samples'][number]['flags'][string];

const near = (a: number | null | undefined, b: number | null | undefined, tol: number) =>
  a == null || b == null ? a == b : Math.abs(a - b) <= tol;

/** Diferencias de una parte en un viewport. Vacío = fiel. */
export function compareMeasurement(id: string, expected: Measurement, actual: Measurement, flags: Flags): string[] {
  const out: string[] = [];
  const diff = (what: string, e: unknown, a: unknown) => out.push(`${id}: ${what} esperado ${JSON.stringify(e)} obtenido ${JSON.stringify(a)}`);
  if (expected.present !== actual.present) {
    diff('present', expected.present, actual.present);
    return out;
  }
  if (expected.visible !== actual.visible) {
    diff('visible', expected.visible, actual.visible);
    return out;
  }
  if (!expected.visible) return out;

  for (const key of ['display', 'position'] as const) if (expected[key] !== actual[key]) diff(key, expected[key], actual[key]);
  if (!near(expected.top, actual.top, TOLERANCE.px)) diff('top', expected.top, actual.top);
  if (expected.position === 'sticky' || expected.position === 'fixed') {
    if (expected.zIndex !== actual.zIndex) diff('zIndex', expected.zIndex, actual.zIndex);
  }
  if (!flags.freeX && !near(expected.x, actual.x, TOLERANCE.ratio)) diff('x/vw', expected.x, actual.x);
  if (!flags.freeW && !near(expected.w, actual.w, TOLERANCE.ratio)) diff('w/vw', expected.w, actual.w);
  if (flags.fixedH && !near(expected.h, actual.h, TOLERANCE.px)) diff('h', expected.h, actual.h);
  if (expected.bg !== actual.bg) diff('background', expected.bg, actual.bg);
  if (expected.bgImage !== actual.bgImage) diff('background-image', expected.bgImage, actual.bgImage);
  if (expected.bgAttachment !== actual.bgAttachment) diff('background-attachment', expected.bgAttachment, actual.bgAttachment);
  const eb = expected.borders ?? [0, 0, 0, 0];
  const ab = actual.borders ?? [0, 0, 0, 0];
  if (eb.some((b, i) => !near(b, ab[i], TOLERANCE.px))) diff('borders', eb, ab);
  else if (eb.some((b) => b > 0) && expected.borderColor !== actual.borderColor) diff('border-color', expected.borderColor, actual.borderColor);
  if (!near(expected.radius, actual.radius, TOLERANCE.px)) diff('radius', expected.radius, actual.radius);
  if (!near(expected.opacity, actual.opacity, TOLERANCE.opacity)) diff('opacity', expected.opacity, actual.opacity);
  if (expected.columns !== actual.columns) diff('grid columns', expected.columns, actual.columns);
  if (!near(expected.gap, actual.gap, TOLERANCE.px)) diff('gap', expected.gap, actual.gap);
  if (!flags.noType) {
    if (expected.font !== actual.font) diff('font', expected.font, actual.font);
    if (!near(expected.fontSize, actual.fontSize, TOLERANCE.px)) diff('font-size', expected.fontSize, actual.fontSize);
    if (expected.fontWeight !== actual.fontWeight) diff('font-weight', expected.fontWeight, actual.fontWeight);
    if (expected.fontStyle !== actual.fontStyle) diff('font-style', expected.fontStyle, actual.fontStyle);
    if (!near(expected.lineHeight, actual.lineHeight, TOLERANCE.px)) diff('line-height', expected.lineHeight, actual.lineHeight);
    if (!near(expected.letterSpacing, actual.letterSpacing, TOLERANCE.px)) diff('letter-spacing', expected.letterSpacing, actual.letterSpacing);
    if (expected.textTransform !== actual.textTransform) diff('text-transform', expected.textTransform, actual.textTransform);
    if (expected.color !== actual.color) diff('color', expected.color, actual.color);
  }
  return out;
}

/** Diferencias de una página muestra (todas sus partes) en un viewport. */
export function comparePage(
  sample: ReferenceContract['samples'][number],
  viewport: string,
  actual: PageMeasurement
): string[] {
  const expected = sample.viewports[viewport];
  const out: string[] = [];
  for (const [id, m] of Object.entries(expected.parts)) {
    const got = actual.parts[id] ?? { present: false, visible: false };
    out.push(...compareMeasurement(id, m, got, sample.flags[id]).map((d) => `${sample.family}@${viewport} ${d}`));
  }
  if (JSON.stringify(expected.domOrder) !== JSON.stringify(actual.domOrder)) {
    out.push(`${sample.family}@${viewport} DOM order esperado ${expected.domOrder.join('>')} obtenido ${actual.domOrder.join('>')}`);
  }
  if (JSON.stringify(expected.visualOrder) !== JSON.stringify(actual.visualOrder)) {
    out.push(`${sample.family}@${viewport} visual order esperado ${expected.visualOrder.join('>')} obtenido ${actual.visualOrder.join('>')}`);
  }
  return out;
}

/** Diferencias de interacción (tiempos, estados, conteos). */
export function compareInteractions(expected: InteractionContract, actual: InteractionContract): string[] {
  const out: string[] = [];
  const walk = (prefix: string, e: unknown, a: unknown) => {
    if (typeof e === 'number' && typeof a === 'number') {
      const tol = prefix.endsWith('intervalMs') ? TOLERANCE.autoplayMs : prefix.endsWith('Ms') ? 0 : TOLERANCE.px;
      if (!near(e, a, tol)) out.push(`${prefix}: esperado ${e} obtenido ${a}`);
      return;
    }
    if (e && typeof e === 'object' && !Array.isArray(e)) {
      for (const [k, v] of Object.entries(e)) walk(prefix ? `${prefix}.${k}` : k, v, (a as Record<string, unknown> | undefined)?.[k]);
      return;
    }
    if (JSON.stringify(e) !== JSON.stringify(a)) out.push(`${prefix}: esperado ${JSON.stringify(e)} obtenido ${JSON.stringify(a)}`);
  };
  walk('', expected, actual);
  return out;
}
