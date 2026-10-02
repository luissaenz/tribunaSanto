// DEMO ONLY: composición de portada de la web demo de WEB.2.
// Referencia artículos sólo por articleRef: no duplica ningún texto del payload.

import type { HomeComposition } from '../presentation/composition.js';
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
