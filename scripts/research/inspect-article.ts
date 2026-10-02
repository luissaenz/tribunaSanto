import fs from 'node:fs';
import path from 'node:path';
import { parse, HTMLElement } from 'node-html-parser';

const html = fs.readFileSync(path.resolve(process.cwd(), 'web', 'sports-football-transfer.html'), 'utf-8');
const root = parse(html);

console.log('=== ARTICLE PAGE BREAKDOWN ===');

// 1. Breadcrumbs
const breadcrumb = root.querySelector('div.bg-gray-100.border-b');
console.log('[Breadcrumb]:', breadcrumb?.text.replace(/\s+/g, ' ').trim());

// 2. Hero / Header area
const hero = root.querySelector('div.relative.w-full.aspect-4\\/3') || root.querySelector('div.relative.w-full.aspect-video') || root.querySelector('div.relative.w-full');
console.log('\n[Hero area]:');
if (hero) {
  console.log('  Hero class:', hero.getAttribute('class'));
  const h1 = hero.querySelector('h1');
  console.log('  H1:', h1?.text.trim());
  const meta = hero.querySelector('div.text-white');
  console.log('  Hero meta overlay:', meta?.text.replace(/\s+/g, ' ').trim());
}

// 3. Sub-header / metadata bar if any
const metaBar = root.querySelector('div.border-b.border-gray-200.bg-white');
console.log('\n[Meta/Share bar]:', metaBar?.text.replace(/\s+/g, ' ').trim());

// 4. Main article body & Sidebar
const articleMain = root.querySelector('main > div.grid');
console.log('\n[Main layout grid]:', articleMain?.getAttribute('class'));
if (articleMain) {
  const leftCol = articleMain.querySelector('div.lg\\:col-span-3, div.col-span-3, div.lg\\:col-span-2');
  const rightCol = articleMain.querySelector('aside');
  console.log('  Left Col (article body):', leftCol?.getAttribute('class'));
  console.log('    Direct tags inside left col:');
  leftCol?.childNodes.filter((n): n is HTMLElement => n.nodeType === 1).forEach((c, i) => {
    console.log(`      [${i}] <${c.tagName}> class="${c.getAttribute('class')}" id="${c.getAttribute('id')}"`);
  });

  console.log('  Right Col (sidebar):', rightCol?.getAttribute('class'));
  console.log('    Headings in sidebar:', rightCol?.querySelectorAll('h2, h3, h4').map(h => h.text.trim()).join(' | '));
}

// 5. Related articles section
const related = root.querySelector('section');
console.log('\n[Related section]:', related?.querySelector('h2')?.text.trim());
console.log('  Related articles count:', related?.querySelectorAll('article').length);
