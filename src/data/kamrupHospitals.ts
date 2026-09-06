import type { Hospital } from '../types'

// Demo data for the PoC. Bed/ICU counts are illustrative, not verified facility data.
export const kamrupHospitals: Hospital[] = [
  {
    id: 'hosp-01',
    name: 'District Hospital, Guwahati',
    position: { lat: 26.148, lng: 91.744 },
    distanceKm: 6,
    beds: 42,
    icu: 5,
    emergency: 'Available',
    status: 'OPEN'
  },
  {
    id: 'hosp-02',
    name: 'Palashbari Community Health Centre',
    position: { lat: 26.169, lng: 91.463 },
    distanceKm: 12,
    beds: 18,
    icu: 2,
    emergency: 'Limited',
    status: 'LIMITED'
  },
  {
    id: 'hosp-03',
    name: 'Rangia Civil Hospital',
    position: { lat: 26.436, lng: 91.614 },
    distanceKm: 17,
    beds: 31,
    icu: 4,
    emergency: 'Available',
    status: 'OPEN'
  },
  {
    id: 'hosp-04',
    name: 'Boko Primary Health Centre',
    position: { lat: 25.935, lng: 91.362 },
    distanceKm: 22,
    beds: 12,
    icu: 1,
    emergency: 'Limited',
    status: 'LIMITED'
  }
]
