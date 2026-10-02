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
