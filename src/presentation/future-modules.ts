// WEB.2 — Huecos reservados para módulos futuros.
//
// DEP (datos deportivos), MET (métricas) y GRF (gráficos) no se implementan en
// WEB.2. Estos slots fijan su posición y su contrato visual mínimo sin mostrar
// valores inventados: sólo título, propósito y aviso de disponibilidad.

export type FutureModule = 'DEP' | 'MET' | 'GRF';

export type FutureSlot = Readonly<{
  id: string;
  module: FutureModule;
  title: string;
  purpose: string;
}>;

export const FUTURE_MODULE_NOTICE: Record<FutureModule, string> = {
  DEP: 'Datos deportivos disponibles en próximos arcos.',
  MET: 'Métricas disponibles en próximos arcos.',
  GRF: 'Gráficos disponibles en próximos arcos.'
};

export const futureSlots = {
  nextMatch: {
    id: 'dep-next-match',
    module: 'DEP',
    title: 'Próximo partido',
    purpose: 'Fixture oficial y calendario'
  },
  standings: {
    id: 'dep-standings',
    module: 'DEP',
    title: 'Tabla de posiciones',
    purpose: 'Estadísticas y rendimiento'
  },
  results: {
    id: 'dep-results',
    module: 'DEP',
    title: 'Últimos resultados',
    purpose: 'Marcadores y goleadores'
  },
  squadMetrics: {
    id: 'met-squad',
    module: 'MET',
    title: 'Rendimiento del plantel',
    purpose: 'Minutos, participación y evolución'
  },
  matchGraphic: {
    id: 'grf-match',
    module: 'GRF',
    title: 'La fecha en gráficos',
    purpose: 'Infografías y visualizaciones'
  }
} as const satisfies Record<string, FutureSlot>;
