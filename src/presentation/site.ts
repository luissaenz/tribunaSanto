// WEB.2/WEB.3 — Punto único de entrada de datos a la web.
//
// Hoy las historias provienen de fixtures demo validadas contra
// PublicationToWebPayload. Cuando PUB real exista, sólo este módulo cambia.

import { demoStories } from '../data/demo-articles.js';
import { replicaHomeComposition } from '../data/demo-home.js';
import { resolveReplicaHome } from './composition.js';
import { editionInstant } from './queries.js';

export const site = {
  stories: demoStories,
  home: resolveReplicaHome(demoStories, replicaHomeComposition),
  editionInstant: editionInstant(demoStories)
} as const;
