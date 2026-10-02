// WEB.2 — Contrato del inventario versionado del corpus (docs/web2/corpus-inventory.json).
//
// Todos los strings están restringidos a rutas, hashes, ids o formas
// estructurales: el schema hace imposible almacenar texto libre del corpus.

import crypto from 'node:crypto';
import { z } from 'zod';
import { CORPUS_BLOCK_IDS, PAGE_FAMILIES } from './analyze.js';

export const INVENTORY_DESCRIPTION =
  'Inventario estructural generado por scripts/corpus/inventory.ts. No contiene textos ni código del corpus: sólo rutas, clasificación, bloques, formas DOM, perfiles y hashes.';

const Sha256 = z.string().regex(/^[0-9a-f]{64}$/);
const HeadingHash = z.string().regex(/^[0-9a-f]{16}$/);
const CorpusPath = z.string().regex(/^[A-Za-z0-9_./-]+\.(html|css|js|jpg|jpeg|png|svg|webp|woff2|txt)$/);
const Family = z.enum(PAGE_FAMILIES);
const BlockId = z.enum(CORPUS_BLOCK_IDS);
const CardShape = z.string().regex(/^[a-z0-9>()+]+$/);
const MediaQuery = z.string().regex(/^[a-z0-9 ()<>=:.-]+$/);
const Count = z.number().int().nonnegative();

export const CorpusPageSchema = z.strictObject({
  path: CorpusPath,
  sha256: Sha256,
  family: Family,
  paginated: z.boolean(),
  pageNumber: z.number().int().positive(),
  blocks: z.array(BlockId),
  headings: z.strictObject({ h1: Count, h2: Count, h3: Count, h4: Count }),
  sections: Count,
  asides: Count,
  articleElements: Count,
  interactiveComponents: Count,
  cardShapes: z.array(CardShape)
});

export const CorpusAssetSchema = z.strictObject({
  path: CorpusPath,
  bytes: Count,
  sha256: Sha256
});

export const CorpusInventorySchema = z.strictObject({
  schemaVersion: z.literal(1),
  description: z.literal(INVENTORY_DESCRIPTION),
  corpus: z.strictObject({
    root: z.literal('web/'),
    digest: Sha256,
    files: Count,
    html: Count,
    fileTypes: z.record(z.string().regex(/^[a-z0-9]+$/), Count)
  }),
  families: z.record(
    Family,
    z.strictObject({
      pages: Count,
      paginated: Count,
      withoutSingleH1: Count,
      examples: z.array(CorpusPath)
    })
  ),
  blocks: z.record(BlockId, z.strictObject({ pages: Count, families: z.array(Family) })),
  blockCoverage: z.record(Family, z.partialRecord(BlockId, z.number().min(0).max(1))),
  cardShapes: z.array(z.strictObject({ shape: CardShape, pages: Count, families: z.array(Family) })),
  css: z.array(
    z.strictObject({
      path: CorpusPath,
      sha256: Sha256,
      bytes: Count,
      tailwind: z.boolean(),
      fontFaces: Count,
      customPropertyCount: Count,
      mediaQueries: z.array(MediaQuery)
    })
  ),
  pages: z.array(CorpusPageSchema),
  assets: z.array(CorpusAssetSchema),
  headingHashes: z.array(HeadingHash)
});

export type CorpusInventory = z.infer<typeof CorpusInventorySchema>;

/** Digest global determinista: sha256 de "ruta:sha256" de todos los archivos, ordenados. */
export function corpusDigest(entries: ReadonlyArray<{ path: string; sha256: string }>): string {
  const lines = entries.map((e) => `${e.path}:${e.sha256}`).sort();
  return crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
}
