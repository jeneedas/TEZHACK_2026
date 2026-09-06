import type { FieldUpdate } from '../types'

export const initialFieldUpdates: FieldUpdate[] = [
  {
    id: 'fu-01',
    time: '14:56',
    resourceName: 'Field Team 03',
    incidentId: 'inc-1020',
    location: 'Village X',
    message: 'Flood depth: 1.8 m. People affected: ~240. Road: BLOCKED.',
    metrics: { floodDepthM: 1.8, affected: 240, road: 'BLOCKED' }
  },
  {
    id: 'fu-02',
    time: '14:48',
    resourceName: 'NDRF Team 02',
    incidentId: 'inc-1038',
    location: 'Village H',
    message: 'On scene. Search and rescue in progress. 4 casualties recovered so far.',
  },
  {
    id: 'fu-03',
    time: '14:35',
    resourceName: 'Excavator 03',
    incidentId: 'inc-1035',
    location: 'Palashbari',
    message: 'En route, ETA 18 minutes. Embankment breach site confirmed.',
  }
]

export const routeInc1042FieldUpdates: FieldUpdate[] = [
  {
    id: 'fu-1042-1',
    time: '14:50',
    resourceName: 'SDRF Boat 04',
    incidentId: 'inc-1042',
    location: 'Village C',
    message: '12 people rescued. 11 people remain. Medical assistance required. Location verified.',
    metrics: { rescued: 12, remaining: 11 },
    requiresFollowUp: true
  }
]
