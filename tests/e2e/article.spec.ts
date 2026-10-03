import { expect, test } from '@playwright/test';
import { contract, openPaused, sampleContract } from './support.js';

// WEB.3 — Artículo (la fidelidad vive en fidelity.spec.ts): compartir, copiar enlace y responsive.

const sample = sampleContract('article');

test.describe('article behaviour', () => {
  test('copies the link and shows the 2000 ms confirmation', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openPaused(page, sample.tribuna, 1280);
    const copy = page.locator('[data-block="share-bar"] [data-part="copy"]');
    await expect(copy).toHaveText(/Copiar enlace/);
    await copy.click();
    await expect(copy).toHaveText(/¡Copiado!/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
    await page.clock.runFor(contract.interactions.copyLink.feedbackMs - 100);
    await expect(copy).toHaveText(/¡Copiado!/);
    await page.clock.runFor(200);
    await expect(copy).toHaveText(/Copiar enlace/);
  });

  test('shares the real article URL on every network', async ({ page }) => {
    await openPaused(page, sample.tribuna, 1280);
    const url = encodeURIComponent(`https://tribunasanto.local${sample.tribuna}`);
    for (const id of ['facebook', 'x', 'whatsapp', 'linkedin']) {
      const link = page.locator(`[data-block="share-bar"] [data-part="${id}"]`);
      await expect(link).toHaveAttribute('href', new RegExp(url.replace(/[.*+?^${}()|[\]\\%]/g, '\\$&')));
      await expect(link).toHaveAttribute('target', '_blank');
    }
  });

  test('hides share labels, copy link, separators and reading time below 640 px', async ({ page }) => {
    await openPaused(page, sample.tribuna, 639);
    await expect(page.locator('[data-block="share-bar"] [data-part="copy"]')).toBeHidden();
    await expect(page.locator('[data-block="share-bar"] [data-part="facebook"] span')).toBeHidden();
    await expect(page.locator('[data-block="article-meta"] [data-part="reading"]')).toBeHidden();
    await expect(page.locator('[data-block="article-meta"] [data-part="separator"]')).toBeHidden();
    await page.setViewportSize({ width: 640, height: 900 });
    await expect(page.locator('[data-block="share-bar"] [data-part="copy"]')).toBeVisible();
    await expect(page.locator('[data-block="share-bar"] [data-part="facebook"] span')).toBeVisible();
    await expect(page.locator('[data-block="article-meta"] [data-part="reading"]')).toBeVisible();
  });

  test('changes the hero ratio 4:3 → 16:9 → 16:5 and related columns 1 → 2 → 3', async ({ page }) => {
    const ratio = () => page.evaluate(() => { const r = document.querySelector('[data-block="article-hero"]')!.getBoundingClientRect(); return Math.round((r.width / r.height) * 100) / 100; });
    const cols = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-block="related-articles"] [data-part="grid"]')!).gridTemplateColumns.split(' ').length);
    await openPaused(page, sample.tribuna, 639);
    expect(await ratio()).toBeCloseTo(4 / 3, 1);
    expect(await cols()).toBe(1);
    await page.setViewportSize({ width: 640, height: 900 });
    expect(await cols()).toBe(2);
    await page.setViewportSize({ width: 768, height: 900 });
    expect(await ratio()).toBeCloseTo(16 / 9, 1);
    expect(await cols()).toBe(3);
    await page.setViewportSize({ width: 1024, height: 900 });
    expect(await ratio()).toBeCloseTo(16 / 5, 1);
  });

  test('does not highlight a navigation item on articles (golden master)', async ({ page }) => {
    await openPaused(page, sample.tribuna, 1280);
    await expect(page.locator('[data-block="site-nav"] [aria-current="page"]')).toHaveCount(0);
  });
});
