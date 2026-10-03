import { expect, test, type Page } from '@playwright/test';
import { BREAKPOINTS, SAMPLES, VIEWPORTS } from '../../scripts/reference/spec.js';
import type { InteractionContract } from '../../scripts/reference/schema.js';
import { compareInteractions, comparePage } from '../support/fidelity.js';
import { alpineData, contract, measureTribuna, openPaused, sampleContract, scrollToY } from './support.js';

// WEB.3 — Suite de fidelidad completa contra docs/web3/reference-contract.json.
//
// 1. Cada página muestra del contrato × 6 viewports: presencia, visibilidad,
//    posición, sticky/fixed, geometría, ratios, tipografía, colores, fondos,
//    bordes, radio, opacidad, columnas de grilla, gaps y orden DOM/visual.
// 2. Constantes de interacción: se re-miden sobre Tribuna Santo con el mismo
//    procedimiento que el extractor y se comparan con compareInteractions.
//
// Ante una diferencia se corrige la implementación; el contrato sólo cambia si
// el extractor midió objetivamente mal (con evidencia en el commit).

test.describe('golden-master coverage', () => {
  test('the contract covers every sample family at every viewport', () => {
    expect(contract.samples.map((s) => s.family)).toEqual(SAMPLES.map((s) => s.family));
    expect(contract.viewports).toEqual([...VIEWPORTS]);
    for (const sample of contract.samples) expect(Object.keys(sample.viewports).map(Number).sort((a, b) => a - b)).toEqual([...VIEWPORTS]);
  });
});

test.describe('page fidelity', () => {
  for (const { family } of SAMPLES) {
    for (const vw of VIEWPORTS) {
      test(`${family} matches the golden master at ${vw}px`, async ({ page }) => {
        const sample = sampleContract(family);
        await openPaused(page, sample.tribuna, vw);
        expect(comparePage(sample, String(vw), await measureTribuna(page, family))).toEqual([]);
      });
    }
  }
});

const HERO = '[data-block="hero-carousel"]';
const away = (page: Page) => page.mouse.move(2, 2);
const slide = (page: Page) => alpineData<number>(page, HERO, 'current');

async function measureCarousel(page: Page): Promise<InteractionContract['carousel']> {
  await openPaused(page, '/', 1280);
  const homeSlides = await page.locator(`${HERO} [data-part="slide"]`).count();
  const box = (await page.locator(HERO).boundingBox())!;
  await away(page);
  const changes: Array<{ t: number; slide: number }> = [];
  let last = await slide(page);
  for (let t = 50; t <= 3 * 5000 + 1000; t += 50) {
    await page.clock.runFor(50);
    const now = await slide(page);
    if (now !== last) changes.push({ t, slide: now });
    last = now;
  }
  const interval = changes.length >= 2 ? changes[1].t - changes[0].t : -1;
  const loops = changes.some((c, i) => i > 0 && c.slide === 0 && changes[i - 1].slide === homeSlides - 1);
  await page.clock.runFor(interval / 2);
  const beforeClick = await slide(page);
  await page.locator(`${HERO} [data-part="next"]`).click({ force: true });
  await away(page);
  const afterClick = await slide(page);
  let restart = -1;
  for (let t = 50; t <= interval + 500; t += 50) {
    await page.clock.runFor(50);
    if ((await slide(page)) !== afterClick) {
      restart = t;
      break;
    }
  }
  const manualNavigationRestartsTimer = afterClick === (beforeClick + 1) % homeSlides && restart === interval;
  await page.locator(`${HERO} [data-part="next"]`).click({ force: true });
  await page.clock.runFor(16);
  const fade = await page.evaluate(() => {
    const entering = [...document.querySelectorAll('[data-block="hero-carousel"] [data-part="slide"]')].find(
      (s) => getComputedStyle(s).transitionDuration !== '0s'
    )!;
    const cs = getComputedStyle(entering);
    return { ms: parseFloat(cs.transitionDuration) * 1000, easing: cs.transitionTimingFunction, property: cs.transitionProperty };
  });
  await page.clock.runFor(1000);
  await page.waitForTimeout(500);
  const dots = await page.evaluate(() => {
    const ds = [...document.querySelectorAll('[data-block="hero-carousel"] [data-part="dots"] button')] as HTMLElement[];
    const widths = ds.map((d) => d.getBoundingClientRect().width);
    return {
      active: Math.max(...widths),
      inactive: Math.min(...widths),
      height: ds[0].getBoundingClientRect().height,
      transitionMs: parseFloat(getComputedStyle(ds[0]).transitionDuration) * 1000
    };
  });
  const cx = box.x + box.width / 2;
  const cy = box.y + 60;
  const drag = async (dx: number) => {
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - dx, cy);
    await page.mouse.up();
    await away(page);
  };
  let s0 = await slide(page);
  await drag(49);
  const dragBelowThresholdChanges = (await slide(page)) !== s0;
  await drag(50);
  const dragged = (await slide(page)) === (s0 + 1) % homeSlides;
  await page.mouse.move(cx, cy);
  s0 = await slide(page);
  await page.clock.runFor(interval * 2 + 500);
  const pausesOnHover = (await slide(page)) === s0;
  await page.waitForTimeout(500);
  const arrowOpacity = () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-block="hero-carousel"] [data-part="prev"]')!).opacity));
  const arrowsOpacityHover = await arrowOpacity();
  await away(page);
  await page.waitForTimeout(500);
  const arrowsOpacityIdle = await arrowOpacity();

  const slidesOf = async (url: string) => {
    await openPaused(page, url, 1280);
    return page.locator(`${HERO} [data-part="slide"]`).count();
  };
  return {
    homeSlides,
    categorySlides: await slidesOf(sampleContract('section').tribuna),
    categoryTwoSlideVariant: await slidesOf(sampleContract('section-two-slides').tribuna),
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
  };
}

