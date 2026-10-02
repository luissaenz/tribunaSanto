// WEB.2 — Esqueleto DOM sin texto (lógica de scripts/corpus/outline.ts).
//
// Imprime etiquetas y clases, colapsando hermanos idénticos consecutivos (×N).
// Nunca devuelve texto, atributos ni HTML del corpus.

import { parse as parseHtml, type HTMLElement } from 'node-html-parser';

const SKIPPED = new Set(['script', 'style', 'svg', 'path', 'template', 'noscript']);

const isElement = (node: unknown): node is HTMLElement =>
  typeof node === 'object' && node !== null && (node as { nodeType?: number }).nodeType === 1;

const signature = (el: HTMLElement) => `${el.tagName.toLowerCase()}.${el.getAttribute('class') ?? ''}`;

export function outline(html: string, options: { depth?: number; selector?: string } = {}): string[] {
  const root = parseHtml(html);
  const start = options.selector ? root.querySelector(options.selector) : root.querySelector('body');
  if (!start) throw new Error(`Selector sin coincidencias: ${options.selector ?? 'body'}`);

  const maxDepth = options.depth ?? 6;
  const lines: string[] = [];

  const visit = (el: HTMLElement, depth: number) => {
    if (depth > maxDepth) return;
    const children = el.childNodes.filter(isElement).filter((c) => !SKIPPED.has(c.tagName.toLowerCase()));
    for (let i = 0; i < children.length; i++) {
      let repeat = 1;
      while (i + repeat < children.length && signature(children[i + repeat]) === signature(children[i])) repeat++;
      const child = children[i];
      const classes = (child.getAttribute('class') ?? '').trim();
      const kids = child.childNodes.filter(isElement).length;
      lines.push(
        `${'  '.repeat(depth)}<${child.tagName.toLowerCase()}${classes ? ` .${classes}` : ''}>` +
          `${kids ? ` [${kids}]` : ''}${repeat > 1 ? ` ×${repeat}` : ''}`
      );
      visit(child, depth + 1);
      i += repeat - 1;
    }
  };

  lines.push(`<${start.tagName.toLowerCase()}>`);
  visit(start, 1);
  return lines;
}
