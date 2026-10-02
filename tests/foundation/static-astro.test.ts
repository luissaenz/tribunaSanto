import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Astro foundation invariants', () => {
  it('keeps Astro static without adapter', async () => {
    const configPath = path.resolve(process.cwd(), 'astro.config.mjs');
    expect(fs.existsSync(configPath)).toBe(true);

    const configContent = fs.readFileSync(configPath, 'utf-8');

    // Invariant: static-first
    expect(configContent).toMatch(/output:\s*['"]static['"]/);

    // Invariant: no adapter
    expect(configContent).not.toMatch(/adapter:/);
    expect(configContent).not.toMatch(/@astrojs\/cloudflare/);
    expect(configContent).not.toMatch(/@astrojs\/node/);
    expect(configContent).not.toMatch(/@astrojs\/vercel/);

    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    expect(allDeps['@astrojs/cloudflare']).toBeUndefined();
    expect(allDeps['@astrojs/node']).toBeUndefined();
  });
});