async function measureNav(page: Page): Promise<InteractionContract['nav']> {
  const toggleVisible = async (width: number) => {
    await openPaused(page, '/', width);
    return page.locator('[data-part="menu-toggle"]').isVisible();
  };
  let hamburgerBelowPx = 0;
  for (const bp of BREAKPOINTS) if ((await toggleVisible(bp - 1)) && !(await toggleVisible(bp))) hamburgerBelowPx = bp;
  await openPaused(page, '/', 375, 800);
  await page.locator('[data-part="menu-toggle"]').click();
  await page.clock.runFor(400);
  const menu = await page.evaluate(() => {
    const panel = document.querySelector('#menu-mobile') as HTMLElement;
    const navEl = document.querySelector('[data-block="site-nav"]')!;
    const cs = getComputedStyle(panel);
    return {
      position: cs.position,
      below: Math.abs(panel.getBoundingClientRect().top - navEl.getBoundingClientRect().bottom) <= 1,
      maxVh: Math.round((parseFloat(cs.maxHeight) / window.innerHeight) * 100),
      sticky: parseFloat(getComputedStyle(navEl).top),
      zIndex: getComputedStyle(navEl).zIndex
    };
  });
  await page.mouse.click(200, 780);
  await page.clock.runFor(400);
  const menuClosesOnOutsideClick = await page.locator('#menu-mobile').isHidden();
  const navHeight = (await page.locator('[data-block="site-nav"]').boundingBox())!.height;
  await page.locator('[data-part="search-toggle"]').click();
  await page.clock.runFor(400);
  const searchFocusesInput = await page.evaluate(() => document.activeElement?.tagName === 'INPUT');
  const searchBarInFlow = (await page.locator('[data-block="site-nav"]').boundingBox())!.height > navHeight;
  return {
    hamburgerBelowPx,
    menuPanelPosition: menu.position,
    menuPanelBelowNav: menu.below,
    menuMaxHeightVh: menu.maxVh,
    menuClosesOnOutsideClick,
    searchFocusesInput,
    searchBarInFlow,
    stickyTop: menu.sticky,
    zIndex: menu.zIndex
  };
}

async function measureBackToTop(page: Page): Promise<InteractionContract['backToTop']> {
  await openPaused(page, '/', 1280);
  const button = page.locator('[data-block="back-to-top"]');
  await scrollToY(page, 400);
  const hiddenAt400 = !(await button.isVisible());
  await scrollToY(page, 401);
  const shownAt401 = await button.isVisible();
  const box = await page.evaluate(() => {
    const el = document.querySelector('[data-block="back-to-top"]')!;
    const cs = getComputedStyle(el);
    return { right: parseFloat(cs.right), bottom: parseFloat(cs.bottom), size: el.getBoundingClientRect().width };
  });
  await scrollToY(page, 3000);
  await button.click();
  const scrolledInstant = await page.evaluate(() => window.scrollY === 0);
  return { thresholdPx: hiddenAt400 && shownAt401 ? 400 : -1, rightPx: box.right, bottomPx: box.bottom, size: box.size, smoothScroll: !scrolledInstant };
}

async function measureCopyLink(page: Page): Promise<InteractionContract['copyLink']> {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await openPaused(page, sampleContract('article').tribuna, 1280);
  const share = '[data-block="share-bar"]';
  await page.locator(`${share} [data-part="copy"]`).click();
  await expect.poll(() => alpineData<boolean>(page, share, 'copied')).toBe(true);
  let feedbackMs = 0;
  for (let t = 50; t <= 4000; t += 50) {
    await page.clock.runFor(50);
    if (!(await alpineData<boolean>(page, share, 'copied'))) {
      feedbackMs = t;
      break;
    }
  }
  return { feedbackMs };
}

