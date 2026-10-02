# Registro de Procedencia: claude-seo (Upstream)

## Información de la Herramienta

- **Repositorio Upstream**: [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)
- **Versión Fijada**: `v2.4.1`
- **Commit SHA**: `ff87fcee0734845d3f59128c8c905799ee2298da`
- **Licencia**: MIT (Copyright (c) 2026 agricidaniel)

## Rol y Frontera en Tribuna Santo

1. **Uso Exclusivo como Tooling de Desarrollo**: `claude-seo` está instalado a nivel global del entorno del agente/IDE (`~/.claude/skills/seo/`) para auditorías, análisis puntual de Core Web Vitals, generación asistida de briefs y verificación de señales GEO.
2. **Cero Dependencia de Runtime**: Ningún script, subagente o biblioteca de `claude-seo` forma parte del `package.json`, del bundle de Astro ni del código productivo de Tribuna Santo.
3. **Subordinación Metodológica**: Las directivas de `claude-seo` están subordinadas a las reglas del repositorio y al proceso normativo Skill 1 → Skill 2 → Skill 3.
4. **Independencia Normativa**: La fuente normativa interna del proyecto es `seo/policy.json` y sus gates ejecutables en TypeScript.

## Disponibilidad verificada

- **WEB.2 (entorno remoto de ejecución)**: `~/.claude/skills/seo/` no existe; `claude-seo` no estaba instalado. Las decisiones SEO de WEB.2 se apoyaron exclusivamente en `.claude/skills/tribuna-seo`, `seo/policy.json` y `docs/seo/`. La instalación global descripta arriba debe verificarse en cada entorno; no puede asumirse.
