// WEB.2/WEB.3 — SEO provisional: toda página es demo, no indexable y vive en / o /demo/.
// WEB.3: el cliente admite una única entrada funcional propia (Alpine).

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateInternalLinksInDirectory } from '../../scripts/seo/lib/contracts.js';
import { demoArticles } from '../../src/data/demo-articles.js';
import {
  findClientEntries,
  findFabricatedSlotData,
  findIndexingMetadata,
  findMissingBlocks,
  findOffNamespaceRoutes,
  findPayloadContamination,
  findUnexpectedClientScripts
} from '../support/guards.js';
import { distDir, readDistPages, walkFiles } from '../support/dist.js';
import { expectedRoutes } from '../support/expected.js';
import { asHtmlPages } from '../support/repo.js';

const pages = asHtmlPages(readDistPages());
const distFiles = walkFiles(distDir);

describe('demo SEO, namespace and static-first guards on the built site', () => {
  it('builds exactly the routes derived from demo data, all under / or /demo/ and linking only inside it', () => {
    expect(pages.map((p) => p.route).sort()).toEqual(expectedRoutes());
    expect(findOffNamespaceRoutes(pages)).toEqual([]);
  });

  it('marks every page noindex,nofollow with no canonical, OpenGraph, Twitter or NewsArticle', () => {
    expect(findIndexingMetadata(pages)).toEqual([]);
  });

  it('emits no sitemap', () => {
    expect(distFiles.filter((f) => /sitemap.*\.xml$/i.test(path.basename(f)))).toEqual([]);
  });

  it('ships exactly one functional client entry (Alpine), with no islands, inline logic or other frameworks', () => {
    expect(findUnexpectedClientScripts(pages, distFiles)).toEqual([]);
    const entries = findClientEntries(pages);
    expect(entries).toHaveLength(1);
    for (const page of pages) expect(page.html, page.route).toContain(entries[0]);
    const bundle = distFiles.filter((f) => /\.m?js$/.test(f)).map((f) => fs.readFileSync(f, 'utf-8')).join('\n');
    expect(bundle).toContain('Alpine Expression Error');
    for (const name of ['siteNav', 'carousel', 'backToTop', 'copyLink', 'contactForm', 'faq', 'careers', 'applyForm', 'newsletter', 'topbarDate']) {
      expect(bundle, name).toMatch(new RegExp(`["'\x60]${name}["'\x60]`));
    }
  });

  it('renders every required block for every page family', () => {
    expect(findMissingBlocks(pages)).toEqual([]);
  });

  it('keeps DEP/MET/GRF placeholders free of data', () => {
    expect(findFabricatedSlotData(pages)).toEqual([]);
  });

  it('keeps the canonical payload free of presentation keys', () => {
    expect(findPayloadContamination(demoArticles)).toEqual([]);
  });

  it('resolves every internal link of the build', () => {
    const results = validateInternalLinksInDirectory(distDir);
    expect(results.length).toBeGreaterThan(1000);
    expect(results.filter((r) => !r.exists)).toEqual([]);
  });
});
