// DEMO ONLY: contenido de las páginas institucionales de la web demo (WEB.3).
// Cifras, premios, personas, puestos y direcciones son ficticios.

import type { StoryImage } from '../presentation/story.js';
import type { IconName } from '../presentation/icons.js';
import type { SocialLink } from './demo-authors.js';

export type Segment = string | Readonly<{ strong: string }> | Readonly<{ link: string; href: string }>;

export type LegalBlock =
  | Readonly<{ type: 'p'; segments: readonly Segment[] }>
  | Readonly<{ type: 'h2' | 'h3'; text: string }>
  | Readonly<{ type: 'ul'; items: ReadonlyArray<readonly Segment[]> }>;

export type HeroData = Readonly<{ badge: string; icon: IconName; title: string; lead: string; background: string }>;

const bg = (name: string) => `/demo/img/fondo-${name}.svg`;
const img = (src: StoryImage['src'], alt: string, width = 800, height = 533): StoryImage => ({ src, alt, width, height });

export const about = {
  hero: { badge: 'Quiénes somos', icon: 'newspaper', title: 'Acerca de Tribuna Santo', lead: 'Periodismo deportivo de demostración. Primero los hechos, siempre.', background: bg('acerca') } satisfies HeroData,
  mission: {
    title: 'Nuestra misión',
    paragraphs: [
      'Tribuna Santo es una web demo que ensaya cómo contar la actualidad de un club con rigor, cercanía y una lectura clara en cualquier pantalla.',
      'No perseguimos clics ni exageramos. En esta demostración, cada pieza ficticia existe para evaluar jerarquía, composición y navegación.',
      'De la previa al archivo histórico, el objetivo es que cada hincha encuentre contexto, datos y relato en un mismo lugar.'
    ],
    image: img('/demo/img/oficina.svg', 'Ilustración de una redacción'),
    badge: 'Desde 2026'
  },
  stats: [
    { value: '40', label: 'Notas publicadas' },
    { value: '6', label: 'Secciones activas' },
    { value: '24', label: 'Temas cubiertos' },
    { value: '4', label: 'Periodistas imaginarios' }
  ],
  teamTitle: 'Equipo editorial',
  team: [
    { name: 'Valentina Ruiz', role: 'Jefa de redacción (ficticia)', bio: 'Coordina la agenda diaria y la jerarquía de portada en esta demo.', image: img('/demo/img/equipo-1.svg', 'Retrato ilustrado de Valentina Ruiz (persona ficticia)', 400, 400) },
    { name: 'Diego Paz', role: 'Editor general (ficticio)', bio: 'Revisa cada nota demo antes de su publicación provisional.', image: img('/demo/img/equipo-2.svg', 'Retrato ilustrado de Diego Paz (persona ficticia)', 400, 400) },
    { name: 'Camila Sosa', role: 'Editora de fotografía (ficticia)', bio: 'Define el tratamiento visual de portadas y galerías demo.', image: img('/demo/img/equipo-3.svg', 'Retrato ilustrado de Camila Sosa (persona ficticia)', 400, 400) },
    { name: 'Joaquín Herrera', role: 'Editor de datos (ficticio)', bio: 'Prepara el terreno para estadísticas y gráficos en próximos arcos.', image: img('/demo/img/equipo-4.svg', 'Retrato ilustrado de Joaquín Herrera (persona ficticia)', 400, 400) }
  ],
  teamSocials: [
    { network: 'twitter-x', label: 'X', url: 'https://example.invalid/twitter-x/equipo' },
    { network: 'linkedin', label: 'LinkedIn', url: 'https://example.invalid/linkedin/equipo' }
  ] satisfies readonly SocialLink[],
  historyTitle: 'Nuestra historia',
  timeline: [
    { year: '2026', title: 'Primera demo', text: 'La web demo nace para ensayar la experiencia editorial completa.', aside: 'El comienzo de algo más grande.' },
    { year: '2026', title: 'Réplica de referencia', text: 'Se reconstruye la experiencia de un golden master con identidad propia.', aside: 'Cada detalle cuenta.' },
    { year: '2027', title: 'Datos deportivos', text: 'Próximos arcos sumarán fixture, tabla y estadísticas reales.', aside: 'Información para cada hincha.' },
    { year: 'Hoy', title: 'Demo en evolución', text: 'Contenido ficticio, navegación completa y diseño responsive.', aside: 'La historia continúa.' }
  ],
  awardsTitle: 'Reconocimientos (demo)',
  awards: [
    { title: 'Mención de diseño editorial', org: 'Jurado ficticio · 2026', text: 'Reconocimiento inventado para completar el bloque de la demostración.' },
    { title: 'Premio a la accesibilidad', org: 'Certamen ficticio · 2026', text: 'Distinción de ejemplo: no corresponde a ningún premio real.' },
    { title: 'Mejor cobertura de inferiores', org: 'Asociación ficticia · 2026', text: 'Texto de relleno para evaluar la composición de tarjetas.' }
  ],
  cta: {
    newsletterTitle: 'Mantenete informado',
    newsletterText: 'Sumate al resumen diario de la demo. El formulario no envía datos.',
    newsletterPlaceholder: 'Tu correo electrónico',
    newsletterButton: 'Suscribirme',
    careersTitle: 'Trabajá con nosotros',
    careersText: 'Buscamos perfiles para seguir construyendo la experiencia editorial de Tribuna Santo (búsquedas ficticias).',
    careersButton: 'Ver empleos',
    contactButton: 'Contacto'
  }
} as const;

