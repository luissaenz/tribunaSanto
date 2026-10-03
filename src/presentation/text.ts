// WEB.3 — Recorte de textos en tarjetas (el golden master trunca por palabras con "…").

export const TRUNCATE = {
  shortTitle: 50,
  shortExcerpt: 65,
  listTitle: 80,
  listExcerpt: 100,
  breadcrumb: 35
} as const;

/** Recorta en el último espacio para que el resultado (con "…") no supere `max` caracteres. */
export function truncateWords(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const cut = slice.lastIndexOf(' ');
  const base = (cut > 0 ? slice.slice(0, cut) : slice).replace(/[\s,.;:—–-]+$/, '');
  return `${base}…`;
}
