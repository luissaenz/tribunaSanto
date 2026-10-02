import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

function inspectPage(filePath: string, label: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const root = parse(content);

  console.log(`\n======================================================`);
  console.log(`PAGE: ${label} (${path.basename(filePath)})`);
  console.log(`======================================================`);

  // Header & Nav
  const header = root.querySelector('header');
  if (header) {
    console.log(`[Header] Found <header>:`);
    const subSections = header.querySelectorAll('> div, > nav');
    console.log(`  Sub-elements: ${subSections.length}`);
    for (let i = 0; i < subSections.length; i++) {
      const el = subSections[i];
      console.log(`    Level 1 [${i}]: tag=${el.tagName} class="${el.getAttribute('class') || ''}"`);
    }
  }

  // Top level container under header
  const main = root.querySelector('main') || root.querySelector('div.container, div[class*="max-w"]');
  console.log(`[Main container] tag=${main?.tagName} class="${main?.getAttribute('class') || ''}"`);

  // Sections and grids
  const sections = root.querySelectorAll('section');
  console.log(`[Sections] Total: ${sections.length}`);
  sections.slice(0, 5).forEach((sec, idx) => {
    const heading = sec.querySelector('h1, h2, h3, h4')?.text.trim();
    console.log(`  Section ${idx}: class="${sec.getAttribute('class') || ''}" heading="${heading}"`);
    const articles = sec.querySelectorAll('article');
    console.log(`    Contains ${articles.length} <article> items`);
  });

  // Asides / Sidebars
  const asides = root.querySelectorAll('aside');
  console.log(`[Asides/Sidebars] Total: ${asides.length}`);
  asides.forEach((aside, idx) => {
    console.log(`  Aside ${idx}: class="${aside.getAttribute('class') || ''}"`);
    const headings = aside.querySelectorAll('h2, h3, h4').map(h => h.text.trim());
    console.log(`    Headings: ${headings.join(' | ')}`);
  });

  // Footer
  const footer = root.querySelector('footer');
  if (footer) {
    console.log(`[Footer] Found <footer>: class="${footer.getAttribute('class') || ''}"`);
    const colDivs = footer.querySelectorAll('> div > div, footer div.grid > div');
    console.log(`    Columns / sub-blocks: ${colDivs.length}`);
  }
}

const webDir = path.resolve(process.cwd(), 'web');
inspectPage(path.join(webDir, 'index.html'), 'HOME');
inspectPage(path.join(webDir, 'sports.html'), 'CATEGORY (sports)');
inspectPage(path.join(webDir, 'sports-football-transfer.html'), 'ARTICLE (sports-football-transfer)');
inspectPage(path.join(webDir, 'tags', 'football.html'), 'TAG (football)');
inspectPage(path.join(webDir, 'author', 'john-smith.html'), 'AUTHOR (john-smith)');
inspectPage(path.join(webDir, 'page', '2.html'), 'PAGINATION (page/2)');
inspectPage(path.join(webDir, 'about.html'), 'INSTITUTIONAL (about)');
