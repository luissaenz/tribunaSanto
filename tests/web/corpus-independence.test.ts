// WEB.2 — El producto no depende del corpus de referencia /web.
//
// Las comprobaciones usan el inventario versionado (docs/web2/corpus-inventory.json),
// así siguen funcionando aunque /web deje de estar en el repositorio.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { parse as parseHtml } from 'node-html-parser';
import { hashText, CORPUS_BLOCK_IDS } from '../../scripts/corpus/lib/analyze.js';
import { blockCatalog, omittedCorpusBlocks } from '../../src/presentation/blocks.js';
import { distDir, distHtmlFiles } from './dist.js';

const repo = process.cwd();
const inventory = JSON.parse(fs.readFileSync(path.join(repo, 'docs/web2/corpus-inventory.json'), 'utf-8')) as {
  blocks: Record<string, { pages: number }>;
  assets: { path: string; sha256: string }[];
  headingHashes: string[];
};

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const productFiles = [...walk(path.join(repo, 'src')), ...walk(path.join(repo, 'public'))];
const productSources = productFiles.filter((f) => /\.(astro|ts|css|mjs|js|svg)$/.test(f));

// Huellas del template de referencia que no deben aparecer en código propio.
const CORPUS_FINGERPRINTS = [
  /['"`./]web\//,
  /_astro\/MainLayout/,
  /madethemes/i,
  /daily newspaper/i,
  /\bx-data\b/,
  /\bmax-w-7xl\b/,
  /\bfont-heading\b/,
  /\blg:col-span-\d/,
  /\bpost-content\b/,
  /alpine/i,
  /tailwind/i
];

describe('product independence from the /web corpus', () => {
  it('has a versioned inventory to check against', () => {
    expect(inventory.assets.length).toBeGreaterThan(0);
    expect(inventory.headingHashes.length).toBeGreaterThan(0);
  });

  it('does not import, reference or imitate corpus source in src/ or public/', () => {
    expect(productSources.length).toBeGreaterThan(0);
    for (const file of productSources) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const pattern of CORPUS_FINGERPRINTS) {
        expect(pattern.test(content), `${path.relative(repo, file)} matches ${pattern}`).toBe(false);
      }
    }
  });

  it('does not ship corpus assets in public/ or dist/', () => {
    const corpusHashes = new Set(inventory.assets.map((a) => a.sha256));
    const corpusNames = new Set(inventory.assets.map((a) => path.basename(a.path)));
    for (const file of [...walk(path.join(repo, 'public')), ...walk(distDir)]) {
      const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
      expect(corpusHashes.has(digest), path.relative(repo, file)).toBe(false);
      expect(corpusNames.has(path.basename(file)), path.relative(repo, file)).toBe(false);
    }
  });

  it('does not reuse corpus headings in the built site', () => {
    const corpusHeadings = new Set(inventory.headingHashes);
    for (const file of distHtmlFiles()) {
      const root = parseHtml(fs.readFileSync(file, 'utf-8'));
      for (const heading of root.querySelectorAll('h1, h2, h3, h4')) {
        const text = heading.text.replace(/\s+/g, ' ').trim();
        // Rótulos genéricos de una palabra pueden coincidir legítimamente.
        if (text.split(' ').length < 3) continue;
        expect(corpusHeadings.has(hashText(text)), `${path.relative(distDir, file)}: ${text}`).toBe(false);
      }
    }
  });

  it('keeps /web out of the build, lint and type-check inputs', () => {
    const astroConfig = fs.readFileSync(path.join(repo, 'astro.config.mjs'), 'utf-8');
    expect(astroConfig).not.toMatch(/publicDir|srcDir|root\s*:/);
    expect(fs.existsSync(path.join(distDir, 'web'))).toBe(false);
    expect(fs.existsSync(path.join(distDir, '_astro', 'fonts'))).toBe(false);

    const tsconfig = JSON.parse(fs.readFileSync(path.join(repo, 'tsconfig.json'), 'utf-8')) as { exclude?: string[] };
    expect(tsconfig.exclude).toContain('web');
    expect(fs.readFileSync(path.join(repo, 'eslint.config.mjs'), 'utf-8')).toContain("'web/**'");
  });

  it('maps every detected corpus block to a component or a documented omission', () => {
    const mapped = new Set<string>(blockCatalog.flatMap((b) => [...b.corpus]));
    const detected = CORPUS_BLOCK_IDS.filter((id) => (inventory.blocks[id]?.pages ?? 0) > 0);
    for (const id of detected) {
      expect(mapped.has(id) || id in omittedCorpusBlocks, `corpus block ${id}`).toBe(true);
    }
    for (const block of blockCatalog) {
      for (const evidence of block.corpus) {
        expect(inventory.blocks[evidence]?.pages ?? 0, `${block.id} → ${evidence}`).toBeGreaterThan(0);
      }
      expect(fs.existsSync(path.join(repo, 'src/components', block.component)), block.component).toBe(true);
    }
  });
});
