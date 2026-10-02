// WEB.2 — Única fuente de URLs internas de la web demo.

import type { WebStory } from './story.js';
import { getSection, getTopic, type SectionId, type TopicId } from './taxonomy.js';

export const LATEST_PAGE_SIZE = 8;

export const routes = {
  home: () => '/',
  article: (story: WebStory) => `/demo/${story.presentation.demoId}/`,
  section: (id: SectionId) => `/seccion/${getSection(id).slug}/`,
  topic: (id: TopicId) => `/tema/${getTopic(id).slug}/`,
  latest: (page = 1) => (page <= 1 ? '/ultimas/' : `/ultimas/${page}/`),
  about: () => '/acerca/'
} as const;
