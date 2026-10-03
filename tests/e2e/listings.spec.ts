import { expect, test } from '@playwright/test';
import { contract, openPaused, sampleContract, scrollToY } from './support.js';

// WEB.3 — Secciones, temas y últimas: carrusel de sección, sidebar sticky y paginación.

test.describe('listing behaviour', () => {
  test('section carousels render 3 slides, and 2 for the two-slide variant', async ({ page }) => {
    await openPaused(page, sampleContract('section').tribuna);
    await expect(page.locator('[data-block="hero-carousel"] [data-part="slide"]')).toHaveCount(contract.interactions.carousel.categorySlides);
    await openPaused(page, sampleContract('section-two-slides').tribuna);
    await expect(page.locator('[data-block="hero-carousel"] [data-part="slide"]')).toHaveCount(contract.interactions.carousel.categoryTwoSlideVariant);
    await expect(page.locator('[data-block="hero-carousel"] [data-part="dots"] button')).toHaveCount(2);
  });

  test('section carousel autoplays and loops like the home carousel', async ({ page }) => {
    await openPaused(page, sampleContract('section-two-slides').tribuna);
    await page.mouse.move(2, 2);
    const current = () => page.evaluate(() => (document.querySelector('[data-block="hero-carousel"]') as HTMLElement & { _x_dataStack: Array<{ current: number }> })._x_dataStack[0].current);
    const seen: number[] = [];
    for (let i = 0; i < 3; i++) {
      await page.clock.runFor(contract.interactions.carousel.intervalMs);
      seen.push(await current());
    }
    expect(new Set(seen)).toEqual(new Set([0, 1]));
  });

  test('keeps the standard sidebar sticky at 64 px on desktop', async ({ page }) => {
    await openPaused(page, sampleContract('section').tribuna, 1280);
    await scrollToY(page, 600);
    const sticky = await page.evaluate(() => {
      const el = document.querySelector('[data-block="standard-sidebar"]')!;
      return { position: getComputedStyle(el).position, top: parseFloat(getComputedStyle(el).top), y: Math.round(el.getBoundingClientRect().top) };
    });
    expect(sticky).toEqual({ position: 'sticky', top: contract.interactions.sidebarStickyTop, y: contract.interactions.sidebarStickyTop });
  });

  test('paginates sections, topics and latest with a single current page and prev/next', async ({ page }) => {
    for (const [route, current, pages] of [
      ['/demo/seccion/juveniles/', 1, 2],
      ['/demo/seccion/juveniles/2/', 2, 2],
      ['/demo/tema/entrenamiento/2/', 2, 2],
      ['/demo/ultimas/', 1, 5],
      ['/demo/ultimas/5/', 5, 5]
    ] as const) {
      await page.goto(route);
      const nav = page.locator('[data-block="pagination"]');
      await expect(nav.locator('[aria-current="page"]')).toHaveText(new RegExp(`${current}$`));
      await expect(nav.locator('[data-part="current"], [data-part="page"]')).toHaveCount(pages);
      await expect(nav.locator('a[rel="prev"]')).toHaveCount(current > 1 ? 1 : 0);
      await expect(nav.locator('a[rel="next"]')).toHaveCount(current < pages ? 1 : 0);
    }
    for (const route of ['/demo/seccion/primera/', '/demo/tema/tactica/']) {
      await page.goto(route);
      await expect(page.locator('[data-block="pagination"]')).toHaveCount(0);
    }
  });
});
