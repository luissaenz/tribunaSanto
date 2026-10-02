import { describe, it, expect } from 'vitest';
import { validateNewsArticleJsonLd } from '../../scripts/seo/lib/contracts.js';

describe('NewsArticle schema invariants', () => {
  const validArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: 'San Martín de Tucumán entrena pensando en el próximo compromiso',
    datePublished: '2026-10-01T12:00:00Z',
    dateModified: '2026-10-01T14:30:00Z',
    author: {
      '@type': 'Person',
      name: 'Redacción Tribuna Santo'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tribuna Santo'
    },
    image: 'https://tribunasanto.local/images/entrenamiento.webp'
  };

  it('accepts complete NewsArticle', () => {
    const result = validateNewsArticleJsonLd(validArticle);
    expect(result.success).toBe(true);
  });

  it('rejects incomplete NewsArticle', () => {
    // Missing author
    const withoutAuthor: Record<string, unknown> = { ...validArticle };
    delete withoutAuthor.author;
    const authorCheck = validateNewsArticleJsonLd(withoutAuthor);
    expect(authorCheck.success).toBe(false);

    // Missing headline
    const withoutHeadline: Record<string, unknown> = { ...validArticle };
    delete withoutHeadline.headline;
    const headlineCheck = validateNewsArticleJsonLd(withoutHeadline);
    expect(headlineCheck.success).toBe(false);

    // Missing datePublished
    const withoutDate: Record<string, unknown> = { ...validArticle };
    delete withoutDate.datePublished;
    const dateCheck = validateNewsArticleJsonLd(withoutDate);
    expect(dateCheck.success).toBe(false);

    // Missing publisher
    const withoutPublisher: Record<string, unknown> = { ...validArticle };
    delete withoutPublisher.publisher;
    const publisherCheck = validateNewsArticleJsonLd(withoutPublisher);
    expect(publisherCheck.success).toBe(false);

    // Missing image
    const withoutImage: Record<string, unknown> = { ...validArticle };
    delete withoutImage.image;
    const imageCheck = validateNewsArticleJsonLd(withoutImage);
    expect(imageCheck.success).toBe(false);
  });
});
