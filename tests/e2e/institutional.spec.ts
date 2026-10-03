import { expect, test } from '@playwright/test';
import { VIEWPORTS } from '../../scripts/reference/spec.js';
import { comparePage } from '../support/fidelity.js';
import { contract, measureTribuna, openPaused, sampleContract } from './support.js';

// WEB.3 — Institucionales: fidelidad y estados demo (contacto, FAQ, empleos, legales).

const { contact, faq, careers } = contract.interactions;

test.describe('institutional fidelity', () => {
  for (const family of ['about', 'contact', 'careers', 'legal']) {
    for (const vw of VIEWPORTS) {
      test(`${family} matches the golden master at ${vw}px`, async ({ page }) => {
        const sample = sampleContract(family);
        await openPaused(page, sample.tribuna, vw);
        expect(comparePage(sample, String(vw), await measureTribuna(page, family))).toEqual([]);
      });
    }
  }
});

test.describe('contact', () => {
  test('shows the organisation field only for organisation subjects', async ({ page }) => {
    await openPaused(page, '/demo/contacto/');
    const select = page.locator('[data-block="contact-form"] select');
    const org = page.locator('[data-block="contact-form"] [data-part="organization"]');
    const shown: number[] = [];
    for (let i = 1; i <= contact.subjects; i++) {
      await select.selectOption({ index: i });
      await page.clock.runFor(100);
      if (await org.isVisible()) shown.push(i);
    }
    expect(shown).toEqual(contact.conditionalSubjectIndexes);
  });

  test('submits as a demo (no request), shows success and resets with "Enviar otro"', async ({ page }) => {
    await openPaused(page, '/demo/contacto/');
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    const form = page.locator('[data-block="contact-form"]');
    await form.locator('#c-nombre').fill('Juana');
    await form.locator('#c-apellido').fill('Pérez');
    await form.locator('#c-email').fill('juana@example.com');
    await form.locator('select').selectOption({ index: 1 });
    await form.locator('textarea').fill('Mensaje demo');
    await form.locator('#consent').check();
    await form.locator('[data-part="submit"]').click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-part="sent"]').first()).toBeVisible();
    await expect(form).toBeHidden();
    expect(requests.filter((u) => !u.includes('/_astro/') && !u.includes('/demo/img/'))).toEqual([]);
    await page.locator('[data-part="sent"] button').first().click();
    await page.clock.runFor(400);
    await expect(form).toBeVisible();
  });

  test('opens one FAQ answer at a time with a 300 ms enter transition and aria-expanded', async ({ page }) => {
    await openPaused(page, '/demo/contacto/');
    const buttons = page.locator('[data-block="faq-accordion"] button');
    await expect(buttons).toHaveCount(faq.items);
    await buttons.nth(0).click();
    await page.clock.runFor(50);
    const enter = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#faq-1')!).transitionDuration) * 1000);
    expect(enter).toBe(faq.enterMs);
    await page.clock.runFor(400);
    await expect(page.locator('#faq-1')).toBeVisible();
    await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'true');
    await buttons.nth(1).click();
    await page.clock.runFor(400);
    await expect(page.locator('#faq-1')).toBeHidden();
    await expect(page.locator('#faq-2')).toBeVisible();
    await buttons.nth(1).click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="faq-accordion"] [data-part="answer"]:visible')).toHaveCount(0);
  });
});

test.describe('careers', () => {
  test('renders every job server-side and filters by area', async ({ page }) => {
    const response = await page.request.get('/demo/empleos/');
    const html = await response.text();
    expect(html.match(/data-dept="/g)).toHaveLength(careers.jobs);
    await openPaused(page, '/demo/empleos/');
    const filters = page.locator('[data-block="job-board"] [role="group"] button');
    await expect(filters).toHaveCount(careers.filters);
    const counts: number[] = [];
    for (let i = 0; i < careers.filters; i++) {
      await filters.nth(i).click();
      await page.clock.runFor(100);
      counts.push(await page.locator('[data-block="job-board"] [data-dept]:visible').count());
      await expect(filters.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
    expect(counts).toEqual(careers.perFilter);
  });

  test('opens a single job detail at a time', async ({ page }) => {
    await openPaused(page, '/demo/empleos/');
    const jobs = page.locator('[data-block="job-board"] [data-dept] > button');
    await jobs.nth(0).click();
    await page.clock.runFor(400);
    await jobs.nth(1).click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="job-board"] [data-part="detail"]:visible')).toHaveCount(1);
    await expect(jobs.nth(1)).toHaveAttribute('aria-expanded', 'true');
  });

  test('submits the application as a demo with a success state', async ({ page }) => {
    await openPaused(page, '/demo/empleos/');
    await page.locator('[data-block="apply-form"] [data-part="submit"]').click();
    await page.clock.runFor(400);
    await expect(page.locator('[data-block="apply-form"] [data-part="sent"]')).toBeVisible();
  });
});

test.describe('legal', () => {
  for (const route of ['/demo/publicidad/', '/demo/privacidad/', '/demo/terminos/']) {
    test(`${route} uses a fixed hero background and the narrow breadcrumb`, async ({ page }) => {
      await openPaused(page, route);
      const css = await page.evaluate(() => ({
        attachment: getComputedStyle(document.querySelector('[data-block="legal-hero"]')!).backgroundAttachment,
        crumb: Math.round(document.querySelector('[data-block="breadcrumb"] [data-part="inner"]')!.getBoundingClientRect().width)
      }));
      expect(css).toEqual({ attachment: 'fixed', crumb: 896 });
      await expect(page.locator('h1')).toHaveCount(1);
    });
  }
});
