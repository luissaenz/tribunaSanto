// DEMO ONLY:
// All editorial copy in this module is fictional and exists only to evaluate WEB.1/WEB.2.
// It must never be treated as factual input, claims, source material, or domain knowledge.
// People, quotes, matches and transfers mentioned here do not exist.

import {
  PublicationToWebPayloadSchema,
  type PublicationToWebPayload
} from '../contracts/index.js';
import {
  joinStories,
  type StoryImage,
  type StoryPresentation,
  type WebStory
} from '../presentation/story.js';
import type { SectionId, TopicId } from '../presentation/taxonomy.js';

type DemoArticleInput = Readonly<{
  headline: string;
  dek?: string;
  body: string;
  publishedAt: string;
  modifiedAt?: string;
}>;

function demoArticle(n: number, input: DemoArticleInput): PublicationToWebPayload {
  const suffix = String(n).padStart(3, '0');
  return PublicationToWebPayloadSchema.parse({
    articleRef: `018f1000-0000-7000-8000-000000000${suffix}`,
    articleRevisionRef: `018f1000-0000-7000-8000-000000000${String(n + 100).padStart(3, '0')}`,
    byline: 'Tribuna Santo',
    modifiedAt: input.publishedAt,
    ...input
  });
}

export const demoArticles: readonly PublicationToWebPayload[] = [
  demoArticle(101, {
    headline: 'La Ciudadela se prepara para una semana clave',
    dek: 'El plantel intensifica el trabajo mientras el cuerpo técnico prueba variantes para afrontar un nuevo desafío.',
    body: `La actividad se concentra nuevamente alrededor de La Ciudadela. En este escenario editorial de demostración, el plantel atraviesa una semana de trabajo intenso, con ejercicios tácticos y movimientos orientados a ajustar el funcionamiento colectivo antes del próximo compromiso.

## El plan de trabajo

El cuerpo técnico distribuye las tareas entre bloques de presión, circulación de pelota y movimientos sin balón. La intención es ampliar alternativas sin perder la identidad competitiva que el equipo busca sostener durante la temporada.

> La idea es llegar al partido con más de una respuesta preparada.
> — Integrante ficticio del cuerpo técnico

## Lo que se vive afuera

Puertas afuera, el clima también empieza a crecer. La expectativa alrededor del equipo vuelve a ocupar el centro de la conversación y la semana promete dejar señales sobre las decisiones que pueden marcar el próximo partido.`,
    publishedAt: '2026-10-02T12:00:00-03:00',
    modifiedAt: '2026-10-02T12:20:00-03:00'
  }),
  demoArticle(102, {
    headline: 'El cuerpo técnico ensaya variantes en la mitad de la cancha',
    dek: 'La práctica dejó nuevas asociaciones y alternativas para modificar el ritmo del equipo.',
    body: `La mitad de la cancha fue uno de los sectores con mayor movimiento durante la práctica. El ensayo ficticio utilizado para esta demostración mostró distintas combinaciones entre recuperación, primer pase y llegada desde segunda línea.

## Dos ritmos posibles

La búsqueda apunta a disponer de más de una respuesta para escenarios de partido diferentes. Algunos bloques priorizaron posesiones largas y otros aceleraron la transición apenas recuperada la pelota.

La definición de nombres queda fuera de esta demostración, pero la estructura permite observar cómo una noticia táctica breve puede convivir en la portada con una historia principal de mayor desarrollo.`,
    publishedAt: '2026-10-02T11:15:00-03:00'
  }),
  demoArticle(103, {
    headline: 'Los juveniles ganan espacio y empujan desde abajo',
    dek: 'La estructura formativa aparece cada vez más cerca del trabajo cotidiano del plantel principal.',
    body: `El vínculo entre inferiores y plantel principal ocupa un lugar creciente dentro de esta historia ficticia de demostración. Varios juveniles participan de ejercicios compartidos y encuentran una oportunidad para adaptarse a otra velocidad de juego.

Para el cuerpo técnico, esos entrenamientos permiten observar respuestas bajo mayor presión y detectar características que puedan resultar útiles en distintos momentos de la temporada.

Para el club, la aparición de futbolistas formados en casa también fortalece una narrativa reconocible: pertenencia, desarrollo y la posibilidad de construir recursos deportivos desde la propia estructura.`,
    publishedAt: '2026-10-02T10:25:00-03:00'
  }),
  demoArticle(104, {
    headline: 'La Ciudadela prepara otra jornada de color y expectativa',
    dek: 'La previa vuelve a reunir camisetas, banderas y rituales alrededor del estadio.',
    body: `Las horas previas a un partido también forman parte de la experiencia que rodea al club. Esta pieza ficticia permite probar una noticia enfocada menos en lo táctico y más en el vínculo entre San Martín, su estadio y sus hinchas.

Banderas, camisetas y puntos de encuentro construyen una escena que empieza mucho antes del inicio. Para un medio centrado en el club, ese contexto puede convivir con información deportiva, institucional y de plantel.

WEB.1 utiliza esta historia únicamente para comprobar que la portada soporta registros editoriales diferentes sin perder una jerarquía visual coherente.`,
    publishedAt: '2026-10-02T09:40:00-03:00'
  }),
  demoArticle(105, {
    headline: 'Trabajo vespertino con pelota y bloques de presión',
    dek: 'La jornada combinó ejercicios cortos, circulación rápida y movimientos coordinados.',
    body: `El entrenamiento ficticio de esta demostración estuvo dividido en estaciones de trabajo cortas. La pelota tuvo protagonismo desde el inicio y los ejercicios aumentaron progresivamente la presión sobre quien debía resolver.

En el tramo final aparecieron secuencias colectivas destinadas a coordinar movimientos entre líneas. La nota funciona como ejemplo de una actualización breve y cronológica dentro del bloque de últimas noticias.`,
    publishedAt: '2026-10-02T08:55:00-03:00'
  }),
  demoArticle(106, {
    headline: 'El club ordena una agenda cargada dentro y fuera de la cancha',
    dek: 'Actividad deportiva e institucional conviven en una semana con varios frentes abiertos.',
    body: `La actividad de un club no termina en el entrenamiento del plantel profesional. Esta historia ficticia incorpora una dimensión institucional para comprobar que Tribuna Santo puede organizar contenidos de distinta naturaleza dentro de una misma experiencia editorial.

Reuniones, planificación de actividades y coordinación interna forman parte del escenario de muestra. No representan acontecimientos reales: sirven exclusivamente para probar el tratamiento visual de una noticia institucional.`,
    publishedAt: '2026-10-02T08:10:00-03:00'
  }),
  demoArticle(107, {
    headline: 'Las claves que marcarán la semana del Santo',
    dek: 'Entrenamientos, decisiones tácticas y movimiento alrededor del club componen la agenda de los próximos días.',
    body: `La agenda ficticia de esta demostración reúne distintos focos de atención: el trabajo del plantel, las decisiones que surjan de las prácticas y la actividad cotidiana que rodea al club.

La intención editorial es ofrecer una lectura rápida de temas que después pueden desarrollarse en historias independientes. En la portada, esta pieza ocupa el nivel de actualización breve y ayuda a probar densidad sin competir visualmente con la noticia principal.`,
    publishedAt: '2026-10-02T07:30:00-03:00'
  }),
  demoArticle(108, {
    headline: 'Una práctica a puertas cerradas para ajustar la pelota parada',
    dek: 'Córners, tiros libres y salidas cortas ocuparon la última parte del entrenamiento ficticio.',
    body: `La pelota parada volvió a ocupar un lugar central en esta práctica de demostración. El trabajo se repartió entre situaciones ofensivas y defensivas, con repeticiones cortas y correcciones inmediatas.

## Ensayo y corrección

Cada secuencia terminaba con una breve charla grupal. La nota sirve para probar cómo una pieza táctica corta se integra a un bloque de sección con varias historias del mismo tema.`,
    publishedAt: '2026-10-01T18:40:00-03:00'
  }),
  demoArticle(109, {
    headline: 'El club evalúa reforzar la última línea antes del cierre del libro de pases',
    dek: 'La dirigencia analiza perfiles defensivos sin descuidar el equilibrio del presupuesto.',
    body: `Esta historia ficticia plantea un escenario típico de mercado: la búsqueda de un refuerzo para la defensa. No menciona nombres ni operaciones reales.

## Perfiles en estudio

El análisis contempla características físicas, experiencia y adaptación al estilo de juego. También pesa la posibilidad de sumar alternativas sin bloquear el crecimiento de los juveniles.

> Cualquier incorporación tiene que sumar desde el primer día.
> — Dirigente ficticio

El bloque Mercado de la portada permite comprobar cómo conviven una nota principal y varias actualizaciones breves sobre un mismo frente.`,
    publishedAt: '2026-10-01T17:10:00-03:00'
  }),
  demoArticle(110, {
    headline: 'Tres perfiles en carpeta para el mediocampo',
    dek: 'La secretaría técnica ordena prioridades para una posición con mucha competencia.',
    body: `En este escenario de demostración, la secretaría técnica trabaja con una lista corta de perfiles para el mediocampo. La información no corresponde a negociaciones reales.

La prioridad, según la historia ficticia, es sumar dinámica sin perder control de la pelota.`,
    publishedAt: '2026-10-01T13:20:00-03:00'
  }),
  demoArticle(111, {
    headline: 'Un préstamo que vuelve y otro que se analiza',
    dek: 'Movimientos de ida y vuelta completan el panorama del plantel.',
    body: `Los préstamos forman parte de la planificación de cualquier plantel. Esta pieza ficticia describe un regreso y una posible salida para sumar minutos en otro club.

La nota existe para probar tarjetas compactas dentro del bloque de mercado.`,
    publishedAt: '2026-09-30T19:00:00-03:00'
  }),
  demoArticle(112, {
    headline: 'Cómo se decide una incorporación: el recorrido interno',
    dek: 'Del pedido del cuerpo técnico a la firma, un proceso con varias etapas.',
    body: `Una incorporación atraviesa varias etapas antes de concretarse. Esta explicación ficticia ordena el recorrido habitual: pedido deportivo, evaluación económica, negociación y revisión médica.

## Etapas

Cada etapa involucra a áreas distintas del club. La historia funciona como nota explicativa, un formato frecuente en medios deportivos.`,
    publishedAt: '2026-09-29T16:45:00-03:00'
  }),
  demoArticle(113, {
    headline: 'La Reserva sostiene su idea de juego en cada presentación',
    dek: 'El equipo alternativo mantiene una identidad reconocible y suma rodaje.',
    body: `La Reserva cumple un rol de transición entre las inferiores y la Primera. En esta historia ficticia, el equipo mantiene una idea de juego asociada y con presión alta.

El texto sirve para probar el bloque de titulares sin imagen dentro de la sección Juveniles.`,
    publishedAt: '2026-10-01T15:30:00-03:00'
  }),
  demoArticle(114, {
    headline: 'Las categorías menores suman una nueva jornada de captación',
    dek: 'Chicos de distintos barrios participaron de una prueba abierta de demostración.',
    body: `La captación de talentos es una tarea permanente. Esta pieza ficticia describe una jornada abierta con chicos de distintas edades y zonas de la provincia.

La historia no refiere a hechos reales y se utiliza para probar densidad en la sección Juveniles.`,
    publishedAt: '2026-09-30T11:00:00-03:00'
  }),
  demoArticle(115, {
    headline: 'El predio de entrenamiento suma mejoras para las inferiores',
    dek: 'Vestuarios y campos auxiliares forman parte del plan de demostración.',
    body: `La infraestructura condiciona el desarrollo de las divisiones formativas. Esta nota ficticia enumera mejoras en vestuarios y campos auxiliares.

Su función es completar el bloque de sección con una historia de tono institucional-deportivo.`,
    publishedAt: '2026-09-28T12:15:00-03:00'
  }),
  demoArticle(116, {
    headline: 'Los socios podrán actualizar sus datos desde un nuevo canal',
    dek: 'El club simplifica un trámite frecuente para la masa societaria.',
    body: `En este escenario ficticio, el club habilita un canal para que los socios actualicen sus datos. La medida apunta a reducir filas y demoras.

La nota prueba una historia institucional breve dentro del bloque Club.`,
    publishedAt: '2026-10-01T10:05:00-03:00'
  }),
  demoArticle(117, {
    headline: 'La comisión directiva presentó su plan de obras',
    dek: 'Prioridades de infraestructura para los próximos meses.',
    body: `La comisión directiva ficticia de esta demostración presentó un plan de obras con prioridades de corto y mediano plazo.

## Prioridades

El orden de las obras responde a criterios de seguridad, uso cotidiano y costos. Ningún dato corresponde a decisiones reales del club.`,
    publishedAt: '2026-09-30T20:30:00-03:00'
  }),
  demoArticle(118, {
    headline: 'Actividades sociales para toda la familia en la sede',
    dek: 'Talleres y propuestas recreativas completan la agenda del mes.',
    body: `Un club también es un espacio social. Esta historia ficticia reúne propuestas recreativas y talleres abiertos a la familia de socios e hinchas.

Se utiliza para probar listas compactas con fecha en la columna lateral.`,
    publishedAt: '2026-09-29T09:30:00-03:00'
  }),
  demoArticle(119, {
    headline: 'Los accesos al estadio tendrán nueva señalización',
    dek: 'El objetivo es ordenar el ingreso en los días de partido.',
    body: `La experiencia de los hinchas empieza en la llegada al estadio. Esta nota ficticia describe una nueva señalización para ordenar accesos y circulación.

Sirve para completar el bloque La Ciudadela con una historia de servicio.`,
    publishedAt: '2026-10-01T12:40:00-03:00'
  }),
  demoArticle(120, {
    headline: 'Una bandera que recorre generaciones',
    dek: 'Relato ficticio sobre los símbolos que pasan de mano en mano en la tribuna.',
    body: `Los símbolos de una hinchada tienen historias propias. Este relato ficticio sigue el recorrido de una bandera imaginaria a lo largo de distintas generaciones.

> En la tribuna nadie es dueño de nada: todo se cuida para el que viene.
> — Hincha ficticio

La pieza prueba el tratamiento de citas dentro del cuerpo de una nota de color.`,
    publishedAt: '2026-09-30T15:10:00-03:00'
  }),
  demoArticle(121, {
    headline: 'Recomendaciones para la próxima fecha en casa',
    dek: 'Horarios sugeridos, accesos y servicios para los hinchas.',
    body: `Esta guía ficticia reúne recomendaciones prácticas para quienes asisten al estadio: llegar con anticipación, respetar los accesos asignados y consultar canales oficiales.

Es un ejemplo de nota de servicio que la portada puede jerarquizar en días de partido.`,
    publishedAt: '2026-09-29T18:20:00-03:00'
  }),
  demoArticle(122, {
    headline: 'Postales de una tarde inolvidable en La Ciudadela',
    dek: 'Reconstrucción ficticia de un partido que quedó en la memoria colectiva.',
    body: `La memoria de un club se construye con relatos. Esta reconstrucción ficticia evoca una tarde imaginaria en La Ciudadela para probar el formato de nota histórica.

## El contexto

Ningún dato pertenece a la historia real del club: fechas, rivales y protagonistas se omiten deliberadamente.`,
    publishedAt: '2026-09-30T08:00:00-03:00'
  }),
  demoArticle(123, {
    headline: 'Los colores del club y su lugar en la identidad tucumana',
    dek: 'Un ensayo ficticio sobre pertenencia, barrio y camiseta.',
    body: `La identidad de un club excede lo deportivo. Este ensayo ficticio reflexiona sobre la relación entre colores, barrio y pertenencia.

El texto se utiliza para probar la sección Memoria con un registro más reflexivo.`,
    publishedAt: '2026-09-29T11:45:00-03:00'
  }),
  demoArticle(124, {
    headline: 'Archivo: cómo se contaba un partido en la radio',
    dek: 'Una mirada ficticia a las formas de relatar fútbol antes de la televisión.',
    body: `Antes de la televisión, la radio construía la imagen del partido. Esta nota de archivo ficticia describe ese oficio y su vínculo con los hinchas.

Sirve para completar el bloque de sección con una tercera historia de memoria.`,
    publishedAt: '2026-09-28T17:00:00-03:00'
  })
];

