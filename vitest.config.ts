import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Un único build estático compartido por las suites que inspeccionan dist/.
    globalSetup: ['./tests/setup/build-dist.ts']
  }
});
