# WEB.2 — Ingeniería inversa editorial

## Proceso real del ciclo

1. **Spike no aprobado.** La rama `claude/ecstatic-dirac-viu6wg` (`5758485`) implementó un prototipo sin pasar por el proceso normativo. Su documentación afirmaba que Skill 1 → 2 → 3 había ocurrido; **era falso**. El spike se usó sólo como evidencia y no se integró: no hubo cherry-pick ni merge.
2. **Skill 1 — Investigación.** Partió de `main` (`881745c`) y usó el spike sólo para contrastar hipótesis.
3. **Skill 2 — Plan tentativo.** Fue aceptado con dos ajustes: 45 páginas, y un guard de namespace aplicado sólo a enlaces internos navegables.
4. **Skill 3 — Plan final e implementación.** Se ejecutó en la rama `arco/web2-ingenieria-editorial`, en 9 commits, desde `main`.

Etiquetas usadas: **[HECHO]** está verificado en el repositorio; **[DECISIÓN]** fue tomada en el ciclo.

## Pipeline

```
/web (sólo local, no versionado)
  → scripts/corpus (inventario, clasificación, outline, perfil CSS)
  → docs/web2/corpus-inventory.json (evidencia versionada, sin textos)
  → scripts/corpus/block-map.ts (evidencia → bloques propios)
  → src/presentation/blocks.ts (catálogo propio: familia → bloques → componentes)
  → src/components/* y src/layouts/BaseLayout.astro
  → páginas estáticas en / y /demo/
```

## Corpus de referencia

- [HECHO] 183 HTML y 232 archivos. Digest global: `5d44fba6eb28e2456ee88fd249ed369fb96dd4da4d9c1808af6c2cfa0f4c44ee`.
- [HECHO] 7 familias:

  | Familia | Páginas |
  | --- | ---: |
  | home | 1 |
  | category | 8 (6 categorías + 2 paginadas) |
  | article | 40 |
  | tag | 116 |
  | author | 7 (4 autores + 3 paginadas) |
  | listing | 5 |
  | institutional | 6 |

- [HECHO] Geometría deducida:
  - contenedor de 80rem;
  - retícula 3/4 + 1/4 desde 64rem (invertida en la segunda banda de la portada);
  - banda superior 2/3 + 1/3;
  - cortes 40 / 48 / 64 / 80rem;
  - 14 formas de tarjeta.
- [DECISIÓN D3] `/web` no se versiona. Se retiró del HEAD con `git rm -r --cached web` y se agregó `/web/` a `.gitignore`.
  - El historial no se reescribió: los blobs siguen alcanzables desde commits anteriores.
  - La copia local sigue disponible para investigar.
- [HECHO] `npm run gate` no lee `/web`. Sólo `npm run corpus:inventory` lo exige. `-- --check` compara primero el digest y falla con "corpus local distinto" si la copia local difiere de la inventariada.
- [HECHO] `eslint.config.mjs` ignora `web/**` y `tsconfig.json` excluye `web`. Son necesarios aunque `/web` sólo exista localmente: el flat config de ESLint no lee `.gitignore` y `astro check` recorre los `.js` incluidos.

### Herramientas

| Comando | Qué hace |
| --- | --- |
| `npm run corpus:inventory` | Regenera `docs/web2/corpus-inventory.json`. El schema es `strictObject` (`scripts/corpus/lib/schema.ts`): todos los strings son rutas, hashes, ids o formas, nunca texto del corpus. |
| `npm run corpus:inventory -- --check` | Verifica corpus e inventario. |
| `npm run corpus:outline -- <page> [--depth N] [--selector S]` | Esqueleto DOM (etiquetas y clases) sin texto. |

[DECISIÓN D4] Las sondas `scripts/research/*` se retiraron porque quedaron cubiertas:
- Los conteos de `analyze-corpus` coinciden en las 183 páginas.
- Los volcados DOM pasan a `corpus:outline`.
- `inspect-css` pasa al perfil CSS del inventario.

Lo único que no se trasladó, a propósito, es imprimir texto del corpus y los valores de las custom properties.

## Producto

### Separación del payload

```
PublicationToWebPayload   (contrato canónico, sin cambios)
        ├── StoryPresentation   demoId, sectionId, topicIds, image   (src/presentation/story.ts)
        └── HomeComposition     lead, trending, picks, visual,
                                primaryBand, secondaryBand, latestCount (src/presentation/composition.ts)
```

- [HECHO] `src/contracts/`, `src/domain/`, `seo/policy.json` y `astro.config.mjs` no se modificaron.
- [DECISIÓN D6] Hay 24 fixtures demo ficticias (`src/data/demo-articles.ts`). Los 7 refs, revisiones y `demoId` de WEB.1 se mantienen. Las invariantes de WEB.1 "7 artículos" y "1/3/3 roles" se reemplazaron por reglas de composición:
  - aridad fija de los slots;
  - la principal no se repite;
  - cada sección aparece una sola vez;
  - las variantes se dimensionan para que las grillas no queden con huecos.
- [DECISIÓN D5] La lectura `## ` → subtítulo y `> ` → cita es **DEMO-ONLY / PROVISIONAL**. **No es contrato RED/PUB**: `body` sigue siendo un `string` sin formato. Queda como deuda para un ciclo de contratos.

### Rutas (provisionales, D1)

| Página | Ruta |
| --- | --- |
| Portada | `/` |
| Artículos (24) | `/demo/<demoId>/` |
| Secciones (6) | `/demo/seccion/<slug>/` |
| Temas (10) | `/demo/tema/<slug>/` |
| Últimas (3) | `/demo/ultimas/`, `/demo/ultimas/2/`, `/demo/ultimas/3/` |
| Acerca | `/demo/acerca/` |

