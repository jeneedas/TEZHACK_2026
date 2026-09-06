import type { Incident, Report } from '../types'
import { calculateConfidence, calculateInformationFog, calculatePriority } from './intelligenceService'

/**
 * Recomputes derived AI fields (confidence, fog, priority) for an incident
 * given its current attached reports. Called whenever reports/verification
 * data changes so the whole system stays consistent with a single source
 * of truth.
 */
export function deriveIncidentScores(incident: Incident, reports: Report[]): Incident {
  const relatedReports = reports.filter((r) => incident.reportIds.includes(r.id))
  const confidenceScore = calculateConfidence(relatedReports)
  const informationFog = calculateInformationFog(relatedReports, confidenceScore)
  const priorityScore = calculatePriority(incident, confidenceScore)

  return {
    ...incident,
    confidenceScore,
    informationFog,
    priorityScore
  }
}

export function deriveAllIncidents(incidents: Incident[], reports: Report[]): Incident[] {
  return incidents.map((inc) => deriveIncidentScores(inc, reports))
}

export function sortByPriority(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => b.priorityScore - a.priorityScore)
}
