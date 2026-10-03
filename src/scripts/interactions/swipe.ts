// WEB.3 — Decisión de arrastre/swipe: desplazamiento ≥ umbral avanza (izquierda)
// o retrocede (derecha); por debajo del umbral no hace nada.

import { CAROUSEL_DRAG_THRESHOLD_PX } from './constants.js';

export type SwipeDirection = 'next' | 'prev' | null;

export function swipeDirection(startX: number, endX: number, threshold = CAROUSEL_DRAG_THRESHOLD_PX): SwipeDirection {
  const delta = startX - endX;
  if (Math.abs(delta) < threshold) return null;
  return delta > 0 ? 'next' : 'prev';
}

type PointerLike = { clientX?: number; touches?: ArrayLike<{ clientX: number }>; changedTouches?: ArrayLike<{ clientX: number }> };

export const startX = (e: PointerLike): number => (e.touches && e.touches.length ? e.touches[0].clientX : (e.clientX ?? 0));
export const endX = (e: PointerLike): number =>
  e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientX : (e.clientX ?? 0);
