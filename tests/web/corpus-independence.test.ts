// WEB.2 — El producto no depende del corpus de referencia /web ni lo reproduce.
// Todas las comprobaciones usan el inventario versionado: /web no se lee nunca.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  findCorpusAssets,
  findCorpusFingerprints,
  findCorpusHeadings,
  findCorpusReferences,
  findUnprovenancedFonts,
  fontPackageHashes,
  findUnescapedHtml
} from '../support/guards.js';
import { distDir, readDistPages, walkFiles } from '../support/dist.js';
import { EXPECTED_PAGE_COUNT } from '../support/expected.js';
import { asHtmlPages, productSources, readInventory, repoRoot } from '../support/repo.js';

const inventory = readInventory();
const sources = productSources();
const shippedFiles = [...walkFiles(path.join(repoRoot, 'public')), ...walkFiles(distDir)];

describe('independence from the /web reference corpus', () => {
  it('does not version /web', () => {
    expect(execSync('git ls-files web', { encoding: 'utf-8' }).trim()).toBe('');
    expect(fs.readFileSync(path.join(repoRoot, '.gitignore'), 'utf-8')).toMatch(/^\/web\/$/m);
  });

  it('keeps /web out of build, lint and type-check inputs', () => {
    expect(fs.readFileSync(path.join(repoRoot, 'astro.config.mjs'), 'utf-8')).not.toMatch(/publicDir|srcDir|root\s*:/);
    const tsconfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tsconfig.json'), 'utf-8')) as { exclude: string[] };
    expect(tsconfig.exclude).toEqual(expect.arrayContaining(['dist', 'node_modules', 'web']));
    expect(fs.readFileSync(path.join(repoRoot, 'eslint.config.mjs'), 'utf-8')).toContain("'web/**'");
    expect(fs.existsSync(path.join(distDir, 'web'))).toBe(false);
  });

  it('has no code references to the corpus in src/ or public/', () => {
    expect(sources.length).toBeGreaterThan(40);
    expect(findCorpusReferences(sources)).toEqual([]);
  });

  it('has no template classes, brand or framework fingerprints in src/ or public/', () => {
    expect(findCorpusFingerprints(sources)).toEqual([]);
  });

  it('ships no corpus asset, and only fonts provenanced from @fontsource packages', () => {
    expect(shippedFiles.length).toBeGreaterThan(EXPECTED_PAGE_COUNT);
    expect(findCorpusAssets(shippedFiles, inventory.assets)).toEqual([]);
    const allowed = fontPackageHashes(path.join(repoRoot, 'node_modules'));
    expect(allowed.size).toBeGreaterThan(0);
    expect(findUnprovenancedFonts(shippedFiles, allowed)).toEqual([]);
  });

  it('does not reuse corpus headings (hash check; translations are out of its reach)', () => {
    expect(inventory.headingHashes.length).toBeGreaterThan(100);
    expect(findCorpusHeadings(asHtmlPages(readDistPages()), inventory.headingHashes)).toEqual([]);
  });

  it('never renders unescaped HTML', () => {
    expect(findUnescapedHtml(sources)).toEqual([]);
  });
});
