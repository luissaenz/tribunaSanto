import fs from 'node:fs';
import path from 'node:path';

const cssPath = path.resolve(process.cwd(), 'web', '_astro', 'MainLayout.Cuo_Vvbu.css');
const css = fs.readFileSync(cssPath, 'utf-8');

console.log('CSS file size:', (css.length / 1024).toFixed(1), 'KB');

// Check for Tailwind v3 or v4 tokens
const isTailwind = css.includes('--tw-') || css.includes('@theme') || css.includes('tailwindcss');
console.log('Uses Tailwind:', isTailwind);

// Check fonts referenced
const fontFaces = css.match(/@font-face\s*\{[^}]+\}/g) || [];
console.log('Number of @font-face rules:', fontFaces.length);

// Check common design tokens / color variables
const customProps = css.match(/--[a-zA-Z0-9_-]+:[^;]+;/g) || [];
console.log('Total custom properties:', customProps.length);
console.log('Sample custom properties:', customProps.slice(0, 10));

// Check breakpoints
const mediaQueries = css.match(/@media\s*\([^)]+\)/g) || [];
const uniqueMedia = [...new Set(mediaQueries)];
console.log('Breakpoints / media queries:', uniqueMedia);
