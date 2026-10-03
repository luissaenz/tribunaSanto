import { expect, test } from '@playwright/test';
import { VIEWPORTS } from '../../scripts/reference/spec.js';
import { contract, measureTribuna, openPaused, partDiffs, scrollToY } from './support.js';

// WEB.3 — Chrome del golden master: topbar, masthead, nav sticky con
// hamburguesa y búsqueda, pie y volver arriba.

const CHROME = /^(top-bar|masthead|site-nav|site-footer|back-to-top)(\/|$)/;
const { nav, backToTop } = contract.interactions;

test.describe('chrome fidelity', () => {
  for (const vw of VIEWPORTS) {
    test(`home chrome matches the golden master at ${vw}px`, async ({ page }) => {
      await openPaused(page, '/', vw);
      expect(partDiffs('home', vw, await measureTribuna(page, 'home'), (id) => CHROME.test(id))).toEqual([]);
    });
  }
});

test.describe('navigation', () => {
  test('shows the hamburger below 1024 px and desktop links from 1024 px', async ({ page }) => {
    await openPaused(page, '/', nav.hamburgerBelowPx - 1);
    await expect(page.locator('[data-part="menu-toggle"]')).toBeVisible();
    await expect(page.locator('[data-part="links"]')).toBeHidden();
    await page.setViewportSize({ width: nav.hamburgerBelowPx, height: 900 });
    await expect(page.locator('[data-part="menu-toggle"]')).toBeHidden();
    await expect(page.locator('[data-part="links"]')).toBeVisible();
    await expect(page.locator('[data-part="links"] a[aria-current="page"]')).toHaveText('Inicio');
  });

  for (const vw of [375, 1023]) {
    test(`opens and closes the mobile menu at ${vw}px (click outside, Escape, aria-expanded)`, async ({ page }) => {
      await openPaused(page, '/', vw, 800);
      const toggle = page.locator('[data-part="menu-toggle"]');
      const panel = page.locator('#menu-mobile');
      await expect(panel).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await page.clock.runFor(400);
      await expect(panel).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const geometry = await page.evaluate(() => {
        const p = document.querySelector('#menu-mobile')!;
        const n = document.querySelector('[data-block="site-nav"]')!.getBoundingClientRect();
        const cs = getComputedStyle(p);
        return { position: cs.position, top: p.getBoundingClientRect().top, navBottom: n.bottom, maxVh: Math.round((parseFloat(cs.maxHeight) / innerHeight) * 100) };
      });
      expect(geometry.position).toBe(nav.menuPanelPosition);
      expect(Math.abs(geometry.top - geometry.navBottom)).toBeLessThanOrEqual(1);
      expect(geometry.maxVh).toBe(nav.menuMaxHeightVh);
      await page.mouse.click(vw / 2, 790);
      await page.clock.runFor(400);
      await expect(panel).toBeHidden();
      await toggle.click();
      await page.clock.runFor(400);
      await expect(panel).toBeVisible();
      await page.keyboard.press('Escape');
      await page.clock.runFor(400);
      await expect(panel).toBeHidden();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  }

  test('keeps the nav sticky at the top after scrolling', async ({ page }) => {
    await openPaused(page, '/', 1280);
    await scrollToY(page, 1500);
    const top = await page.evaluate(() => {
      const el = document.querySelector('[data-block="site-nav"]')!;
      return { top: el.getBoundingClientRect().top, position: getComputedStyle(el).position, z: getComputedStyle(el).zIndex };
    });
    expect(top).toEqual({ top: nav.stickyTop, position: 'sticky', z: nav.zIndex });
  });
});

test.describe('search', () => {
  test('toggles the search bar in flow, focuses the input and navigates to the demo destination', async ({ page }) => {
    await openPaused(page, '/', 375, 800);
    const navBox = await page.locator('[data-block="site-nav"]').boundingBox();
    await page.locator('[data-part="search-toggle"]').click();
    await page.clock.runFor(400);
    await expect(page.locator('#busqueda')).toBeVisible();
    await expect(page.locator('[data-part="search-toggle"]')).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('x-ref'))).toBe('searchInput');
    expect((await page.locator('[data-block="site-nav"]').boundingBox())!.height).toBeGreaterThan(navBox!.height);
    // Consulta vacía: no navega.
    await page.keyboard.press('Enter');
    await page.clock.runFor(200);
    expect(new URL(page.url()).pathname).toBe('/');
    await page.keyboard.type(' San Martín ');
    await Promise.all([page.waitForURL(/\/demo\/ultimas\/\?q=/), page.keyboard.press('Enter')]);
    expect(new URL(page.url()).search).toBe('?q=San%20Mart%C3%ADn');
  });

  test('closes the search bar again with the toggle and with Escape', async ({ page }) => {
    await openPaused(page, '/', 1280);
    const toggle = page.locator('[data-part="search-toggle"]');
    await toggle.click();
    await page.clock.runFor(400);
    await expect(page.locator('#busqueda')).toBeVisible();
    await toggle.click();
    await page.clock.runFor(400);
    await expect(page.locator('#busqueda')).toBeHidden();
    await toggle.click();
    await page.clock.runFor(400);
    await page.keyboard.press('Escape');
    await page.clock.runFor(400);
    await expect(page.locator('#busqueda')).toBeHidden();
  });
});

test.describe('back to top and footer', () => {
  test('appears only beyond 400 px and returns to the top', async ({ page }) => {
    await openPaused(page, '/', 1280);
    const button = page.locator('[data-block="back-to-top"]');
    await scrollToY(page, backToTop.thresholdPx - 1);
    await expect(button).toBeHidden();
    await scrollToY(page, backToTop.thresholdPx + 1);
    await expect(button).toBeVisible();
    const box = await page.evaluate(() => {
      const el = document.querySelector('[data-block="back-to-top"]')!;
      const cs = getComputedStyle(el);
      return { right: parseFloat(cs.right), bottom: parseFloat(cs.bottom), size: el.getBoundingClientRect().width, position: cs.position };
    });
    expect(box).toEqual({ right: backToTop.rightPx, bottom: backToTop.bottomPx, size: backToTop.size, position: 'fixed' });
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBe(0);
  });

  test('stacks the footer in one column below 768 px and uses three columns from 768 px', async ({ page }) => {
    await openPaused(page, '/', 767);
    const cols = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-block="site-footer"] [data-part="grid"]')!).gridTemplateColumns.split(' ').length);
    expect(await cols()).toBe(1);
    await page.setViewportSize({ width: 768, height: 900 });
    expect(await cols()).toBe(3);
  });

  test('keeps the newsletter as a no-op demo form (no navigation, no request)', async ({ page }) => {
    await openPaused(page, '/', 1280);
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.locator('[data-part="newsletter-input"]').fill('demo@example.com');
    await page.locator('[data-part="newsletter-button"]').click();
    await page.clock.runFor(500);
    expect(new URL(page.url()).pathname).toBe('/');
    expect(requests.filter((u) => !u.includes('/_astro/') && !u.includes('/demo/img/'))).toEqual([]);
  });
});
