// DEMO ONLY:
// All editorial copy in this module is fictional and exists only to evaluate WEB.1.
// It must never be treated as factual input, claims, source material, or domain knowledge.

import {
  PublicationToWebPayloadSchema,
  type PublicationToWebPayload
} from '../contracts/index.js';

export type DemoStoryRole =
  | 'lead'
  | 'secondary'
  | 'latest';

export type DemoStoryPresentation = Readonly<{
  articleRef: PublicationToWebPayload['articleRef'];
  demoId: string;
  role: DemoStoryRole;
  provisionalTag: string;
  image: Readonly<{
    src: string;
    alt: string;
  }>;
}>;

export type DemoStory = Readonly<{
  article: PublicationToWebPayload;
  presentation: DemoStoryPresentation;
}>;

const rawArticle1 = {
  articleRef: '018f1000-0000-7000-8000-000000000101',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000201',
  headline: 'La Ciudadela se prepara para una semana clave',
  dek: 'El plantel intensifica el trabajo mientras el cuerpo técnico prueba variantes para afrontar un nuevo desafío.',
  body: `La actividad se concentra nuevamente alrededor de La Ciudadela. En este escenario editorial de demostración, el plantel atraviesa una semana de trabajo intenso, con ejercicios tácticos y movimientos orientados a ajustar el funcionamiento colectivo antes del próximo compromiso.

El cuerpo técnico distribuye las tareas entre bloques de presión, circulación de pelota y movimientos sin balón. La intención es ampliar alternativas sin perder la identidad competitiva que el equipo busca sostener durante la temporada.

Puertas afuera, el clima también empieza a crecer. La expectativa alrededor del equipo vuelve a ocupar el centro de la conversación y la semana promete dejar señales sobre las decisiones que pueden marcar el próximo partido.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T12:00:00-03:00',
  modifiedAt: '2026-10-02T12:20:00-03:00'
};

const rawArticle2 = {
  articleRef: '018f1000-0000-7000-8000-000000000102',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000202',
  headline: 'El cuerpo técnico ensaya variantes en la mitad de la cancha',
  dek: 'La práctica dejó nuevas asociaciones y alternativas para modificar el ritmo del equipo.',
  body: `La mitad de la cancha fue uno de los sectores con mayor movimiento durante la práctica. El ensayo ficticio utilizado para esta demostración mostró distintas combinaciones entre recuperación, primer pase y llegada desde segunda línea.

La búsqueda apunta a disponer de más de una respuesta para escenarios de partido diferentes. Algunos bloques priorizaron posesiones largas y otros aceleraron la transición apenas recuperada la pelota.

La definición de nombres queda fuera de esta demostración, pero la estructura permite observar cómo una noticia táctica breve puede convivir en la portada con una historia principal de mayor desarrollo.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T11:15:00-03:00',
  modifiedAt: '2026-10-02T11:15:00-03:00'
};

const rawArticle3 = {
  articleRef: '018f1000-0000-7000-8000-000000000103',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000203',
  headline: 'Los juveniles ganan espacio y empujan desde abajo',
  dek: 'La estructura formativa aparece cada vez más cerca del trabajo cotidiano del plantel principal.',
  body: `El vínculo entre inferiores y plantel principal ocupa un lugar creciente dentro de esta historia ficticia de demostración. Varios juveniles participan de ejercicios compartidos y encuentran una oportunidad para adaptarse a otra velocidad de juego.

Para el cuerpo técnico, esos entrenamientos permiten observar respuestas bajo mayor presión y detectar características que puedan resultar útiles en distintos momentos de la temporada.

Para el club, la aparición de futbolistas formados en casa también fortalece una narrativa reconocible: pertenencia, desarrollo y la posibilidad de construir recursos deportivos desde la propia estructura.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T10:25:00-03:00',
  modifiedAt: '2026-10-02T10:25:00-03:00'
};

const rawArticle4 = {
  articleRef: '018f1000-0000-7000-8000-000000000104',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000204',
  headline: 'La Ciudadela prepara otra jornada de color y expectativa',
  dek: 'La previa vuelve a reunir camisetas, banderas y rituales alrededor del estadio.',
  body: `Las horas previas a un partido también forman parte de la experiencia que rodea al club. Esta pieza ficticia permite probar una noticia enfocada menos en lo táctico y más en el vínculo entre San Martín, su estadio y sus hinchas.

Banderas, camisetas y puntos de encuentro construyen una escena que empieza mucho antes del inicio. Para un medio centrado en el club, ese contexto puede convivir con información deportiva, institucional y de plantel.

WEB.1 utiliza esta historia únicamente para comprobar que la portada soporta registros editoriales diferentes sin perder una jerarquía visual coherente.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T09:40:00-03:00',
  modifiedAt: '2026-10-02T09:40:00-03:00'
};

