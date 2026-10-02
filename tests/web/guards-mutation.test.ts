// WEB.2 — Mutation tests: cada guard es VERDE sobre el repo/build reales y
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
  findClientScripts,
  findCorpusAssets,
  findCorpusFingerprints,
  findCorpusReferences,
  findFabricatedSlotData,
  findIndexingMetadata,
  findMissingBlocks,
  findOffNamespaceRoutes,
  findPayloadContamination,
  findUnescapedHtml
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

    const mutant = [{ path: 'src/components/Mutant.astro', content: '<div class="max-w-7xl mx-auto"></div>' }];
    expect(findCorpusFingerprints(mutant)).not.toEqual([]);
  });

  it('M4 disappearance of a required block', () => {
    expect(findMissingBlocks([page(section), page(home), page(article)])).toEqual([]);
    const mutant = { route: section.route, html: section.html.replace('data-block="river-list"', 'data-block="removed"') };
    expect(findMissingBlocks([mutant])).toEqual([`${section.route} (section)`]);
  });

  it('M5 client JavaScript or hydration', () => {
    expect(findClientScripts([page(home)], walkFiles(distDir))).toEqual([]);
    const withScript = { route: '/', html: home.html.replace('</body>', '<script>alert(1)</script></body>') };
    const withIsland = { route: '/', html: home.html.replace('</body>', '<astro-island></astro-island></body>') };
    expect(findClientScripts([withScript])).toEqual(['/: <script>']);
    expect(findClientScripts([withIsland])).toEqual(['/: island']);
    expect(findClientScripts([], ['dist/_astro/app.js'])).toEqual(['dist/_astro/app.js: js file']);
    const jsonLd = { route: '/', html: home.html.replace('</body>', '<script type="application/ld+json">{}</script></body>') };
    expect(findClientScripts([jsonLd])).toEqual([]);
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
    expect(findFabricatedSlotData([page(home)])).toEqual([]);
    const mutant = { route: '/', html: home.html.replace('Datos deportivos disponibles en próximos arcos.', 'Puntos 12 · Posición 3') };
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
