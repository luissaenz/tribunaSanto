// WEB.2 — Perfil estructural del CSS del corpus.
//
// Sustituye a la sonda scripts/research/inspect-css.ts. Registra sólo
// señales estructurales (conteos, presencia de Tailwind, media queries).
// Nunca guarda valores de color, nombres de custom properties ni reglas:
// la paleta y la tipografía son identidad del template, no evidencia.

export type CssProfile = Readonly<{
  bytes: number;
  tailwind: boolean;
  fontFaces: number;
  customPropertyCount: number;
  mediaQueries: readonly string[];
}>;

export function profileCss(css: string): CssProfile {
  const customProperties = new Set(
    [...css.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1])
  );

  const mediaQueries = new Set(
    [...css.matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].replace(/\s+/g, ' ').trim())
  );

  return {
    bytes: Buffer.byteLength(css, 'utf-8'),
    tailwind: /--tw-|tailwindcss|@layer\s+theme/.test(css),
    fontFaces: (css.match(/@font-face\s*\{/g) ?? []).length,
    customPropertyCount: customProperties.size,
    mediaQueries: [...mediaQueries].sort()
  };
}
