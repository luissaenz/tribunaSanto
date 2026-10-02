import { describe, it, expect } from 'vitest';
import {
  validateNewsSitemapEntry,
  validateNewsSitemapXml,
  type NewsSitemapEntry
} from '../../scripts/seo/lib/contracts.js';

describe('News Sitemap temporal invariants', () => {
  const referenceTime = new Date('2026-10-02T12:00:00Z');

  it('accepts news published within 48 hours', () => {
    // 47 hours old
    const date47hAgo = new Date(referenceTime.getTime() - 47 * 60 * 60 * 1000).toISOString();

    const entry: NewsSitemapEntry = {
      loc: 'https://tribunasanto.local/noticias/victoria-clasico',
      publicationName: 'Tribuna Santo',
      publicationLanguage: 'es',
      publicationDate: date47hAgo,
      title: 'Triunfo histórico del Santo'
    };

    const result = validateNewsSitemapEntry(entry, referenceTime, 48);
    expect(result.valid).toBe(true);
  });

  it('rejects news older than 48 hours', () => {
    // 49 hours old
    const date49hAgo = new Date(referenceTime.getTime() - 49 * 60 * 60 * 1000).toISOString();

    const entry: NewsSitemapEntry = {
      loc: 'https://tribunasanto.local/noticias/noticia-antigua',
      publicationName: 'Tribuna Santo',
      publicationLanguage: 'es',
      publicationDate: date49hAgo,
      title: 'Noticia archivada'
    };

    const result = validateNewsSitemapEntry(entry, referenceTime, 48);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum age of 48h');
  });

  it('validates News Sitemap XML structure and temporal constraints', () => {
    const validDate = new Date(referenceTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const expiredDate = new Date(referenceTime.getTime() - 50 * 60 * 60 * 1000).toISOString();

    const xmlWithExpired = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://tribunasanto.local/noticias/reciente</loc>
    <news:news>
      <news:publication>
        <news:name>Tribuna Santo</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${validDate}</news:publication_date>
      <news:title>Noticia reciente</news:title>
    </news:news>
  </url>
  <url>
    <loc>https://tribunasanto.local/noticias/expirada</loc>
    <news:news>
      <news:publication>
        <news:name>Tribuna Santo</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${expiredDate}</news:publication_date>
      <news:title>Noticia vencida</news:title>
    </news:news>
  </url>
</urlset>`;

    const result = validateNewsSitemapXml(xmlWithExpired, referenceTime, 48);
    expect(result.valid).toBe(false);
    expect(result.entryCount).toBe(2);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toContain('exceeds maximum age of 48h');
  });
});
