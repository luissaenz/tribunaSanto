// WEB.3 — Contrato derivado del golden master: válido, sin código del corpus y
// capaz de detectar las regresiones de fidelidad críticas (mutantes M11–M15).
// No requiere /web: sólo lee docs/web3/reference-contract.json.

import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { SAMPLES, VIEWPORTS, BREAKPOINTS } from '../../scripts/reference/spec.js';
import type { Measurement, PageMeasurement } from '../../scripts/reference/measure.js';
import { CONTRACT_FILE, compareInteractions, comparePage, readContract } from '../support/fidelity.js';

const contract = readContract();
const sample = (family: string) => contract.samples.find((s) => s.family === family)!;
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const asMeasured = (family: string, vw: number): PageMeasurement => clone(sample(family).viewports[String(vw)]);

describe('golden-master reference contract', () => {
  it('is valid, versioned and covers every sample family, viewport and breakpoint', () => {
    expect(contract.corpus).toEqual({ html: 183, commit: '881745c7faf3bca123e50a3e52cd7f46082df988' });
    expect(contract.viewports).toEqual([...VIEWPORTS]);
    expect(contract.breakpoints).toEqual([...BREAKPOINTS]);
    expect(contract.samples.map((s) => s.family)).toEqual(SAMPLES.map((s) => s.family));
    for (const s of contract.samples) expect(Object.keys(s.viewports)).toEqual(VIEWPORTS.map(String));
  });

  it('stores only derived measurements: no markup, CSS or script from the corpus', () => {
    const raw = fs.readFileSync(CONTRACT_FILE, 'utf-8');
    expect(raw).not.toMatch(/<[a-z!/]|x-data|class=|@media|function|=>|\.html|img\//i);
  });

  it('records the observed carousel, navigation and back-to-top behaviour', () => {
    const { carousel, nav, backToTop, copyLink } = contract.interactions;
    expect(carousel).toMatchObject({ homeSlides: 3, categorySlides: 3, categoryTwoSlideVariant: 2, intervalMs: 5000, loops: true, fadeMs: 700, dragThresholdPx: 50 });
    expect(nav).toMatchObject({ hamburgerBelowPx: 1024, stickyTop: 0, menuPanelPosition: 'absolute' });
    expect(backToTop.thresholdPx).toBe(400);
    expect(copyLink.feedbackMs).toBe(2000);
    expect(contract.interactions.sidebarStickyTop).toBe(64);
  });

  it('accepts the reference itself (zero differences)', () => {
    for (const s of contract.samples) {
      for (const vw of VIEWPORTS) expect(comparePage(s, String(vw), asMeasured(s.family, vw))).toEqual([]);
    }
    expect(compareInteractions(contract.interactions, clone(contract.interactions))).toEqual([]);
  });
});

describe('fidelity mutation tests (GREEN on the contract, RED on the mutant)', () => {
  const mutatePart = (family: string, vw: number, id: string, patch: Partial<Measurement>) => {
    const m = asMeasured(family, vw);
    m.parts[id] = { ...m.parts[id], ...patch } as Measurement;
    return comparePage(sample(family), String(vw), m);
  };

  it('M11 hero carousel converted into a static hero', () => {
    const staticHero = clone(contract.interactions);
    staticHero.carousel.homeSlides = 1;
    staticHero.carousel.intervalMs = -1;
    staticHero.carousel.loops = false;
    const diffs = compareInteractions(contract.interactions, staticHero);
    expect(diffs).toEqual(expect.arrayContaining([expect.stringMatching(/carousel\.homeSlides/), expect.stringMatching(/carousel\.intervalMs/)]));
    expect(mutatePart('home', 1280, 'hero-carousel/dots', { present: false, visible: false })).not.toEqual([]);
  });

  it('M12 navigation stops being sticky', () => {
    expect(mutatePart('home', 1280, 'site-nav', { position: 'static', top: null })).toEqual(
      expect.arrayContaining([expect.stringMatching(/site-nav: position/)])
    );
  });

  it('M13 hamburger breakpoint moves', () => {
    expect(mutatePart('home', 1024, 'site-nav/menu-toggle', { visible: true })).not.toEqual([]);
    expect(mutatePart('home', 768, 'site-nav/menu-toggle', { visible: false })).not.toEqual([]);
    const moved = clone(contract.interactions);
    moved.nav.hamburgerBelowPx = 768;
    expect(compareInteractions(contract.interactions, moved)).not.toEqual([]);
  });

  it('M14 typography or palette regress to WEB.2 (Georgia / #b5121b)', () => {
    expect(mutatePart('home', 1280, 'masthead/name', { font: 'other' })).toEqual(expect.arrayContaining([expect.stringMatching(/font esperado/)]));
    expect(mutatePart('home', 1280, 'trending/title', { bg: 'rgba(181,18,27,1.00)' })).toEqual(expect.arrayContaining([expect.stringMatching(/background/)]));
  });

  it('M15 a reference family or component disappears', () => {
    expect(mutatePart('author', 1280, 'author-box', { present: false, visible: false })).toEqual(
      expect.arrayContaining([expect.stringMatching(/author-box: present/)])
    );
    const noPhotos = asMeasured('home', 375);
    noPhotos.domOrder = noPhotos.domOrder.filter((id) => id !== 'photos-rail');
    expect(comparePage(sample('home'), '375', noPhotos)).not.toEqual([]);
  });
});
