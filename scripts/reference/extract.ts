// WEB.3 — Extrae del corpus local de referencia el contrato observable versionado.
//
//   WEB3_CORPUS_DIR=<copia temporal> npm run reference:contract            → regenera
//   WEB3_CORPUS_DIR=<copia temporal> npm run reference:contract -- --check → compara
//
// Sólo mide (geometría, estilos computados, estados, tiempos). No copia HTML,
// CSS ni JS del corpus. No corre en CI: el corpus no se versiona.

import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import { ReferenceContractSchema, type InteractionContract, type ReferenceContract } from './schema.js';
import { BREAKPOINTS, SAMPLES, VIEWPORTS } from './spec.js';
import { measureInPage } from './measure.js';
import { corpusDirFromEnv, serveDirectory } from './serve.js';

export const CONTRACT_PATH = path.resolve(process.cwd(), 'docs/web3/reference-contract.json');
const CORPUS_COMMIT = '881745c7faf3bca123e50a3e52cd7f46082df988';
const CLOCK_START = new Date('2026-04-20T12:00:00-03:00');

async function open(browser: Browser, url: string, width: number, height = 900): Promise<Page> {
  const context = await browser.newContext({ viewport: { width, height }, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  // tsx/esbuild envuelve funciones con __name(); las funciones evaluadas en la página lo necesitan.
  await context.addInitScript('window.__name = (fn) => fn;');
  const page = await context.newPage();
  await page.clock.install({ time: CLOCK_START });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // El tiempo de la página sólo avanza con runFor(): mediciones deterministas.
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 100);
  await page.clock.runFor(1000);
  // Las transiciones CSS corren en tiempo real: esperar a que terminen antes de medir.
  await page.waitForTimeout(600);
  return page;
}

const close = (page: Page) => page.context().close();

async function measureSamples(browser: Browser, base: string): Promise<ReferenceContract['samples']> {
  const samples: ReferenceContract['samples'] = [];
  for (const sample of SAMPLES) {
    const viewports: ReferenceContract['samples'][number]['viewports'] = {};
    const orderSpecs = (sample.order ?? []).map((id) => {
      const spec = sample.parts.find((p) => p.id === id);
      if (!spec) throw new Error(`order id ${id} sin parte en ${sample.family}`);
      return { id, sel: spec.ref };
    });
    for (const width of VIEWPORTS) {
      const page = await open(browser, base + sample.ref, width);
      viewports[String(width)] = await page.evaluate(measureInPage, {
        parts: sample.parts.map((p) => ({ id: p.id, sel: p.ref })),
        order: orderSpecs
      });
      await close(page);
    }
    const flags = Object.fromEntries(
      sample.parts.map((p) => [p.id, { fixedH: !!p.fixedH, freeX: !!p.freeX, freeW: !!p.freeW, noType: !!p.noType }])
    );
    samples.push({ family: sample.family, tribuna: sample.tribuna, flags, viewports });
    console.log(`[reference] ✓ ${sample.family} (${sample.parts.length} partes × ${VIEWPORTS.length} viewports)`);
  }
  return samples;
}

const HOME_CAROUSEL = 'main > section:first-child [x-init="startTimer()"]';

async function currentSlide(page: Page, container: string): Promise<number> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel) as HTMLElement & { _x_dataStack?: Array<{ current?: number }> };
    return el._x_dataStack?.[0]?.current ?? -1;
  }, container);
}

