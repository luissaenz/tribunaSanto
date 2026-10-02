// WEB.2 — SEO provisional: toda página es demo, no indexable y vive en / o /demo/.

import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateInternalLinksInDirectory } from '../../scripts/seo/lib/contracts.js';
import { demoArticles } from '../../src/data/demo-articles.js';
import {
  findClientScripts,
  findFabricatedSlotData,
  findIndexingMetadata,
  findMissingBlocks,
  findOffNamespaceRoutes,
  findPayloadContamination
} from '../support/guards.js';
import { distDir, readDistPages, walkFiles } from '../support/dist.js';
import { asHtmlPages } from '../support/repo.js';

const pages = asHtmlPages(readDistPages());
const distFiles = walkFiles(distDir);

describe('demo SEO, namespace and static-first guards on the built site', () => {
  it('builds 45 pages, all under / or /demo/ and linking only inside that namespace', () => {
    expect(pages).toHaveLength(45);
    expect(findOffNamespaceRoutes(pages)).toEqual([]);
  });

  it('marks every page noindex,nofollow with no canonical, OpenGraph, Twitter or NewsArticle', () => {
    expect(findIndexingMetadata(pages)).toEqual([]);
  });

  it('emits no sitemap', () => {
    expect(distFiles.filter((f) => /sitemap.*\.xml$/i.test(path.basename(f)))).toEqual([]);
  });

  it('ships no client JavaScript and no hydration', () => {
    expect(findClientScripts(pages, distFiles)).toEqual([]);
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
