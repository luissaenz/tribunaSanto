// WEB.2 — Guards puros. Cada uno devuelve la lista de violaciones encontradas
// (vacía = OK). Se aplican sobre el repo/dist reales y sobre mutantes sintéticos
// en tests/web/guards-mutation.test.ts.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseHtml } from 'node-html-parser';
import { hashText } from '../../scripts/corpus/lib/analyze.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';
import { PRESENTATION_ONLY_KEYS } from '../../src/presentation/story.js';
import { pageFamilyBlocks } from '../../src/presentation/blocks.js';
import { familyOf, isSubsequence } from './dist.js';

export type SourceFile = Readonly<{ path: string; content: string }>;
export type HtmlPage = Readonly<{ route: string; html: string }>;

/** 1 — Referencias de código o rutas al corpus /web. */
export function findCorpusReferences(files: readonly SourceFile[]): string[] {
  const patterns = [/(['"`(]|\s)(\.\.?\/)+web\//, /['"`]\/?web\/[^'"`]*['"`]/, /_astro\/MainLayout/];
  return files.flatMap((f) => patterns.filter((p) => p.test(f.content)).map((p) => `${f.path}: ${p}`));
}

/** 3a — Huellas del template: marca, frameworks y clases utilitarias del corpus. */
export const CORPUS_FINGERPRINTS: readonly RegExp[] = [
  /madethemes/i,
  /daily newspaper/i,
  /\bx-data\b/,
  /\balpine/i,
  /tailwind/i,
  /\bmax-w-7xl\b/,
  /\bfont-heading\b/,
  /\bpost-content\b/,
  /\blg:col-span-\d/,
  /\blg:grid-cols-\d/,
  /\bborder-t-4\b/,
  /\bborder-s-4\b/,
  /\bbg-red-600\b/,
  /\btext-gray-\d{3}\b/,
  /\bspace-y-\d\b/,
  /\bhover:text-red-\d{3}\b/
];

export function findCorpusFingerprints(files: readonly SourceFile[]): string[] {
  return files.flatMap((f) => CORPUS_FINGERPRINTS.filter((p) => p.test(f.content)).map((p) => `${f.path}: ${p}`));
}

/** 3b — Assets del corpus (por SHA-256 o nombre de archivo). */
export function findCorpusAssets(
  files: readonly string[],
  corpusAssets: ReadonlyArray<{ path: string; sha256: string }>
): string[] {
  const hashes = new Set(corpusAssets.map((a) => a.sha256));
  const names = new Set(corpusAssets.map((a) => path.basename(a.path)));
  return files.filter((file) => {
    const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    return hashes.has(digest) || names.has(path.basename(file));
  });
}

/** 3c — Fuentes: sólo se publican woff2 con procedencia de paquetes OFL (@fontsource*). */
export function fontPackageHashes(nodeModules: string): Set<string> {
  const hashes = new Set<string>();
  for (const scope of ['@fontsource', '@fontsource-variable']) {
    const scopeDir = path.join(nodeModules, scope);
    if (!fs.existsSync(scopeDir)) continue;
    for (const pkg of fs.readdirSync(scopeDir)) {
      const filesDir = path.join(scopeDir, pkg, 'files');
      if (!fs.existsSync(filesDir)) continue;
      for (const file of fs.readdirSync(filesDir)) {
        if (/\.(woff2?|ttf|otf|eot)$/i.test(file)) {
          hashes.add(crypto.createHash('sha256').update(fs.readFileSync(path.join(filesDir, file))).digest('hex'));
        }
      }
    }
  }
  return hashes;
}

/** 3c — Archivos de fuente publicados cuyo contenido no proviene de un paquete permitido. */
export function findUnprovenancedFonts(files: readonly string[], allowedHashes: ReadonlySet<string>): string[] {
  return files
    .filter((f) => /\.(woff2?|ttf|otf|eot)$/i.test(f))
    .filter((f) => !allowedHashes.has(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')));
}

/** 3d — Títulos del corpus reutilizados (hash de títulos de ≥3 palabras; no detecta traducciones). */
export function findCorpusHeadings(pages: readonly HtmlPage[], corpusHeadingHashes: readonly string[]): string[] {
  const corpus = new Set(corpusHeadingHashes);
  return pages.flatMap((page) =>
    parseHtml(page.html)
      .querySelectorAll('h1, h2, h3, h4')
      .map((h) => h.text.replace(/\s+/g, ' ').trim())
      .filter((t) => t.split(' ').length >= 3 && corpus.has(hashText(t)))
      .map((t) => `${page.route}: ${t}`)
  );
}

/** 2 — Contaminación del payload canónico con claves de presentación o ajenas al contrato. */
export function findPayloadContamination(articles: readonly object[]): string[] {
  const contract = new Set(Object.keys(PublicationToWebPayloadSchema.shape));
  const forbidden = new Set<string>(PRESENTATION_ONLY_KEYS);
  return articles.flatMap((article, i) =>
    Object.keys(article)
      .filter((k) => forbidden.has(k) || !contract.has(k))
      .map((k) => `article[${i}].${k}`)
  );
}

/** 4 — Familias/bloques requeridos ausentes. */
export function findMissingBlocks(pages: readonly HtmlPage[]): string[] {
  return pages.flatMap((page) => {
    const family = familyOf(page.route);
    const actual = parseHtml(page.html)
      .querySelectorAll('[data-block]')
      .map((el) => el.getAttribute('data-block') ?? '');
    return isSubsequence(pageFamilyBlocks[family], actual) ? [] : [`${page.route} (${family})`];
  });
}

/** 5 — JS de cliente o hidratación. */
export function findClientScripts(pages: readonly HtmlPage[], files: readonly string[] = []): string[] {
  const inPages = pages.flatMap((page) => {
    const root = parseHtml(page.html);
    const scripts = root
      .querySelectorAll('script')
      .filter((s) => s.getAttribute('type') !== 'application/ld+json')
      .map(() => `${page.route}: <script>`);
    const islands = /<astro-island|client:(load|idle|visible|media|only)/.test(page.html) ? [`${page.route}: island`] : [];
    return [...scripts, ...islands];
  });
  const jsFiles = files.filter((f) => /\.(m?js)$/.test(f)).map((f) => `${f}: js file`);
  return [...inPages, ...jsFiles];
}

const NON_NAVIGABLE = /^(#|mailto:|tel:|https?:\/\/|\/\/)/i;

/** 6 — Rutas y enlaces internos navegables fuera de `/` o `/demo/...`. */
export function findOffNamespaceRoutes(pages: readonly HtmlPage[]): string[] {
  const inNamespace = (pathname: string) => pathname === '/' || pathname.startsWith('/demo/');
  return pages.flatMap((page) => {
    const routeViolation = inNamespace(page.route) ? [] : [`route ${page.route}`];
    const hrefViolations = parseHtml(page.html)
      .querySelectorAll('a[href]')
      .map((a) => (a.getAttribute('href') ?? '').trim())
      .filter((href) => href !== '' && !NON_NAVIGABLE.test(href))
      .map((href) => ({ href, pathname: new URL(href, `https://demo.invalid${page.route}`).pathname }))
      .filter(({ pathname }) => !inNamespace(pathname))
      .map(({ href }) => `${page.route}: ${href}`);
    return [...routeViolation, ...hrefViolations];
  });
}

/** 7 — Metadata SEO definitiva sobre páginas demo, o robots distinto de noindex,nofollow. */
export function findIndexingMetadata(pages: readonly HtmlPage[]): string[] {
  return pages.flatMap((page) => {
    const root = parseHtml(page.html);
    const issues: string[] = [];
    if (root.querySelector('link[rel="canonical"]')) issues.push('canonical');
    if (root.querySelectorAll('meta[property^="og:"]').length > 0) issues.push('og');
    if (root.querySelectorAll('meta[name^="twitter:"]').length > 0) issues.push('twitter');
    if (/NewsArticle/.test(page.html)) issues.push('NewsArticle');
    const robots = root.querySelectorAll('meta[name="robots"]').map((m) => (m.getAttribute('content') ?? '').replace(/\s+/g, ''));
    if (robots.length !== 1 || robots[0] !== 'noindex,nofollow') issues.push(`robots=${robots.join('|') || 'missing'}`);
    return issues.map((i) => `${page.route}: ${i}`);
  });
}

/** 8 — Datos inventados dentro de los placeholders DEP/MET/GRF. */
export function findFabricatedSlotData(pages: readonly HtmlPage[]): string[] {
  return pages.flatMap((page) =>
    parseHtml(page.html)
      .querySelectorAll('[data-block="future-slot"]')
      .filter((slot) => /\d/.test(slot.text))
      .map((slot) => `${page.route}: ${slot.getAttribute('data-slot')}`)
  );
}

/** 9 — Render de HTML sin escapar en componentes. */
export function findUnescapedHtml(files: readonly SourceFile[]): string[] {
  return files.filter((f) => /set:html|\binnerHTML\b/.test(f.content)).map((f) => f.path);
}
