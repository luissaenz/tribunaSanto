// WEB.3 — Búsqueda del header.
//
// DESVIACIÓN DEMO TEMPORAL POR FALTA DE GOLDEN MASTER DE `/search`: la consulta
// navega a /demo/ultimas/?q=<consulta>, sin página de resultados ni filtrado.

export const SEARCH_ACTION = '/demo/ultimas/';

export function searchUrl(query: string): string | null {
  const q = query.trim();
  return q ? `${SEARCH_ACTION}?q=${encodeURIComponent(q)}` : null;
}

export function formatToday(now: Date = new Date()): string {
  const text = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
