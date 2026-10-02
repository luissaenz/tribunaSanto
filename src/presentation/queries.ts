// WEB.2 — Consultas puras sobre el conjunto de historias (sin estado global).

import type { WebStory } from './story.js';
import { sections, type SectionId, type TopicId } from './taxonomy.js';

const byNewest = (a: WebStory, b: WebStory) =>
  Date.parse(b.article.publishedAt) - Date.parse(a.article.publishedAt);

export function newestFirst(stories: readonly WebStory[]): readonly WebStory[] {
  return [...stories].sort(byNewest);
}

export function storiesInSection(stories: readonly WebStory[], sectionId: SectionId): readonly WebStory[] {
  return newestFirst(stories.filter((s) => s.presentation.sectionId === sectionId));
}

export function storiesWithTopic(stories: readonly WebStory[], topicId: TopicId): readonly WebStory[] {
  return newestFirst(stories.filter((s) => s.presentation.topicIds.includes(topicId)));
}

export function excluding(stories: readonly WebStory[], exclude: readonly WebStory[]): readonly WebStory[] {
  const refs = new Set(exclude.map((s) => s.article.articleRef));
  return stories.filter((s) => !refs.has(s.article.articleRef));
}

/** Relacionadas: misma sección primero, luego temas compartidos, luego recencia. */
export function relatedStories(stories: readonly WebStory[], story: WebStory, limit = 3): readonly WebStory[] {
  const score = (candidate: WebStory) => {
    const sameSection = candidate.presentation.sectionId === story.presentation.sectionId ? 10 : 0;
    const sharedTopics = candidate.presentation.topicIds.filter((t) => story.presentation.topicIds.includes(t)).length;
    return sameSection + sharedTopics;
  };

  return excluding(stories, [story])
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.candidate, b.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export type SectionCount = Readonly<{ sectionId: SectionId; count: number }>;

export function sectionCounts(stories: readonly WebStory[]): readonly SectionCount[] {
  return sections
    .map((section) => ({
      sectionId: section.id,
      count: stories.filter((s) => s.presentation.sectionId === section.id).length
    }))
    .filter((entry) => entry.count > 0);
}

/** Fecha de edición: la publicación más reciente (determinista, no el reloj del build). */
export function editionInstant(stories: readonly WebStory[]): string {
  const newest = newestFirst(stories)[0];
  if (!newest) throw new Error('Edition requires at least one story');
  return newest.article.publishedAt;
}
