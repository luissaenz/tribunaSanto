import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { describe, it, expect, beforeAll } from 'vitest';
import { parse as parseHtml } from 'node-html-parser';
import { demoStories } from '../../src/data/demo-articles.js';

describe('WEB.1 static render integration', () => {
  const distDir = path.resolve(process.cwd(), 'dist');

  beforeAll(() => {
    // Generate clean static build for integration inspection
    execSync('npm run build', { stdio: 'pipe' });
  });

  it('builds the editorial homepage', () => {
    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  it('builds one static article page per demo story', () => {
    expect(demoStories).toHaveLength(7);

    for (const story of demoStories) {
      const articlePath = path.join(distDir, 'demo', story.presentation.demoId, 'index.html');
      expect(fs.existsSync(articlePath)).toBe(true);
    }
  });

  it('renders one h1 and semantic landmarks on the homepage', () => {
    const indexPath = path.join(distDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    const root = parseHtml(content);

    const h1Elements = root.querySelectorAll('h1');
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0].text.trim()).toBe('Tribuna Santo');

    expect(root.querySelector('header')).not.toBeNull();
    expect(root.querySelector('nav')).not.toBeNull();
    expect(root.querySelector('main')).not.toBeNull();
    expect(root.querySelector('footer')).not.toBeNull();
  });

  it('renders the lead story before secondary stories in DOM order', () => {
    const indexPath = path.join(distDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    const leadStory = demoStories.find((s) => s.presentation.role === 'lead')!;
    const secondaryStory = demoStories.find((s) => s.presentation.role === 'secondary')!;

    const leadIndex = content.indexOf(leadStory.article.headline);
    const secondaryIndex = content.indexOf(secondaryStory.article.headline);

    expect(leadIndex).toBeGreaterThan(-1);
    expect(secondaryIndex).toBeGreaterThan(-1);
    expect(leadIndex).toBeLessThan(secondaryIndex);
  });

  it('renders every homepage story from the validated fixtures', () => {
    const indexPath = path.join(distDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    for (const story of demoStories) {
      expect(content).toContain(story.article.headline);
    }
  });

  it('renders article headline dek byline time and body from the same fixture', () => {
    for (const story of demoStories) {
      const articlePath = path.join(distDir, 'demo', story.presentation.demoId, 'index.html');
      const content = fs.readFileSync(articlePath, 'utf-8');
      const root = parseHtml(content);

      const h1 = root.querySelector('h1');
      expect(h1?.text.trim()).toBe(story.article.headline);

      if (story.article.dek) {
        expect(content).toContain(story.article.dek);
      }

      expect(content).toContain(story.article.byline);
      expect(content).toContain(story.article.publishedAt);

      const firstParagraph = story.article.body.split(/\n\s*\n/)[0].trim();
      expect(content).toContain(firstParagraph);
    }
  });

  it('links every story to its generated demo article', () => {
    const indexPath = path.join(distDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    for (const story of demoStories) {
      const expectedHref = `/demo/${story.presentation.demoId}/`;
      expect(content).toContain(`href="${expectedHref}"`);
    }
  });

  it('links every article back to the homepage', () => {
    for (const story of demoStories) {
      const articlePath = path.join(distDir, 'demo', story.presentation.demoId, 'index.html');
      const content = fs.readFileSync(articlePath, 'utf-8');
      const root = parseHtml(content);

      const backLinks = root.querySelectorAll('a[href="/"]');
      expect(backLinks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('does not emit hydrated Astro islands', () => {
    const indexPath = path.join(distDir, 'index.html');
    const homeContent = fs.readFileSync(indexPath, 'utf-8');
    expect(homeContent).not.toContain('astro-island');

    for (const story of demoStories) {
      const articlePath = path.join(distDir, 'demo', story.presentation.demoId, 'index.html');
      const articleContent = fs.readFileSync(articlePath, 'utf-8');
      expect(articleContent).not.toContain('astro-island');
    }
  });

  it('keeps article body rendering escaped', () => {
    const articleViewSource = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ArticleView.astro'),
      'utf-8'
    );
    expect(articleViewSource).not.toContain('set:html');
  });

  it('does not emit NewsArticle structured data', () => {
    const indexPath = path.join(distDir, 'index.html');
    const homeContent = fs.readFileSync(indexPath, 'utf-8');
    expect(homeContent).not.toContain('NewsArticle');

    for (const story of demoStories) {
      const articlePath = path.join(distDir, 'demo', story.presentation.demoId, 'index.html');
      const articleContent = fs.readFileSync(articlePath, 'utf-8');
      expect(articleContent).not.toContain('NewsArticle');
    }
  });

  it('renders sports placeholders without fabricated sports values', () => {
    const indexPath = path.join(distDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    expect(content).toContain('Próximo partido');
    expect(content).toContain('Tabla de posiciones');
    expect(content).toContain('Datos deportivos disponibles en próximos arcos.');

    // Ensure no fabricated numbers/rankings
    expect(content).not.toMatch(/Puntos:\s*\d+/);
    expect(content).not.toMatch(/Posición:\s*\d+/);
  });
});
