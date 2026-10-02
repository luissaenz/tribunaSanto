# WEB.2 — Ingeniería inversa editorial

Este documento registra el ciclo WEB.2 siguiendo el proceso normativo:
**Skill 1 (investigación)** → **Skill 2 (plan tentativo)** → **Skill 3 (plan final e implementación)**.

Pipeline aplicado:

```
/web → inventario → clasificación → patrones → catálogo de bloques
     → componentes Astro propios → layouts propios → Tribuna Santo
```

| Artefacto | Ubicación |
| --- | --- |
| Analizador del corpus (clasificación + detección de bloques) | `scripts/corpus/lib/analyze.ts` |
| Generador del inventario | `scripts/corpus/inventory.ts` (`npm run corpus:inventory`, `-- --check`) |
| Inventario versionado (sin textos del corpus) | `docs/web2/corpus-inventory.json` |
| Mapa ejecutable página → bloques → componentes | `src/presentation/blocks.ts` |
| Capa de presentación | `src/presentation/` |
| Componentes | `src/components/{chrome,layout,story,home,rail,listing,article,institutional}/` |
| Pruebas de estructura e independencia | `tests/web/static-render.test.ts`, `tests/web/corpus-independence.test.ts` |

---

## 1. Skill 1 — Investigación

### 1.1 Corpus

El inventario se genera automáticamente y es determinista: no lleva timestamps, así que se puede regenerar sin producir diffs.

| Tipo | Archivos |
| --- | --- |
| HTML | 183 |
| CSS (bundle Tailwind) | 1 |
| JS (bundle Alpine.js) | 1 |
| Imágenes | 40 (39 jpg + 1 png) |
| Fuentes woff2 | 6 |
| README de la descarga | 1 |

### 1.2 Familias de páginas (dudas 1 y 21)

La clasificación usa primero el DOM y recurre a la ruta sólo como desempate (`classifyPage`):

| Familia | Páginas | Paginadas | Sin H1 único | Rasgo DOM distintivo |
| --- | ---: | ---: | ---: | --- |
| home | 1 | 0 | 1 | carrusel + ≥3 encabezados de sección con "más" |
| category | 8 | 2 | 2 | río de notas + carrusel o "Category: … Page N" |
| article | 40 | 0 | 0 | cuerpo de prosa + área de compartir |
| tag | 116 | 1 | 1 | río + "tagged with" / "Tag:" |
| author | 7 | 3 | 0 | río + caja de autor |
| listing (paginación) | 5 | 4 | 5 | río + paginación, sin otra señal |
| institutional | 6 | 0 | 0 | sin río; banda de título oscura |

En total hay **7 familias reales** (la consigna exigía al menos 6). Autor es una variante de listado, y la paginación es un rasgo transversal (10 páginas). El corpus tiene defectos SEO que **no** se reproducen: la portada no tiene H1 y los listados paginados tampoco.

### 1.3 Patrones DOM repetidos (duda 2)

- **Cromo idéntico en las 183 páginas**: barra utilitaria (fecha/clima), cabecera con logo, navegación fija negra (con toggle mobile y búsqueda), pie de 3 columnas (marca+redes, 2 columnas de enlaces, newsletter) y botón "volver arriba".
- **Contenedor**: ancho máximo 80rem con gutter de 1rem en todas las páginas.
- **Retícula con columna lateral**: 3/4 + 1/4 desde 64rem en todas las familias salvo institucional. En portada aparece invertida (columna lateral a la izquierda) en la segunda banda.
- **Banda superior de portada**: 2/3 + 1/3 (principal + "trending").
- **Columna lateral estándar** (100% de category/article/tag/author/listing): lo último numerado 01–05 → índice de categorías con conteo → últimas (1 destacada + miniaturas) → anuncio. Es fija (sticky) desde lg.
- **Título de bloque**: regla superior gruesa + rótulo invertido + enlace "más". Aparece en todas las familias editoriales.
- **Formas de tarjeta**: hay 14 formas distintas (`cardShapes` en el inventario). Cinco se repiten en todo el sitio (rail ×3, río, relacionadas) y nueve son exclusivas de la portada. En total resultan 10 variantes funcionales: overlay, feature, tile, headline, accent, thumb, thumb-end, river, numbered y compact.
- **Cortes responsive**: 40 / 48 / 64 / 80rem (los únicos `@media` del bundle).

