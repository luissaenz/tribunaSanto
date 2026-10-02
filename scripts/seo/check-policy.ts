import path from 'node:path';
import { loadAndValidatePolicy } from './lib/contracts.js';

function run() {
  const policyPath = path.resolve(process.cwd(), 'seo', 'policy.json');
  console.log(`[SEO Gate] Validating policy file: ${policyPath}`);

  try {
    const policy = loadAndValidatePolicy(policyPath);
    console.log(`[SEO Gate] ✓ Policy v${policy.version} is valid and compliant.`);
    console.log(`[SEO Gate] Invariants: singleTenant=${policy.singleTenant}, rendering=${policy.rendering}, newsSitemap.maxAgeHours=${policy.newsSitemap.maxAgeHours}h`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[SEO Gate] ✗ Policy validation failed: ${message}`);
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error(JSON.stringify((error as { errors: unknown }).errors, null, 2));
    }
    process.exit(1);
  }
}

run();
