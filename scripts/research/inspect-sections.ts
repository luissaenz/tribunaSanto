import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const html = fs.readFileSync(path.resolve(process.cwd(), 'web', 'index.html'), 'utf-8');
const root = parse(html);

const sections = root.querySelectorAll('section');
sections.forEach((s, idx) => {
  const h2 = s.querySelector('h2')?.text.trim();
  const headerDiv = s.querySelector('div.flex.items-center.justify-between') || s.querySelector('> div:first-child');
  const articles = s.querySelectorAll('article');
  console.log(`\n=== Section [${idx}]: "${h2}" ===`);
  console.log(`  Header pattern: ${headerDiv?.rawAttrs}`);
  console.log(`  Articles total: ${articles.length}`);
  
  // Look at internal grid / layout inside section
  const internalGrids = s.querySelectorAll('div.grid, div.space-y-4');
  internalGrids.forEach((g, gi) => {
    console.log(`    Sub-layout ${gi}: class="${g.getAttribute('class')}" has ${g.querySelectorAll('article').length} articles`);
  });
});
