import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// WEB.3 — Tailwind v4 vía Vite y fuentes self-hosted desde paquetes OFL
// (@fontsource*), nunca desde los bytes del corpus de referencia.
const pkg = (file) => `./node_modules/${file}`;

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://tribunasanto.local',
  vite: {
    plugins: [tailwindcss()]
  },
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.local(),
      fallbacks: ['Arial'],
      options: {
        variants: [
          {
            weight: '400 700',
            style: 'normal',
            src: [pkg('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')]
          },
          {
            weight: '400 700',
            style: 'italic',
            src: [pkg('@fontsource-variable/inter/files/inter-latin-wght-italic.woff2')]
          }
        ]
      }
    },
    {
      name: 'PT Serif',
      cssVariable: '--font-pt-serif',
      provider: fontProviders.local(),
      fallbacks: ['Arial'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: [pkg('@fontsource/pt-serif/files/pt-serif-latin-400-normal.woff2')] },
          { weight: 400, style: 'italic', src: [pkg('@fontsource/pt-serif/files/pt-serif-latin-400-italic.woff2')] },
          { weight: 700, style: 'normal', src: [pkg('@fontsource/pt-serif/files/pt-serif-latin-700-normal.woff2')] },
          { weight: 700, style: 'italic', src: [pkg('@fontsource/pt-serif/files/pt-serif-latin-700-italic.woff2')] }
        ]
      }
    }
  ]
});