### 1.4 Bloques investigados (dudas 3, 8, 9, 10)

Estas son las 23 piezas pedidas, con la evidencia del corpus y la decisión tomada:

| Bloque pedido | ¿Estructura real? | Evidencia | Decisión WEB.2 |
| --- | --- | --- | --- |
| utility bar | sí | 183/183 | `UtilityBar`; la fecha sale de los datos, no del reloj |
| header | sí | 183/183 | `Masthead`; marca en texto, provisional |
| navigation | sí | 183/183 | `PrimaryNav` fija, sin JS |
| hero/lead story | sí (carrusel ×3) | home, 6/8 category | estático: `LeadStory` y `ListingFeature` |
| trending | sí | home + 1/4 lateral | `TrendingList` |
| secondary stories | sí | home | variantes de `SectionBlock` |
| section header | sí | todas las editoriales | `BlockTitle` |
| story grid | sí | home, related | `.grid--3`, `LatestGrid`, `RelatedStories` |
| compact story list | sí | home (lateral) | `CompactList` |
| popular/sidebar | sí | home | `EditorPicks`: selección editorial, sin métricas inventadas |
| sports blocks | **no** | la sección deportes usa el mismo bloque que las demás | `FutureSlot` DEP/MET/GRF (extensión propia) |
| latest news | sí | home + lateral | `LatestGrid`, `RailLatest` |
| breadcrumb | sí | 40/40 article, 3/6 institucional | `Breadcrumb` en todas las páginas no-home |
| article hero | sí | 40/40 | `ArticleHero` (imagen a sangre 16/5 en lg) |
| article metadata | sí | 40/40 | `ArticleMeta` (firma, publicado, actualizado, lectura) |
| article body | sí | 40/40 | `ArticleBody` |
| subheadings | sí | 40/40 | `## ` → h2 con ancla |
| quote/callout | sí, raro | 3/40 | `> ` → `figure > blockquote` |
| tags | sí | 40/40 | `ArticleTags` → páginas de tema |
| share area | sí (JS para copiar) | 40/40 | `ShareLinks` con enlaces de intención, sin JS |
| related articles | sí | 40/40 | `RelatedStories` (sección > temas > recencia) |
| article sidebar | sí | 40/40 | `StandardRail` + slot DEP |
| footer | sí | 183/183 | `SiteFooter` sin newsletter ni redes |
| pagination | sí | home, listados | `Pagination` numerada |

Hay además bloques detectados que **no** se reproducen, cada uno con su motivo en `omittedCorpusBlocks`: toggle mobile, búsqueda, anuncios, caja de autor, banda de cifras, grilla de equipo, formularios, newsletter, redes y volver-arriba con JS. Un test exige que todo bloque del inventario esté mapeado a un componente o justificado como omisión.

**Barras laterales por contexto (duda 10):**
- Portada, banda 1: Recomendadas → Próximo partido (DEP) → Tabla (DEP) → Agenda.
- Portada, banda 2 (a la izquierda): En imágenes → Gráficos (GRF) → Rendimiento (MET).
- Sección, tema y últimas: lateral estándar.
- Artículo: lateral estándar + Próximo partido (DEP).
- Institucional: sin lateral, columna angosta de 56rem (igual que el corpus).

### 1.5 WEB.1: conservar, refactorizar, eliminar (dudas 4, 5, 6, 27)

| WEB.1 | Destino |
| --- | --- |
| `PublicationToWebPayload`, contratos, dominio | **Se conservan intactos** |
| `demo-articles.ts` (7 notas) | Se conserva y amplía a 24. Los 7 refs y URLs `/demo/<id>/` no cambian |
| `role: lead/secondary/latest` en la presentación | **Se elimina**: el rol pasa a un documento de composición aparte |
| `provisionalTag` | Se reemplaza por la sección (taxonomía provisional) |
| `EditorialLayout` | Se refactoriza como `BaseLayout` (añade canonical, OG y Twitter) |
| `SiteHeader` | Se divide en `UtilityBar`, `Masthead` y `PrimaryNav` |
| `PrimaryStory`, `StoryCard`, `LatestNews` | Se unifican en `story/StoryCard` con variantes |
| `SportsSidebar` | Pasa a `FutureSlot`, con un registro de módulos futuros |
| `ArticleView` | Se divide en hero, meta, body, tags, share, related y rail |
| Navegación por anclas `/#club` | Se sustituye por páginas de sección reales |
| Tokens de color y tipografía | Siguen siendo válidos; se suman espaciado, geometría y ritmo |