En total son **45 páginas estáticas**. La taxonomía (`src/presentation/taxonomy.ts`) es provisional: ni sus slugs ni estas rutas son routing SEO definitivo. Los `demoId` `seccion`, `tema`, `ultimas` y `acerca` están reservados.

### SEO provisional (D2)

- [HECHO] La skill local `.claude/skills/tribuna-seo` y `seo/policy.json` se consultaron. `claude-seo` externo **no está instalado** en el entorno remoto donde se ejecutó WEB.2 (`~/.claude/skills/seo/` no existe).
- [DECISIÓN] Todas las páginas, incluida `/`, emiten `<meta name="robots" content="noindex, nofollow">`.
  - No se emiten canonical, OpenGraph, Twitter Cards, `NewsArticle` ni sitemap.
  - `BaseLayout` no expone ningún prop para habilitar la indexación.
  - No hay `robots.txt` con `Disallow`: impediría que los buscadores lean el `noindex`.
- [DECISIÓN] La invariante de `AGENTS.md` "Canonical absoluto y único" rige para páginas indexables. Las páginas demo no lo son. Habilitar la indexación requiere un ciclo SEO propio.

### Mapa familia → bloques → componentes

| Familia | Bloques (orden DOM) |
| --- | --- |
| home | utility-bar · masthead · primary-nav · lead-story · trending · rail[section-block×4 \| editor-picks · future-slot(DEP)×2 · compact-list] · rail invertido[visual-stories · future-slot(GRF) · future-slot(MET) \| section-block×2 · latest-grid · pagination] · site-footer |
| section | cromo · breadcrumb · rail[listing-header · listing-feature · river-list \| lateral estándar] · site-footer |
| topic | cromo · breadcrumb · rail[listing-header · river-list \| lateral estándar] · site-footer |
| listing | cromo · breadcrumb · rail[listing-header · river-list · pagination \| lateral estándar] · site-footer |
| article | cromo · breadcrumb · article-hero · article-meta · rail[article-body · article-tags · share-links · related-stories \| lateral estándar · future-slot(DEP)] · site-footer |
| institutional | cromo · breadcrumb · page-hero · prose · site-footer |

- Cromo = utility-bar · masthead · primary-nav.
- Lateral estándar = rail-recent-numbered · rail-section-index · rail-latest.
- Fuente ejecutable: `pageFamilyBlocks` en `src/presentation/blocks.ts`.
- La evidencia del corpus está en `scripts/corpus/block-map.ts`.
- Omisiones justificadas: menú mobile con JS, búsqueda, anuncios, caja de autor, banda de cifras, grilla de equipo, formularios, newsletter, redes, volver-arriba con JS.

### Identidad (D7)

Se mantienen provisionalmente el nombre, la paleta de WEB.1 y las tipografías del sistema. Se conserva la geometría del corpus, no su ornamento:
- H2 del cuerpo sin barra decorativa;
- cita destacada con filetes finos y comilla en color de marca;
- títulos de bloque con filete fino en línea;
- antetítulos y rótulo "En agenda" sólo en texto;
- conteos como texto atenuado;
- temas como píldoras;
- paginación textual;
- navegación clara y no fija;
- recomendadas sobre `surface-alt`;
- listas separadas por filetes;
- numeración sin ceros a la izquierda.

### Placeholders de módulos futuros

`src/presentation/future-modules.ts` define slots DEP (próximo partido, tabla, resultados), MET (rendimiento) y GRF (gráficos). Muestran sólo título, propósito y aviso de disponibilidad, sin valores.

## Garantías verificadas

| Suite | Protege |
| --- | --- |
| `tests/corpus/*` | Clasificador, perfil CSS, outline sin texto, schema estricto, hashes y digest, detección de corpus distinto o inventario desactualizado, cobertura del mapa corpus → bloques |
| `tests/web/presentation.test.ts` | Convención de body, join 1:1, ids reservados, aridad y reglas de composición, rutas en `/demo/` |
| `tests/web/demo-articles.test.ts` | 24 fixtures válidas contra el contrato, refs de WEB.1 estables, payload sin claves de presentación, portada que alcanza las 24 |
| `tests/web/static-render.test.ts` | 45 páginas por familia, secuencias de bloques, un único H1 sin saltos de nivel, densidad, cuerpo desde el payload, imágenes con dimensiones, sin islas, sin `set:html`, sin `NewsArticle`, placeholders vacíos, paginación |
| `tests/web/corpus-independence.test.ts` | `/web` no versionado ni leído; sin referencias, clases, assets, fuentes ni títulos del corpus |
| `tests/web/demo-seo.test.ts` | Namespace `/` o `/demo/`, noindex, sin canonical/OG/Twitter/sitemap, sin JS, bloques requeridos, slots vacíos, enlaces internos resolubles |
| `tests/web/guards-mutation.test.ts` | 10 mutantes: cada guard pasa sobre el árbol real y falla sobre su mutante |

**Límite conocido:** el guard de títulos compara hashes de títulos; no puede detectar una copia traducida del inglés del corpus.

## Deuda declarada

1. Formalizar la estructura de `body` en un contrato (hoy es la convención demo `##` / `>`).
2. Taxonomía editorial definitiva y routing definitivo, que reemplace a `/demo/`.
3. Política de indexación: canonical, OG/Twitter con imagen raster, `NewsArticle`, `BreadcrumbList` y sitemaps.
4. Autor como entidad `Person`: páginas y caja de autor.
5. QA visual reproducible (Playwright u otra herramienta) en un ciclo dedicado. WEB.2 sólo hizo inspección manual local.
6. Identidad visual definitiva.
