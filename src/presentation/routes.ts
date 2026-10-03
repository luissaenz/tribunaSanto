// WEB.2/WEB.3 — Única fuente de URLs internas de la web demo.
//
// Todas las rutas, salvo la portada, viven bajo el namespace provisional /demo/.
// No constituyen routing SEO definitivo.

import type { WebStory } from './story.js';
import { PAGE_SIZE } from './pagination.js';
import { getSection, getTopic, type SectionId, type TopicId } from './taxonomy.js';

export const DEMO_NAMESPACE = '/demo/';
export const LATEST_PAGE_SIZE = PAGE_SIZE.listing;

const paged = (base: string, page: number) => (page <= 1 ? base : `${base}${page}/`);

export const routes = {
  home: () => '/',
  article: (story: WebStory) => `/demo/${story.presentation.demoId}/`,
  section: (id: SectionId, page = 1) => paged(`/demo/seccion/${getSection(id).slug}/`, page),
  topic: (id: TopicId, page = 1) => paged(`/demo/tema/${getTopic(id).slug}/`, page),
  author: (slug: string, page = 1) => paged(`/demo/autor/${slug}/`, page),
  latest: (page = 1) => paged('/demo/ultimas/', page),
  about: () => '/demo/acerca/',
  contact: () => '/demo/contacto/',
  careers: () => '/demo/empleos/',
  advertise: () => '/demo/publicidad/',
  privacy: () => '/demo/privacidad/',
  terms: () => '/demo/terminos/'
} as const;