export const contact = {
  hero: { badge: 'Contacto', icon: 'envelope-paper', title: 'Contactanos', lead: 'Escribile a la redacción, al área comercial o a atención de suscriptores. Formulario demo sin envío.', background: bg('contacto') } satisfies HeroData,
  formTitle: 'Envianos un mensaje',
  subjects: [
    { label: 'Dato o primicia', org: false },
    { label: 'Comunicado de prensa', org: true },
    { label: 'Pedido de corrección', org: false },
    { label: 'Carta de lectores', org: false },
    { label: 'Consulta comercial', org: true },
    { label: 'Atención a suscriptores', org: false },
    { label: 'Propuesta de alianza', org: true },
    { label: 'Consulta general', org: false }
  ],
  sent: { title: 'Mensaje enviado (demo)', text: 'No se envió ningún dato: este formulario es una demostración sin backend.', again: 'Enviar otro' },
  officeTitle: 'Nuestra redacción',
  office: [
    { icon: 'geo-alt-fill', label: 'Dirección (demo)', lines: ['Calle Ficticia 1909', 'San Miguel de Tucumán', 'Argentina'] },
    { icon: 'telephone-fill', label: 'Teléfono (demo)', phone: '+54 381 000-0000', note: 'Lunes a viernes, 9 a 18' },
    { icon: 'clock-fill', label: 'Tiempo de respuesta', lines: ['Dentro de un día hábil'], note: 'Datos urgentes: dentro de 2 horas' }
  ],
  followTitle: 'Seguinos',
  follow: [
    { network: 'twitter-x', label: 'X', handle: '@tribunasanto_demo', url: 'https://example.invalid/twitter-x/tribunasanto' },
    { network: 'facebook', label: 'Facebook', handle: 'Tribuna Santo (demo)', url: 'https://example.invalid/facebook/tribunasanto' },
    { network: 'instagram', label: 'Instagram', handle: '@tribunasanto_demo', url: 'https://example.invalid/instagram/tribunasanto' },
    { network: 'youtube', label: 'YouTube', handle: 'Tribuna Santo (demo)', url: 'https://example.invalid/youtube/tribunasanto' }
  ],
  faqTitle: 'Preguntas frecuentes',
  faq: [
    { q: '¿Cómo pido una corrección sobre una nota publicada?', a: 'En esta demo no hay envío real. En producción se indicará un canal para informar la URL de la nota, el error y la información correcta.' },
    { q: '¿Cómo administro mi suscripción?', a: 'La demo no tiene cuentas de usuario. La gestión de suscripciones llegará en un ciclo futuro.' },
    { q: '¿Puedo compartir o republicar contenido?', a: 'Podés compartir los enlaces libremente. El contenido de la demo es ficticio y no debe republicarse como información real.' },
    { q: '¿Cómo envío un comunicado o un dato?', a: 'Elegí el asunto correspondiente en el formulario demo. En producción habrá un canal confidencial para datos sensibles.' },
    { q: '¿Dónde encuentro las tarifas publicitarias?', a: 'La página de publicidad describe los formatos disponibles en la demo. No hay tarifas reales publicadas.' }
  ]
} as const;

