import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, it, expect } from 'vitest';
import { validateInternalLinksInDirectory } from '../../scripts/seo/lib/contracts.js';

describe('Internal links crawlability invariants', () => {
  it('rejects broken internal links', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tribuna-seo-links-'));

    try {
      // Create a valid page
      fs.writeFileSync(
        path.join(tempDir, 'index.html'),
        `<!doctype html>
<html>
  <body>
    <a href="/about">Acerca de nosotros</a>
    <a href="/broken-target">Enlace roto</a>
    <a href="https://example.com/external">Enlace externo</a>
    <a href="mailto:contacto@tribunasanto.local">Mail</a>
  </body>
</html>`
      );

      // Create target for /about
      const aboutDir = path.join(tempDir, 'about');
      fs.mkdirSync(aboutDir, { recursive: true });
      fs.writeFileSync(path.join(aboutDir, 'index.html'), '<html><body>About</body></html>');

      const results = validateInternalLinksInDirectory(tempDir);

      const aboutLink = results.find((r) => r.href === '/about');
      expect(aboutLink).toBeDefined();
      expect(aboutLink?.exists).toBe(true);

      const brokenLink = results.find((r) => r.href === '/broken-target');
      expect(brokenLink).toBeDefined();
      expect(brokenLink?.exists).toBe(false);

      const brokenCount = results.filter((r) => !r.exists).length;
      expect(brokenCount).toBe(1);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('accepts mini site with complete valid internal links', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tribuna-seo-valid-'));

    try {
      fs.writeFileSync(
        path.join(tempDir, 'index.html'),
        `<!doctype html>
<html>
  <body>
    <a href="/contacto">Contacto</a>
  </body>
</html>`
      );

      fs.writeFileSync(
        path.join(tempDir, 'contacto.html'),
        `<!doctype html>
<html>
  <body>
    <a href="/">Volver</a>
  </body>
</html>`
      );

      const results = validateInternalLinksInDirectory(tempDir);
      const brokenCount = results.filter((r) => !r.exists).length;
      expect(brokenCount).toBe(0);
      expect(results.length).toBe(2);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
