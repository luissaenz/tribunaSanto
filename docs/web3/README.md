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

## Implementación

### Stack

- Astro 7 en modo estático (sin adapter SSR). Tailwind CSS v4 vía `@tailwindcss/vite` (`src/styles/global.css`: tokens `@theme`, `.post-content`, `[x-cloak]`, foco visible).
- Fuentes con la API `fonts` de Astro (`fontProviders.local()` sobre los woff2 de `@fontsource*`): `--font-body` Inter, `--font-heading` PT Serif. Un guard verifica que cada fuente emitida sea byte a byte la del paquete.
- Íconos de `bootstrap-icons` leídos en build y renderizados como nodos SVG (`ui/Icon.astro`), sin HTML crudo.
- Cliente: **una sola entrada funcional**, `src/scripts/alpine.ts`, que registra con `Alpine.data` los componentes `siteNav`, `topbarDate`, `carousel`, `backToTop`, `copyLink`, `contactForm`, `faq`, `careers`, `applyForm` y `newsletter`. La lógica pura vive en `src/scripts/interactions/*` y tiene pruebas unitarias. El markup sólo nombra componentes (`x-data="carousel(3)"`), nunca lógica inline.
- Catálogo de bloques (`src/presentation/blocks.ts`): cada componente marca su raíz con `data-block`, y las partes medidas con `data-slot`/`data-part`. La evidencia de corpus por bloque está en `scripts/corpus/block-map.ts`; no queda ningún bloque del corpus omitido.

### Golden master y contrato de referencia

- El corpus (`881745c:web/`) **no se versiona ni se usa en runtime**: ni el build, ni `dist/`, ni los tests de CI lo leen. Sólo lo usan dos herramientas locales.
- `docs/web3/reference-contract.json` es el contrato observable versionado. Para cada página muestra × viewport (375, 640, 768, 1024, 1280 y 1440) registra presencia, visibilidad, `display`/`position`/`top`/`z-index`, geometría relativa al viewport, tipografía, colores, fondos, bordes, radio, opacidad, columnas de grilla, gaps y orden DOM/visual. También registra las constantes de interacción (carrusel, nav, búsqueda, volver arriba, copiar enlace, FAQ, empleos, contacto, sidebar sticky y truncados). Son sólo mediciones: ni texto, ni HTML, ni CSS del template.
- Las muestras y los selectores están en `scripts/reference/spec.ts`. En Tribuna Santo una parte se ubica como `[data-block][data-slot] [data-part]`.

Cómo regenerarlo (requiere una copia local del corpus fuera del árbol):

```bash
git archive 881745c web | tar -x -C <dir-temporal>
WEB3_CORPUS_DIR=<dir-temporal>/web npm run reference:contract            # regenera
WEB3_CORPUS_DIR=<dir-temporal>/web npm run reference:contract -- --check # compara sin escribir
WEB3_CORPUS_DIR=<dir-temporal>/web npm run reference:shots               # capturas lado a lado en tmp/web3/shots/ (ignorado)
```

El contrato sólo se corrige si el extractor midió objetivamente mal, y siempre con evidencia en el commit. Ejemplo (D11): `#apply .bg-black` medía el H3 "Apply for a Role" en lugar de la caja de pasos; se corrigió a `.bg-black.p-6` y sólo cambiaron las 6 entradas `hiring-steps`.

### Pruebas

- `npm run test` (Vitest): guards de producto y de corpus, contrato (esquema y comparador, mutantes M11–M15), presentación, fixtures, render estático (**92 páginas exactas**, `EXPECTED_PAGE_COUNT`) y mutantes M1–M10, M16 y M17.
- `npm run test:e2e` (Playwright 1.56.1, Chromium, `es-AR`, zona `America/Argentina/Buenos_Aires`) corre sobre `dist/` con `astro preview --ignore-lock`. En CI: `npx playwright install --with-deps chromium`.
  - `tests/e2e/fidelity.spec.ts`: las 15 muestras × 6 viewports con `comparePage`, más las constantes de interacción re-medidas sobre Tribuna Santo con `compareInteractions`. Los truncados se verifican como máximos.
  - `tests/e2e/{chrome,home,listings,article,author,institutional}.spec.ts`: comportamiento (teclado, Escape, ARIA, swipe, formularios demo, filtros, paginación).
  - `tests/e2e/visual.spec.ts`: regresión visual **sólo de Tribuna Santo**, con baselines en `tests/e2e/__screenshots__/`. Cubre 9 familias × 375/768/1280 a página completa, más 8 estados: menú, búsqueda, slide 2, flechas en hover, FAQ, empleos filtrado, contacto enviado y volver arriba. Es determinista: reloj pausado, animaciones deshabilitadas, imágenes lazy forzadas, fecha y emoji enmascarados. Para actualizar baselines tras un cambio visual intencional: `npx playwright test tests/e2e/visual.spec.ts --update-snapshots`.
- Tolerancias (`tests/support/fidelity.ts` y `playwright.config.ts`):

  | Medición | Tolerancia |
  | --- | --- |
  | px (posición, tamaños, tipografía, bordes, gaps) | ±1 |
  | ratios (x/w relativos al viewport, aspecto) | ±0.015 |
  | opacidad | ±0.01 |
  | intervalo de autoplay | ±150 ms |
  | resto de tiempos | exacto |
  | capturas | `maxDiffPixelRatio` 0.01 |

- `npm run gate` = lint, typecheck, test, build, test:e2e y seo:gate.

### Comportamiento demo

- **Búsqueda**: abre la barra en flujo, enfoca el input, se cierra con el botón o con Escape, y navega a `/demo/ultimas/?q=…` (desviación demo temporal; no filtra).
- **Newsletter**: no-op (`@submit.prevent`). No envía request, no persiste y no muestra mensaje de éxito.
- **Contacto y postulación**: estado de envío local y botón para reiniciar. No envían nada a la red.
- **JavaScript**: no rige ninguna regla de "cero JS". El invariante es una única entrada funcional propia (Alpine), sin islands ni otros frameworks.
- **Indexación**: las 92 páginas son `noindex, nofollow`, sin canonical, sitemap, OpenGraph ni NewsArticle.

## Deuda explícita

- Página de resultados de búsqueda (sin golden master de `/search`).
- Página 404 (sin golden master).
- Envío real de newsletter y formularios (sin backend).
