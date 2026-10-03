// DEMO ONLY:
// All editorial copy in this module is fictional and exists only to evaluate WEB.1/WEB.2/WEB.3.
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

/** Firmas DEMO: personas ficticias (ver src/data/demo-authors.ts). */
export const DEMO_BYLINES = ['Martina Quiroga', 'Lucas Ferreyra', 'Sofía Medina', 'Tomás Albarracín'] as const;

/** 101–132 rotan entre las tres primeras firmas; 133–140 corresponden a la cuarta (11/11/10/8). */
const bylineFor = (n: number): string => (n >= 133 ? DEMO_BYLINES[3] : DEMO_BYLINES[(n - 101) % 3]);

function demoArticle(n: number, input: DemoArticleInput): PublicationToWebPayload {
  const suffix = String(n).padStart(3, '0');
  return PublicationToWebPayloadSchema.parse({
    articleRef: `018f1000-0000-7000-8000-000000000${suffix}`,
    articleRevisionRef: `018f1000-0000-7000-8000-000000000${String(n + 100).padStart(3, '0')}`,
    byline: bylineFor(n),
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

## Entrenamientos compartidos

Para el cuerpo técnico, esos entrenamientos permiten observar respuestas bajo mayor presión y detectar características que puedan resultar útiles en distintos momentos de la temporada.

> Cada práctica con la Primera es una clase acelerada.
> — Coordinador ficticio de inferiores

## Una identidad que se construye

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
  }),
  demoArticle(125, {
    headline: 'El arquero titular recupera ritmo tras una semana de controles',
    dek: 'Trabajo diferenciado, controles médicos y una vuelta progresiva a los ejercicios con el grupo.',
    body: `Esta nota ficticia de demostración presenta "el arquero titular recupera ritmo tras una semana de controles" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Trabajo diferenciado

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

> Volver a sentir la pelota en las manos fue el primer objetivo.
> — Entrenador de arqueros ficticio

## La vuelta al grupo

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-27T18:30:00-03:00'
  }),
  demoArticle(126, {
    headline: 'Renovaciones en carpeta: el club ordena los contratos que vencen',
    dek: 'La dirigencia ficticia prioriza continuidad y define plazos para cada conversación.',
    body: `Esta nota ficticia de demostración presenta "renovaciones en carpeta: el club ordena los contratos que vencen" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Prioridades

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Los plazos

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-27T12:10:00-03:00'
  }),
  demoArticle(127, {
    headline: 'Un delantero llega a prueba para la pretemporada',
    dek: 'El cuerpo técnico evaluará su adaptación antes de decidir una incorporación.',
    body: `Esta nota ficticia de demostración presenta "un delantero llega a prueba para la pretemporada" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## El perfil buscado

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Cómo será la evaluación

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-26T19:45:00-03:00'
  }),
  demoArticle(128, {
    headline: 'La Sub-17 cierra su preparación antes del torneo regional',
    dek: 'Doble turno, trabajo físico y una agenda de viaje para la categoría.',
    body: `Esta nota ficticia de demostración presenta "la sub-17 cierra su preparación antes del torneo regional" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Doble turno

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

> El grupo llega con hambre y con orden.
> — Coordinador ficticio de inferiores

## La agenda del viaje

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-26T10:20:00-03:00'
  }),
  demoArticle(129, {
    headline: 'Arqueros de inferiores: una escuela propia en el predio',
    dek: 'Un programa ficticio de formación específica para los puestos bajo los tres palos.',
    body: `Esta nota ficticia de demostración presenta "arqueros de inferiores: una escuela propia en el predio" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## El método

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Seguimiento físico

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-25T17:00:00-03:00'
  }),
  demoArticle(130, {
    headline: 'La Cuarta División viaja con una agenda cargada',
    dek: 'Partidos, entrenamientos y descanso organizados al detalle para el viaje.',
    body: `Esta nota ficticia de demostración presenta "la cuarta división viaja con una agenda cargada" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## El itinerario

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-25T09:15:00-03:00'
  }),
  demoArticle(131, {
    headline: 'Controles médicos para todas las categorías formativas',
    dek: 'El área de salud ficticia completa la evaluación anual de los juveniles.',
    body: `Esta nota ficticia de demostración presenta "controles médicos para todas las categorías formativas" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Qué se evalúa

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Prevención

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-24T16:40:00-03:00'
  }),
  demoArticle(132, {
    headline: 'La Reserva suma minutos y consolida una idea de juego',
    dek: 'El equipo alternativo sostiene el estilo y le da rodaje a los más jóvenes.',
    body: `Esta nota ficticia de demostración presenta "la reserva suma minutos y consolida una idea de juego" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Rodaje y continuidad

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

> La Reserva tiene que parecerse a la Primera.
> — Integrante ficticio del cuerpo técnico

## El mediocampo como eje

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-24T11:30:00-03:00'
  }),
  demoArticle(133, {
    headline: 'Asamblea de socios: el orden del día de la próxima reunión',
    dek: 'Una convocatoria ficticia para repasar balances, obras y actividades.',
    body: `Esta nota ficticia de demostración presenta "asamblea de socios: el orden del día de la próxima reunión" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Temas previstos

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-23T19:00:00-03:00'
  }),
  demoArticle(134, {
    headline: 'La sede renueva sus espacios de encuentro',
    dek: 'Mejoras ficticias en salones, accesos y lugares comunes para los socios.',
    body: `Esta nota ficticia de demostración presenta "la sede renueva sus espacios de encuentro" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Las obras

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Uso de los espacios

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-23T10:00:00-03:00'
  }),
  demoArticle(135, {
    headline: 'Una caravana acompaña al equipo camino al estadio',
    dek: 'La previa ficticia se vive en las calles con banderas y cánticos.',
    body: `Esta nota ficticia de demostración presenta "una caravana acompaña al equipo camino al estadio" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## El recorrido

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

> La caravana es parte del partido.
> — Hincha ficticio

## Cuidados en la previa

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-22T20:15:00-03:00'
  }),
  demoArticle(136, {
    headline: 'La tribuna estrena banderas para la temporada',
    dek: 'Telones y trapos nuevos se suman al color de cada partido en casa.',
    body: `Esta nota ficticia de demostración presenta "la tribuna estrena banderas para la temporada" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Cómo se hicieron

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-22T12:45:00-03:00'
  }),
  demoArticle(137, {
    headline: 'El archivo de fotos del club abre sus cajas',
    dek: 'Un trabajo ficticio de catalogación recupera imágenes de distintas épocas.',
    body: `Esta nota ficticia de demostración presenta "el archivo de fotos del club abre sus cajas" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## La catalogación

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Lo que viene

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-21T18:00:00-03:00'
  }),
  demoArticle(138, {
    headline: 'Camisetas de otras décadas, contadas por sus detalles',
    dek: 'Un repaso ficticio por diseños, escudos y telas que marcaron épocas.',
    body: `Esta nota ficticia de demostración presenta "camisetas de otras décadas, contadas por sus detalles" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Los diseños

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Detalles que vuelven

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-21T09:30:00-03:00'
  }),
  demoArticle(139, {
    headline: 'La primera pretemporada que todos recuerdan',
    dek: 'Un relato ficticio de viajes, cerros y entrenamientos que forjaron un grupo.',
    body: `Esta nota ficticia de demostración presenta "la primera pretemporada que todos recuerdan" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## El viaje

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

> Esa pretemporada nos hizo equipo.
> — Exjugador ficticio

## El legado

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-20T17:20:00-03:00'
  }),
  demoArticle(140, {
    headline: 'El estadio a través del tiempo',
    dek: 'Ampliaciones, tribunas y transformaciones en una historia ficticia de La Ciudadela.',
    body: `Esta nota ficticia de demostración presenta "el estadio a través del tiempo" para completar la densidad editorial de la réplica de la referencia. Ningún dato, nombre ni hecho corresponde a la realidad.

## Las primeras tribunas

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## Las ampliaciones

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

## El estadio de hoy

El desarrollo ficticio describe el contexto, los pasos previstos y las decisiones que acompañan la historia, con la extensión de una nota breve.

El texto sirve sólo para evaluar composición, ritmo de lectura y navegación entre páginas de la web demo.`,
    publishedAt: '2026-09-20T10:00:00-03:00'
  })
];

const IMAGES = {
  estadio: '/demo/img/estadio.svg',
  tactica: '/demo/img/tactica.svg',
  entrenamiento: '/demo/img/entrenamiento.svg',
  hinchada: '/demo/img/hinchada.svg',
  mercado: '/demo/img/mercado.svg',
  institucional: '/demo/img/institucional.svg',
  juveniles: '/demo/img/juveniles.svg',
  memoria: '/demo/img/memoria.svg',
  radio: '/demo/img/radio.svg',
  banderas: '/demo/img/banderas.svg',
  vestuario: '/demo/img/vestuario.svg',
  arquero: '/demo/img/arquero.svg',
  ciudad: '/demo/img/ciudad.svg',
  oficina: '/demo/img/oficina.svg',
  viaje: '/demo/img/viaje.svg',
  salud: '/demo/img/salud.svg'
} as const;

/** Ilustraciones DEMO propias en 3:2 (800×533), la proporción de las fotos del golden master. */
const image = (key: keyof typeof IMAGES, alt: string): StoryImage => ({
  src: IMAGES[key],
  alt,
  width: 800,
  height: 533
});

const presentationInputs: ReadonlyArray<
  readonly [number, string, SectionId, readonly TopicId[], StoryImage]
> = [
  [101, 'semana-clave-en-la-ciudadela', 'primera', ['entrenamiento', 'cuerpo-tecnico', 'agenda'], image('estadio', 'Ilustración editorial de La Ciudadela')],
  [102, 'variantes-en-el-mediocampo', 'primera', ['tactica', 'cuerpo-tecnico', 'mediocampo'], image('tactica', 'Ilustración de una pizarra táctica con movimientos en el mediocampo')],
  [103, 'juveniles-ganan-espacio', 'juveniles', ['inferiores', 'entrenamiento', 'reserva'], image('juveniles', 'Ilustración editorial de futbolistas juveniles')],
  [104, 'la-ciudadela-prepara-su-color', 'ciudadela', ['hinchas', 'estadio', 'banderas'], image('hinchada', 'Ilustración editorial de tribunas con hinchas')],
  [105, 'trabajo-vespertino-con-pelota', 'primera', ['entrenamiento', 'pretemporada', 'mediocampo'], image('entrenamiento', 'Ilustración editorial de una sesión de entrenamiento')],
  [106, 'agenda-del-club', 'club', ['agenda', 'socios', 'sede'], image('institucional', 'Ilustración editorial de la sede de un club')],
  [107, 'claves-de-la-semana-del-santo', 'primera', ['agenda', 'cuerpo-tecnico', 'entrenamiento'], image('estadio', 'Ilustración editorial del estadio')],
  [108, 'practica-de-pelota-parada', 'primera', ['entrenamiento', 'tactica', 'pelota-parada'], image('tactica', 'Ilustración de una pizarra con jugadas de pelota parada')],
  [109, 'refuerzo-para-la-ultima-linea', 'mercado', ['refuerzos', 'contratos', 'cuerpo-tecnico'], image('mercado', 'Ilustración de un contrato y una flecha de transferencia')],
  [110, 'perfiles-para-el-mediocampo', 'mercado', ['refuerzos', 'tactica', 'mediocampo'], image('mercado', 'Ilustración de documentos de evaluación de jugadores')],
  [111, 'prestamos-de-ida-y-vuelta', 'mercado', ['prestamos', 'contratos', 'reserva'], image('oficina', 'Ilustración de una oficina donde se firma un préstamo')],
  [112, 'como-se-decide-una-incorporacion', 'mercado', ['refuerzos', 'cuerpo-tecnico', 'contratos'], image('institucional', 'Ilustración de la sede donde se decide una incorporación')],
  [113, 'la-reserva-sostiene-su-idea', 'juveniles', ['reserva', 'tactica', 'inferiores'], image('juveniles', 'Ilustración de futbolistas de la Reserva')],
  [114, 'jornada-de-captacion', 'juveniles', ['inferiores', 'agenda', 'pelota-parada'], image('entrenamiento', 'Ilustración de chicos en una prueba de fútbol')],
  [115, 'mejoras-en-el-predio', 'juveniles', ['infraestructura', 'entrenamiento', 'inferiores'], image('entrenamiento', 'Ilustración de un campo auxiliar de entrenamiento')],
  [116, 'nuevo-canal-para-socios', 'club', ['socios', 'sede', 'agenda'], image('oficina', 'Ilustración de una oficina de atención a socios')],
  [117, 'plan-de-obras', 'club', ['infraestructura', 'estadio', 'socios'], image('institucional', 'Ilustración de un plan de obras institucional')],
  [118, 'actividades-sociales-en-la-sede', 'club', ['sede', 'socios', 'pelota-parada'], image('institucional', 'Ilustración de la sede con actividades sociales')],
  [119, 'nueva-senalizacion-en-accesos', 'ciudadela', ['estadio', 'hinchas', 'infraestructura'], image('estadio', 'Ilustración de los accesos al estadio')],
  [120, 'una-bandera-que-recorre-generaciones', 'ciudadela', ['banderas', 'hinchas', 'historia'], image('banderas', 'Ilustración de banderas en la tribuna')],
  [121, 'recomendaciones-para-la-fecha', 'ciudadela', ['estadio', 'viajes', 'hinchas'], image('ciudad', 'Ilustración de una ciudad camino al estadio')],
  [122, 'postales-de-una-tarde-inolvidable', 'memoria', ['historia', 'estadio', 'archivo'], image('memoria', 'Ilustración con los colores del club en clave histórica')],
  [123, 'los-colores-y-la-identidad', 'memoria', ['historia', 'banderas', 'archivo'], image('memoria', 'Ilustración de franjas con los colores del club')],
  [124, 'como-se-contaba-un-partido-en-la-radio', 'memoria', ['historia', 'radio', 'archivo'], image('radio', 'Ilustración de una radio antigua')],
  [125, 'el-arquero-titular-recupera-ritmo', 'primera', ['arqueros', 'entrenamiento', 'salud'], image('arquero', 'Ilustración de un arco con un arquero')],
  [126, 'renovaciones-en-carpeta', 'mercado', ['contratos', 'refuerzos', 'prestamos'], image('oficina', 'Ilustración de un escritorio con contratos')],
  [127, 'un-delantero-a-prueba', 'mercado', ['refuerzos', 'pretemporada', 'prestamos'], image('vestuario', 'Ilustración de camisetas en un vestuario')],
  [128, 'la-sub-17-cierra-su-preparacion', 'juveniles', ['inferiores', 'entrenamiento', 'viajes'], image('juveniles', 'Ilustración de una categoría juvenil entrenando')],
  [129, 'arqueros-de-inferiores', 'juveniles', ['arqueros', 'inferiores', 'salud'], image('arquero', 'Ilustración de un arco de entrenamiento')],
  [130, 'viaje-de-la-cuarta-division', 'juveniles', ['viajes', 'pretemporada', 'agenda'], image('viaje', 'Ilustración de un micro de viaje')],
  [131, 'controles-medicos-en-formativas', 'juveniles', ['salud', 'arqueros', 'tactica'], image('salud', 'Ilustración de una cruz sanitaria')],
  [132, 'la-reserva-suma-minutos', 'juveniles', ['reserva', 'entrenamiento', 'mediocampo'], image('tactica', 'Ilustración de una pizarra táctica de la Reserva')],
  [133, 'asamblea-de-socios', 'club', ['socios', 'sede', 'salud'], image('oficina', 'Ilustración de una sala de reuniones')],
  [134, 'la-sede-renueva-sus-espacios', 'club', ['sede', 'infraestructura', 'prestamos'], image('institucional', 'Ilustración de la fachada de la sede')],
  [135, 'caravana-hacia-el-estadio', 'ciudadela', ['hinchas', 'viajes', 'banderas'], image('ciudad', 'Ilustración de una ciudad con caravana de hinchas')],
  [136, 'la-tribuna-estrena-banderas', 'ciudadela', ['banderas', 'pelota-parada', 'tactica'], image('banderas', 'Ilustración de banderas nuevas en la tribuna')],
  [137, 'el-archivo-de-fotos-del-club', 'memoria', ['archivo', 'historia', 'sede'], image('memoria', 'Ilustración de un archivo histórico')],
  [138, 'camisetas-de-otras-decadas', 'memoria', ['historia', 'archivo', 'pretemporada'], image('vestuario', 'Ilustración de camisetas históricas')],
  [139, 'la-primera-pretemporada-recordada', 'memoria', ['pretemporada', 'arqueros', 'viajes'], image('viaje', 'Ilustración de un viaje de pretemporada')],
  [140, 'el-estadio-a-traves-del-tiempo', 'memoria', ['estadio', 'infraestructura', 'mediocampo'], image('estadio', 'Ilustración del estadio a lo largo del tiempo')]
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
