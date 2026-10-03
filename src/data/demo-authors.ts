// DEMO ONLY: autores ficticios de la web demo (WEB.3).
// No son personas reales. Se vinculan al artículo por el texto exacto de
// `byline` del payload: el payload no gana campos de presentación.

import type { StoryImage } from '../presentation/story.js';
import { DEMO_BYLINES } from './demo-articles.js';

export type SocialNetwork = 'facebook' | 'twitter-x' | 'linkedin' | 'instagram' | 'youtube';

export type SocialLink = Readonly<{ network: SocialNetwork; label: string; url: string }>;

export type DemoAuthor = Readonly<{
  byline: (typeof DEMO_BYLINES)[number];
  slug: string;
  role: string;
  bio: string;
  avatar: StoryImage;
  socials: readonly SocialLink[];
}>;

const avatar = (file: string, alt: string): StoryImage => ({ src: `/demo/img/${file}.svg`, alt, width: 400, height: 400 });
const demoSocial = (network: SocialNetwork, label: string, handle: string): SocialLink => ({
  network,
  label,
  url: `https://example.invalid/${network}/${handle}`
});

export const demoAuthors: readonly DemoAuthor[] = [
  {
    byline: 'Martina Quiroga',
    slug: 'martina-quiroga',
    role: 'Redactora de Primera',
    bio: 'Perfil ficticio de demostración. Sigue el día a día del plantel profesional, los entrenamientos y las decisiones del cuerpo técnico.',
    avatar: avatar('autor-mq', 'Avatar ilustrado de Martina Quiroga (autora ficticia)'),
    socials: [demoSocial('facebook', 'Facebook', 'mquiroga'), demoSocial('twitter-x', 'X', 'mquiroga'), demoSocial('linkedin', 'LinkedIn', 'mquiroga')]
  },
  {
    byline: 'Lucas Ferreyra',
    slug: 'lucas-ferreyra',
    role: 'Editor de Mercado',
    bio: 'Perfil ficticio de demostración. Cubre altas, bajas, contratos y la estrategia deportiva de cada temporada.',
    avatar: avatar('autor-lf', 'Avatar ilustrado de Lucas Ferreyra (autor ficticio)'),
    socials: [demoSocial('facebook', 'Facebook', 'lferreyra'), demoSocial('twitter-x', 'X', 'lferreyra'), demoSocial('linkedin', 'LinkedIn', 'lferreyra')]
  },
  {
    byline: 'Sofía Medina',
    slug: 'sofia-medina',
    role: 'Cronista de Juveniles',
    bio: 'Perfil ficticio de demostración. Recorre las divisiones formativas, la Reserva y los torneos de inferiores.',
    avatar: avatar('autor-sm', 'Avatar ilustrado de Sofía Medina (autora ficticia)'),
    socials: [demoSocial('facebook', 'Facebook', 'smedina'), demoSocial('twitter-x', 'X', 'smedina'), demoSocial('linkedin', 'LinkedIn', 'smedina')]
  },
  {
    byline: 'Tomás Albarracín',
    slug: 'tomas-albarracin',
    role: 'Cronista de Memoria',
    bio: 'Perfil ficticio de demostración. Escribe sobre la historia del club, su estadio y la vida institucional.',
    avatar: avatar('autor-ta', 'Avatar ilustrado de Tomás Albarracín (autor ficticio)'),
    socials: [demoSocial('twitter-x', 'X', 'talbarracin'), demoSocial('linkedin', 'LinkedIn', 'talbarracin')]
  }
];

export function authorByByline(byline: string): DemoAuthor {
  const author = demoAuthors.find((a) => a.byline === byline);
  if (!author) throw new Error(`Byline sin autor demo: ${byline}`);
  return author;
}
