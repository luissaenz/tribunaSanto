// DEMO ONLY: composición de portada para la web demo de WEB.2.

import type { HomeComposition } from '../presentation/composition.js';
import { demoRef } from './demo-articles.js';

export const demoHomeComposition: HomeComposition = {
  lead: demoRef(101),
  trending: [demoRef(109), demoRef(103), demoRef(119), demoRef(102)],
  picks: [demoRef(112), demoRef(120), demoRef(117)],
  visual: [demoRef(104), demoRef(122)],
  primaryBand: [
    { sectionId: 'primera', variant: 'feature-list' },
    { sectionId: 'mercado', variant: 'feature-quad' },
    { sectionId: 'juveniles', variant: 'headline-grid' },
    { sectionId: 'club', variant: 'list-feature' }
  ],
  secondaryBand: [
    { sectionId: 'ciudadela', variant: 'feature-list' },
    { sectionId: 'memoria', variant: 'feature-list' }
  ],
  latestCount: 9
};
