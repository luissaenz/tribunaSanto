import fs from 'node:fs';
import path from 'node:path';
import { parse as parseHtml, type HTMLElement } from 'node-html-parser';
import type { OwnPageFamily } from '../../src/presentation/blocks.js';

export const distDir = path.resolve(process.cwd(), 'dist');

export function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

export const distHtmlFiles = (dir = distDir): string[] => walkFiles(dir).filter((f) => f.endsWith('.html'));

export function routeOf(file: string, root = distDir): string {
  const rel = path.relative(root, path.dirname(file)).replace(/\\/g, '/');
  return rel === '' ? '/' : `/${rel}/`;
}

export type DistPage = Readonly<{ route: string; file: string; html: string; root: HTMLElement }>;

export function readDistPages(dir = distDir): DistPage[] {
  return distHtmlFiles(dir).map((file) => {
    const html = fs.readFileSync(file, 'utf-8');
    return { route: routeOf(file, dir), file, html, root: parseHtml(html) };
  });
}

export function readDistPage(route: string): DistPage {
  const file = path.join(distDir, route, 'index.html');
  const html = fs.readFileSync(file, 'utf-8');
  return { route, file, html, root: parseHtml(html) };
}

/** Familia de página propia a partir de la ruta construida. */
export function familyOf(route: string): OwnPageFamily {
  if (route === '/') return 'home';
  if (/^\/demo\/seccion\/[^/]+\/\d+\/$/.test(route)) return 'section-page';
  if (route.startsWith('/demo/seccion/')) return 'section';
  if (/^\/demo\/tema\/[^/]+\/\d+\/$/.test(route)) return 'topic-page';
  if (route.startsWith('/demo/tema/')) return 'topic';
  if (route.startsWith('/demo/autor/')) return 'author';
  if (route.startsWith('/demo/ultimas/')) return 'listing';
  if (route === '/demo/acerca/') return 'institutional';
  return 'article';
}

/** `expected` aparece dentro de `actual` respetando el orden (con posibles bloques intermedios). */
export function isSubsequence(expected: readonly string[], actual: readonly string[]): boolean {
  let i = 0;
  for (const id of actual) if (id === expected[i]) i++;
  return i === expected.length;
}
