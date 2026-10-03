# Referencias Externas de Diseño y Funcionalidad

Este documento registra los dos sitios web utilizados como referencias analíticas durante la investigación del proyecto, junto con sus estrictas restricciones de uso.

---

## 1. Referencia Estructural Editorial

- **URL**: `https://newspaper.madethemes.com/`
- **Rol desde WEB.3**: **golden master observable** (ver `docs/web3/README.md`). Lo observable por el usuario —estructura, geometría, responsive, tipografía, paleta, decoración, iconografía, interacción, timings y estados— se reproduce con fidelidad, sustituyendo identidad, textos, imágenes, URLs e idioma por los de Tribuna Santo.
- **Uso Autorizado**:
  - Reproducir el comportamiento y la apariencia observables mediante una **implementación propia**.
  - Usar Tailwind CSS, Alpine.js, Bootstrap Icons, Inter y PT Serif obtenidos desde sus paquetes y licencias oficiales.
  - Derivar mediciones (`docs/web3/reference-contract.json`) del corpus local, sin versionar su código ni sus assets.
- **Restricciones No Negociables**:
  - **Prohibido** copiar literalmente código propietario del template (HTML, CSS, JavaScript o plantillas) sin licencia de reutilización.
  - **Prohibido** extraer imágenes, logotipos, textos o archivos de fuentes de la demo.
  - **Prohibido** versionar, servir o importar el corpus `/web`.
  - La revocación de WEB.2 ("geometría sí, ornamentación no") consta en `docs/web3/README.md` (D1).

---

## 2. Referencia Funcional Deportiva

- **URL**: `https://www.mundoascenso.com.ar/club/211-san-martin-tuc`
- **Uso Autorizado**:
  - Modelo conceptual y funcional de información para páginas deportivas de Club:
    - Ficha de institución (nombre, sede, estadio, capacidad).
    - Métricas de rendimiento y tabla de posiciones (puntos, PJ, PG, PE, PP, GF, GC, DG).
    - Fixture y calendario: últimos resultados (marcadores, goleadores) y próximos encuentros (horarios, rivales, localía).
    - Desempeño reciente y mercado de pases (altas y bajas).
- **Restricciones No Negociables**:
  - **Prohibido** copiar la interfaz de usuario, diseño visual, estilos o estructura de maquetación de Mundo Ascenso.
  - La referencia es exclusivamente a nivel de modelo de datos y necesidades informativas de los seguidores del club.
