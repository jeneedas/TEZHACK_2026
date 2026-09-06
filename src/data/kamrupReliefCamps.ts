import type { ReliefCamp } from '../types'

export const kamrupReliefCamps: ReliefCamp[] = [
  {
    id: 'camp-01',
    name: 'Camp 01',
    location: 'Hajo',
    position: { lat: 26.219, lng: 91.53 },
    capacity: 500,
    occupied: 320,
    water: 'Available',
    food: 'Available'
  },
  {
    id: 'camp-02',
    name: 'Camp 02',
    location: 'Palashbari',
    position: { lat: 26.163, lng: 91.472 },
    capacity: 300,
    occupied: 270,
    water: 'Low',
    food: 'Available'
  },
  {
    id: 'camp-03',
    name: 'Camp 03',
    location: 'Boko',
    position: { lat: 25.929, lng: 91.371 },
    capacity: 400,
    occupied: 185,
    water: 'Available',
    food: 'Low'
  },
  {
    id: 'camp-04',
    name: 'Camp 04',
    location: 'Chaygaon',
    position: { lat: 26.003, lng: 91.462 },
    capacity: 250,
    occupied: 90,
    water: 'Available',
    food: 'Available'
  }
]