async function measureInteractions(browser: Browser, base: string): Promise<InteractionContract> {
  // Carrusel de portada.
  let page = await open(browser, base + 'index.html', 1280);
  const homeSlides = await page.locator('main > section:first-child [x-show^="current"]').count();
  const box = (await page.locator(HOME_CAROUSEL).boundingBox())!;
  const away = async () => page.mouse.move(5, 5);
  await away();
  // Autoplay natural: secuencia de cambios con paso de 50 ms.
  const changes: Array<{ t: number; slide: number }> = [];
  let last = await currentSlide(page, HOME_CAROUSEL);
  for (let t = 50; t <= 3 * 5000 + 1000; t += 50) {
    await page.clock.runFor(50);
    const now = await currentSlide(page, HOME_CAROUSEL);
    if (now !== last) changes.push({ t, slide: now });
    last = now;
  }
  const interval = changes.length >= 2 ? changes[1].t - changes[0].t : -1;
  const loops = changes.some((c, i) => i > 0 && c.slide === 0 && changes[i - 1].slide === homeSlides - 1);
  // Navegación manual a mitad de ciclo: el próximo cambio ocurre un intervalo completo después.
  await page.clock.runFor(interval / 2);
  const beforeClick = await currentSlide(page, HOME_CAROUSEL);
  await page.locator('button[aria-label="Next slide"]').click({ force: true });
  await away();
  const afterClick = await currentSlide(page, HOME_CAROUSEL);
  let restart = -1;
  for (let t = 50; t <= interval + 500; t += 50) {
    await page.clock.runFor(50);
    if ((await currentSlide(page, HOME_CAROUSEL)) !== afterClick) {
      restart = t;
      break;
    }
  }
  const manualNavigationRestartsTimer = afterClick === (beforeClick + 1) % homeSlides && restart === interval;
  // Transición del slide entrante.
  await page.locator('button[aria-label="Next slide"]').click({ force: true });
  await page.clock.runFor(16);
  const fade = await page.evaluate(() => {
    const slides = [...document.querySelectorAll('main > section:first-child [x-show^="current"]')] as HTMLElement[];
    const entering = slides.find((s) => getComputedStyle(s).transitionDuration !== '0s')!;
    const cs = getComputedStyle(entering);
    return { ms: parseFloat(cs.transitionDuration) * 1000, easing: cs.transitionTimingFunction, property: cs.transitionProperty };
  });
  await page.clock.runFor(1000);
  await page.waitForTimeout(500);
  const dots = await page.evaluate(() => {
    const ds = [...document.querySelectorAll('main > section:first-child button[aria-label^="Go to slide"]')] as HTMLElement[];
    const widths = ds.map((d) => d.getBoundingClientRect().width);
    return {
      active: Math.max(...widths),
      inactive: Math.min(...widths),
      height: ds[0].getBoundingClientRect().height,
      transitionMs: parseFloat(getComputedStyle(ds[0]).transitionDuration) * 1000
    };
  });
  // Drag con mouse: 49px no cambia, 50px sí.
  const cx = box.x + box.width / 2;
  // Zona de imagen sin enlaces (arrastrar sobre un enlace inicia drag&drop nativo).
  const cy = box.y + 60;
  const drag = async (dx: number) => {
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - dx, cy);
    await page.mouse.up();
    await away();
  };
  let s0 = await currentSlide(page, HOME_CAROUSEL);
  await drag(49);
  const dragBelowThresholdChanges = (await currentSlide(page, HOME_CAROUSEL)) !== s0;
  await drag(50);
  const dragged = (await currentSlide(page, HOME_CAROUSEL)) === (s0 + 1) % homeSlides;
  // Pausa con hover.
  await page.mouse.move(cx, cy);
  s0 = await currentSlide(page, HOME_CAROUSEL);
  await page.clock.runFor(interval * 2 + 500);
  const pausesOnHover = (await currentSlide(page, HOME_CAROUSEL)) === s0;
  // Opacidad de flechas (transición CSS en tiempo real).
  await page.waitForTimeout(500);
  const arrowsOpacityHover = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('button[aria-label="Previous slide"]')!).opacity));
  await away();
  await page.waitForTimeout(500);
  const arrowsOpacityIdle = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('button[aria-label="Previous slide"]')!).opacity));
  await close(page);

  const slidesOf = async (file: string) => {
    const p = await open(browser, base + file, 1280);
    const n = await p.locator('main [x-show^="current"]').count();
    await close(p);
    return n;
  };
  const categorySlides = await slidesOf('technology.html');
  const categoryTwoSlideVariant = await slidesOf('politics.html');

  // Navegación.
  const toggleVisible = async (width: number) => {
    const p = await open(browser, base + 'index.html', width);
    const v = await p.locator('button[aria-label="Toggle menu"]').isVisible();
    await close(p);
    return v;
  };
  let hamburgerBelowPx = 0;
  for (const bp of BREAKPOINTS) if ((await toggleVisible(bp - 1)) && !(await toggleVisible(bp))) hamburgerBelowPx = bp;
  page = await open(browser, base + 'index.html', 375, 800);
  await page.locator('button[aria-label="Toggle menu"]').click();
  await page.clock.runFor(400);
  const menu = await page.evaluate(() => {
    const panel = document.querySelector('nav div[x-show="mobileMenu"]') as HTMLElement;
    const nav = document.querySelector('body > nav')!.getBoundingClientRect();
    const cs = getComputedStyle(panel);
    return {
      position: cs.position,
      below: Math.abs(panel.getBoundingClientRect().top - nav.bottom) <= 1,
      maxVh: Math.round((parseFloat(cs.maxHeight) / window.innerHeight) * 100),
      sticky: parseFloat(getComputedStyle(document.querySelector('body > nav')!).top),
      zIndex: getComputedStyle(document.querySelector('body > nav')!).zIndex
    };
  });
  await page.mouse.click(200, 780);
  await page.clock.runFor(400);
  const menuClosesOnOutsideClick = await page.locator('nav div[x-show="mobileMenu"]').isHidden();
  const navHeight = (await page.locator('body > nav').boundingBox())!.height;
  await page.locator('button[aria-label="Search"]').click();
  await page.clock.runFor(400);
  const searchFocusesInput = await page.evaluate(() => document.activeElement?.tagName === 'INPUT');
  const searchBarInFlow = (await page.locator('body > nav').boundingBox())!.height > navHeight;
  await close(page);

  // Back-to-top.
  page = await open(browser, base + 'index.html', 1280);
  const btt = 'button[aria-label="Back to top"]';
  const shownAt = async (y: number) => {
    await page.evaluate((top) => {
      window.scrollTo(0, top);
      window.dispatchEvent(new Event('scroll'));
    }, y);
    await page.clock.runFor(400);
    return page.locator(btt).isVisible();
  };
  const hiddenAt400 = !(await shownAt(400));
  const shownAt401 = await shownAt(401);
  const bttBox = await page.evaluate((sel) => {
    const el = document.querySelector(sel)!;
    const cs = getComputedStyle(el);
    return { right: parseFloat(cs.right), bottom: parseFloat(cs.bottom), size: el.getBoundingClientRect().width };
  }, btt);
  await page.evaluate(() => {
    window.scrollTo(0, 3000);
    window.dispatchEvent(new Event('scroll'));
  });
  await page.clock.runFor(400);
  await page.locator(btt).click();
  const scrolledInstant = await page.evaluate(() => window.scrollY === 0);
  await close(page);

  // Copiar enlace.
  page = await open(browser, base + 'sports-wimbledon.html', 1280);
  const share = 'main [x-data*="copied"]';
  const copiedState = () =>
    page.evaluate((sel) => (document.querySelector(sel) as HTMLElement & { _x_dataStack?: Array<{ copied?: boolean }> })._x_dataStack?.[0]?.copied ?? false, share);
  await page.locator(`${share} button`).click();
  await page.waitForFunction((sel) => (document.querySelector(sel) as HTMLElement & { _x_dataStack?: Array<{ copied?: boolean }> })._x_dataStack?.[0]?.copied === true, share);
  let feedbackMs = 0;
  for (let t = 50; t <= 4000; t += 50) {
    await page.clock.runFor(50);
    if (!(await copiedState())) {
      feedbackMs = t;
      break;
    }
  }
  await close(page);

  // Contacto + FAQ.
  page = await open(browser, base + 'contact.html', 1280);
  const options = await page.locator('main main form select option').count();
  const conditionalSubjectIndexes: number[] = [];
  for (let i = 1; i < options; i++) {
    await page.locator('main main form select').selectOption({ index: i });
    await page.clock.runFor(100);
    if (await page.locator('main main form [x-show="showOrg"]').isVisible()) conditionalSubjectIndexes.push(i);
  }
  const faqButtons = page.locator('main main section[x-data] button');
  const faqItems = await faqButtons.count();
  await faqButtons.nth(0).click();
  await page.clock.runFor(50);
  const faqEnterMs = await page.evaluate(() => {
    const answer = [...document.querySelectorAll('main main section[x-data] [x-show]')].find((e) => getComputedStyle(e).display !== 'none')!;
    return parseFloat(getComputedStyle(answer).transitionDuration) * 1000;
  });
  await page.clock.runFor(400);
  await faqButtons.nth(1).click();
  await page.clock.runFor(400);
  const openAnswers = await page.evaluate(
    () => [...document.querySelectorAll('main main section[x-data] [x-show]')].filter((e) => getComputedStyle(e).display !== 'none').length
  );
  // Envío y reinicio.
  const form = page.locator('main main form');
  for (const input of await form.locator('input[required][type="text"], input[required][type="email"]').all()) {
    await input.fill((await input.getAttribute('type')) === 'email' ? 'demo@example.com' : 'Demo');
  }
  await form.locator('textarea').fill('Demo');
  await form.locator('input[type="checkbox"]').check();
  await form.locator('button[type="submit"]').click();
  await page.clock.runFor(400);
  const sentShown = await page.locator('main main [x-show="sent"]').isVisible();
  await page.locator('main main [x-show="sent"] button').click();
  await page.clock.runFor(400);
  const resetsAfterSend = sentShown && (await form.isVisible());
  await close(page);

  // Empleos.
  page = await open(browser, base + 'careers.html', 1280);
  const filters = page.locator('#open-roles > div:nth-of-type(2) button');
  const filterCount = await filters.count();
  const visibleJobs = () => page.locator(`#open-roles [x-show^="visible"]`).filter({ visible: true }).count();
  const perFilter: number[] = [];
  for (let i = 0; i < filterCount; i++) {
    await filters.nth(i).click();
    await page.clock.runFor(100);
    perFilter.push(await visibleJobs());
  }
  await filters.nth(0).click();
  await page.clock.runFor(100);
  const jobButtons = page.locator('#open-roles [x-show^="visible"] > button');
  await jobButtons.nth(0).click();
  await page.clock.runFor(400);
  await jobButtons.nth(1).click();
  await page.clock.runFor(400);
  const openJobs = await page.locator('#open-roles [x-show^="openId"]').filter({ visible: true }).count();
  const jobs = await page.locator('#open-roles [x-show^="visible"]').count();
  await close(page);

  // Sidebar sticky y truncados.
  page = await open(browser, base + 'sports-wimbledon.html', 1280);
  const sidebarStickyTop = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main aside .sticky')!).top));
  const crumb = await page.evaluate(() => (document.querySelector('main > div.bg-gray-100 span') as HTMLElement).innerText.trim().length);
  await close(page);
  page = await open(browser, base + 'index.html', 1280);
  const truncation = await page.evaluate(() => {
    const max = (sel: string) => Math.max(...[...document.querySelectorAll(sel)].map((e) => (e as HTMLElement).innerText.trim().length));
    return {
      trendingTitle: max('main > section:first-child article h4'),
      trendingExcerpt: max('main > section:first-child article p'),
      listTitle: max('main article.border-l-4 h4'),
      listExcerpt: max('main article.border-l-4 p'),
      thumbListTitle: max('main article.flex.items-center h4'),
      thumbListExcerpt: max('main article.flex.items-center p'),
      popularExcerpt: max('main aside .bg-black p')
    };
  });
  await close(page);

  return {
    carousel: {
      homeSlides,
      categorySlides,
      categoryTwoSlideVariant,
      intervalMs: interval,
      loops,
      fadeMs: fade.ms,
      fadeEasing: fade.easing,
      fadeProperty: fade.property,
      controlTransitionMs: dots.transitionMs,
      dragThresholdPx: dragged && !dragBelowThresholdChanges ? 50 : -1,
      dragBelowThresholdChanges,
      pausesOnHover,
      manualNavigationRestartsTimer,
      arrowsOpacityIdle,
      arrowsOpacityHover,
      dotActiveWidth: dots.active,
      dotWidth: dots.inactive,
      dotHeight: dots.height
    },
    nav: {
      hamburgerBelowPx,
      menuPanelPosition: menu.position,
      menuPanelBelowNav: menu.below,
      menuMaxHeightVh: menu.maxVh,
      menuClosesOnOutsideClick,
      searchFocusesInput,
      searchBarInFlow,
      stickyTop: menu.sticky,
      zIndex: menu.zIndex
    },
    backToTop: {
      thresholdPx: hiddenAt400 && shownAt401 ? 400 : -1,
      rightPx: bttBox.right,
      bottomPx: bttBox.bottom,
      size: bttBox.size,
      smoothScroll: !scrolledInstant
    },
    copyLink: { feedbackMs },
    faq: { items: faqItems, singleOpen: openAnswers === 1, enterMs: faqEnterMs },
    careers: { jobs, filters: filterCount, perFilter, singleOpen: openJobs === 1 },
    contact: { subjects: options - 1, conditionalSubjectIndexes, resetsAfterSend },
    sidebarStickyTop,
    truncation: { ...truncation, breadcrumb: crumb }
  };
}