export const careers = {
  hero: { badge: 'Empleos', icon: 'briefcase', title: 'Trabajá con nosotros', lead: 'Búsquedas ficticias de periodismo, tecnología, diseño y área comercial para la demo.', background: bg('empleos') } satisfies HeroData,
  title: 'Búsquedas abiertas',
  departments: [
    { id: 'redaccion', label: 'Redacción', color: 'bg-red-600' },
    { id: 'tecnologia', label: 'Tecnología', color: 'bg-blue-600' },
    { id: 'diseno', label: 'Diseño', color: 'bg-violet-600' },
    { id: 'comercial', label: 'Comercial', color: 'bg-green-700' }
  ],
  types: { 'Tiempo completo': 'bg-black', Contrato: 'bg-gray-500', 'Medio tiempo': 'bg-gray-700' } as Record<string, string>,
  jobs: [
    {
      id: 'periodista-de-investigacion',
      title: 'Periodista de investigación',
      dept: 'redaccion',
      type: 'Tiempo completo',
      location: 'Tucumán / Remoto',
      summary: 'Historias de fondo con datos, documentos y fuentes verificadas (búsqueda ficticia).',
      overview: 'Vas a liderar investigaciones de largo aliento sobre la vida institucional y deportiva del club en esta demo.',
      requirements: ['Experiencia en periodismo de investigación', 'Manejo de datos y documentos', 'Escritura clara y precisa'],
      offers: ['Trabajo híbrido', 'Formación continua', 'Equipo editorial de apoyo']
    },
    {
      id: 'cronista-de-primera',
      title: 'Cronista de Primera',
      dept: 'redaccion',
      type: 'Tiempo completo',
      location: 'Tucumán',
      summary: 'Cobertura diaria del plantel profesional y de cada partido (búsqueda ficticia).',
      requirements: ['Conocimiento del fútbol argentino', 'Disponibilidad fines de semana', 'Redacción ágil'],
      offers: ['Acreditaciones', 'Equipo técnico', 'Plan de carrera']
    },
    {
      id: 'desarrollador-frontend',
      title: 'Desarrollador/a frontend',
      dept: 'tecnologia',
      type: 'Tiempo completo',
      location: 'Remoto',
      summary: 'Construcción de la experiencia web con foco en rendimiento y accesibilidad (búsqueda ficticia).',
      requirements: ['TypeScript', 'Astro o similar', 'Buenas prácticas de accesibilidad'],
      offers: ['Remoto', 'Equipo pequeño', 'Producto propio']
    },
    {
      id: 'periodista-de-datos',
      title: 'Periodista de datos',
      dept: 'redaccion',
      type: 'Contrato',
      location: 'Tucumán / Remoto',
      summary: 'Estadísticas, visualizaciones y contexto numérico para cada nota (búsqueda ficticia).',
      requirements: ['Análisis de datos', 'Visualización', 'Criterio periodístico'],
      offers: ['Proyecto de seis meses', 'Herramientas propias', 'Flexibilidad horaria']
    },
    {
      id: 'disenador-ux-ui',
      title: 'Diseñador/a UX/UI',
      dept: 'diseno',
      type: 'Tiempo completo',
      location: 'Remoto',
      summary: 'Diseño de interfaces editoriales claras en todas las pantallas (búsqueda ficticia).',
      requirements: ['Diseño de interfaces', 'Prototipado', 'Sistemas de diseño'],
      offers: ['Remoto', 'Impacto directo', 'Formación']
    },
    {
      id: 'ejecutivo-comercial',
      title: 'Ejecutivo/a comercial',
      dept: 'comercial',
      type: 'Tiempo completo',
      location: 'Tucumán',
      summary: 'Desarrollo de alianzas y formatos publicitarios (búsqueda ficticia).',
      requirements: ['Experiencia comercial', 'Negociación', 'Conocimiento de medios digitales'],
      offers: ['Comisiones', 'Cartera inicial', 'Capacitación']
    }
  ],
  countLabel: '6 búsquedas abiertas',
  allLabel: 'Todas las áreas',
  overviewTitle: 'Sobre el puesto',
  requirementsTitle: 'Requisitos',
  offersTitle: 'Qué ofrecemos',
  applyLabel: 'Postularme',
  apply: {
    title: 'Postulate',
    intro: 'Para postularte a cualquiera de las búsquedas, completá el formulario demo. No se envían datos ni archivos.',
    stepsTitle: 'Qué sigue',
    steps: [
      { title: 'Revisión de la postulación', text: 'El equipo revisa cada envío dentro de cinco días hábiles (demo).' },
      { title: 'Primera charla', text: 'Una conversación de 30 minutos para conocerte.' },
      { title: 'Prueba breve', text: 'Una tarea corta relacionada con el puesto.' },
      { title: 'Entrevista final y propuesta', text: 'Conocés al equipo y, si hay acuerdo, recibís una propuesta.' }
    ],
    sentTitle: 'Postulación enviada (demo)',
    sentText: 'No se envió ningún dato: este formulario es una demostración sin backend.',
    submit: 'Enviar postulación',
    privacy: 'Al enviar aceptás nuestra'
  }
} as const;

export type LegalDoc = Readonly<{ slug: 'publicidad' | 'privacidad' | 'terminos'; hero: HeroData; updated: string; blocks: readonly LegalBlock[] }>;

const p = (...segments: Segment[]): LegalBlock => ({ type: 'p', segments });
const h2 = (text: string): LegalBlock => ({ type: 'h2', text });
const h3 = (text: string): LegalBlock => ({ type: 'h3', text });
const ul = (...items: Segment[][]): LegalBlock => ({ type: 'ul', items });

