// WEB.3 — Rutas esperadas del build, derivadas de los datos demo y de routes.ts.
// Ningún test fija el número de páginas a mano: la cuenta sale de los datos.

import { demoStories } from '../../src/data/demo-articles.js';
import { LATEST_PAGE_SIZE, routes } from '../../src/presentation/routes.js';
import { sections, topics } from '../../src/presentation/taxonomy.js';

export function expectedRoutes(): string[] {
  const latestPages = Math.ceil(demoStories.length / LATEST_PAGE_SIZE);
  return [
    routes.home(),
    ...demoStories.map((s) => routes.article(s)),
    ...sections.map((s) => routes.section(s.id)),
    ...topics.map((t) => routes.topic(t.id)),
    ...Array.from({ length: latestPages }, (_, i) => routes.latest(i + 1)),
    routes.about()
  ].sort();
}
