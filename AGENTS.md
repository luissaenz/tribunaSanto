# Instrucciones para Agentes — Tribuna Santo

Este repositorio contiene la base de código del medio deportivo autónomo **Tribuna Santo**.
Todo agente que interactúe con este proyecto debe ceñirse a las siguientes directivas normativas.

## Proceso de Desarrollo y Precedencia

Las únicas habilidades de proceso permitidas son:
1. **Skill 1 — Investigación**
2. **Skill 2 — Plan tentativo**
3. **Skill 3 — Plan final e implementación**

Ante cualquier discrepancia técnica o conflicto de instrucciones, prevalece estrictamente:
1. El **OBJETIVO CERRADO** del macroarco o ciclo en ejecución.
2. Las **Skills 1–3** del proceso normativo.
3. Las **reglas del repositorio** (`AGENTS.md`, `package.json`, configuraciones versionadas).
4. La **política SEO machine-readable** (`seo/policy.json`).
5. Las **skills SEO externas** (`AgriciDaniel/claude-seo`) únicamente como soporte auxiliar de consulta técnica.

## Preocupaciones Transversales SEO y GEO

Las reglas SEO no son opcionales ni dependen de la memoria del agente.
- **Fuente de verdad normativa**: `seo/policy.json`.
- **Skill local del proyecto**: `.claude/skills/tribuna-seo/SKILL.md`.
- **Gates automatizados**: Cualquier cambio en HTML, layouts, metadata o rutas debe validar contra `npm run gate` y `npm run seo:gate`.
- **Invariantes críticas**:
  - Frontend static-first (Astro sin adapter SSR en FND.1).
  - Canonical absoluto y único.
  - Datos estructurados `NewsArticle` completos (autor Person, publisher Organization).
  - News Sitemap limitado a artículos publicados en las últimas 48 horas.
  - Enlaces internos íntegros y comprobables en build estático.
  - Jerarquía semántica estricta (un solo H1 por página, H2/H3 anidados).

## Infraestructura Local

- **Gestor de paquetes**: Únicamente `npm` con lockfile versionado.
- **Base de datos**: PostgreSQL 17 dedicado vía `docker-compose.yml` en `127.0.0.1:5435`.
- **Volumen persistente**: `tribuna_santo_pg17_data`.
- **Credenciales**: Jamás commitear `.env` ni claves en el repositorio. Usar `.env.example` como referencia.

## Documentación de Referencia

- Referencias estructurales editoriales y funcionales: consultar `docs/references.md`.
- Provenance de tooling auxiliar upstream: consultar `docs/seo/upstream.md`.
