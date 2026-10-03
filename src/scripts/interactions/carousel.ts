// WEB.3 — Lógica pura del carrusel (sin DOM ni Alpine).

export const nextIndex = (current: number, count: number): number => (current + 1) % count;
export const prevIndex = (current: number, count: number): number => (current - 1 + count) % count;
export const clampIndex = (index: number, count: number): number => Math.min(Math.max(index, 0), count - 1);
