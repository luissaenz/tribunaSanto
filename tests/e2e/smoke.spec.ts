import { expect, test } from '@playwright/test';

// WEB.3 — Humo: el build estático se sirve y la portada responde con un único H1.
test('home is served from the static build with a single h1', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
});
