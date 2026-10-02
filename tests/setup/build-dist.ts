import { execSync } from 'node:child_process';

// Construye dist/ una sola vez antes de todas las suites (evita builds concurrentes).
export default function setup() {
  execSync('npm run build', { stdio: 'pipe' });
}
