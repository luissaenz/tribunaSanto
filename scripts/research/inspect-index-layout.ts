import fs from 'node:fs';
import path from 'node:path';
import { parse, HTMLElement } from 'node-html-parser';

const html = fs.readFileSync(path.resolve(process.cwd(), 'web', 'index.html'), 'utf-8');
const root = parse(html);

console.log('--- SECTION 0 (Hero Grid) ---');
const heroGrid = root.querySelector('section.relative > div.grid');
if (heroGrid) {
  const heroCols = heroGrid.childNodes.filter((n): n is HTMLElement => n.nodeType === 1);
  heroCols.forEach((col, i) => {
    console.log(`Hero Col ${i}: tag=${col.tagName} class="${col.getAttribute('class')}"`);
  });
}

console.log('\n--- MAIN CONTENT GRID 1 ---');
const grids = root.querySelectorAll('div.max-w-7xl > div.grid-cols-1.lg\\:grid-cols-4');
grids.forEach((grid, gIdx) => {
  console.log(`\nGrid ${gIdx}: class="${grid.getAttribute('class')}"`);
  const cols = grid.childNodes.filter((n): n is HTMLElement => n.nodeType === 1);
  cols.forEach((col, cIdx) => {
    console.log(`  Col ${cIdx}: tag=${col.tagName} class="${col.getAttribute('class')}"`);
    const sections = col.querySelectorAll('section');
    if (sections.length > 0) {
      console.log(`    Contains ${sections.length} sections:`);
      sections.forEach((s) => {
        const h2 = s.querySelector('h2')?.text.trim();
        console.log(`      Section: "${h2}" (class="${s.getAttribute('class')}")`);
      });
    }
    if (col.tagName === 'ASIDE') {
      const h2s = col.querySelectorAll('h2').map((h) => h.text.trim());
      console.log(`    Aside widgets: ${h2s.join(', ')}`);
    }
  });
});