### 1.6 Composición sin contaminar el payload (dudas 11, 12)

```
PublicationToWebPayload   (canónico, sin cambios)
        │ 1:1 por articleRef (joinStories)
StoryPresentation         (sólo presentación: demoId, sectionId, topicIds, image)
        │ referenciado por articleRef
HomeComposition           (lead, trending, picks, visual, bandas → variantes)
```

Metadata que es **sólo presentación**: slug demo, sección, temas, imagen, variante de bloque, orden de bandas, tiempo de lectura (derivado), ids de subtítulos (derivados), conteos por sección (derivados) y fecha de edición (derivada). Un test prohíbe esas claves dentro del payload.

`body` sigue siendo texto plano. La estructura (subtítulos y citas) se lee con una convención mínima (`## `, `> `) que se renderiza siempre como texto escapado. **Deuda declarada**: un ciclo de contratos deberá decidir si `body` pasa a bloques estructurados.

### 1.7 CSS, tokens y responsive (dudas 14, 15, 16)

- **Tailwind del corpus: se ignora por completo.** Sólo se estudió para deducir geometría. No hay clases ni utilidades del template en `src/`, y un test lo vigila.
- Abstracciones propias en `global.css`: `--content-max: 80rem`, `--grid-gap`, `--rail-gap`, `--sticky-offset`, `--thumb-w`, escala `--space-*` y `--text-*`, `.container`, `.grid--2/3/4`, `.block-title`, `.kicker`, `.media`, más el componente `RailLayout` (3fr/1fr, variante invertida, sticky).
- Responsive real del corpus, reproducido: una columna en mobile; las grillas pasan a 2 columnas en 48rem; lateral y banda superior aparecen en 64rem; el río de notas pasa a imagen 1/3 + texto 2/3 en 40rem.

### 1.8 JS y assets del corpus (dudas 17, 18)

El JS es Alpine.js. Lo usa para el carrusel, el menú mobile, la búsqueda, la fecha en vivo, copiar enlace, filtros de empleo y estados de formulario. **Todo se omite.** Tribuna Santo publica 0 bytes de JS de cliente (test `ships no client JavaScript`). Imágenes, logo y fuentes del corpus son material de análisis únicamente; su sha256 queda registrado en el inventario y un test impide que aparezcan en `public/` o `dist/`.

### 1.9 Aislamiento de `/web` (dudas 19, 20)

- `/web` no está bajo `src/` ni `public/`, y Astro no lo lee. Además está excluido de ESLint (`web/**`) y de TypeScript (`exclude`). Antes de WEB.2, `npm run gate` fallaba en `main` precisamente por lint sobre el bundle minificado.
- Lo vigila `tests/web/corpus-independence.test.ts`: huellas del template en `src/`/`public/`, hashes de assets, hashes de títulos del corpus en `dist/`, configuración de Astro, cobertura del catálogo.
- **¿Fuera de Git?** Recomendación: **sí, en un ciclo posterior**. El commit que lo incorporó ya está en `main`, que no se reescribe. Retirarlo con un commit nuevo es seguro porque todas las pruebas dependen del inventario versionado, no de `/web`. Se deja en el repositorio durante WEB.2 para que el inventario sea reproducible (`corpus:inventory --check`). Hay que tener en cuenta que contiene assets propietarios del template y que retirarlo no los saca del historial.

### 1.10 Fidelidad estructural y Playwright (dudas 22–25)

- **Medición sin píxeles**: cada componente marca su raíz con `data-block`. `pageFamilyBlocks` declara la secuencia mínima de bloques por familia y el test verifica que cada página construida la contenga en orden DOM. Se complementa con: jerarquía de headings sin saltos, un H1 por página, densidad de portada (24 notas enlazadas, ≥40 tarjetas, 4 variantes de bloque) y paginación coherente.
- **Playwright**: está justificado para capturas de referencia y para detectar regresiones visuales, pero **no se agregó como dependencia**. Durante WEB.2 se usó la instalación global del entorno para inspeccionar visualmente desktop 1366×900 y mobile 390×844, y así se detectaron y corrigieron un desborde horizontal del breadcrumb y el hero en mobile. Propuesta para un ciclo dedicado: `@playwright/test` fuera de `npm run gate`, con estas vistas de referencia: `/`, un artículo con cita, `/seccion/<x>/`, `/ultimas/2/` y `/acerca/`, en 1366 y 390, y asserts geométricos (ancho del contenedor, proporción de columnas, sin scroll horizontal) en lugar de diffs de píxeles.

