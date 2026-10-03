// WEB.3 — Visibilidad del botón "volver arriba".

import { BACK_TO_TOP_THRESHOLD_PX } from './constants.js';

export const shouldShowBackToTop = (scrollY: number): boolean => scrollY > BACK_TO_TOP_THRESHOLD_PX;
