# Tribuna Santo

Medio deportivo digital autónomo dedicado a la cobertura de San Martín de Tucumán.

## Fundación técnica (FND.1)

- **Frontend**: Astro (modo estático puro, sin adapter SSR).
- **Lenguaje**: TypeScript en modo estricto.
- **Package Manager**: npm.
- **Base de datos local**: PostgreSQL 17 dedicado vía Docker Compose en `127.0.0.1:5435`.
- **SEO**: Reglas machine-readable versionadas en `seo/policy.json` y gates automatizados de verificación.

## Web editorial (WEB.2)

- Capa de presentación en `src/presentation/`, separada de `PublicationToWebPayload` (que no cambia).
- Componentes por bloque en `src/components/`; mapa familia → bloques → componentes en `src/presentation/blocks.ts`.
- Web demo estática: portada en `/` y el resto bajo `/demo/` (provisional, `noindex, nofollow`; una única entrada de cliente: Alpine).
- `/web` es un corpus de referencia **local y no versionado**; sólo `npm run corpus:inventory` lo requiere. Ver `docs/web2/README.md`.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo local de Astro.
- `npm run build`: Genera el build estático en `dist/`.
- `npm run preview`: Previsualiza el build estático.
- `npm run typecheck`: Valida tipos TypeScript y plantillas Astro.
- `npm run lint`: Ejecuta el linter ESLint.
- `npm run test`: Ejecuta las pruebas (un único build estático compartido).
- `npm run gate`: Certificación completa (lint, typecheck, test, build, SEO).
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
