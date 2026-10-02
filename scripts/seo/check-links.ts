import path from 'node:path';
import fs from 'node:fs';
import { validateInternalLinksInDirectory } from './lib/contracts.js';

function run() {
  const distDir = path.resolve(process.cwd(), 'dist');
  console.log(`[SEO Gate] Checking internal links in dist: ${distDir}`);

  if (!fs.existsSync(distDir)) {
    console.error(`[SEO Gate] ✗ Dist directory does not exist. Run 'npm run build' first.`);
    process.exit(1);
  }

  const results = validateInternalLinksInDirectory(distDir);
  const brokenLinks = results.filter((r) => !r.exists);

  if (brokenLinks.length > 0) {
    console.error(`[SEO Gate] ✗ Found ${brokenLinks.length} broken internal link(s):`);
    for (const b of brokenLinks) {
      console.error(`  - File: ${b.file}`);
      console.error(`    Target: ${b.href} (resolved to: ${b.resolvedPath})`);
    }
    process.exit(1);
  }

  console.log(`[SEO Gate] ✓ Checked ${results.length} internal links. 0 broken links found.`);
}

run();