export async function extractContract(): Promise<ReferenceContract> {
  const corpus = corpusDirFromEnv();
  const server = await serveDirectory(corpus);
  const browser = await chromium.launch();
  try {
    const samples = await measureSamples(browser, server.url);
    const interactions = await measureInteractions(browser, server.url);
    console.log('[reference] ✓ interacciones');
    return ReferenceContractSchema.parse({
      version: 1,
      corpus: { html: 183, commit: CORPUS_COMMIT },
      breakpoints: [...BREAKPOINTS],
      viewports: [...VIEWPORTS],
      samples,
      interactions
    });
  } finally {
    await browser.close();
    await server.close();
  }
}

/** JSON estable y legible en diffs: cada medición ocupa una sola línea. */
export function formatContract(contract: ReferenceContract): string {
  const lines: string[] = ['{'];
  const { samples, ...rest } = contract;
  for (const [key, value] of Object.entries(rest)) lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
  lines.push('  "samples": [');
  samples.forEach((sample, si) => {
    lines.push('    {');
    lines.push(`      "family": ${JSON.stringify(sample.family)},`);
    lines.push(`      "tribuna": ${JSON.stringify(sample.tribuna)},`);
    lines.push(`      "flags": ${JSON.stringify(sample.flags)},`);
    lines.push('      "viewports": {');
    const vps = Object.entries(sample.viewports);
    vps.forEach(([vw, m], vi) => {
      lines.push(`        ${JSON.stringify(vw)}: {`);
      lines.push(`          "domOrder": ${JSON.stringify(m.domOrder)},`);
      lines.push(`          "visualOrder": ${JSON.stringify(m.visualOrder)},`);
      lines.push('          "parts": {');
      const parts = Object.entries(m.parts);
      parts.forEach(([id, value], pi) => lines.push(`            ${JSON.stringify(id)}: ${JSON.stringify(value)}${pi < parts.length - 1 ? ',' : ''}`));
      lines.push('          }');
      lines.push(`        }${vi < vps.length - 1 ? ',' : ''}`);
    });
    lines.push('      }');
    lines.push(`    }${si < samples.length - 1 ? ',' : ''}`);
  });
  lines.push('  ]');
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const check = process.argv.includes('--check');
  const contract = await extractContract();
  const json = formatContract(contract);
  if (check) {
    const current = fs.existsSync(CONTRACT_PATH) ? fs.readFileSync(CONTRACT_PATH, 'utf-8') : '';
    if (current !== json) {
      console.error('[reference] ✗ docs/web3/reference-contract.json no coincide con el corpus. Ejecutar npm run reference:contract.');
      process.exit(1);
    }
    console.log('[reference] ✓ contrato al día');
    return;
  }
  fs.mkdirSync(path.dirname(CONTRACT_PATH), { recursive: true });
  fs.writeFileSync(CONTRACT_PATH, json);
  console.log(`[reference] ✓ escrito ${path.relative(process.cwd(), CONTRACT_PATH)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
