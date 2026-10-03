# Tribuna Santo

Medio deportivo digital autónomo dedicado a la cobertura de San Martín de Tucumán.

## Fundación técnica (FND.1)

- **Frontend**: Astro (modo estático puro, sin adapter SSR).
- **Lenguaje**: TypeScript en modo estricto.
- **Package Manager**: npm.
- **Base de datos local**: PostgreSQL 17 dedicado vía Docker Compose en `127.0.0.1:5435`.
- **SEO**: Reglas machine-readable versionadas en `seo/policy.json` y gates automatizados de verificación.

## Web editorial (WEB.2 → WEB.3)

- WEB.3 replica de forma observable el golden master: Astro estático, Tailwind CSS v4, Alpine.js, Bootstrap Icons, Inter y PT Serif. La implementación es propia, sin código ni assets del template. Ver `docs/web3/README.md`.
- Capa de presentación en `src/presentation/`, separada de `PublicationToWebPayload` (que no cambia).
- Componentes por bloque en `src/components/`; mapa familia → bloques → componentes en `src/presentation/blocks.ts`.
- Web demo estática de **92 páginas**: portada en `/` y el resto bajo `/demo/`. Es provisional y `noindex, nofollow`, sin canonical ni sitemap.
- Cliente: una única entrada funcional (Alpine, `src/scripts/alpine.ts`). La búsqueda es demo (`/demo/ultimas/?q=`) y la newsletter es no-op.
- Deuda: página de resultados de búsqueda y 404 (sin golden master).
- `/web` es un corpus de referencia **local y no versionado**. No se usa en runtime ni en CI. Lo requieren `npm run corpus:inventory` (lee `/web`) y `npm run reference:contract` / `reference:shots` (leen `WEB3_CORPUS_DIR`). Ver `docs/web2/README.md` y `docs/web3/README.md`.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo local de Astro.
- `npm run build`: Genera el build estático en `dist/`.
- `npm run preview`: Previsualiza el build estático.
- `npm run typecheck`: Valida tipos TypeScript y plantillas Astro.
- `npm run lint`: Ejecuta el linter ESLint.
- `npm run test`: Ejecuta las pruebas Vitest (un único build estático compartido).
- `npm run test:e2e`: Pruebas Playwright sobre `dist/`: fidelidad al contrato, comportamiento y regresión visual (requiere build previo).
- `npm run gate`: Certificación completa (lint, typecheck, test, build, test:e2e, SEO).
- `npm run reference:contract`: Regenera `docs/web3/reference-contract.json` desde una copia local del corpus (`WEB3_CORPUS_DIR`; `-- --check` sólo compara).
- `npm run reference:shots`: Capturas lado a lado referencia vs Tribuna Santo en `tmp/web3/shots/` (no versionadas).
- `npm run corpus:inventory`: Regenera el inventario estructural del corpus local `/web` (`-- --check` verifica digest e inventario).
- `npm run corpus:outline -- <page> [--depth N] [--selector S]`: Esqueleto DOM sin texto de una página del corpus local.
- `npm run db:up`: Inicia el contenedor PostgreSQL 17 dedicado en segundo plano.
- `npm run db:down`: Detiene el contenedor PostgreSQL 17 preservando el volumen de datos.
- `npm run db:check`: Verifica el estado de salud y conectividad de PostgreSQL.

## Configuración de Base de Datos Local

Copiar `.env.example` a `.env` y configurar `POSTGRES_PASSWORD`:
```bash
cp .env.example .env
# Asignar un password seguro en .env
npm run db:up
npm run db:check
```
