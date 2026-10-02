// WEB.2 — Esqueleto DOM de una página del corpus, sin texto.
//
// Uso:
//   npm run corpus:outline -- <page> [--depth N] [--selector S]
//
// <page> es relativa a /web (ej.: index.html, sports.html, tags/football.html).
// Imprime etiquetas y clases, colapsando hermanos idénticos consecutivos (×N).
// Nunca imprime texto, atributos ni HTML del corpus.
// Sustituye a las sondas de volcado DOM de scripts/research.

import fs from 'node:fs';
import path from 'node:path';
import { outline } from './lib/outline.js';

function main() {
  const args = process.argv.slice(2);
  const page = args.find((a, i) => !a.startsWith('--') && !['--depth', '--selector'].includes(args[i - 1]));
  const flag = (name: string) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };

  if (!page) {
    console.error('Uso: npm run corpus:outline -- <page> [--depth N] [--selector S]');
    process.exit(1);
  }

  const file = path.join(process.cwd(), 'web', page);
  if (!fs.existsSync(file)) {
    console.error(`[corpus] ✗ No existe ${path.relative(process.cwd(), file)} (requiere la copia local de /web).`);
    process.exit(1);
  }

  const depth = flag('--depth') ? Number(flag('--depth')) : undefined;
  console.log(outline(fs.readFileSync(file, 'utf-8'), { depth, selector: flag('--selector') }).join('\n'));
}

main();
