import { describe, it, expect } from 'vitest';
import { loadAndValidatePolicy } from '../../scripts/seo/lib/contracts.js';

describe('SEO policy invariants', () => {
  it('accepts the versioned SEO policy', () => {
    const policy = loadAndValidatePolicy();

    expect(policy.version).toBe(1);
    expect(policy.singleTenant).toBe(true);
    expect(policy.rendering).toBe('static');

    // NewsArticle policy invariants
    expect(policy.newsArticle.requiredFields).toContain('headline');
    expect(policy.newsArticle.requiredFields).toContain('datePublished');
    expect(policy.newsArticle.requiredFields).toContain('dateModified');
    expect(policy.newsArticle.requiredFields).toContain('author');
    expect(policy.newsArticle.requiredFields).toContain('publisher');
    expect(policy.newsArticle.requiredFields).toContain('image');

    // Sitemap policy invariants
    expect(policy.newsSitemap.maxAgeHours).toBe(48);

    // Canonical & performance
    expect(policy.canonical.mustBeAbsolute).toBe(true);
    expect(policy.canonical.mustBeUnique).toBe(true);
    expect(policy.performance.htmlFirst).toBe(true);
  });
});
