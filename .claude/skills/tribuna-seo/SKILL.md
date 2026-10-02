---
name: tribuna-seo
description: Directivas y políticas SEO del proyecto Tribuna Santo. Rige cualquier cambio sobre URLs, HTML público, taxonomía, metadatos, datos estructurados o enlazado interno.
---

# Tribuna Santo — Skill SEO de Proyecto

Esta skill define las políticas y reglas de dominio SEO/GEO obligatorias para el proyecto **Tribuna Santo**.

## Precedencia Normativa Obligatoria

En cualquier contradicción durante el desarrollo, rige estrictamente la siguiente jerarquía:

1. **Objetivo cerrado del macroarco / ciclo en ejecución**
2. **Skills normativas de proceso (Skill 1 → Skill 2 → Skill 3)**
3. **Reglas del repositorio (`AGENTS.md`, `.devin/rules/`, etc.)**
4. **Política SEO local (`seo/policy.json`)**
5. **Skills SEO externas (`AgriciDaniel/claude-seo`) como fuente auxiliar de consulta**

Esta skill de dominio **NO** crea fases adicionales del proceso y **NO** sustituye las Skills 1–3.

## Obligación de Consulta

Todo agente de desarrollo o desarrollador que modifique:
- URLs y enrutamiento;
- HTML público o componentes Astro;
- Contenido editorial y taxonomía;
- Entidades del grafo deportivo (Club, Competición, Partido, Plantel);
- Categorización y enlazado interno;
- Rendimiento y Core Web Vitals;
- Optimización de imágenes;
- Publicación e indexación (sitemaps, canonicals, robots);
- Datos estructurados (Schema.org JSON-LD);
- Redacción automatizada y titulares;
- Optimización para motores de respuesta y AI Search (GEO);

debe consultar `seo/policy.json` y verificar que los cambios satisfagan los contratos ejecutables correspondientes.

## Principios Centrales de la Política (`seo/policy.json`)

- **Single-Tenant & Static-First**: Generación estática pura en Astro; sin hidratación innecesaria en cliente.
- **NewsArticle**: Datos estructurados obligatorios con `headline`, `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization) e `image`.
- **News Sitemap**: Antigüedad estricta máxima de 48 horas respecto del instante de validación.
- **Canonical**: URLs canónicas absolutas y únicas por cada página indexable.
- **Metadatos & Social**: Meta descripción, OpenGraph y Twitter Card obligatorios en páginas publicables.
- **Imágenes**: Dimensiones explícitas (`width`/`height`) y texto alternativo descriptivo en contenido informativo. Formatos preferidos: AVIF y WebP.
- **Headings**: Jerarquía semántica estricta con único elemento `H1` por página.
- **Interlinking**: Preparado para relaciones bidireccionales `Noticia ↔ Club ↔ Competición ↔ Categoría` y breadcrumbs `BreadcrumbList`.
- **AI Search (GEO)**: Diferenciación clara entre agentes de búsqueda/recuperación y bots de scraping para entrenamiento masivo.
