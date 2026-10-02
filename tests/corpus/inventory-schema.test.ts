import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { CorpusInventorySchema, corpusDigest } from '../../scripts/corpus/lib/schema.js';
import { buildInventory, checkInventory, serializeInventory } from '../../scripts/corpus/lib/build.js';

// El inventario versionado es la única evidencia del corpus que leen los tests:
// nada aquí depende de la copia local de /web.
const recordedJson = fs.readFileSync(path.resolve(process.cwd(), 'docs/web2/corpus-inventory.json'), 'utf-8');

function syntheticCorpus(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tribuna-corpus-'));
  fs.mkdirSync(path.join(dir, 'img'));
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    '<html><body><header><div class="py-2"><div>a</div><div>b</div></div></header><main><h1>Portada sintética</h1></main></body></html>'
  );
  fs.writeFileSync(path.join(dir, 'x.css'), '@media (width>=40rem){a{b:c}}');
  fs.writeFileSync(path.join(dir, 'img', 'a.png'), Buffer.from([1, 2, 3]));
  return dir;
}

describe('versioned corpus inventory', () => {
  const inventory = CorpusInventorySchema.parse(JSON.parse(recordedJson));

  it('matches the strict schema (no free text can be stored)', () => {
    expect(inventory.schemaVersion).toBe(1);
    expect(inventory.corpus.html).toBe(183);
    expect(inventory.pages).toHaveLength(183);
  });

  it('records a SHA-256 for every HTML page and asset', () => {
    expect(inventory.pages.every((p) => /^[0-9a-f]{64}$/.test(p.sha256))).toBe(true);
    expect(inventory.assets.every((a) => /^[0-9a-f]{64}$/.test(a.sha256))).toBe(true);
    expect(inventory.pages.length + inventory.assets.length).toBe(inventory.corpus.files);
  });

  it('has a global digest consistent with the per-file hashes', () => {
    expect(corpusDigest([...inventory.pages, ...inventory.assets])).toBe(inventory.corpus.digest);
  });

  it('classifies the corpus into the seven accepted families', () => {
    const counts = Object.fromEntries(Object.entries(inventory.families).map(([f, v]) => [f, v.pages]));
    expect(counts).toEqual({ home: 1, category: 8, article: 40, tag: 116, author: 7, listing: 5, institutional: 6 });
  });

  it('is serialized deterministically', () => {
    expect(serializeInventory(inventory)).toBe(recordedJson);
  });
});

describe('inventory build and check (synthetic corpus)', () => {
  it('is deterministic and detects a different or missing corpus', () => {
    const dir = syntheticCorpus();
    try {
      const json = serializeInventory(buildInventory(dir));
      expect(serializeInventory(buildInventory(dir))).toBe(json);
      expect(json).not.toContain('Portada sintética');
      expect(checkInventory(dir, json)).toEqual({ status: 'ok' });

      fs.writeFileSync(path.join(dir, 'img', 'a.png'), Buffer.from([9]));
      expect(checkInventory(dir, json).status).toBe('corpus-mismatch');

      expect(checkInventory(path.join(dir, 'nope'), json)).toEqual({ status: 'missing-corpus' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('detects a stale inventory for an unchanged corpus', () => {
    const dir = syntheticCorpus();
    try {
      const inventory = buildInventory(dir);
      const stale = serializeInventory({ ...inventory, cardShapes: [{ shape: 'article', pages: 9, families: ['home'] }] });
      expect(checkInventory(dir, stale)).toEqual({ status: 'stale-inventory' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
