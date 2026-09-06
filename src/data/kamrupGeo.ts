// Simplified Kamrup District boundary (PoC approximation, not survey-grade).
// Coordinates are [lat, lng] pairs forming a closed polygon roughly enclosing
// the district's major settlements for demonstration purposes.

export const KAMRUP_DISTRICT_CENTER: [number, number] = [26.15, 91.65]

export const KAMRUP_DEFAULT_ZOOM = 10

export const KAMRUP_BOUNDARY: [number, number][] = [
  [26.42, 91.35],
  [26.48, 91.55],
  [26.46, 91.72],
  [26.38, 91.82],
  [26.28, 91.86],
  [26.15, 91.84],
  [26.02, 91.78],
  [25.9, 91.7],
  [25.85, 91.55],
  [25.88, 91.4],
  [25.98, 91.3],
  [26.12, 91.25],
  [26.28, 91.26],
  [26.42, 91.35]
]

export interface PlaceMarker {
  name: string
  position: [number, number]
}

export const KAMRUP_PLACES: PlaceMarker[] = [
  { name: 'Guwahati', position: [26.1445, 91.7362] },
  { name: 'North Guwahati', position: [26.1721, 91.7317] },
  { name: 'Palashbari', position: [26.1667, 91.4667] },
  { name: 'Hajo', position: [26.2167, 91.5333] },
  { name: 'Rangia', position: [26.4333, 91.6167] },
  { name: 'Boko', position: [25.9333, 91.3667] },
  { name: 'Chaygaon', position: [26.0, 91.4667] },
  { name: 'Mirza', position: [26.0667, 91.5333] },
  { name: 'Goroimari', position: [26.05, 91.4167] },
  { name: 'Sualkuchi', position: [26.2167, 91.6167] }
]