const rawArticle5 = {
  articleRef: '018f1000-0000-7000-8000-000000000105',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000205',
  headline: 'Trabajo vespertino con pelota y bloques de presión',
  dek: 'La jornada combinó ejercicios cortos, circulación rápida y movimientos coordinados.',
  body: `El entrenamiento ficticio de esta demostración estuvo dividido en estaciones de trabajo cortas. La pelota tuvo protagonismo desde el inicio y los ejercicios aumentaron progresivamente la presión sobre quien debía resolver.

En el tramo final aparecieron secuencias colectivas destinadas a coordinar movimientos entre líneas. La nota funciona como ejemplo de una actualización breve y cronológica dentro del bloque de últimas noticias.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T08:55:00-03:00',
  modifiedAt: '2026-10-02T08:55:00-03:00'
};

const rawArticle6 = {
  articleRef: '018f1000-0000-7000-8000-000000000106',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000206',
  headline: 'El club ordena una agenda cargada dentro y fuera de la cancha',
  dek: 'Actividad deportiva e institucional conviven en una semana con varios frentes abiertos.',
  body: `La actividad de un club no termina en el entrenamiento del plantel profesional. Esta historia ficticia incorpora una dimensión institucional para comprobar que Tribuna Santo puede organizar contenidos de distinta naturaleza dentro de una misma experiencia editorial.

Reuniones, planificación de actividades y coordinación interna forman parte del escenario de muestra. No representan acontecimientos reales: sirven exclusivamente para probar el tratamiento visual de una noticia institucional.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T08:10:00-03:00',
  modifiedAt: '2026-10-02T08:10:00-03:00'
};

const rawArticle7 = {
  articleRef: '018f1000-0000-7000-8000-000000000107',
  articleRevisionRef: '018f1000-0000-7000-8000-000000000207',
  headline: 'Las claves que marcarán la semana del Santo',
  dek: 'Entrenamientos, decisiones tácticas y movimiento alrededor del club componen la agenda de los próximos días.',
  body: `La agenda ficticia de esta demostración reúne distintos focos de atención: el trabajo del plantel, las decisiones que surjan de las prácticas y la actividad cotidiana que rodea al club.

La intención editorial es ofrecer una lectura rápida de temas que después pueden desarrollarse en historias independientes. En la portada, esta pieza ocupa el nivel de actualización breve y ayuda a probar densidad sin competir visualmente con la noticia principal.`,
  byline: 'Tribuna Santo',
  publishedAt: '2026-10-02T07:30:00-03:00',
  modifiedAt: '2026-10-02T07:30:00-03:00'
};

export const demoArticles: readonly PublicationToWebPayload[] = [
  PublicationToWebPayloadSchema.parse(rawArticle1),
  PublicationToWebPayloadSchema.parse(rawArticle2),
  PublicationToWebPayloadSchema.parse(rawArticle3),
  PublicationToWebPayloadSchema.parse(rawArticle4),
  PublicationToWebPayloadSchema.parse(rawArticle5),
  PublicationToWebPayloadSchema.parse(rawArticle6),
  PublicationToWebPayloadSchema.parse(rawArticle7)
];

