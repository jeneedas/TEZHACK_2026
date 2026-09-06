import type { Resource } from '../types'

export const initialResources: Resource[] = [
  {
    id: 'res-sdrf-boat-04',
    name: 'SDRF Boat 04',
    type: 'RESCUE_BOAT',
    typeLabel: 'Rescue Boat',
    status: 'AVAILABLE',
    position: { lat: 26.14, lng: 91.68 },
    locationLabel: 'SDRF Base, Guwahati',
    personnel: 6
  },
  {
    id: 'res-ndrf-team-02',
    name: 'NDRF Team 02',
    type: 'RESCUE_TEAM',
    typeLabel: 'Rescue Team',
    status: 'EN_ROUTE',
    position: { lat: 26.05, lng: 91.45 },
    locationLabel: 'Village H',
    personnel: 10,
    destinationIncidentId: 'inc-1038',
    etaMinutes: 14,
    lastUpdate: '14:48 IST'
  },
  {
    id: 'res-ambulance-07',
    name: 'Ambulance 07',
    type: 'AMBULANCE',
    typeLabel: 'Ambulance',
    status: 'AVAILABLE',
    position: { lat: 26.14, lng: 91.74 },
    locationLabel: 'District Hospital',
    personnel: 2
  },
  {
    id: 'res-ambulance-11',
    name: 'Ambulance 11',
    type: 'AMBULANCE',
    typeLabel: 'Ambulance',
    status: 'AVAILABLE',
    position: { lat: 26.21, lng: 91.53 },
    locationLabel: 'Hajo PHC',
    personnel: 2
  },
  {
    id: 'res-excavator-03',
    name: 'Excavator 03',
    type: 'HEAVY_MACHINERY',
    typeLabel: 'Heavy Machinery',
    status: 'EN_ROUTE',
    position: { lat: 26.15, lng: 91.5 },
    locationLabel: 'En route to Palashbari',
    personnel: 3,
    destinationIncidentId: 'inc-1035',
    etaMinutes: 18,
    lastUpdate: '14:35 IST'
  },
  {
    id: 'res-heli-02',
    name: 'Helicopter 02',
    type: 'AIR_SUPPORT',
    typeLabel: 'Air Support',
    status: 'STANDBY',
    position: { lat: 26.19, lng: 91.7 },
    locationLabel: 'Air Base, Guwahati',
    personnel: 4
  },
  {
    id: 'res-sdrf-boat-01',
    name: 'SDRF Boat 01',
    type: 'RESCUE_BOAT',
    typeLabel: 'Rescue Boat',
    status: 'AVAILABLE',
    position: { lat: 26.17, lng: 91.46 },
    locationLabel: 'Palashbari Base',
    personnel: 5
  },
  {
    id: 'res-fvt-03',
    name: 'Field Verification Team 03',
    type: 'FIELD_VERIFICATION_TEAM',
    typeLabel: 'Field Verification Team',
    status: 'AVAILABLE',
    position: { lat: 26.06, lng: 91.42 },
    locationLabel: 'Mirza Base',
    personnel: 3
  }
]
