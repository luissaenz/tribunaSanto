// WEB.3 — Soporte e2e: abre páginas con reloj controlado y mide Tribuna Santo
// con el mismo medidor que el extractor del golden master.

import type { Page } from '@playwright/test';
import { SAMPLES, tribunaSelector, type SampleSpec } from '../../scripts/reference/spec.js';
import { measureInPage, type PageMeasurement } from '../../scripts/reference/measure.js';
import { readContract } from '../support/fidelity.js';

export const contract = readContract();
export const CLOCK_START = new Date('2026-10-02T12:00:00-03:00');

/** Navega con el reloj pausado: el tiempo sólo avanza con `page.clock.runFor`. */
export async function openPaused(page: Page, url: string, width = 1280, height = 900): Promise<void> {
  await page.setViewportSize({ width, height });
  await page.addInitScript('window.__name = (fn) => fn;');
  await page.clock.install({ time: CLOCK_START });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 100);
  await page.clock.runFor(1000);
  await page.waitForTimeout(600);
}

export const sampleSpec = (family: string): SampleSpec => SAMPLES.find((s) => s.family === family)!;
export const sampleContract = (family: string) => contract.samples.find((s) => s.family === family)!;

export async function measureTribuna(page: Page, family: string): Promise<PageMeasurement> {
  const spec = sampleSpec(family);
  return page.evaluate(measureInPage, {
    parts: spec.parts.map((p) => ({ id: p.id, sel: tribunaSelector(p) })),
    order: (spec.order ?? []).map((id) => ({ id, sel: tribunaSelector(spec.parts.find((p) => p.id === id)!) }))
  });
}

export async function alpineData<T>(page: Page, selector: string, key: string): Promise<T> {
  return page.evaluate(
    ({ selector, key }) => {
      const el = document.querySelector(selector) as (HTMLElement & { _x_dataStack?: Array<Record<string, unknown>> }) | null;
      return el?._x_dataStack?.[0]?.[key] as never;
    },
    { selector, key }
  );
}

export async function scrollToY(page: Page, y: number): Promise<void> {
  await page.evaluate((top) => {
    window.scrollTo(0, top);
    window.dispatchEvent(new Event('scroll'));
  }, y);
  await page.clock.runFor(400);
}
