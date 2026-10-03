// DEMO ONLY: datos del chrome del sitio (WEB.3). Los valores sin backend
// (clima, redes, newsletter, publicidad) son ficticios y se rotulan como demo.

import type { StoryImage } from '../presentation/story.js';
import { routes } from '../presentation/routes.js';
import type { SocialLink } from './demo-authors.js';

export const siteChrome = {
  name: 'Tribuna Santo',
  tagline: 'Pasión · Identidad · Historia albirroja',
  /** Clima DEMO: valor fijo, no proviene de un servicio meteorológico. */
  weather: 'Clima demo: 25 °C',
  logo: { src: '/demo/img/logo.svg', alt: 'Escudo ilustrado de Tribuna Santo', width: 96, height: 96 } satisfies StoryImage,
  footer: {
    title: 'TRIBUNA SANTO',
    description: 'Web demo de un medio deportivo dedicado a San Martín de Tucumán. Contenido ficticio de demostración.',
    categoriesTitle: 'Secciones',
    pagesTitle: 'Institucional',
    newsletterTitle: 'NEWSLETTER',
    newsletterLead: 'Recibí cada mañana el resumen de la jornada (demo, sin envío).',
    newsletterPlaceholder: 'Tu correo electrónico',
    newsletterButton: 'Suscribirme',
    copyright: '© 2026 Tribuna Santo. Contenido demo ficticio.'
  },
  /** Columna "Institucional" del pie. */
  footerPages: [
    { label: 'Acerca de', href: routes.about() },
    { label: 'Contacto', href: routes.contact() },
    { label: 'Empleos', href: routes.careers() },
    { label: 'Publicidad', href: routes.advertise() },
    { label: 'Privacidad', href: routes.privacy() },
    { label: 'Términos de uso', href: routes.terms() }
  ],
  socials: [
    { network: 'facebook', label: 'Facebook', url: 'https://example.invalid/facebook/tribunasanto' },
    { network: 'twitter-x', label: 'X', url: 'https://example.invalid/twitter-x/tribunasanto' },
    { network: 'instagram', label: 'Instagram', url: 'https://example.invalid/instagram/tribunasanto' },
    { network: 'youtube', label: 'YouTube', url: 'https://example.invalid/youtube/tribunasanto' }
  ] satisfies readonly SocialLink[],
  ad: {
    src: '/demo/img/publicidad-300x250.svg',
    alt: 'Espacio publicitario de demostración 300×250',
    width: 300,
    height: 250
  } satisfies StoryImage
} as const;
