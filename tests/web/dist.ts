import fs from 'node:fs';
import path from 'node:path';
import { parse as parseHtml, type HTMLElement } from 'node-html-parser';

export const distDir = path.resolve(process.cwd(), 'dist');

export function distHtmlFiles(dir = distDir): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return distHtmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

export function readDistPage(route: string): { html: string; root: HTMLElement } {
  const file = path.join(distDir, route, 'index.html');
  const html = fs.readFileSync(file, 'utf-8');
  return { html, root: parseHtml(html) };
}

export function routeOf(file: string): string {
  const rel = path.relative(distDir, path.dirname(file)).replace(/\\/g, '/');
  return rel === '' ? '/' : `/${rel}/`;
}
