// DEMO ONLY: slides del carrusel de cada sección (WEB.3).
// Por defecto, las 3 notas más nuevas de la sección; `primera` usa 2 para
// reproducir la variante de dos slides observada en el golden master.

import type { SectionId } from '../presentation/taxonomy.js';

export const CATEGORY_CAROUSEL_SLIDES: Readonly<Record<SectionId, number>> = {
  primera: 2,
  mercado: 3,
  juveniles: 3,
  club: 3,
  ciudadela: 3,
  memoria: 3
};
