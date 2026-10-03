// DEMO ONLY: composición de portada de la web demo (réplica WEB.3).
// Referencia artículos sólo por articleRef: no duplica ningún texto del payload.

import type { ReplicaHomeComposition } from '../presentation/composition.js';
import { demoRef } from './demo-articles.js';

/** DEMO ONLY: composición de la portada réplica de WEB.3. */
export const replicaHomeComposition: ReplicaHomeComposition = {
  heroSlides: [demoRef(101), demoRef(109), demoRef(119)],
  trending: [demoRef(102), demoRef(103), demoRef(104), demoRef(106)],
  band2: { a: 'primera', b: 'mercado', c: 'juveniles', d: 'club' },
  popular: [demoRef(110), demoRef(120), demoRef(113)],
  sidebarSection: 'memoria',
  photos: [demoRef(105), demoRef(117)],
  band3: ['ciudadela', 'memoria'],
  latestCount: 9
};
