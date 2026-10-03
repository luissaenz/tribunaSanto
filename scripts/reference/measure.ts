// WEB.3 — Medición observable compartida por el extractor del golden master y
// la suite de fidelidad de Tribuna Santo. Corre dentro de la página (Playwright
// `page.evaluate`): no puede referenciar nada fuera de su propio cuerpo.

export type Measurement = {
  present: boolean;
  visible: boolean;
  display?: string;
  position?: string;
  top?: number | null;
  zIndex?: string;
  x?: number;
  w?: number;
  h?: number;
  aspect?: number;
  font?: 'heading' | 'body' | 'other';
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: number | null;
  letterSpacing?: number | null;
  textTransform?: string;
  color?: string;
  bg?: string;
  bgImage?: 'none' | 'gradient' | 'url';
  bgAttachment?: string;
  borders?: [number, number, number, number];
  borderColor?: string | null;
  radius?: number;
  opacity?: number;
  columns?: number | null;
  gap?: number | null;
  objectFit?: string;
};

export type MeasureArgs = Readonly<{
  parts: ReadonlyArray<{ id: string; sel: string }>;
  order: ReadonlyArray<{ id: string; sel: string }>;
}>;

export type PageMeasurement = {
  parts: Record<string, Measurement>;
  domOrder: string[];
  visualOrder: string[];
};

/** Función autocontenida para `page.evaluate`. */
export function measureInPage(args: MeasureArgs): PageMeasurement {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const rgba = (value: string): string => {
    if (!value || value === 'transparent') return 'rgba(0,0,0,0.00)';
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return `rgba(${d[0]},${d[1]},${d[2]},${(d[3] / 255).toFixed(2)})`;
  };
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r4 = (n: number) => Math.round(n * 10000) / 10000;
  const px = (v: string): number | null => (v.endsWith('px') ? r2(parseFloat(v)) : null);
  const vw = document.documentElement.clientWidth;

  const fontCategory = (family: string): 'heading' | 'body' | 'other' =>
    /PT Serif/i.test(family) ? 'heading' : /Inter/i.test(family) ? 'body' : 'other';

  const isVisible = (el: Element, cs: CSSStyleDeclaration) => {
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    for (let p: Element | null = el.parentElement; p; p = p.parentElement) {
      if (getComputedStyle(p).display === 'none') return false;
    }
    return true;
  };

  const measure = (el: Element | null): Measurement => {
    if (!el) return { present: false, visible: false };
    const cs = getComputedStyle(el);
    const visible = isVisible(el, cs);
    if (!visible) return { present: true, visible: false, display: cs.display };
    const r = el.getBoundingClientRect();
    const borders = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map((b) =>
      r2(parseFloat(b))
    ) as [number, number, number, number];
    const sides = ['Top', 'Right', 'Bottom', 'Left'] as const;
    const firstSide = sides.find((_, i) => borders[i] > 0);
    const bgImage = cs.backgroundImage === 'none' ? 'none' : /gradient/.test(cs.backgroundImage) ? 'gradient' : 'url';
    const cols = cs.display.includes('grid') ? cs.gridTemplateColumns.split(' ').filter(Boolean).length : null;
    return {
      present: true,
      visible: true,
      display: cs.display,
      position: cs.position,
      top: cs.position === 'sticky' || cs.position === 'fixed' ? px(cs.top) : null,
      zIndex: cs.zIndex,
      x: r4(r.left / vw),
      w: r4(r.width / vw),
      h: r2(r.height),
      aspect: r4(r.width / r.height),
      font: fontCategory(cs.fontFamily),
      fontSize: r2(parseFloat(cs.fontSize)),
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      lineHeight: px(cs.lineHeight),
      letterSpacing: cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing),
      textTransform: cs.textTransform,
      color: rgba(cs.color),
      bg: rgba(cs.backgroundColor),
      bgImage,
      bgAttachment: cs.backgroundAttachment,
      borders,
      borderColor: firstSide ? rgba(cs.getPropertyValue(`border-${firstSide.toLowerCase()}-color`)) : null,
      radius: r2(parseFloat(cs.borderTopLeftRadius)),
      opacity: r2(parseFloat(cs.opacity)),
      columns: cols,
      gap: cs.display.includes('grid') || cs.display.includes('flex') ? px(cs.columnGap) : null,
      objectFit: cs.objectFit
    };
  };

  const parts: Record<string, Measurement> = {};
  for (const p of args.parts) parts[p.id] = measure(document.querySelector(p.sel));

  const located = args.order
    .map((o) => ({ id: o.id, el: document.querySelector(o.sel) }))
    .filter((o): o is { id: string; el: Element } => o.el !== null);
  const domOrder = [...located]
    .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .map((o) => o.id);
  const visualOrder = located
    .filter((o) => isVisible(o.el, getComputedStyle(o.el)))
    .map((o) => ({ id: o.id, r: o.el.getBoundingClientRect() }))
    .sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left)
    .map((o) => o.id);
  return { parts, domOrder, visualOrder };
}
