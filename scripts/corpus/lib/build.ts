// WEB.2 — Construcción y verificación del inventario del corpus.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CORPUS_BLOCK_IDS, PAGE_FAMILIES, analyzePage } from './analyze.js';
import { profileCss } from './css-profile.js';
import {
  CorpusInventorySchema,
  INVENTORY_DESCRIPTION,
  corpusDigest,
  type CorpusInventory
} from './schema.js';

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    })
    .sort();
}

const sha256 = (buffer: Buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

/** Hash de cada archivo del corpus (HTML y assets), con ruta relativa POSIX. */
export function hashCorpusFiles(corpusDir: string): Array<{ path: string; sha256: string; bytes: number }> {
  return walk(corpusDir).map((file) => {
    const buffer = fs.readFileSync(file);
    return {
      path: path.relative(corpusDir, file).replace(/\\/g, '/'),
      sha256: sha256(buffer),
      bytes: buffer.length
    };
  });
}

export function buildInventory(corpusDir: string): CorpusInventory {
  const files = hashCorpusFiles(corpusDir);
  const htmlFiles = files.filter((f) => f.path.endsWith('.html'));

  const analyzed = htmlFiles.map((f) => ({
    sha256: f.sha256,
    ...analyzePage(f.path, fs.readFileSync(path.join(corpusDir, f.path), 'utf-8'))
  }));

  const fileTypes: Record<string, number> = {};
  for (const f of files) {
    const ext = path.extname(f.path).slice(1).toLowerCase() || 'none';
    fileTypes[ext] = (fileTypes[ext] ?? 0) + 1;
  }

  const families = Object.fromEntries(
    PAGE_FAMILIES.map((family) => {
      const members = analyzed.filter((p) => p.family === family);
      return [
        family,
        {
          pages: members.length,
          paginated: members.filter((p) => p.paginated).length,
          withoutSingleH1: members.filter((p) => p.headings.h1 !== 1).length,
          examples: members.slice(0, 3).map((p) => p.path)
        }
      ];
    })
  );

  const blockCoverage = Object.fromEntries(
    PAGE_FAMILIES.map((family) => {
      const members = analyzed.filter((p) => p.family === family);
      const coverage = Object.fromEntries(
        CORPUS_BLOCK_IDS.map((id) => {
          const n = members.filter((p) => p.blocks.includes(id)).length;
          return [id, members.length === 0 ? 0 : Number((n / members.length).toFixed(2))] as const;
        }).filter(([, ratio]) => ratio > 0)
      );
      return [family, coverage];
    })
  );

  const blocks = Object.fromEntries(
    CORPUS_BLOCK_IDS.map((id) => {
      const members = analyzed.filter((p) => p.blocks.includes(id));
      return [id, { pages: members.length, families: [...new Set(members.map((p) => p.family))].sort() }];
    })
  );

  const shapeIndex = new Map<string, { pages: number; families: Set<string> }>();
  for (const page of analyzed) {
    for (const shape of page.cardShapes) {
      const entry = shapeIndex.get(shape) ?? { pages: 0, families: new Set<string>() };
      entry.pages += 1;
      entry.families.add(page.family);
      shapeIndex.set(shape, entry);
    }
  }
  const cardShapes = [...shapeIndex.entries()]
    .map(([shape, v]) => ({ shape, pages: v.pages, families: [...v.families].sort() }))
    .sort((a, b) => b.pages - a.pages || a.shape.localeCompare(b.shape));

  const css = files
    .filter((f) => f.path.endsWith('.css'))
    .map((f) => ({
      path: f.path,
      sha256: f.sha256,
      ...profileCss(fs.readFileSync(path.join(corpusDir, f.path), 'utf-8'))
    }));

  const inventory = {
    schemaVersion: 1,
    description: INVENTORY_DESCRIPTION,
    corpus: {
      root: 'web/',
      digest: corpusDigest(files),
      files: files.length,
      html: htmlFiles.length,
      fileTypes
    },
    families,
    blocks,
    blockCoverage,
    cardShapes,
    css,
    pages: analyzed.map((page) => ({
      path: page.path,
      sha256: page.sha256,
      family: page.family,
      paginated: page.paginated,
      pageNumber: page.pageNumber,
      blocks: [...page.blocks],
      headings: page.headings,
      sections: page.sections,
      asides: page.asides,
      articleElements: page.articleElements,
      interactiveComponents: page.interactiveComponents,
      cardShapes: [...page.cardShapes]
    })),
    assets: files.filter((f) => !f.path.endsWith('.html')).map(({ path: p, bytes, sha256: h }) => ({ path: p, bytes, sha256: h })),
    headingHashes: [...new Set(analyzed.flatMap((p) => p.headingHashes))].sort()
  };

  return CorpusInventorySchema.parse(inventory);
}

export const serializeInventory = (inventory: CorpusInventory): string => `${JSON.stringify(inventory, null, 2)}\n`;

export type InventoryCheck =
  | { status: 'ok' }
  | { status: 'missing-corpus' }
  | { status: 'corpus-mismatch'; expected: string; actual: string }
  | { status: 'stale-inventory' };

/** Compara el corpus local contra el inventario versionado (primero el digest, luego el resultado). */
export function checkInventory(corpusDir: string, recordedJson: string): InventoryCheck {
  if (!fs.existsSync(corpusDir)) return { status: 'missing-corpus' };

  const recorded = CorpusInventorySchema.parse(JSON.parse(recordedJson));
  const actual = corpusDigest(hashCorpusFiles(corpusDir));
  if (actual !== recorded.corpus.digest) {
    return { status: 'corpus-mismatch', expected: recorded.corpus.digest, actual };
  }

  return serializeInventory(buildInventory(corpusDir)) === recordedJson ? { status: 'ok' } : { status: 'stale-inventory' };
}
