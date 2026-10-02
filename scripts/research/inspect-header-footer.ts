import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

const html = fs.readFileSync(path.resolve(process.cwd(), 'web', 'index.html'), 'utf-8');
const root = parse(html);

console.log('=== HEADER STRUCTURE ===');
const header = root.querySelector('header');
if (header) {
  // Utility bar
  const utilityBar = header.querySelector('div.bg-gray-100');
  console.log('[Utility Bar]:', utilityBar?.text.replace(/\s+/g, ' ').trim());

  // Main header
  const mainHeader = header.querySelector('div.max-w-7xl');
  console.log('\n[Main Header Div]:', mainHeader?.querySelector('img')?.getAttribute('alt'), '| Links:', mainHeader?.querySelectorAll('a').map(a => a.text.trim()).filter(Boolean).slice(0, 5));

  // Navigation
  const nav = root.querySelector('nav');
  console.log('\n[Nav]:', nav?.querySelectorAll('a').map(a => `${a.text.trim()}(${a.getAttribute('href')})`).join(' | '));
}

console.log('\n=== FOOTER STRUCTURE ===');
const footer = root.querySelector('footer');
if (footer) {
  const headings = footer.querySelectorAll('h2, h3, h4').map(h => h.text.trim());
  console.log('[Footer Headings]:', headings);
  const links = footer.querySelectorAll('a').map(a => `${a.text.trim()}(${a.getAttribute('href')})`);
  console.log('[Footer Links]:', links.slice(0, 15));
}
