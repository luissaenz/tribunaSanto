// WEB.3 — Servidor estático mínimo para medir/capturar el corpus local de referencia.
// Sólo tooling: nunca lo importa el producto. El directorio llega por parámetro
// (WEB3_CORPUS_DIR); el corpus jamás se versiona ni se sirve como producto.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import type { AddressInfo } from 'node:net';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

export type StaticServer = Readonly<{ url: string; close: () => Promise<void> }>;

export async function serveDirectory(root: string): Promise<StaticServer> {
  const base = path.resolve(root);
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let file = path.join(base, pathname);
    if (!file.startsWith(base)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/`,
    close: () => new Promise((resolve) => server.close(() => resolve()))
  };
}

export function corpusDirFromEnv(): string {
  const dir = process.env.WEB3_CORPUS_DIR;
  if (!dir || !fs.existsSync(path.join(dir, 'index.html')) || !fs.existsSync(path.join(dir, '_astro'))) {
    console.error('[reference] ✗ WEB3_CORPUS_DIR debe apuntar a una copia local del corpus (git archive 881745c web).');
    process.exit(2);
  }
  return path.resolve(dir);
}
