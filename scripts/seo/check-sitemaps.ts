import fs from 'node:fs';
import path from 'node:path';
import { validateNewsSitemapXml } from './lib/contracts.js';

function run() {
  const distDir = path.resolve(process.cwd(), 'dist');
  console.log(`[SEO Gate] Checking News Sitemaps in dist: ${distDir}`);

  if (!fs.existsSync(distDir)) {
    console.error(`[SEO Gate] ✗ Dist directory does not exist. Run 'npm run build' first.`);
    process.exit(1);
  }

  function getXmlFiles(dir: string): string[] {
    let files: string[] = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getXmlFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.xml')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const xmlFiles = getXmlFiles(distDir);
  let checkedSitemaps = 0;
  let totalNewsEntries = 0;
  let errorCount = 0;

  for (const file of xmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('news:news') && !content.includes('<news>')) {
      continue;
    }

    checkedSitemaps++;
    console.log(`[SEO Gate] Validating News Sitemap: ${file}`);
    const result = validateNewsSitemapXml(content, new Date(), 48);
    totalNewsEntries += result.entryCount;

    if (!result.valid) {
      errorCount += result.errors.length;
      for (const err of result.errors) {
        console.error(`[SEO Gate] ✗ ${err}`);
      }
    } else {
      console.log(`[SEO Gate] ✓ ${result.entryCount} news entries in ${file} valid (≤ 48 hours).`);
    }
  }

  if (checkedSitemaps === 0) {
    console.log(`[SEO Gate] ✓ No News Sitemaps found in dist — skipping validation (valid for FND.1).`);
  } else if (errorCount === 0) {
    console.log(`[SEO Gate] ✓ All ${checkedSitemaps} News Sitemaps (${totalNewsEntries} entries) passed validation.`);
  } else {
    console.error(`[SEO Gate] ✗ News Sitemap check failed with ${errorCount} error(s).`);
    process.exit(1);
  }
}

run();
