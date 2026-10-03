// WEB.3 — Tipos mínimos de Alpine.js (el paquete no publica declaraciones).
declare module 'alpinejs' {
  interface AlpineStatic {
    data(name: string, callback: (...args: never[]) => object): void;
    start(): void;
  }
  const Alpine: AlpineStatic;
  export default Alpine;
}
