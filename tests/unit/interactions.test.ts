import { describe, it, expect } from 'vitest';
import {
  BACK_TO_TOP_THRESHOLD_PX,
  CAROUSEL_DRAG_THRESHOLD_PX,
  CAROUSEL_FADE_MS,
  CAROUSEL_INTERVAL_MS,
  CONTROL_TRANSITION_MS,
  COPY_FEEDBACK_MS
} from '../../src/scripts/interactions/constants.js';
import { clampIndex, nextIndex, prevIndex } from '../../src/scripts/interactions/carousel.js';
import { endX, startX, swipeDirection } from '../../src/scripts/interactions/swipe.js';
import { shouldShowBackToTop } from '../../src/scripts/interactions/scroll.js';
import { copyText } from '../../src/scripts/interactions/copy.js';
import { formatToday, searchUrl } from '../../src/scripts/interactions/nav.js';
import { readContract } from '../support/fidelity.js';

const { interactions } = readContract();

describe('WEB.3 interaction logic', () => {
  it('uses the timings and thresholds of the golden-master contract', () => {
    expect(CAROUSEL_INTERVAL_MS).toBe(interactions.carousel.intervalMs);
    expect(CAROUSEL_FADE_MS).toBe(interactions.carousel.fadeMs);
    expect(CAROUSEL_DRAG_THRESHOLD_PX).toBe(interactions.carousel.dragThresholdPx);
    expect(CONTROL_TRANSITION_MS).toBe(interactions.carousel.controlTransitionMs);
    expect(BACK_TO_TOP_THRESHOLD_PX).toBe(interactions.backToTop.thresholdPx);
    expect(COPY_FEEDBACK_MS).toBe(interactions.copyLink.feedbackMs);
  });

  it('loops carousel indexes in both directions', () => {
    expect([0, 1, 2].map((i) => nextIndex(i, 3))).toEqual([1, 2, 0]);
    expect([0, 1, 2].map((i) => prevIndex(i, 3))).toEqual([2, 0, 1]);
    expect(nextIndex(1, 2)).toBe(0);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(-1, 3)).toBe(0);
  });

  it('applies the 50 px swipe threshold', () => {
    expect(swipeDirection(300, 251)).toBeNull();
    expect(swipeDirection(300, 250)).toBe('next');
    expect(swipeDirection(250, 300)).toBe('prev');
    expect(swipeDirection(100, 100)).toBeNull();
    expect(startX({ touches: [{ clientX: 40 }] })).toBe(40);
    expect(startX({ clientX: 12 })).toBe(12);
    expect(endX({ changedTouches: [{ clientX: 7 }] })).toBe(7);
  });

  it('shows back-to-top only beyond 400 px', () => {
    expect(shouldShowBackToTop(400)).toBe(false);
    expect(shouldShowBackToTop(401)).toBe(true);
  });

  it('builds the demo search URL only for non-empty queries', () => {
    expect(searchUrl('   ')).toBeNull();
    expect(searchUrl(' San Martín ')).toBe('/demo/ultimas/?q=San%20Mart%C3%ADn');
  });

  it('formats the topbar date in es-AR with a capital first letter', () => {
    expect(formatToday(new Date('2026-04-15T15:00:00-03:00'))).toMatch(/^Miércoles, 15 de abril de 2026$/);
  });

  it('copies through the clipboard when available', async () => {
    const written: string[] = [];
    expect(await copyText({ writeText: async (t) => void written.push(t) }, 'https://x')).toBe(true);
    expect(written).toEqual(['https://x']);
    expect(await copyText(undefined, 'x')).toBe(false);
    expect(await copyText({ writeText: async () => Promise.reject(new Error('denied')) }, 'x')).toBe(false);
  });
});
