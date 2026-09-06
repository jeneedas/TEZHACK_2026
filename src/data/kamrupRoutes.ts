import type { RouteOption } from '../types'

// Route options are conceptual — scored on safety/accessibility, not just distance.
export const initialRoutes: RouteOption[] = [
  {
    id: 'route-inc1042-a',
    label: 'Route A',
    incidentId: 'inc-1042',
    distanceKm: 8,
    etaMinutes: 16,
    risk: 'HIGH',
    status: 'PARTIAL',
    hazardNote: 'Flooded road segment near Village C approach.',
    score: 52
  },
  {
    id: 'route-inc1042-b',
    label: 'Route B',
    incidentId: 'inc-1042',
    distanceKm: 11,
    etaMinutes: 21,
    risk: 'LOW',
    status: 'OPEN',
    hazardNote: 'Clear approach via northern embankment road.',
    score: 88,
    recommended: true
  },
  {
    id: 'route-inc1042-c',
    label: 'Route C',
    incidentId: 'inc-1042',
    distanceKm: 13,
    etaMinutes: 27,
    risk: 'MEDIUM',
    status: 'PARTIAL',
    hazardNote: 'Partial blockage near market junction.',
    score: 67
  }
]