async function measureContactAndFaq(page: Page): Promise<Pick<InteractionContract, 'contact' | 'faq'>> {
  await openPaused(page, sampleContract('contact').tribuna, 1280);
  const form = page.locator('[data-block="contact-form"]');
  const options = await form.locator('select option').count();
  const conditionalSubjectIndexes: number[] = [];
  for (let i = 1; i < options; i++) {
    await form.locator('select').selectOption({ index: i });
    await page.clock.runFor(100);
    if (await form.locator('[data-part="organization"]').isVisible()) conditionalSubjectIndexes.push(i);
  }
  const faqButtons = page.locator('[data-block="faq-accordion"] button');
  const items = await faqButtons.count();
  await faqButtons.nth(0).click();
  await page.clock.runFor(50);
  const enterMs = await page.evaluate(() => {
    const answer = [...document.querySelectorAll('[data-block="faq-accordion"] [data-part="answer"]')].find((e) => getComputedStyle(e).display !== 'none')!;
    return parseFloat(getComputedStyle(answer).transitionDuration) * 1000;
  });
  await page.clock.runFor(400);
  await faqButtons.nth(1).click();
  await page.clock.runFor(400);
  const openAnswers = await page.locator('[data-block="faq-accordion"] [data-part="answer"]:visible').count();
  for (const input of await form.locator('input[required][type="text"], input[required][type="email"]').all()) {
    await input.fill((await input.getAttribute('type')) === 'email' ? 'demo@example.com' : 'Demo');
  }
  await form.locator('textarea').fill('Demo');
  await form.locator('input[type="checkbox"]').check();
  await form.locator('[data-part="submit"]').click();
  await page.clock.runFor(400);
  const sentShown = await page.locator('[data-part="sent"]').first().isVisible();
  await page.locator('[data-part="sent"] button').first().click();
  await page.clock.runFor(400);
  return {
    contact: { subjects: options - 1, conditionalSubjectIndexes, resetsAfterSend: sentShown && (await form.isVisible()) },
    faq: { items, singleOpen: openAnswers === 1, enterMs }
  };
}

async function measureCareers(page: Page): Promise<InteractionContract['careers']> {
  await openPaused(page, sampleContract('careers').tribuna, 1280);
  const board = '[data-block="job-board"]';
  const filters = page.locator(`${board} [role="group"] button`);
  const filterCount = await filters.count();
  const perFilter: number[] = [];
  for (let i = 0; i < filterCount; i++) {
    await filters.nth(i).click();
    await page.clock.runFor(100);
    perFilter.push(await page.locator(`${board} [data-dept]:visible`).count());
  }
  await filters.nth(0).click();
  await page.clock.runFor(100);
  const jobButtons = page.locator(`${board} [data-dept] > button`);
  await jobButtons.nth(0).click();
  await page.clock.runFor(400);
  await jobButtons.nth(1).click();
  await page.clock.runFor(400);
  const openJobs = await page.locator(`${board} [data-part="detail"]:visible`).count();
  return { jobs: await page.locator(`${board} [data-dept]`).count(), filters: filterCount, perFilter, singleOpen: openJobs === 1 };
}

async function measureTruncation(page: Page): Promise<Record<string, number>> {
  await openPaused(page, sampleContract('article').tribuna, 1280);
  const breadcrumb = await page.evaluate(() => (document.querySelector('[data-block="breadcrumb"] [data-part="current"]') as HTMLElement).innerText.trim().length);
  await openPaused(page, '/', 1280);
  const truncation = await page.evaluate(() => {
    const max = (sel: string) => Math.max(...[...document.querySelectorAll(sel)].map((e) => (e as HTMLElement).innerText.trim().length));
    return {
      trendingTitle: max('[data-block="trending"] [data-part="item-title"]'),
      trendingExcerpt: max('[data-block="trending"] [data-part="excerpt"]'),
      listTitle: max('[data-block="section-a"] [data-part="list-item"] h3'),
      listExcerpt: max('[data-block="section-a"] [data-part="list-item"] p'),
      thumbListTitle: max('[data-block="section-d"] [data-part="list-item"] h3'),
      thumbListExcerpt: max('[data-block="section-d"] [data-part="list-item"] p'),
      popularExcerpt: max('[data-block="popular-news"] [data-part="excerpt"]')
    };
  });
  return { ...truncation, breadcrumb };
}

test.describe('interaction fidelity', () => {
  test.setTimeout(240_000);

  test('re-measured interaction constants match the golden master', async ({ page }) => {
    const carousel = await measureCarousel(page);
    const nav = await measureNav(page);
    const backToTop = await measureBackToTop(page);
    const copyLink = await measureCopyLink(page);
    const { contact, faq } = await measureContactAndFaq(page);
    const careers = await measureCareers(page);
    await openPaused(page, sampleContract('article').tribuna, 1280);
    const sidebarStickyTop = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-block="standard-sidebar"]')!).top));
    const truncation = await measureTruncation(page);
    const { truncation: expectedTruncation, ...expected } = contract.interactions;
    const actual = { carousel, nav, backToTop, copyLink, faq, careers, contact, sidebarStickyTop };
    expect(compareInteractions(expected as InteractionContract, actual as InteractionContract)).toEqual([]);
    // Los truncados del contrato son máximos observados: Tribuna Santo nunca los supera.
    const over = Object.entries(expectedTruncation).filter(([k, max]) => !(truncation[k] <= max)).map(([k, max]) => `${k}: máximo ${max} obtenido ${truncation[k]}`);
    expect(over).toEqual([]);
  });
});
