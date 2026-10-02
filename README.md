# Tribuna Santo

Medio deportivo digital autónomo dedicado a la cobertura de San Martín de Tucumán.

## Fundación técnica (FND.1)

- **Frontend**: Astro (modo estático puro, sin adapter SSR).
- **Lenguaje**: TypeScript en modo estricto.
- **Package Manager**: npm.
- **Base de datos local**: PostgreSQL 17 dedicado vía Docker Compose en `127.0.0.1:5435`.
- **SEO**: Reglas machine-readable versionadas en `seo/policy.json` y gates automatizados de verificación.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo local de Astro.
- `npm run build`: Genera el build estático en `dist/`.
- `npm run preview`: Previsualiza el build estático.
- `npm run typecheck`: Valida tipos TypeScript y plantillas Astro.
- `npm run lint`: Ejecuta el linter ESLint.