const IMAGES = {
  ciudadela: '/demo/ciudadela.svg',
  entrenamiento: '/demo/entrenamiento.svg',
  hinchada: '/demo/hinchada.svg',
  institucional: '/demo/institucional.svg',
  juveniles: '/demo/juveniles.svg',
  memoria: '/demo/memoria.svg',
  mercado: '/demo/mercado.svg',
  tactica: '/demo/tactica.svg'
} as const;

const image = (key: keyof typeof IMAGES, alt: string): StoryImage => ({
  src: IMAGES[key],
  alt,
  width: 800,
  height: 450
});

const presentationInputs: ReadonlyArray<
  readonly [number, string, SectionId, readonly TopicId[], StoryImage]
> = [
  [101, 'semana-clave-en-la-ciudadela', 'primera', ['entrenamiento', 'cuerpo-tecnico', 'agenda'], image('ciudadela', 'Ilustración editorial de La Ciudadela')],
  [102, 'variantes-en-el-mediocampo', 'primera', ['tactica', 'cuerpo-tecnico'], image('tactica', 'Ilustración de una pizarra táctica con movimientos en el mediocampo')],
  [103, 'juveniles-ganan-espacio', 'juveniles', ['inferiores', 'entrenamiento'], image('juveniles', 'Ilustración editorial de futbolistas juveniles')],
  [104, 'la-ciudadela-prepara-su-color', 'ciudadela', ['hinchas', 'estadio'], image('hinchada', 'Ilustración editorial de tribunas con hinchas')],
  [105, 'trabajo-vespertino-con-pelota', 'primera', ['entrenamiento'], image('entrenamiento', 'Ilustración editorial de una sesión de entrenamiento')],
  [106, 'agenda-del-club', 'club', ['agenda', 'socios'], image('institucional', 'Ilustración editorial de la sede de un club')],
  [107, 'claves-de-la-semana-del-santo', 'primera', ['agenda', 'cuerpo-tecnico'], image('ciudadela', 'Ilustración editorial del estadio de San Martín')],
  [108, 'practica-de-pelota-parada', 'primera', ['entrenamiento', 'tactica'], image('tactica', 'Ilustración de una pizarra con jugadas de pelota parada')],
  [109, 'refuerzo-para-la-ultima-linea', 'mercado', ['refuerzos'], image('mercado', 'Ilustración de un contrato y una flecha de transferencia')],
  [110, 'perfiles-para-el-mediocampo', 'mercado', ['refuerzos', 'tactica'], image('mercado', 'Ilustración de documentos de evaluación de jugadores')],
  [111, 'prestamos-de-ida-y-vuelta', 'mercado', ['refuerzos'], image('mercado', 'Ilustración de un documento de préstamo')],
  [112, 'como-se-decide-una-incorporacion', 'mercado', ['refuerzos', 'cuerpo-tecnico'], image('institucional', 'Ilustración de la sede donde se decide una incorporación')],
  [113, 'la-reserva-sostiene-su-idea', 'juveniles', ['inferiores', 'tactica'], image('juveniles', 'Ilustración de futbolistas de la Reserva')],
  [114, 'jornada-de-captacion', 'juveniles', ['inferiores'], image('juveniles', 'Ilustración de chicos en una prueba de fútbol')],
  [115, 'mejoras-en-el-predio', 'juveniles', ['inferiores', 'entrenamiento'], image('entrenamiento', 'Ilustración de un campo auxiliar de entrenamiento')],
  [116, 'nuevo-canal-para-socios', 'club', ['socios'], image('institucional', 'Ilustración de la sede social del club')],
  [117, 'plan-de-obras', 'club', ['socios', 'estadio'], image('institucional', 'Ilustración de un plan de obras institucional')],
  [118, 'actividades-sociales-en-la-sede', 'club', ['socios', 'agenda'], image('institucional', 'Ilustración de la sede con actividades sociales')],
  [119, 'nueva-senalizacion-en-accesos', 'ciudadela', ['estadio', 'hinchas'], image('ciudadela', 'Ilustración de los accesos al estadio')],
  [120, 'una-bandera-que-recorre-generaciones', 'ciudadela', ['hinchas', 'historia'], image('hinchada', 'Ilustración de una bandera en la tribuna')],
  [121, 'recomendaciones-para-la-fecha', 'ciudadela', ['estadio', 'agenda'], image('hinchada', 'Ilustración de hinchas llegando al estadio')],
  [122, 'postales-de-una-tarde-inolvidable', 'memoria', ['historia', 'estadio'], image('memoria', 'Ilustración con los colores del club en clave histórica')],
  [123, 'los-colores-y-la-identidad', 'memoria', ['historia', 'hinchas'], image('memoria', 'Ilustración de franjas con los colores del club')],
  [124, 'como-se-contaba-un-partido-en-la-radio', 'memoria', ['historia'], image('memoria', 'Ilustración de archivo con estética histórica')]
];

const refFor = (n: number) => {
  const article = demoArticles.find((a) => a.articleRef.endsWith(String(n).padStart(3, '0')));
  if (!article) throw new Error(`Unknown demo article ${n}`);
  return article.articleRef;
};

export const demoPresentation: readonly StoryPresentation[] = presentationInputs.map(
  ([n, demoId, sectionId, topicIds, img]) => ({
    articleRef: refFor(n),
    demoId,
    sectionId,
    topicIds,
    image: img
  })
);

export const demoStories: readonly WebStory[] = joinStories(demoArticles, demoPresentation);

/** Atajo para fixtures: referencia de artículo demo por número correlativo. */
export const demoRef = refFor;