export const legalDocs: readonly LegalDoc[] = [
  {
    slug: 'publicidad',
    hero: { badge: 'Publicidad', icon: 'megaphone-fill', title: 'Publicitá con nosotros', lead: 'Formatos display y nativos para llegar a hinchas comprometidos. Información de demostración.', background: bg('legal') },
    updated: 'Última actualización: 1 de octubre de 2026',
    blocks: [
      p('Tribuna Santo es una web demo. Las cifras de audiencia de esta página son ', { strong: 'valores ficticios' }, ' para evaluar la composición.'),
      h2('Por qué publicitar'),
      p('Los lectores de un medio de nicho valoran el contexto y vuelven con frecuencia. Estos son indicadores de ejemplo:'),
      p({ strong: 'Resumen de audiencia (demo):' }),
      ul([{ strong: 'Visitantes únicos mensuales:' }, ' valor ficticio'], [{ strong: 'Páginas vistas mensuales:' }, ' valor ficticio'], [{ strong: 'Suscriptores del newsletter:' }, ' valor ficticio']),
      h2('Formatos'),
      p('Ofrecemos formatos display y nativos pensados para convivir con la lectura.'),
      h3('Display'),
      ul([{ strong: 'Rectángulo mediano (300×250)' }, ' — barra lateral'], [{ strong: 'Leaderboard (728×90)' }, ' — cabecera y mitad de nota'], [{ strong: 'Banner mobile (320×50)' }, ' — pensado para teléfonos']),
      h3('Contenido patrocinado'),
      ul([{ strong: 'Notas patrocinadas' }, ' — siempre rotuladas'], [{ strong: 'Newsletter' }, ' — espacios en el resumen diario']),
      h2('Independencia editorial'),
      p('Toda pieza comercial se identifica de forma visible y se mantiene separada del contenido editorial.'),
      h2('Contacto comercial'),
      ul([{ strong: 'Correo:' }, ' ', { link: 'comercial@example.invalid', href: 'mailto:comercial@example.invalid' }], [{ strong: 'Teléfono:' }, ' +54 381 000-0000 (demo)'])
    ]
  },
  {
    slug: 'privacidad',
    hero: { badge: 'Privacidad', icon: 'shield-lock-fill', title: 'Política de privacidad', lead: 'Cómo trataría Tribuna Santo la información de sus lectores. Texto de demostración.', background: bg('legal') },
    updated: 'Última actualización: 1 de octubre de 2026',
    blocks: [
      p('Esta política es un ', { strong: 'texto de demostración' }, ': la web demo no recolecta datos personales ni utiliza cookies de seguimiento.'),
      h2('1. Información que recolectaríamos'),
      p({ strong: 'Datos que nos das:' }, ' nombre y correo si te suscribieras al newsletter o nos escribieras.'),
      p({ strong: 'Datos automáticos:' }, ' métricas agregadas de lectura para mejorar la cobertura.'),
      h2('2. Cómo usaríamos la información'),
      ul(['Para enviar el newsletter'], ['Para entender qué temas interesan más'], ['Para responder consultas']),
      p('No venderíamos datos personales a terceros.'),
      h2('3. Cookies'),
      p('La demo no utiliza cookies propias ni de terceros.'),
      h2('4. Tus derechos'),
      p('Podrías pedir acceso, corrección o eliminación de tus datos escribiendo a ', { link: 'privacidad@example.invalid', href: 'mailto:privacidad@example.invalid' }, '.'),
      h2('5. Cambios en esta política'),
      p('Cualquier cambio se publicaría en esta página con su fecha de actualización.')
    ]
  },
  {
    slug: 'terminos',
    hero: { badge: 'Términos', icon: 'file-earmark-text-fill', title: 'Términos de uso', lead: 'Condiciones de uso de la web demo de Tribuna Santo.', background: bg('legal') },
    updated: 'Última actualización: 1 de octubre de 2026',
    blocks: [
      p('Al navegar esta web demo aceptás que todo su contenido es ', { strong: 'ficticio' }, ' y existe sólo para evaluar diseño y navegación.'),
      h2('1. Uso del contenido'),
      p('Podés compartir enlaces. No republiques el contenido como información real.'),
      h2('2. Conducta de los lectores'),
      ul(['Respetar a otras personas'], ['No intentar vulnerar el sitio'], ['No usar la marca para suplantar identidades']),
      h2('3. Exactitud'),
      p('Las notas, cifras y personas de la demo no existen. No deben citarse como fuente.'),
      h2('4. Cambios en estos términos'),
      p('Los términos podrían actualizarse; la fecha de la última versión figura al comienzo.')
    ]
  }
];

export const legalDoc = (slug: LegalDoc['slug']): LegalDoc => legalDocs.find((d) => d.slug === slug)!;
