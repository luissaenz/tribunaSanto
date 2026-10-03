// WEB.3 — Rutas esperadas del build, derivadas de los datos demo y de routes.ts.
// Ningún test fija el número de páginas a mano: la cuenta sale de los datos.

import { demoStories } from '../../src/data/demo-articles.js';
import { LATEST_PAGE_SIZE, routes } from '../../src/presentation/routes.js';
import { sections, topics } from '../../src/presentation/taxonomy.js';
import { PAGE_SIZE, pageCount } from '../../src/presentation/pagination.js';
import { storiesByAuthor, storiesInSection, storiesWithTopic } from '../../src/presentation/queries.js';
import { demoAuthors } from '../../src/data/demo-authors.js';

const pages = (count: number, size: number) => Array.from({ length: pageCount(count, size) }, (_, i) => i + 1);

export function expectedRoutes(): string[] {
  const latestPages = Math.ceil(demoStories.length / LATEST_PAGE_SIZE);
  return [
    routes.home(),
    ...demoStories.map((s) => routes.article(s)),
    ...sections.flatMap((s) => pages(storiesInSection(demoStories, s.id).length, PAGE_SIZE.section).map((n) => routes.section(s.id, n))),
    ...topics.flatMap((t) => pages(storiesWithTopic(demoStories, t.id).length, PAGE_SIZE.topic).map((n) => routes.topic(t.id, n))),
    ...demoAuthors.flatMap((a) => pages(storiesByAuthor(demoStories, a.byline).length, PAGE_SIZE.author).map((n) => routes.author(a.slug, n))),
    ...Array.from({ length: latestPages }, (_, i) => routes.latest(i + 1)),
    routes.about()
  ].sort();
}
