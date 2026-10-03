import { expect, test, type Page } from '@playwright/test';
import { alpineData, contract, openPaused } from './support.js';

// WEB.3 — Portada: estructura y carrusel (la fidelidad vive en fidelity.spec.ts).

const { carousel } = contract.interactions;
const HERO = '[data-block="hero-carousel"]';
const current = (page: Page) => alpineData<number>(page, HERO, 'current');

test.describe('home structure', () => {
  test('renders every slide server-side and the photos rail before band-3 sections in the DOM', async ({ page }) => {
    await openPaused(page, '/', 375);
    await expect(page.locator(`${HERO} [data-part="slide"]`)).toHaveCount(carousel.homeSlides);
    const order = await page.evaluate(() => {
      const photos = document.querySelector('[data-block="photos-rail"]')!;
      const band3 = document.querySelector('[data-block="section-a"][data-slot="band3a"]')!;
      return { dom: !!(photos.compareDocumentPosition(band3) & Node.DOCUMENT_POSITION_FOLLOWING), above: photos.getBoundingClientRect().top < band3.getBoundingClientRect().top };
    });
    expect(order).toEqual({ dom: true, above: true });
  });
});

test.describe('hero carousel', () => {
  test.beforeEach(async ({ page }) => {
    await openPaused(page, '/', 1280);
    await page.mouse.move(2, 2);
  });

  test('autoplays every 5000 ms and loops', async ({ page }) => {
    const changes: Array<{ t: number; slide: number }> = [];
    let last = await current(page);
    for (let t = 50; t <= carousel.intervalMs * 3 + 1000; t += 50) {
      await page.clock.runFor(50);
      const now = await current(page);
      if (now !== last) changes.push({ t, slide: now });
      last = now;
    }
    expect(changes.map((c) => c.slide)).toEqual([1, 2, 0]);
    for (let i = 1; i < changes.length; i++) expect(Math.abs(changes[i].t - changes[i - 1].t - carousel.intervalMs)).toBeLessThanOrEqual(150);
  });

  test('prev/next navigate, loop and restart the timer', async ({ page }) => {
    await page.clock.runFor(carousel.intervalMs / 2);
    await page.locator(`${HERO} [data-part="next"]`).click({ force: true });
    await page.mouse.move(2, 2);
    expect(await current(page)).toBe(1);
    await page.clock.runFor(carousel.intervalMs - 100);
    expect(await current(page)).toBe(1);
    await page.clock.runFor(200);
    expect(await current(page)).toBe(2);
    await page.locator(`${HERO} [data-part="prev"]`).click({ force: true });
    await page.locator(`${HERO} [data-part="prev"]`).click({ force: true });
    await page.locator(`${HERO} [data-part="prev"]`).click({ force: true });
    await page.mouse.move(2, 2);
    expect(await current(page)).toBe(2);
  });

  test('dots jump to a slide with 24 x 8 active and 8 x 8 inactive indicators', async ({ page }) => {
    await page.locator(`${HERO} button[aria-label="Ir a la nota 3"]`).click();
    await page.mouse.move(2, 2);
    expect(await current(page)).toBe(2);
    await page.waitForTimeout(400);
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('[data-block="hero-carousel"] [data-part="dots"] button')].map((b) => {
        const r = b.getBoundingClientRect();
        return [Math.round(r.width), Math.round(r.height)];
      })
    );
    expect(sizes).toEqual([
      [carousel.dotWidth, carousel.dotHeight],
      [carousel.dotWidth, carousel.dotHeight],
      [carousel.dotActiveWidth, carousel.dotHeight]
    ]);
    await expect(page.locator(`${HERO} button[aria-label="Ir a la nota 3"]`)).toHaveAttribute('aria-current', 'true');
  });

  test('pauses on hover and on keyboard focus, then resumes', async ({ page }) => {
    const box = (await page.locator(HERO).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 40);
    await page.clock.runFor(carousel.intervalMs * 2 + 500);
    expect(await current(page)).toBe(0);
    await page.mouse.move(2, 2);
    await page.clock.runFor(carousel.intervalMs + 100);
    expect(await current(page)).toBe(1);
    await page.keyboard.press('Shift');
    await page.locator(`${HERO} [data-part="next"]`).focus();
    const focused = await current(page);
    await page.clock.runFor(carousel.intervalMs * 2 + 500);
    expect(await current(page)).toBe(focused);
    await page.keyboard.press('ArrowRight');
    expect(await current(page)).toBe((focused + 1) % carousel.homeSlides);
    await page.keyboard.press('ArrowLeft');
    expect(await current(page)).toBe(focused);
  });

  test('swipes with mouse and touch: 49 px is a no-op, ±50 px changes slide', async ({ page }) => {
    const box = (await page.locator(HERO).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 40;
    const drag = async (dx: number) => {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x - dx, y);
      await page.mouse.up();
      await page.mouse.move(2, 2);
    };
    await drag(carousel.dragThresholdPx - 1);
    expect(await current(page)).toBe(0);
    await drag(carousel.dragThresholdPx);
    expect(await current(page)).toBe(1);
    await drag(-carousel.dragThresholdPx);
    expect(await current(page)).toBe(0);
    const touch = async (from: number, to: number) =>
      page.evaluate(
        ({ sel, from, to, y }) => {
          const el = document.querySelector(sel)!;
          const t = (clientX: number) => new Touch({ identifier: 1, target: el, clientX, clientY: y });
          el.dispatchEvent(new TouchEvent('touchstart', { touches: [t(from)], changedTouches: [t(from)], bubbles: true }));
          el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t(to)], bubbles: true }));
        },
        { sel: HERO, from, to, y }
      );
    await touch(x, x - carousel.dragThresholdPx + 1);
    expect(await current(page)).toBe(0);
    await touch(x, x - carousel.dragThresholdPx);
    expect(await current(page)).toBe(1);
  });

  test('crossfades slides over 700 ms with the observed easing; arrows reveal on hover and focus', async ({ page }) => {
    await page.locator(`${HERO} [data-part="next"]`).click({ force: true });
    await page.clock.runFor(16);
    const fade = await page.evaluate(() => {
      const entering = [...document.querySelectorAll('[data-block="hero-carousel"] [data-part="slide"]')].find(
        (s) => getComputedStyle(s).transitionDuration !== '0s'
      )!;
      const cs = getComputedStyle(entering);
      return { ms: parseFloat(cs.transitionDuration) * 1000, easing: cs.transitionTimingFunction, property: cs.transitionProperty };
    });
    expect(fade).toEqual({ ms: carousel.fadeMs, easing: carousel.fadeEasing, property: carousel.fadeProperty });
    await page.mouse.move(2, 2);
    await page.waitForTimeout(500);
    const opacity = () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-block="hero-carousel"] [data-part="prev"]')!).opacity));
    expect(await opacity()).toBe(carousel.arrowsOpacityIdle);
    const box = (await page.locator(HERO).boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.waitForTimeout(500);
    expect(await opacity()).toBe(carousel.arrowsOpacityHover);
    await page.mouse.move(2, 2);
    await page.keyboard.press('Shift');
    await page.locator(`${HERO} [data-part="prev"]`).focus();
    await page.waitForTimeout(500);
    expect(await opacity()).toBe(1);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-block="hero-carousel"] [data-part="dot"]')!).transitionDuration)).toBe(`${carousel.controlTransitionMs / 1000}s`);
  });
});
