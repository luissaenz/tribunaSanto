# Arquitectura y Tooling SEO — Tribuna Santo

Este documento describe la fundación del subsistema SEO y GEO (Generative Engine Optimization) para el medio digital **Tribuna Santo**.

## Principios Fundacionales

1. **Machine-Readable por Diseño**: La política del medio no vive en texto informal disperso; se centraliza en `seo/policy.json`.
2. **Gates Automáticos en CI**: Toda regla crítica se traduce a un validador en código que bloquea el build si se vulnera una invariante.
3. **Desacoplamiento de Runtime**: Las herramientas de análisis y auditoría externa (como `claude-seo`) residen fuera del runtime y de las dependencias de producción.
4. **Static-First**: El medio prioriza el HTML entregado desde el servidor sobre la hidratación en cliente para garantizar máxima indexabilidad y mínima latencia.

## Estructura de Componentes

- **`seo/policy.json`**: Fuente normativa machine-readable versión 1.
- **`.claude/skills/tribuna-seo/SKILL.md`**: Contexto e instrucciones de dominio para agentes de desarrollo.
- **`scripts/seo/`**: Validadores ejecutables de contratos:
  - `check-policy.ts`: Valida integridad del archivo de políticas.
  - `check-jsonld.ts`: Inspecciona schemas `NewsArticle` en HTML generado.
  - `check-sitemaps.ts`: Verifica vigencia temporal (<48h) y estructura de News Sitemaps.
  - `check-links.ts`: Detecta enlaces internos rotos en `dist/`.
- **`docs/seo/upstream.md`**: Registro de procedencia del tooling de soporte.
