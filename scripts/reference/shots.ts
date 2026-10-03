// WEB.3 — Capturas lado a lado (referencia local vs Tribuna Santo) para revisión humana.
//
//   WEB3_CORPUS_DIR=<copia temporal> npm run reference:shots
//
// Requiere `npm run build`. Las capturas quedan en tmp/web3/shots/ (ignorado):
// las imágenes del golden master nunca se versionan.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { SAMPLES } from './spec.js';
import { corpusDirFromEnv, serveDirectory } from './serve.js';

const OUT = path.resolve(process.cwd(), 'tmp/web3/shots');
const WIDTHS = [375, 768, 1280];

async function main() {
  const corpus = corpusDirFromEnv();
  const reference = await serveDirectory(corpus);
  const tribuna = await serveDirectory(path.resolve(process.cwd(), 'dist'));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const sample of SAMPLES) {
      for (const width of WIDTHS) {
        for (const [side, url] of [
          ['referencia', reference.url + sample.ref],
          ['tribuna', tribuna.url.replace(/\/$/, '') + sample.tribuna]
        ] as const) {
          const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'es-AR' });
          const page = await context.newPage();
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(300);
          await page.screenshot({ path: path.join(OUT, `${sample.family}-${width}-${side}.png`), fullPage: true });
          await context.close();
        }
      }
      console.log(`[reference] ✓ capturas ${sample.family}`);
    }
  } finally {
    await browser.close();
    await reference.close();
    await tribuna.close();
  }
  console.log(`[reference] ✓ ${path.relative(process.cwd(), OUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
