import { expect, test, type Locator, type Page } from '@playwright/test';
import { openPaused, sampleContract, scrollToY } from './support.js';

// WEB.3 — Regresión visual de TRIBUNA SANTO (nunca de la referencia).
//
// Determinismo: reloj instalado y pausado (carrusel y fecha sólo avanzan con
// runFor), animaciones deshabilitadas, imágenes lazy forzadas a cargar, fecha
// de la barra superior y emoji de secciones enmascarados (dependen del sistema).
// Las capturas complementan, nunca reemplazan, la suite de fidelidad medida.

const FAMILIES = ['home', 'section', 'article', 'author', 'listing', 'about', 'contact', 'careers', 'legal'] as const;
const WIDTHS = [375, 768, 1280] as const;

const masks = (page: Page): Locator[] => [
  page.locator('[data-block="top-bar"] [data-part="date"]'),
  page.locator('[data-block="sidebar-categories"] a > span > span[aria-hidden="true"]')
];

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = [...document.images];
    for (const img of images) img.loading = 'eager';
    await Promise.all(images.map((img) => (img.complete ? img.decode().catch(() => undefined) : new Promise((r) => img.addEventListener('load', r, { once: true })))));
  });
  await page.mouse.move(0, 0);
}

async function open(page: Page, url: string, width: number): Promise<void> {
  await openPaused(page, url, width);
  await settle(page);
}

test.describe('visual baselines by family', () => {
  for (const family of FAMILIES) {
    for (const width of WIDTHS) {
      test(`${family} at ${width}px`, async ({ page }) => {
        await open(page, sampleContract(family).tribuna, width);
        await expect(page).toHaveScreenshot(`${family}-${width}.png`, { fullPage: true, mask: masks(page) });
      });
    }
  }
});

test.describe('visual baselines by state', () => {
  test('mobile menu open', async ({ page }) => {
    await open(page, '/', 375);
    await page.locator('[data-part="menu-toggle"]').click();
    await page.clock.runFor(400);
    await expect(page).toHaveScreenshot('state-menu-open.png', { mask: masks(page) });
  });

  test('search open', async ({ page }) => {
    await open(page, '/', 1280);
    await page.locator('[data-part="search-toggle"]').click();
    await page.clock.runFor(400);
    await expect(page).toHaveScreenshot('state-search-open.png', { mask: masks(page) });
  });

  test('hero carousel on slide 2', async ({ page }) => {
    await open(page, '/', 1280);
    await page.locator('[data-block="hero-carousel"] button[aria-label="Ir a la nota 2"]').click();
    await page.mouse.move(0, 0);
    await page.clock.runFor(1000);
    await expect(page.locator('[data-block="hero-carousel"]')).toHaveScreenshot('state-slide-2.png');
  });

  test('hero arrows on hover', async ({ page }) => {
    await open(page, '/', 1280);
    await page.locator('[data-block="hero-carousel"] [data-part="next"]').hover({ force: true });
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="hero-carousel"]')).toHaveScreenshot('state-arrows-hover.png');
  });

  test('FAQ answer open', async ({ page }) => {
    await open(page, '/demo/contacto/', 1280);
    await page.locator('[data-block="faq-accordion"] button').first().click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="faq-accordion"]')).toHaveScreenshot('state-faq-open.png');
  });

  test('careers filtered by area', async ({ page }) => {
    await open(page, '/demo/empleos/', 1280);
    await page.locator('[data-block="job-board"] [role="group"] button').nth(1).click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="job-board"]')).toHaveScreenshot('state-careers-filtered.png');
  });

  test('contact form sent', async ({ page }) => {
    await open(page, '/demo/contacto/', 1280);
    const form = page.locator('[data-block="contact-form"]');
    await form.locator('#c-nombre').fill('Juana');
    await form.locator('#c-apellido').fill('Pérez');
    await form.locator('#c-email').fill('juana@example.com');
    await form.locator('select').selectOption({ index: 1 });
    await form.locator('textarea').fill('Mensaje demo');
    await form.locator('#consent').check();
    await form.locator('[data-part="submit"]').click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-part="sent"]').first()).toHaveScreenshot('state-contact-sent.png');
  });

  test('back-to-top visible', async ({ page }) => {
    await open(page, '/', 1280);
    await scrollToY(page, 1200);
    await expect(page.locator('[data-block="back-to-top"]')).toBeVisible();
    await expect(page).toHaveScreenshot('state-back-to-top.png', { mask: masks(page) });
  });
});
