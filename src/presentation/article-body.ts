// WEB.2 — Lectura estructural del cuerpo de un artículo.
//
// `PublicationToWebPayload.body` sigue siendo texto plano. Para dar estructura
// editorial (subtítulos, citas) sin introducir HTML ni una segunda fuente del
// artículo, la web interpreta una convención mínima por bloques separados por
// línea en blanco:
//
//   ## Subtítulo            → subtítulo (h2) con ancla
//   > Texto citado          → cita; una última línea "> — Atribución" es opcional
//   cualquier otro bloque   → párrafo
//
// Todo se renderiza como texto escapado: nunca se inyecta HTML crudo.

export type BodyBlock =
  | Readonly<{ type: 'paragraph'; text: string }>
  | Readonly<{ type: 'subheading'; text: string; id: string }>
  | Readonly<{ type: 'quote'; text: string; attribution?: string }>;

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseArticleBody(body: string): readonly BodyBlock[] {
  const usedIds = new Set<string>();
  const uniqueId = (text: string) => {
    const base = slugify(text) || 'seccion';
    let id = base;
    for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
    usedIds.add(id);
    return id;
  };

  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk): BodyBlock => {
      if (/^##\s+/.test(chunk) && !chunk.includes('\n')) {
        const text = chunk.replace(/^##\s+/, '').trim();
        return { type: 'subheading', text, id: uniqueId(text) };
      }

      const lines = chunk.split('\n').map((l) => l.trim());
      if (lines.every((l) => l.startsWith('>'))) {
        const content = lines.map((l) => l.replace(/^>\s?/, ''));
        const last = content[content.length - 1];
        const hasAttribution = content.length > 1 && /^[—-]\s*/.test(last);
        const quoteLines = hasAttribution ? content.slice(0, -1) : content;
        return {
          type: 'quote',
          text: quoteLines.join(' ').trim(),
          ...(hasAttribution ? { attribution: last.replace(/^[—-]\s*/, '').trim() } : {})
        };
      }

      return { type: 'paragraph', text: chunk.replace(/\s*\n\s*/g, ' ') };
    });
}

/** Primer párrafo del cuerpo, útil como bajada de respaldo y para pruebas. */
export function firstParagraph(body: string): string {
  const block = parseArticleBody(body).find((b) => b.type === 'paragraph');
  return block ? block.text : '';
}

export function readingMinutes(body: string, wordsPerMinute = 200): number {
  const words = body
    .replace(/^##\s+|^>\s?/gm, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
