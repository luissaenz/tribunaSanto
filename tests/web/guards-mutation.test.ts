// WEB.2/WEB.3 — Mutation tests: cada guard es VERDE sobre el repo/build reales y
// ROJO sobre un mutante mínimo. Los mutantes se construyen en memoria o en
// directorios temporales: nunca se escriben en el repositorio.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateInternalLinksInDirectory } from '../../scripts/seo/lib/contracts.js';
import { demoArticles } from '../../src/data/demo-articles.js';
import { routes } from '../../src/presentation/routes.js';
import { demoStories } from '../../src/data/demo-articles.js';
import {
  findClientEntries,
  findCorpusAssets,
  findCorpusFingerprints,
  findCorpusReferences,
  findFabricatedSlotData,
  findIndexingMetadata,
  findMissingBlocks,
  findOffNamespaceRoutes,
  findPayloadContamination,
  findUnescapedHtml,
  findUnexpectedClientScripts
} from '../support/guards.js';
import { distDir, readDistPage, walkFiles } from '../support/dist.js';
import { productSources, readInventory, repoRoot } from '../support/repo.js';

const sources = productSources();
const home = readDistPage('/');
const article = readDistPage(routes.article(demoStories[0]));
const section = readDistPage(routes.section('primera'));
const page = (p: { route: string; html: string }) => ({ route: p.route, html: p.html });

