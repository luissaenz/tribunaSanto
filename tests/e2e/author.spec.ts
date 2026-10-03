import { expect, test } from '@playwright/test';
import { openPaused } from './support.js';

// WEB.3 — Páginas de autor (ficticio): responsive de la caja y paginación.

test.describe('author behaviour', () => {
  test('stacks the author box with a centred avatar below 640 px and uses a row from 640 px', async ({ page }) => {
    await openPaused(page, '/demo/autor/martina-quiroga/', 639);
    const layout = () =>
      page.evaluate(() => {
        const box = document.querySelector('[data-block="author-box"]')!;
        const avatar = box.querySelector('[data-part="avatar"]')!.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        return { direction: getComputedStyle(box).flexDirection, centred: Math.abs(avatar.left + avatar.width / 2 - (b.left + b.width / 2)) < 2 };
      });
    expect(await layout()).toEqual({ direction: 'column', centred: true });
    await page.setViewportSize({ width: 640, height: 900 });
    expect(await layout()).toEqual({ direction: 'row', centred: false });
  });

  test('paginates three authors and links articles to their author page', async ({ page }) => {
    for (const [slug, pages] of [['martina-quiroga', 2], ['lucas-ferreyra', 2], ['sofia-medina', 2], ['tomas-albarracin', 1]] as const) {
      await page.goto(`/demo/autor/${slug}/`);
      await expect(page.locator('[data-block="author-box"] h1')).toHaveCount(1);
      await expect(page.locator('[data-block="pagination"]')).toHaveCount(pages > 1 ? 1 : 0);
    }
    await page.goto('/demo/juveniles-ganan-espacio/');
    await page.locator('[data-block="article-meta"] a').click();
    await expect(page).toHaveURL(/\/demo\/autor\/sofia-medina\/$/);
  });
});
