import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Un único build estático compartido por las suites que inspeccionan dist/.
    globalSetup: ['./tests/setup/build-dist.ts'],
    // Las pruebas de navegador (Playwright) viven en tests/e2e y corren con `npm run test:e2e`.
    exclude: [...configDefaults.exclude, 'tests/e2e/**']
  }
});
