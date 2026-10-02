// WEB.2 — Única fuente de URLs internas de la web demo.
//
// Todas las rutas, salvo la portada, viven bajo el namespace provisional /demo/.
// No constituyen routing SEO definitivo.

import type { WebStory } from './story.js';
import { getSection, getTopic, type SectionId, type TopicId } from './taxonomy.js';

export const DEMO_NAMESPACE = '/demo/';
export const LATEST_PAGE_SIZE = 8;

export const routes = {
  home: () => '/',
  article: (story: WebStory) => `/demo/${story.presentation.demoId}/`,
  section: (id: SectionId) => `/demo/seccion/${getSection(id).slug}/`,
  topic: (id: TopicId) => `/demo/tema/${getTopic(id).slug}/`,
  latest: (page = 1) => (page <= 1 ? '/demo/ultimas/' : `/demo/ultimas/${page}/`),
  about: () => '/demo/acerca/'
} as const;
