// WEB.2 — Punto único de entrada de datos a la web.
//
// Hoy las historias provienen de fixtures demo validadas contra
// PublicationToWebPayload. Cuando PUB real exista, sólo este módulo cambia.

import { demoStories } from '../data/demo-articles.js';
import { demoHomeComposition } from '../data/demo-home.js';
import { resolveHome } from './composition.js';
import { editionInstant } from './queries.js';

export const site = {
  stories: demoStories,
  home: resolveHome(demoStories, demoHomeComposition),
  editionInstant: editionInstant(demoStories)
} as const;
