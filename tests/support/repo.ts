import fs from 'node:fs';
import path from 'node:path';
import { walkFiles, type DistPage } from './dist.js';
import type { SourceFile } from './guards.js';

export const repoRoot = process.cwd();

export type CorpusInventoryJson = Readonly<{
  corpus: { digest: string };
  blocks: Record<string, { pages: number }>;
  assets: ReadonlyArray<{ path: string; sha256: string }>;
  headingHashes: readonly string[];
}>;

/** Única evidencia del corpus que leen los tests: el inventario versionado. */
export function readInventory(): CorpusInventoryJson {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/web2/corpus-inventory.json'), 'utf-8'));
}

/** Fuentes del producto: src/ y public/ (texto). */
export function productSources(): SourceFile[] {
  return [...walkFiles(path.join(repoRoot, 'src')), ...walkFiles(path.join(repoRoot, 'public'))]
    .filter((f) => /\.(astro|ts|css|mjs|js|svg|json)$/.test(f))
    .map((f) => ({ path: path.relative(repoRoot, f), content: fs.readFileSync(f, 'utf-8') }));
}

export const asHtmlPages = (pages: readonly DistPage[]) => pages.map(({ route, html }) => ({ route, html }));
