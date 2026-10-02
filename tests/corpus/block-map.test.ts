import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { CORPUS_BLOCK_IDS } from '../../scripts/corpus/lib/analyze.js';
import { blockEvidence, omittedCorpusBlocks, ownExtensions } from '../../scripts/corpus/block-map.js';
import { blockCatalog } from '../../src/presentation/blocks.js';
import { readInventory, repoRoot, productSources } from '../support/repo.js';

const inventory = readInventory();

describe('corpus → product block map', () => {
  it('maps every block detected in the corpus to a component or a documented omission', () => {
    const mapped = new Set<string>(Object.values(blockEvidence).flat());
    const detected = CORPUS_BLOCK_IDS.filter((id) => (inventory.blocks[id]?.pages ?? 0) > 0);
    for (const id of detected) {
      expect(mapped.has(id) || id in omittedCorpusBlocks, `corpus block ${id}`).toBe(true);
    }
  });

  it('only cites evidence that exists in the inventory, or declares an own extension', () => {
    for (const block of blockCatalog) {
      const evidence = blockEvidence[block.id];
      if (evidence.length === 0) expect(ownExtensions, block.id).toContain(block.id);
      for (const id of evidence) expect(inventory.blocks[id]?.pages ?? 0, `${block.id} → ${id}`).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(repoRoot, 'src/components', block.component)), block.component).toBe(true);
    }
  });

  it('never lets the product import corpus tooling or evidence', () => {
    const importsTooling = /(from\s+|import\s*\(\s*)['"][^'"]*(scripts\/|corpus-inventory|block-map)[^'"]*['"]/;
    for (const file of productSources()) {
      expect(importsTooling.test(file.content), file.path).toBe(false);
    }
  });
});
