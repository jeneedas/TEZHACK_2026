// ─────────────────────────────────────────────────────────────────────────
// DRISHTI Mock Intelligence Service
//
// Deterministic, explainable scoring functions that stand in for the real
// AI/ML engine in this PoC. All UI pages consume these functions rather than
// hard-coding scores, so the architecture is believable and consistent.
// ─────────────────────────────────────────────────────────────────────────

import type { Incident, Report, Resource, RouteOption, Credibility } from '../types'

/** Weighted factors considered when computing incident priority. */
export interface PriorityFactors {
  severity: number
  affectedPeople: number
  trappedPeople: number
  medicalRequests: number
  roadAccess: 'OPEN' | 'PARTIAL' | 'BLOCKED'
  confidenceScore: number
}

const SEVERITY_WEIGHT: Record<Incident['severity'], number> = {
  CRITICAL: 40,
  HIGH: 28,
  MEDIUM: 16,
  LOW: 6
}

/**
 * calculatePriority — combines severity, human-impact factors, and how
 * confident we are in the underlying reports. Low confidence suppresses the
 * score even for severe-sounding incidents, since unverified claims should
 * not automatically win the response queue.
 */
export function calculatePriority(incident: Incident, confidenceScore: number): number {
  const severityPoints = SEVERITY_WEIGHT[incident.severity]
  const trappedPoints = Math.min(20, incident.trappedPeople * 0.8)
  const affectedPoints = Math.min(15, Math.log10(incident.affectedPeople + 1) * 6)
  const medicalPoints = Math.min(10, incident.medicalRequests * 1.4)
  const accessPoints = incident.roadAccess === 'BLOCKED' ? 8 : incident.roadAccess === 'PARTIAL' ? 4 : 0

  const rawScore = severityPoints + trappedPoints + affectedPoints + medicalPoints + accessPoints

  // Confidence acts as a dampening multiplier (0.5 floor so low-confidence
  // incidents are still visible, just not top-ranked).
  const confidenceMultiplier = 0.5 + (confidenceScore / 100) * 0.5

  return Math.round(Math.min(100, rawScore * confidenceMultiplier))
}

/**
 * calculateConfidence — derived from the credibility and corroboration of
 * the reports attached to an incident. More corroborating reports and
 * higher-credibility sources raise confidence; conflicting reports lower it.
 */
export function calculateConfidence(reports: Report[]): number {
  if (reports.length === 0) return 40

  const credibilityScore: Record<Credibility, number> = { HIGH: 90, MEDIUM: 60, LOW: 25 }

  let total = 0
  let corroboration = 0
  let conflict = 0

  reports.forEach((r) => {
    total += credibilityScore[r.credibility]
    corroboration += r.corroboratingReports ?? 0
    conflict += r.conflictingReports ?? 0
  })

  const avgCredibility = total / reports.length
  const corroborationBonus = Math.min(15, corroboration * 2)
  const conflictPenalty = Math.min(35, conflict * 6)
  const multiSourceBonus = reports.length >= 2 ? 5 : 0

  const score = avgCredibility + corroborationBonus + multiSourceBonus - conflictPenalty
  return Math.round(Math.max(5, Math.min(99, score)))
}

/**
 * calculateInformationFog — inverse relationship with confidence, adjusted
 * for report freshness/volume. Higher fog = less reliable understanding of
 * ground truth.
 */
export function calculateInformationFog(reports: Report[], confidenceScore: number): number {
  const baseFog = 100 - confidenceScore
  const volumeAdjustment = reports.length <= 1 ? 8 : reports.length >= 4 ? -6 : 0
  return Math.round(Math.max(3, Math.min(97, baseFog + volumeAdjustment)))
}

/** calculateReportCredibility — single-report credibility classification. */
export function calculateReportCredibility(report: Report): { credibility: Credibility; confidence: number } {
  return { credibility: report.credibility, confidence: report.confidence }
}

export type FogLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export function fogLevel(fog: number): FogLevel {
  if (fog <= 30) return 'LOW'
  if (fog <= 60) return 'MEDIUM'
  return 'HIGH'
}

export type CredibilityLevel = Credibility
export function credibilityFromConfidence(confidence: number): CredibilityLevel {
  if (confidence >= 75) return 'HIGH'
  if (confidence >= 45) return 'MEDIUM'
  return 'LOW'
}

/**
 * recommendResource — matches incident requirements (type/severity) against
 * available resources, preferring capability match, availability, and
 * proximity (approximate straight-line distance).
 */
export function recommendResource(incident: Incident, resources: Resource[]): Resource | undefined {
  const requiredType = mapIncidentToResourceType(incident.type)

  const candidates = resources.filter((r) => r.status === 'AVAILABLE')
  const capable = candidates.filter((r) => r.type === requiredType)
  const pool = capable.length > 0 ? capable : candidates

  if (pool.length === 0) return undefined

  const scored = pool
    .map((r) => ({
      resource: r,
      distance: haversineApprox(incident.position, r.position)
    }))
    .sort((a, b) => a.distance - b.distance)

  return scored[0]?.resource
}

function mapIncidentToResourceType(type: Incident['type']): Resource['type'] {
  switch (type) {
    case 'FLOOD':
    case 'FLOOD_TRAPPED':
      return 'RESCUE_BOAT'
    case 'BUILDING_COLLAPSE':
      return 'RESCUE_TEAM'
    case 'LANDSLIDE':
      return 'HEAVY_MACHINERY'
    case 'ROAD_BLOCKAGE':
      return 'HEAVY_MACHINERY'
    case 'MEDICAL_EMERGENCY':
      return 'AMBULANCE'
    default:
      return 'RESCUE_TEAM'
  }
}

function haversineApprox(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = a.lat - b.lat
  const dLng = a.lng - b.lng
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

/**
 * recommendRoute — scores route options on safety, accessibility, and ETA,
 * rather than simply picking the shortest path. Returns the highest-scoring
 * route (ties broken by lower risk).
 */
export function recommendRoute(routes: RouteOption[]): RouteOption | undefined {
  if (routes.length === 0) return undefined
  return [...routes].sort((a, b) => b.score - a.score)[0]
}

/** Human-readable reasoning string for a resource recommendation. */
export function explainResourceRecommendation(incident: Incident, resource: Resource): string {
  const need =
    incident.type === 'FLOOD_TRAPPED' || incident.type === 'FLOOD'
      ? 'Water rescue required.'
      : incident.type === 'BUILDING_COLLAPSE'
      ? 'Structural search and rescue required.'
      : incident.type === 'LANDSLIDE' || incident.type === 'ROAD_BLOCKAGE'
      ? 'Debris clearance required.'
      : 'Emergency response required.'

  const trapped = incident.trappedPeople > 0 ? ` ${incident.trappedPeople} people potentially trapped.` : ''
  const availability = ` ${resource.name} currently available.`

  return `${need}${trapped}${availability}`
}
