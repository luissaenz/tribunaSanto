import { describe, it, expect } from 'vitest';
import { TRUNCATE, truncateWords } from '../../src/presentation/text.js';
import { PAGE_SIZE, pageCount, paginate } from '../../src/presentation/pagination.js';
import { authorByByline, demoAuthors } from '../../src/data/demo-authors.js';
import { DEMO_BYLINES } from '../../src/data/demo-articles.js';
import { CATEGORY_CAROUSEL_SLIDES } from '../../src/data/demo-category.js';
import { contact, careers } from '../../src/data/demo-institutional.js';
import { readContract } from '../support/fidelity.js';

const { interactions } = readContract();

describe('WEB.3 presentation helpers', () => {
  it('truncates on word boundaries without exceeding the limit', () => {
    const long = 'La Ciudadela se prepara para una semana clave con trabajo táctico y mucha expectativa en la previa';
    for (const max of Object.values(TRUNCATE)) {
      const out = truncateWords(long, max);
      expect(out.length).toBeLessThanOrEqual(max);
      if (long.length > max) expect(out.endsWith('…')).toBe(true);
    }
    expect(truncateWords('Corto', 50)).toBe('Corto');
    expect(truncateWords('Una frase, con coma final larga', 12)).toBe('Una frase…');
  });

  it('keeps truncation limits within the golden-master observations', () => {
    expect(TRUNCATE).toEqual({ shortTitle: 50, shortExcerpt: 65, listTitle: 80, listExcerpt: 100, breadcrumb: 35 });
    expect(TRUNCATE.shortTitle).toBeGreaterThanOrEqual(interactions.truncation.trendingTitle);
    expect(TRUNCATE.shortExcerpt).toBeGreaterThanOrEqual(interactions.truncation.trendingExcerpt);
    expect(TRUNCATE.listExcerpt).toBeGreaterThanOrEqual(interactions.truncation.popularExcerpt);
  });

  it('paginates with the golden-master page sizes', () => {
    expect(PAGE_SIZE).toEqual({ listing: 9, author: 9, section: 6, topic: 6 });
    expect(pageCount(40, 9)).toBe(5);
    expect(pageCount(0, 6)).toBe(1);
    expect(paginate([1, 2, 3, 4, 5, 6, 7], 6, 2)).toEqual({ items: [7], page: 2, pages: 2 });
    expect(() => paginate([1], 6, 2)).toThrow();
  });

  it('maps every byline to a fictitious author with avatar and socials', () => {
    expect(demoAuthors.map((a) => a.byline)).toEqual([...DEMO_BYLINES]);
    for (const a of demoAuthors) {
      expect(authorByByline(a.byline)).toBe(a);
      expect(a.avatar.src).toMatch(/^\/demo\/img\//);
      for (const s of a.socials) expect(s.url).toMatch(/^https:\/\/example\.invalid\//);
    }
    expect(() => authorByByline('Persona real')).toThrow();
  });

  it('reproduces the observed carousel, contact and careers cardinalities', () => {
    expect(Object.values(CATEGORY_CAROUSEL_SLIDES).filter((n) => n === interactions.carousel.categoryTwoSlideVariant)).toHaveLength(1);
    expect(contact.subjects).toHaveLength(interactions.contact.subjects);
    expect(contact.subjects.flatMap((s, i) => (s.org ? [i + 1] : []))).toEqual(interactions.contact.conditionalSubjectIndexes);
    expect(contact.faq).toHaveLength(interactions.faq.items);
    expect(careers.jobs).toHaveLength(interactions.careers.jobs);
    const per = [careers.jobs.length, ...careers.departments.map((d) => careers.jobs.filter((j) => j.dept === d.id).length)];
    expect(per).toEqual(interactions.careers.perFilter);
  });
});
