import type { InformationFogArea } from '../types'

export const initialFogAreas: InformationFogArea[] = [
  {
    id: 'fog-village-x',
    location: 'Village X',
    fogPercent: 82,
    confidencePercent: 34,
    reports: 3,
    lastVerified: '4 hours ago',
    position: { lat: 26.03, lng: 91.395 },
    incidentId: 'inc-1020'
  },
  {
    id: 'fog-goroimari',
    location: 'Goroimari',
    fogPercent: 71,
    confidencePercent: 42,
    reports: 1,
    lastVerified: '5 hours ago',
    position: { lat: 26.05, lng: 91.417 },
    incidentId: 'inc-1018'
  },
  {
    id: 'fog-village-y',
    location: 'Village Y (near Mirza)',
    fogPercent: 64,
    confidencePercent: 48,
    reports: 2,
    lastVerified: '6 hours ago',
    position: { lat: 26.075, lng: 91.545 }
  },
  {
    id: 'fog-village-z',
    location: 'Village Z (near Chaygaon)',
    fogPercent: 58,
    confidencePercent: 53,
    reports: 2,
    lastVerified: '7 hours ago',
    position: { lat: 25.985, lng: 91.485 }
  }
]