const demoPresentation: readonly DemoStoryPresentation[] = [
  {
    articleRef: demoArticles[0].articleRef,
    demoId: 'semana-clave-en-la-ciudadela',
    role: 'lead',
    provisionalTag: 'San Martín',
    image: {
      src: '/demo/ciudadela.svg',
      alt: 'Ilustración editorial de La Ciudadela'
    }
  },
  {
    articleRef: demoArticles[1].articleRef,
    demoId: 'variantes-en-el-mediocampo',
    role: 'secondary',
    provisionalTag: 'Plantel',
    image: {
      src: '/demo/entrenamiento.svg',
      alt: 'Ilustración editorial de un entrenamiento de fútbol'
    }
  },
  {
    articleRef: demoArticles[2].articleRef,
    demoId: 'juveniles-ganan-espacio',
    role: 'secondary',
    provisionalTag: 'Juveniles',
    image: {
      src: '/demo/juveniles.svg',
      alt: 'Ilustración editorial de futbolistas juveniles'
    }
  },
  {
    articleRef: demoArticles[3].articleRef,
    demoId: 'la-ciudadela-prepara-su-color',
    role: 'secondary',
    provisionalTag: 'La Ciudadela',
    image: {
      src: '/demo/hinchada.svg',
      alt: 'Ilustración editorial de tribunas con hinchas'
    }
  },
  {
    articleRef: demoArticles[4].articleRef,
    demoId: 'trabajo-vespertino-con-pelota',
    role: 'latest',
    provisionalTag: 'Entrenamiento',
    image: {
      src: '/demo/entrenamiento.svg',
      alt: 'Ilustración editorial de una sesión de entrenamiento'
    }
  },
  {
    articleRef: demoArticles[5].articleRef,
    demoId: 'agenda-del-club',
    role: 'latest',
    provisionalTag: 'Institucional',
    image: {
      src: '/demo/institucional.svg',
      alt: 'Ilustración editorial de la sede de un club'
    }
  },
  {
    articleRef: demoArticles[6].articleRef,
    demoId: 'claves-de-la-semana-del-santo',
    role: 'latest',
    provisionalTag: 'Actualidad',
    image: {
      src: '/demo/ciudadela.svg',
      alt: 'Ilustración editorial del estadio de San Martín'
    }
  }
];

if (demoArticles.length !== 7 || demoPresentation.length !== 7) {
  throw new Error('demoArticles and demoPresentation must contain exactly 7 items');
}

const leadCount = demoPresentation.filter((p) => p.role === 'lead').length;
const secondaryCount = demoPresentation.filter((p) => p.role === 'secondary').length;
const latestCount = demoPresentation.filter((p) => p.role === 'latest').length;

if (leadCount !== 1 || secondaryCount !== 3 || latestCount !== 3) {
  throw new Error(
    `demoPresentation must contain exactly 1 lead, 3 secondary, and 3 latest stories (found: ${leadCount}/${secondaryCount}/${latestCount})`
  );
}

const articleRefSet = new Set(demoArticles.map((a) => a.articleRef));
const demoIdSet = new Set(demoPresentation.map((p) => p.demoId));

if (articleRefSet.size !== 7) {
  throw new Error('All demo articleRefs must be unique');
}

if (demoIdSet.size !== 7) {
  throw new Error('All demoIds must be unique');
}

for (const p of demoPresentation) {
  if (!articleRefSet.has(p.articleRef)) {
    throw new Error(`Presentation references unknown articleRef: ${p.articleRef}`);
  }
  if (!p.image.src.startsWith('/demo/')) {
    throw new Error(`Presentation image must start with /demo/: ${p.image.src}`);
  }
}

export const demoStories: readonly DemoStory[] = demoArticles.map((article) => {
  const presentation = demoPresentation.find((p) => p.articleRef === article.articleRef);
  if (!presentation) {
    throw new Error(`Missing presentation for articleRef ${article.articleRef}`);
  }
  return {
    article,
    presentation
  };
});