function withTempDir<T>(fn: (dir: string) => T): T {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tribuna-mutant-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('mutation tests (GREEN on the real tree, RED on the mutant)', () => {
  it('M1 accidental reference to /web', () => {
    expect(findCorpusReferences(sources)).toEqual([]);
    const mutant = [...sources, { path: 'src/components/Mutant.astro', content: "import x from '../../web/_astro/x.js';" }];
    expect(findCorpusReferences(mutant)).not.toEqual([]);
  });

  it('M2 contamination of PublicationToWebPayload', () => {
    expect(findPayloadContamination(demoArticles)).toEqual([]);
    expect(findPayloadContamination([{ ...demoArticles[0], sectionId: 'primera' }])).toEqual(['article[0].sectionId']);
    expect(findPayloadContamination([{ ...demoArticles[0], slug: 'x' }])).toEqual(['article[0].slug']);
  });

  it('M3 corpus asset or template class in the product', () => {
    const inventory = readInventory();
    const shipped = [...walkFiles(path.join(repoRoot, 'public')), ...walkFiles(distDir)];
    expect(findCorpusAssets(shipped, inventory.assets)).toEqual([]);
    expect(findCorpusFingerprints(sources)).toEqual([]);

    withTempDir((dir) => {
      // Mismo nombre que un asset inventariado.
      const byName = path.join(dir, path.basename(inventory.assets.find((a) => a.path.endsWith('.jpg'))!.path));
      fs.writeFileSync(byName, 'x');
      // Mismo contenido (hash) que un asset inventariado (simulado con un inventario sintético).
      const byHash = path.join(dir, 'renombrado.bin');
      fs.writeFileSync(byHash, 'contenido');
      const sha256 = crypto.createHash('sha256').update('contenido').digest('hex');
      expect(findCorpusAssets([byName], inventory.assets)).toEqual([byName]);
      expect(findCorpusAssets([byHash], [{ path: 'img/original.jpg', sha256 }])).toEqual([byHash]);
    });

    // WEB.3: las utilidades Tailwind están aprobadas; la marca y la lógica Alpine inline, no.
    const brand = [{ path: 'src/components/Mutant.astro', content: '<span>Daily Newspaper</span>' }];
    const inline = [{ path: 'src/components/Mutant.astro', content: '<div x-data="{ current: 0, next() {} }"></div>' }];
    expect(findCorpusFingerprints(brand)).not.toEqual([]);
    expect(findCorpusFingerprints(inline)).not.toEqual([]);
    expect(findCorpusFingerprints([{ path: 'src/x.astro', content: '<div x-data="carousel(3)" class="max-w-7xl"></div>' }])).toEqual([]);
  });

  it('M4 disappearance of a required block', () => {
    expect(findMissingBlocks([page(section), page(home), page(article)])).toEqual([]);
    const mutant = { route: section.route, html: section.html.replace('data-block="river-list"', 'data-block="removed"') };
    expect(findMissingBlocks([mutant])).toEqual([`${section.route} (section)`]);
  });

  it('M5/M17 a second client entry, island, inline script, inline Alpine logic or another framework', () => {
    expect(findUnexpectedClientScripts([page(home), page(article)], walkFiles(distDir))).toEqual([]);
    const [entry] = findClientEntries([page(home)]);
    expect(entry).toMatch(/^\/_astro\/.+\.js$/);
    expect(findClientEntries([page(home), page(article), page(section)])).toEqual([entry]);

    // Segunda entrada funcional (otra app de cliente) en otra página.
    const second = { route: '/x/', html: home.html.replace(entry, '/_astro/app2.def.js') };
    expect(findUnexpectedClientScripts([page(home), second])).toEqual([`multiple client entries: ${[entry, '/_astro/app2.def.js'].sort().join(', ')}`]);
    const withScript = { route: '/', html: home.html.replace('</body>', '<script>alert(1)</script></body>') };
    const withIsland = { route: '/', html: home.html.replace('</body>', '<astro-island></astro-island></body>') };
    const inlineData = { route: '/', html: home.html.replace('</body>', '<div x-data="{ open: false }"></div></body>') };
    const handler = { route: '/', html: home.html.replace('</body>', '<button onclick="go()">x</button></body>') };
    expect(findUnexpectedClientScripts([withScript])).toEqual(['/: unexpected <script>']);
    expect(findUnexpectedClientScripts([withIsland])).toEqual(['/: island']);
    expect(findUnexpectedClientScripts([inlineData])).toEqual(['/: inline x-data']);
    expect(findUnexpectedClientScripts([handler])).toEqual(['/: inline event handler']);
    const named = { route: '/', html: home.html.replace('</body>', '<div x-data="carousel(3)"></div><div x-data="siteNav"></div></body>') };
    expect(findUnexpectedClientScripts([named])).toEqual([]);
    const jsonLd = { route: '/', html: home.html.replace('</body>', '<script type="application/ld+json">{}</script></body>') };
    expect(findUnexpectedClientScripts([jsonLd])).toEqual([]);
    withTempDir((dir) => {
      const react = path.join(dir, 'chunk.js');
      fs.writeFileSync(react, 'import"react-dom";');
      const vue = path.join(dir, 'vue.js');
      fs.writeFileSync(vue, 'window.__VUE__=1');
      expect(findUnexpectedClientScripts([], [react, vue])).toEqual([`${react}: framework runtime`, `${vue}: framework runtime`]);
    });
  });

  it('M16 runtime dependency on the /web corpus', () => {
    expect(findCorpusReferences(sources)).toEqual([]);
    const importing = [{ path: 'src/scripts/mutant.ts', content: "import '../../web/_astro/MainLayout.js';" }];
    const fetching = [{ path: 'src/pages/mutant.astro', content: "const html = await fetch('/web/index.html');" }];
    expect(findCorpusReferences(importing)).not.toEqual([]);
    expect(findCorpusReferences(fetching)).not.toEqual([]);
  });

  it('M6 route or internal link outside /demo/', () => {
    expect(findOffNamespaceRoutes([page(home), page(article)])).toEqual([]);
    expect(findOffNamespaceRoutes([{ route: '/seccion/primera/', html: '<a href="/demo/">x</a>' }])).toEqual([
      'route /seccion/primera/'
    ]);
    const badLinks = { route: '/demo/x/', html: '<a href="/tema/y/">a</a><a href="../../acerca/">b</a>' };
    expect(findOffNamespaceRoutes([badLinks])).toEqual(['/demo/x/: /tema/y/', '/demo/x/: ../../acerca/']);
    // Sólo enlaces internos navegables: fragmentos, mailto, tel y absolutos externos no aplican.
    const ignored = {
      route: '/demo/x/',
      html: '<a href="#top">a</a><a href="mailto:a@b.c">b</a><a href="tel:123">c</a><a href="https://x.com/">d</a><a href="http://x.org/">e</a><a href="../y/">f</a>'
    };
    expect(findOffNamespaceRoutes([ignored])).toEqual([]);
  });

  it('M7 accidental canonical, OpenGraph or Twitter metadata on /demo/', () => {
    expect(findIndexingMetadata([page(article), page(home)])).toEqual([]);
    const mutant = {
      route: article.route,
      html: article.html.replace(
        '</head>',
        '<link rel="canonical" href="https://tribunasanto.local/demo/x/"><meta property="og:title" content="x"><meta name="twitter:card" content="summary"></head>'
      )
    };
    expect(findIndexingMetadata([mutant])).toEqual([`${article.route}: canonical`, `${article.route}: og`, `${article.route}: twitter`]);
    const indexable = { route: '/', html: home.html.replace('content="noindex, nofollow"', 'content="index, follow"') };
    expect(findIndexingMetadata([indexable])).toEqual(['/: robots=index,follow']);
  });

  it('M8 fabricated data inside DEP/MET/GRF placeholders', () => {
    expect(findFabricatedSlotData([page(article)])).toEqual([]);
    const mutant = { route: article.route, html: article.html.replace('</main>', '<section data-block="future-slot" data-slot="standings">Puntos 12 · Posición 3</section></main>') };
    expect(findFabricatedSlotData([mutant])).not.toEqual([]);
  });

  it('M9 unescaped body rendering', () => {
    expect(findUnescapedHtml(sources)).toEqual([]);
    const mutant = [{ path: 'src/components/article/ArticleBody.astro', content: '<div set:html={body} />' }];
    expect(findUnescapedHtml(mutant)).toEqual(['src/components/article/ArticleBody.astro']);
  });

  it('M10 broken internal link', () => {
    expect(validateInternalLinksInDirectory(distDir).filter((r) => !r.exists)).toEqual([]);
    withTempDir((dir) => {
      fs.writeFileSync(path.join(dir, 'index.html'), home.html.replace('</main>', '<a href="/demo/inexistente/">x</a></main>'));
      const broken = validateInternalLinksInDirectory(dir).filter((r) => !r.exists).map((r) => r.href);
      expect(broken).toContain('/demo/inexistente/');
    });
  });
});
