// WEB.2 — Inventario y clasificación automática del corpus `/web`.
//
// Uso:
//   npm run corpus:inventory          → regenera docs/web2/corpus-inventory.json
//   npm run corpus:inventory -- --check → falla si el inventario versionado está desactualizado
//
// El resultado es determinista (sin timestamps) y no contiene textos del corpus.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  CORPUS_BLOCK_IDS,
  PAGE_FAMILIES,
  analyzePage,
  type PageAnalysis
} from './lib/analyze.js';

const repoRoot = process.cwd();
const corpusDir = path.join(repoRoot, 'web');
const outFile = path.join(repoRoot, 'docs', 'web2', 'corpus-inventory.json');

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    })
    .sort();
}

function sha256(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function buildInventory() {
  const files = walk(corpusDir);
  const rel = (f: string) => path.relative(corpusDir, f).replace(/\\/g, '/');

  const htmlFiles = files.filter((f) => f.endsWith('.html'));
  const pages: PageAnalysis[] = htmlFiles.map((f) => analyzePage(rel(f), fs.readFileSync(f, 'utf-8')));

  const fileTypes: Record<string, number> = {};
  for (const f of files) {
    const ext = path.extname(f).slice(1) || '(none)';
    fileTypes[ext] = (fileTypes[ext] ?? 0) + 1;
  }

  const families = Object.fromEntries(
    PAGE_FAMILIES.map((family) => {
      const members = pages.filter((p) => p.family === family);
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

  // Cobertura de cada bloque por familia: proporción de páginas de la familia que lo contienen.
  const blockCoverage = Object.fromEntries(
    PAGE_FAMILIES.map((family) => {
      const members = pages.filter((p) => p.family === family);
      const coverage = Object.fromEntries(
        CORPUS_BLOCK_IDS.map((id) => {
          const n = members.filter((p) => p.blocks.includes(id)).length;
          return [id, members.length === 0 ? 0 : Number((n / members.length).toFixed(2))];
        }).filter(([, ratio]) => (ratio as number) > 0)
      );
      return [family, coverage];
    })
  );

  const blocks = Object.fromEntries(
    CORPUS_BLOCK_IDS.map((id) => {
      const members = pages.filter((p) => p.blocks.includes(id));
      return [
        id,
        {
          pages: members.length,
          families: [...new Set(members.map((p) => p.family))].sort()
        }
      ];
    })
  );

  const shapeIndex = new Map<string, { pages: number; families: Set<string> }>();
  for (const page of pages) {
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

  const assets = files
    .filter((f) => !f.endsWith('.html'))
    .map((f) => ({ path: rel(f), bytes: fs.statSync(f).size, sha256: sha256(f) }));

  const headingHashes = [...new Set(pages.flatMap((p) => p.headingHashes))].sort();

  return {
    description:
      'Inventario estructural generado por scripts/corpus/inventory.ts. No contiene textos ni código del corpus: sólo rutas, clasificación, bloques detectados, formas DOM y hashes.',
    corpus: 'web/',
    totals: { files: files.length, html: htmlFiles.length, fileTypes },
    families,
    blocks,
    blockCoverage,
    cardShapes,
    pages: pages.map((page) => {
      const rest: Record<string, unknown> = { ...page };
      delete rest.headingHashes;
      return rest;
    }),
    assets,
    headingHashes
  };
}

function main() {
  if (!fs.existsSync(corpusDir)) {
    console.error('[corpus] ✗ No existe /web: el inventario versionado en docs/web2 sigue siendo la referencia.');
    process.exit(1);
  }

  const serialized = `${JSON.stringify(buildInventory(), null, 2)}\n`;

  if (process.argv.includes('--check')) {
    const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8') : '';
    if (current !== serialized) {
      console.error('[corpus] ✗ docs/web2/corpus-inventory.json está desactualizado. Ejecutar npm run corpus:inventory.');
      process.exit(1);
    }
    console.log('[corpus] ✓ Inventario versionado al día.');
    return;
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, serialized);
  const inventory = JSON.parse(serialized) as ReturnType<typeof buildInventory>;
  console.log(`[corpus] ✓ ${inventory.totals.html} páginas HTML inventariadas → ${path.relative(repoRoot, outFile)}`);
  for (const [family, info] of Object.entries(inventory.families)) {
    console.log(`  - ${family.padEnd(14)} ${String(info.pages).padStart(3)} (paginadas: ${info.paginated})`);
  }
}

main();
