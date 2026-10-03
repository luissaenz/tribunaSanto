// WEB.3 — Copiar enlace al portapapeles.

export type ClipboardLike = { writeText: (text: string) => Promise<void> };

export async function copyText(clipboard: ClipboardLike | undefined, text: string): Promise<boolean> {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
