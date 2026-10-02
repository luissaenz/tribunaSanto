// WEB.2 — Inventario y clasificación automática del corpus `/web`.
//
// Uso:
//   npm run corpus:inventory              → regenera docs/web2/corpus-inventory.json
//   npm run corpus:inventory -- --check   → falla si el corpus local no es el inventariado
//                                           o si el inventario versionado está desactualizado
//
// Es el ÚNICO comando del repositorio que requiere la copia local de /web.

import fs from 'node:fs';
import path from 'node:path';
import { buildInventory, checkInventory, serializeInventory } from './lib/build.js';

const repoRoot = process.cwd();
const corpusDir = path.join(repoRoot, 'web');
const outFile = path.join(repoRoot, 'docs', 'web2', 'corpus-inventory.json');

function main() {
  if (!fs.existsSync(corpusDir)) {
    console.error('[corpus] ✗ No existe la copia local de /web (no versionada). El inventario versionado en docs/web2 sigue siendo la referencia.');
    process.exit(1);
  }

  if (process.argv.includes('--check')) {
    const result = checkInventory(corpusDir, fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf-8') : '');
    switch (result.status) {
      case 'ok':
        console.log('[corpus] ✓ Corpus local idéntico al inventariado e inventario al día.');
        return;
      case 'corpus-mismatch':
        console.error(`[corpus] ✗ Corpus local distinto: digest ${result.actual} ≠ inventariado ${result.expected}.`);
        process.exit(1);
        break;
      case 'stale-inventory':
        console.error('[corpus] ✗ docs/web2/corpus-inventory.json está desactualizado. Ejecutar npm run corpus:inventory.');
        process.exit(1);
        break;
      case 'missing-corpus':
        console.error('[corpus] ✗ No existe la copia local de /web.');
        process.exit(1);
    }
  }

  const inventory = buildInventory(corpusDir);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, serializeInventory(inventory));
  console.log(`[corpus] ✓ ${inventory.corpus.html} páginas HTML, ${inventory.corpus.files} archivos → ${path.relative(repoRoot, outFile)}`);
  console.log(`[corpus]   digest ${inventory.corpus.digest}`);
  for (const [family, info] of Object.entries(inventory.families)) {
    console.log(`  - ${family.padEnd(14)} ${String(info.pages).padStart(3)} (paginadas: ${info.paginated})`);
  }
}

main();
