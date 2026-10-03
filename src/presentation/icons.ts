// WEB.3 — Íconos Bootstrap Icons (paquete oficial `bootstrap-icons`, MIT).
// Se leen en build y se emiten como SVG inline, sin inyectar HTML crudo.

import fs from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

export const ICON_NAMES = [
  'list',
  'x-lg',
  'search',
  'newspaper',
  'chevron-left',
  'chevron-right',
  'fire',
  'arrow-right',
  'arrow-left',
  'arrow-up',
  'clock',
  'clock-fill',
  'calendar3',
  'flag',
  'person',
  'person-circle',
  'facebook',
  'twitter-x',
  'instagram',
  'youtube',
  'linkedin',
  'whatsapp',
  'link-45deg',
  'check-lg',
  'check-circle',
  'check',
  'envelope-paper',
  'briefcase',
  'award',
  'trophy-fill',
  'megaphone-fill',
  'shield-lock-fill',
  'file-earmark-text-fill',
  'paperclip',
  'cloud-upload',
  'pencil-square',
  'send',
  'geo-alt-fill',
  'telephone-fill',
  'star-fill'
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export type SvgNode = Readonly<{ tag: string; attrs: Record<string, string>; children: readonly SvgNode[] }>;

const ALLOWED_TAGS = new Set(['path', 'g', 'circle', 'rect', 'ellipse', 'polygon', 'polyline', 'line']);
const ALLOWED_ATTRS = new Set(['d', 'fill', 'fill-rule', 'clip-rule', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'points', 'x1', 'x2', 'y1', 'y2', 'transform', 'opacity']);

const cache = new Map<IconName, { viewBox: string; nodes: readonly SvgNode[] }>();

function toNode(el: HTMLElement): SvgNode | null {
  const tag = el.rawTagName?.toLowerCase();
  if (!tag || !ALLOWED_TAGS.has(tag)) return null;
  const attrs = Object.fromEntries(Object.entries(el.attributes).filter(([k]) => ALLOWED_ATTRS.has(k)));
  const children = el.childNodes.map((c) => toNode(c as HTMLElement)).filter((n): n is SvgNode => n !== null);
  return { tag, attrs, children };
}

export function loadIcon(name: IconName): { viewBox: string; nodes: readonly SvgNode[] } {
  const hit = cache.get(name);
  if (hit) return hit;
  const file = path.join(process.cwd(), 'node_modules', 'bootstrap-icons', 'icons', `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Bootstrap Icon inexistente: ${name}`);
  const svg = parse(fs.readFileSync(file, 'utf-8')).querySelector('svg');
  if (!svg) throw new Error(`SVG inválido: ${name}`);
  const icon = {
    viewBox: svg.getAttribute('viewBox') ?? '0 0 16 16',
    nodes: svg.childNodes.map((c) => toNode(c as HTMLElement)).filter((n): n is SvgNode => n !== null)
  };
  cache.set(name, icon);
  return icon;
}
