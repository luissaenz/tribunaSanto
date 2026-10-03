// WEB.2/WEB.3 — Guards puros. Cada uno devuelve la lista de violaciones encontradas
// (vacía = OK). Se aplican sobre el repo/dist reales y sobre mutantes sintéticos
// en tests/web/guards-mutation.test.ts.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parse as parseHtml } from 'node-html-parser';
import { hashText } from '../../scripts/corpus/lib/analyze.js';
import { PublicationToWebPayloadSchema } from '../../src/contracts/index.js';
import { PRESENTATION_ONLY_KEYS } from '../../src/presentation/story.js';
import { blockCatalog, pageFamilyBlocks } from '../../src/presentation/blocks.js';
import { familyOf, isSubsequence } from './dist.js';

export type SourceFile = Readonly<{ path: string; content: string }>;
export type HtmlPage = Readonly<{ route: string; html: string }>;

/** 1 — Referencias de código o rutas al corpus /web. */
export function findCorpusReferences(files: readonly SourceFile[]): string[] {
  const patterns = [/(['"`(]|\s)(\.\.?\/)+web\//, /['"`]\/?web\/[^'"`]*['"`]/, /_astro\/MainLayout/];
  return files.flatMap((f) => patterns.filter((p) => p.test(f.content)).map((p) => `${f.path}: ${p}`));
}

/**
 * 3a — Huellas del template: marca de la referencia y lógica Alpine inline
 * (`x-data="{ … }"`). WEB.3 usa Tailwind y Alpine (aprobados), pero los
 * componentes Alpine se registran en src/scripts/alpine.ts y el markup sólo
 * los referencia por nombre: nunca se copia lógica inline del template.
 */
export const CORPUS_FINGERPRINTS: readonly RegExp[] = [
  /madethemes/i,
  /daily newspaper/i,
  /x-data\s*=\s*(["'`{])\s*\{/,
  /x-data\s*=\s*\{\s*`\s*\{/
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

/** 5 — Entradas de cliente: `<script type="module" src="/_astro/…">` referenciados por las páginas. */
export function findClientEntries(pages: readonly HtmlPage[]): string[] {
  const entries = new Set<string>();
  for (const page of pages) {
    for (const s of parseHtml(page.html).querySelectorAll('script')) {
      const src = s.getAttribute('src');
      if (s.getAttribute('type') === 'module' && src && ENTRY_SRC.test(src)) entries.add(src);
    }
  }
  return [...entries].sort();
}

const ENTRY_SRC = /^\/_astro\/[\w.-]+\.js$/;
const NAMED_X_DATA = /^[A-Za-z_$][\w$]*(\([^{}]*\))?$/;
const FRAMEWORK_SIGNATURES = /react-dom|__REACT_DEVTOOLS|__VUE__|createApp\(|svelte\/internal|from"svelte|preact/;

/**
 * 5 — Arquitectura de cliente WEB.3: a lo sumo UNA entrada funcional propia
 * (la inicialización Alpine) compartida por todas las páginas. Los chunks
 * físicos que genere el bundler no son normativos. Prohibidos: islands,
 * directivas client:*, scripts inline o clásicos, manejadores on*,
 * `x-data` con lógica inline y runtimes de otros frameworks.
 */
export function findUnexpectedClientScripts(pages: readonly HtmlPage[], files: readonly string[] = []): string[] {
  const inPages = pages.flatMap((page) => {
    const root = parseHtml(page.html);
    const violations: string[] = [];
    for (const s of root.querySelectorAll('script')) {
      const type = s.getAttribute('type');
      const src = s.getAttribute('src');
      if (type === 'application/ld+json') continue;
      if (type === 'module' && src && ENTRY_SRC.test(src) && s.innerHTML.trim() === '') continue;
      violations.push(`${page.route}: unexpected <script>`);
    }
    if (/<astro-island|client:(load|idle|visible|media|only)/.test(page.html)) violations.push(`${page.route}: island`);
    for (const el of root.querySelectorAll('[x-data]')) {
      const value = (el.getAttribute('x-data') ?? '').trim();
      if (!NAMED_X_DATA.test(value)) violations.push(`${page.route}: inline x-data`);
    }
    if (root.querySelectorAll('*').some((el) => Object.keys(el.attributes).some((a) => /^on[a-z]+$/i.test(a)))) {
      violations.push(`${page.route}: inline event handler`);
    }
    return violations;
  });
  const entries = findClientEntries(pages);
  const multiple = entries.length > 1 ? [`multiple client entries: ${entries.join(', ')}`] : [];
  const frameworks = files
    .filter((f) => /\.(m?js)$/.test(f))
    .filter((f) => FRAMEWORK_SIGNATURES.test(fs.readFileSync(f, 'utf-8')))
    .map((f) => `${f}: framework runtime`);
  return [...inPages, ...multiple, ...frameworks];
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

/**
 * 8 — Bloques fuera del catálogo: todo `data-block` renderizado debe estar
 * declarado en src/presentation/blocks.ts (impide que reaparezcan bloques
 * retirados de WEB.2, como los huecos DEP/MET/GRF o el rail antiguo).
 */
export function findUncatalogedBlocks(pages: readonly HtmlPage[]): string[] {
  const known = new Set<string>(blockCatalog.map((b) => b.id));
  return pages.flatMap((page) =>
    parseHtml(page.html)
      .querySelectorAll('[data-block]')
      .map((el) => el.getAttribute('data-block') ?? '')
      .filter((id) => !known.has(id))
      .map((id) => `${page.route}: ${id}`)
  );
}

/** 9 — Render de HTML sin escapar en componentes. */
export function findUnescapedHtml(files: readonly SourceFile[]): string[] {
  return files.filter((f) => /set:html|\binnerHTML\b/.test(f.content)).map((f) => f.path);
}
