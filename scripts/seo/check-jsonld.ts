import fs from 'node:fs';
import path from 'node:path';
import { parse as parseHtml } from 'node-html-parser';
import { validateNewsArticleJsonLd } from './lib/contracts.js';

function run() {
  const distDir = path.resolve(process.cwd(), 'dist');
  console.log(`[SEO Gate] Checking JSON-LD in dist: ${distDir}`);

  if (!fs.existsSync(distDir)) {
    console.error(`[SEO Gate] ✗ Dist directory does not exist. Run 'npm run build' first.`);
    process.exit(1);
  }

  function getHtmlFiles(dir: string): string[] {
    let files: string[] = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getHtmlFiles(fullPath));
      } else if (item.isFile() && item.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const htmlFiles = getHtmlFiles(distDir);
  let checkedCount = 0;
  let errorCount = 0;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const root = parseHtml(content);
    const scripts = root.querySelectorAll('script[type="application/ld+json"]');

    for (const s of scripts) {
      let data: unknown;
      try {
        data = JSON.parse(s.textContent);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(`[SEO Gate] ✗ Syntax error parsing JSON-LD in ${file}: ${msg}`);
        errorCount++;
        continue;
      }

      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item && typeof item === 'object' && '@type' in item && (item as Record<string, unknown>)['@type'] === 'NewsArticle') {
          checkedCount++;
          const result = validateNewsArticleJsonLd(item);
          if (!result.success) {
            console.error(`[SEO Gate] ✗ Invalid NewsArticle JSON-LD in ${file}:`);
            for (const issue of result.error.issues) {
              console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            }
            errorCount++;
          } else {
            const headline = (item as Record<string, unknown>).headline;
            console.log(`[SEO Gate] ✓ Valid NewsArticle found in ${file}: "${headline}"`);
          }
        }
      }
    }
  }

  if (checkedCount === 0) {
    console.log(`[SEO Gate] ✓ No NewsArticle schemas found in dist (0 inspected) — skipping validation (valid for FND.1).`);
  } else if (errorCount === 0) {
    console.log(`[SEO Gate] ✓ All ${checkedCount} NewsArticle schemas passed validation.`);
  } else {
    console.error(`[SEO Gate] ✗ JSON-LD check failed with ${errorCount} error(s).`);
    process.exit(1);
  }
}

run();