### 1.11 Bloques futuros (duda 13, 26)

`src/presentation/future-modules.ts` registra los slots `dep-next-match`, `dep-standings`, `dep-results`, `met-squad` y `grf-match`. Cada uno renderiza título, propósito y aviso, **sin valores**: un test exige que no haya dígitos. El corpus no tiene bloques deportivos de datos. Las necesidades de DEP (fixture, tabla, resultados), MET (rendimiento) y GRF (infografía) salen de `docs/references.md` (referencia funcional) y se ubican donde el corpus pone anuncios y bloques visuales.

---

## 2. Skill 2 — Plan tentativo

1. Aislar el corpus y automatizar el inventario (gate verde de nuevo).
2. Capa de presentación separada del payload: taxonomía, presentación 1:1, composición, rutas y lector de body.
3. Tokens y primitivas de layout deducidos del corpus.
4. Componentes por bloque, con `data-block`.
5. Familias: portada, artículo, sección, tema, últimas paginadas e institucional.
6. Fixtures ficticias suficientes para la densidad.
7. Pruebas de estructura, de composición y de independencia del corpus.

## 3. Skill 3 — Plan final y alcance (duda 28)

**Entra en WEB.2**: todo lo anterior, en tres commits (`chore` aislamiento e inventario, `feat` reconstrucción, `docs`).

**No entra** (rediseño total o fuera de alcance): identidad visual, logo, fuentes propias, búsqueda, menú mobile con JS, carrusel, anuncios, newsletter, redes, autores como entidad, formularios, JSON-LD (`NewsArticle`, `BreadcrumbList`), sitemaps, Playwright como dependencia, DEP/MET/GRF reales.

### Mapa tipo de página → bloques → componentes

| Familia | Ruta | Bloques (orden DOM) |
| --- | --- | --- |
| home | `/` | utility-bar · masthead · primary-nav · lead-story · trending · rail[section-block×4 \| editor-picks · future-slot×2 · compact-list] · rail-invertido[visual-stories · future-slot×2 \| section-block×2 · latest-grid · pagination] · site-footer |
| section | `/seccion/<slug>/` | cromo · breadcrumb · rail[listing-header · listing-feature · river-list \| lateral estándar] · footer |
| topic | `/tema/<slug>/` | cromo · breadcrumb · rail[listing-header · river-list \| lateral estándar] · footer |
| listing | `/ultimas/`, `/ultimas/<n>/` | cromo · breadcrumb · rail[listing-header · river-list · pagination \| lateral estándar] · footer |
| article | `/demo/<id>/` | cromo · breadcrumb · article-hero · article-meta · rail[article-body · article-tags · share-links · related-stories \| lateral estándar · future-slot] · footer |
| institutional | `/acerca/` | cromo · breadcrumb · page-hero · prose · footer |

Lateral estándar = `rail-recent-numbered` · `rail-section-index` · `rail-latest`. El detalle de qué componente implementa cada bloque, y con qué evidencia del corpus, está en `src/presentation/blocks.ts`.

### Resultado medible

| | WEB.1 | WEB.2 |
| --- | ---: | ---: |
| Páginas construidas | 8 | 45 |
| Familias de página | 2 | 6 |
| Tarjetas `<article>` en portada | 7 | 43 |
| Bloques en portada | 4 | 23 |
| Enlaces internos verificados | 64 | 2181 |
| JS de cliente | 0 | 0 |

### Deuda y siguientes pasos

- Convertir `body` en bloques estructurados mediante un contrato.
- Autor como entidad `Person` (la caja de autor y las páginas de autor quedan pendientes).
- Taxonomía editorial definitiva y URL definitiva del artículo (hoy `/demo/<id>/`).
- JSON-LD (`NewsArticle`, `BreadcrumbList`) cuando haya publicación real.
- Retirar `/web` de Git y sumar Playwright en un ciclo de instrumentación visual.
