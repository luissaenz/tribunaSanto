// WEB.3 — Tamaños de página observados en el golden master y paginado puro.

export const PAGE_SIZE = {
  listing: 9,
  author: 9,
  section: 6,
  topic: 6
} as const;

export type Paged<T> = Readonly<{ items: readonly T[]; page: number; pages: number }>;

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

export function paginate<T>(items: readonly T[], size: number, page: number): Paged<T> {
  const pages = pageCount(items.length, size);
  if (page < 1 || page > pages) throw new Error(`Page ${page} out of range 1..${pages}`);
  return { items: items.slice((page - 1) * size, page * size), page, pages };
}
