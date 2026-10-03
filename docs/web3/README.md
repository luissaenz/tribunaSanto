# WEB.3 — Réplica integral de la referencia

Etiquetas: **[HECHO]** verificado en repositorio o corpus; **[DECISIÓN]** aprobada por el usuario en el ciclo.

## Objetivo normativo

- [DECISIÓN] La web histórica de referencia (corpus `881745c:web/`, no versionado) es el **golden master observable** de WEB.3.
- [DECISIÓN] Principio: *si existe en la referencia y es observable por el usuario, debe existir en Tribuna Santo, salvo sustitución explícitamente autorizada.*
- [DECISIÓN] Criterio de aceptación: fidelidad observable (estructura, geometría, responsive, tipografía, paleta, decoración, iconografía, interacción, timings y estados). No se aceptan "parecido", "inspirado" ni "equivalente".

## Decisiones

| Id | Decisión |
| --- | --- |
| D1 | Réplica observable + implementación propia. Se revoca la regla WEB.2 "geometría sí, ornamentación no". Sigue prohibido copiar literalmente código propietario del template (HTML, CSS, JS) o sus assets. |
| D2 | Stack: Astro (static) + Tailwind CSS v4 + Alpine.js 3.15.12 + Bootstrap Icons + Inter + PT Serif. Todo desde paquetes y licencias propias, nunca desde los bytes del corpus. |
| D3 | Fidelidad total, pero no fidelidad a bugs: se corrigen defectos invisibles (`lang`, un solo `<main>`, un único H1, jerarquía, ARIA, Escape, focus-visible, dimensiones de imagen, lazy load, share con URL, placeholder legible, `[x-cloak]`, puestos de empleo SSR, enlaces no rotos) sin rediseñar la UI. |
| D4 | Se reproducen todas las familias con evidencia directa del corpus. No se crean página de resultados de búsqueda ni 404 (sin golden master): **deuda explícita**. El componente de búsqueda del header sí se reproduce. |
| D5 | Bloques sin backend (clima, anuncios, newsletter, redes, autores, cifras, premios, puestos) se conservan con datos DEMO propios, nunca presentados como reales. |
| D6 | Locale `es-AR`. La fecha del topbar es dinámica en el cliente. |

## Ajustes finales aprobados (posteriores a Skill 2)

1. **Búsqueda demo** — el formulario del header navega a `/demo/ultimas/?q=<query>`. **DESVIACIÓN DEMO TEMPORAL POR FALTA DE GOLDEN MASTER DE `/search`.** No filtra resultados; no es ruta productiva.
2. **Newsletter no-op DEMO** — `@submit.prevent`, sin backend, sin request, sin persistencia y sin mensaje falso de éxito. Evita el POST roto de la referencia en hosting estático.
3. **24 temas** — la distribución concreta es detalle técnico de fixtures: 24 temas, uno con ≥ 9 artículos (página 2), uno con 1 artículo, el resto entre 2 y 6; exactamente 3 temas por artículo.
4. **JavaScript** — invariante: **una única entrada funcional propia de cliente** (la inicialización Alpine `src/scripts/alpine.ts`). El bundler puede generar uno o más chunks físicos; eso no es normativo. Sin islands, sin React/Vue/Svelte, sin scripts inesperados, sin lógica `x-data="{…}"` inline.

## Corpus de referencia (inventario definitivo)

- [HECHO] 183 HTML.

  | Familia | HTML |
  | --- | ---: |
  | home | 1 |
  | category p1 | 6 |
  | category p2 | 2 |
  | article | 40 |
  | tag p1 | 115 |
  | tag p2 | 1 |
  | author p1 | 4 |
  | author p2 | 3 |
  | listing | 5 |
  | institutional landing (about, contact, careers) | 3 |
  | institutional legal (advertise, privacy, terms) | 3 |
  | **Total** | **183** |

- [HECHO] El conteo 182 de la investigación inicial omitía que `tags/*.html` tiene 115 páginas de primer nivel y `tags/technology/2.html` es la página 2: 116 páginas tag.

## Resultado estático: 92 páginas demo

| Familia | Ruta | Páginas |
| --- | --- | ---: |
| home | `/` | 1 |
| article | `/demo/<demoId>/` | 40 |
| section | `/demo/seccion/<slug>/` | 6 |
| section p2 | `/demo/seccion/<slug>/2/` | 2 |
| topic | `/demo/tema/<slug>/` | 24 |
| topic p2 | `/demo/tema/<slug>/2/` | 1 |
| author | `/demo/autor/<slug>/` | 4 |
| author p2 | `/demo/autor/<slug>/2/` | 3 |
| listing | `/demo/ultimas/` … `/demo/ultimas/5/` | 5 |
| about | `/demo/acerca/` | 1 |
| contact | `/demo/contacto/` | 1 |
| careers | `/demo/empleos/` | 1 |
| legal | `/demo/publicidad/`, `/demo/privacidad/`, `/demo/terminos/` | 3 |
| **Total** | | **92** |

Todo sigue `noindex, nofollow`, sin canonical, sitemap ni NewsArticle productivos.

## Procedencia de dependencias

| Paquete | Licencia | Uso |
| --- | --- | --- |
| `tailwindcss`, `@tailwindcss/vite` | MIT | utilidades CSS |
| `alpinejs` 3.15.12 | MIT | runtime interactivo |
| `bootstrap-icons` 1.13.1 | MIT | íconos SVG leídos en build |
| `@fontsource-variable/inter` | OFL-1.1 | Inter variable (latin, normal e itálica, 400–700) |
| `@fontsource/pt-serif` | OFL-1.1 | PT Serif 400/700 normal e itálica (latin) |
| `@playwright/test` 1.56.1 | Apache-2.0 | e2e, fidelidad y regresión visual |

## Deuda explícita

- Página de resultados de búsqueda (sin golden master de `/search`).
- Página 404 (sin golden master).
- Envío real de newsletter y formularios (sin backend).
