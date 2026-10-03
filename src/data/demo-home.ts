// DEMO ONLY: composición de portada de la web demo de WEB.2.
// Referencia artículos sólo por articleRef: no duplica ningún texto del payload.

import type { HomeComposition, ReplicaHomeComposition } from '../presentation/composition.js';
import { demoRef } from './demo-articles.js';

export const demoHomeComposition: HomeComposition = {
  lead: demoRef(101),
  trending: [demoRef(109), demoRef(103), demoRef(119), demoRef(102)],
  picks: [demoRef(112), demoRef(120), demoRef(117)],
  visual: [demoRef(104), demoRef(122)],
  primaryBand: [
    { sectionId: 'primera', variant: 'feature-list' },
    { sectionId: 'mercado', variant: 'feature-tiles' },
    { sectionId: 'juveniles', variant: 'list-feature' },
    { sectionId: 'club', variant: 'feature-list' }
  ],
  secondaryBand: [
    { sectionId: 'ciudadela', variant: 'feature-list' },
    { sectionId: 'memoria', variant: 'headline-grid' }
  ],
  latestCount: 9
};

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
