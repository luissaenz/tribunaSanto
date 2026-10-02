import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'node-html-parser';

interface PageInfo {
  file: string;
  relPath: string;
  type: string;
  title: string;
  h1: string[];
  h2Count: number;
  h3Count: number;
  articleCount: number;
  sectionCount: number;
  asideCount: number;
  hasSlider: boolean;
  hasBreadcrumb: boolean;
  hasShareArea: boolean;
  hasAuthorBio: boolean;
  hasRelated: boolean;
  hasPopular: boolean;
  hasUtilityBar: boolean;
  hasMainHeader: boolean;
  hasNav: boolean;
  hasFooter: boolean;
  hasPagination: boolean;
}

function classifyPage(relPath: string): string {
  const norm = relPath.replace(/\\/g, '/');
  if (norm === 'index.html') return 'home';
  if (norm.startsWith('tags/')) return 'tag';
  if (norm.startsWith('page/') || norm === 'page.html' || /author\/[^/]+\/\d+\.html/.test(norm)) return 'paginacion/listado';
  if (norm.startsWith('author/')) return 'autor';
  if (['about.html', 'advertise.html', 'careers.html', 'contact.html', 'privacy.html'].includes(norm)) return 'institucional';
  
  // Distinguish category vs article:
  // e.g. sports.html vs sports-football-transfer.html
  const base = path.basename(norm, '.html');
  if (!base.includes('-')) {
    return 'categoria';
  }
  return 'articulo';
}

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

function analyzeCorpus() {
  const webDir = path.resolve(process.cwd(), 'web');
  const htmlFiles = walkDir(webDir);

  const inventory: PageInfo[] = [];
  const typeCounts: Record<string, number> = {};

  for (const file of htmlFiles) {
    const relPath = path.relative(webDir, file);
    const content = fs.readFileSync(file, 'utf-8');
    const root = parse(content);

    const type = classifyPage(relPath);
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    const title = root.querySelector('title')?.text.trim() || '';
    const h1s = root.querySelectorAll('h1').map(h => h.text.trim());
    const h2Count = root.querySelectorAll('h2').length;
    const h3Count = root.querySelectorAll('h3').length;
    const articleCount = root.querySelectorAll('article').length;
    const sectionCount = root.querySelectorAll('section').length;
    const asideCount = root.querySelectorAll('aside').length;

    // Feature detection
    const hasSlider = content.includes('x-data="{') && content.includes('startTimer');
    const hasBreadcrumb = root.querySelectorAll('nav[aria-label="Breadcrumb"], nav[aria-label="breadcrumb"], ol.breadcrumb, .breadcrumb, [data-breadcrumb]').length > 0
      || content.includes('Home') && (content.includes('&gt;') || content.includes('chevron-right') || content.includes('/')) && root.querySelectorAll('ol, ul').some(el => el.text.includes('Home') && el.querySelectorAll('li').length > 1);
    const hasShareArea = content.includes('Share:') || content.includes('share') && (content.includes('twitter') || content.includes('facebook') || content.includes('whatsapp') || content.includes('linkedin'));
    const hasAuthorBio = content.includes('About the Author') || content.includes('author-bio') || (type === 'autor' || content.includes('Written by'));
    const hasRelated = content.includes('Related Articles') || content.includes('Related Stories') || content.includes('You May Also Like');
    const hasPopular = content.includes('Popular News') || content.includes('Trending');
    const hasUtilityBar = content.includes('Trending:') || content.includes('weather') || content.includes('top-bar');
    const hasMainHeader = root.querySelectorAll('header').length > 0;
    const hasNav = root.querySelectorAll('nav').length > 0;
    const hasFooter = root.querySelectorAll('footer').length > 0;
    const hasPagination = content.includes('Pagination') || root.querySelectorAll('a').some(a => /page\/\d+/.test(a.getAttribute('href') || '') || a.text.trim() === 'Next' || a.text.trim() === 'Previous');

    inventory.push({
      file,
      relPath,
      type,
      title,
      h1: h1s,
      h2Count,
      h3Count,
      articleCount,
      sectionCount,
      asideCount,
      hasSlider,
      hasBreadcrumb,
      hasShareArea,
      hasAuthorBio,
      hasRelated,
      hasPopular,
      hasUtilityBar,
      hasMainHeader,
      hasNav,
      hasFooter,
      hasPagination,
    });
  }

  console.log('=== CORPUS INVENTORY SUMMARY ===');
  console.log(`Total HTML files: ${inventory.length}`);
  console.log('Distribution by page type:');
  for (const [t, count] of Object.entries(typeCounts)) {
    console.log(`  - ${t}: ${count}`);
  }

  console.log('\n=== SAMPLE PAGES PER TYPE ===');
  for (const type of Object.keys(typeCounts)) {
    const samples = inventory.filter(i => i.type === type).slice(0, 3);
    console.log(`Type [${type}]:`);
    for (const s of samples) {
      console.log(`    File: ${s.relPath} | Title: "${s.title}" | H1: [${s.h1.join('; ')}] | Articles: ${s.articleCount} | Sections: ${s.sectionCount} | Aside: ${s.asideCount}`);
    }
  }

  // Save full JSON inventory for detailed analysis
  fs.mkdirSync(path.resolve(process.cwd(), 'temp'), { recursive: true });
  fs.writeFileSync(
    path.resolve(process.cwd(), 'temp', 'web-inventory.json'),
    JSON.stringify({ typeCounts, inventory }, null, 2)
  );
  console.log('\nSaved full inventory to temp/web-inventory.json');
}

analyzeCorpus();
