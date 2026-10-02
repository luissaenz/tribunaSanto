import { describe, it, expect } from 'vitest';
import { analyzePage, cardShape, hashText } from '../../scripts/corpus/lib/analyze.js';
import { parse as parseHtml } from 'node-html-parser';

// Fixtures sintéticas mínimas: el analizador se prueba sin depender de /web.
const chrome = (main: string) => `<!doctype html><html><body>
<header><div class="py-2"><div>fecha</div><div>clima</div></div><div><a href="/"><img src="x.png"></a><p>lema</p></div></header>
<nav><a href="a">A</a><a href="b">B</a><a href="c">C</a><a href="d">D</a><a href="e">E</a></nav>
<main>${main}</main>
<footer><ul><li>x</li></ul><ul><li>y</li></ul></footer>
</body></html>`;

const rail = `<aside><div class="sticky top-16">
<div><h3>Trending</h3><article><span>01</span><div><h4><a href="x">t</a></h4><div>d</div></div></article></div>
<div><h3>Categories</h3><ul><li>c</li></ul></div>
<div><h3>Latest News</h3><article><div><a><img></a></div><div><h4><a>t</a></h4></div></article></div>
</div></aside>`;

describe('corpus analyzer', () => {
  it('classifies an article page by body and share area', () => {
    const page = analyzePage(
      'x-y.html',
      chrome(`<div class="post-content"><p>a</p><h2>s</h2><blockquote><p>q</p></blockquote></div>
        <div><span>Tags:</span><a>t</a></div><div><span>Share:</span></div>${rail}`)
    );
    expect(page.family).toBe('article');
    expect(page.blocks).toEqual(
      expect.arrayContaining(['article-body', 'body-subheading', 'body-quote', 'article-tags', 'share-area', 'sticky-rail'])
    );
  });

  it('classifies listings and detects pagination numbers', () => {
    const river = `<section><div class="divide-y"><article class="py-6"><div>x</div></article></div></section>`;
    const pager = `<div class="flex justify-center"><a href=".">1</a><a href="2.html">2</a><a href="2.html">Next</a></div>`;

    const tag = analyzePage('tags/x.html', chrome(`<h1>X</h1><p>3 articles tagged with X</p>${river}${rail}`));
    expect(tag.family).toBe('tag');

    const listing = analyzePage('page/2.html', chrome(`<div class="border-t-4 border-black"><h2>Latest — Page 2</h2></div>${river}${pager}${rail}`));
    expect(listing.family).toBe('listing');
    expect(listing.paginated).toBe(true);
    expect(listing.pageNumber).toBe(2);
    expect(listing.blocks).toContain('pagination');
  });

  it('falls back to institutional when no editorial listing exists', () => {
    const page = analyzePage('about.html', chrome(`<section class="bg-black overflow-hidden"><h1>About</h1></section>`));
    expect(page.family).toBe('institutional');
    expect(page.blocks).toContain('page-hero-band');
  });

  it('reduces cards to tag-only shapes and headings to hashes', () => {
    const el = parseHtml('<article class="x"><div><a><img></a></div><h3><a>Título</a></h3><p>Texto</p></article>')
      .querySelector('article')!;
    expect(cardShape(el)).toBe('article>div(a(img))+h3(a)+p');
    expect(hashText('  Título  ')).toBe(hashText('título'));
    expect(hashText('Título')).toMatch(/^[0-9a-f]{16}$/);
  });
});
