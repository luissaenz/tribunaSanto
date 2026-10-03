// WEB.2 — Formato de fechas para presentación (zona horaria de Tucumán).

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

const longDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

const shortDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short'
});

const time = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit'
});

const editionDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

export const formatLongDate = (iso: string): string => longDate.format(new Date(iso));
export const formatShortDate = (iso: string): string => shortDate.format(new Date(iso));
export const formatTime = (iso: string): string => time.format(new Date(iso));
export const formatEditionDate = (iso: string): string => editionDate.format(new Date(iso));

// WEB.3 — Fechas de tarjetas ("18 abr 2026") y fecha larga con día ("miércoles, 15 de abril de 2026").
const cardDate = new Intl.DateTimeFormat('es-AR', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

export const formatCardDate = (iso: string): string => {
  const parts = Object.fromEntries(cardDate.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.day} ${String(parts.month).replace('.', '')} ${parts.year}`;
};
export const formatArticleDate = (iso: string): string => {
  const text = editionDate.format(new Date(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
};
