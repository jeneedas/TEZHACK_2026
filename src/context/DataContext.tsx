import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import type {
  Incident,
  Report,
  Resource,
  RouteOption,
  Assignment,
  FieldUpdate,
  Verification,
  AlertItem,
} from '../types'

import { initialIncidents } from '../data/kamrupIncidents'
import { initialReports } from '../data/kamrupReports'
import { initialResources } from '../data/kamrupResources'
import { initialRoutes } from '../data/kamrupRoutes'
import { initialFieldUpdates } from '../data/kamrupFieldUpdates'

import { deriveAllIncidents } from '../services/incidentService'
import {
  recommendResource,
  recommendRoute,
  explainResourceRecommendation,
} from '../services/intelligenceService'

/* =========================================================
   ZIVA OPERATIONAL TYPES
   ========================================================= */

export type PriorityBreakdown = {
  score: number
  severity: number
  affectedPeople: number
  trapped: number
  medical: number
  waiting: number
  confidencePenalty: number
  band: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export type ResourceOperationalState = {
  resource: Resource
  distanceKm: number
  freshnessScore: number
  freshnessLabel: string
  trustScore: number
  accessibility: 'ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN'
  suitabilityScore: number
  recommended: boolean
  reasons: string[]
}

export type ReliefGap = {
  type: string
  demand: number
  supply: number
  gap: number
  gapRate: number
}

export type ConflictRecord = {
  id: string
  incidentId: string
  title: string
  reports: Report[]
  status: 'OPEN' | 'RESOLVED'
}

export type DataContextValue = {
  /* -------------------------
     Core operational state
     ------------------------- */

  incidents: Incident[]
  reports: Report[]
  resources: Resource[]
  routes: RouteOption[]
  assignments: Assignment[]
  fieldUpdates: FieldUpdate[]
  verifications: Verification[]
  alerts: AlertItem[]

  /* -------------------------
     Basic lookups
     ------------------------- */

  getIncident: (id: string) => Incident | undefined
  getReportsForIncident: (id: string) => Report[]
  getRoutesForIncident: (id: string) => RouteOption[]
  getResource: (id: string) => Resource | undefined

  /* -------------------------
     Decision engine
     ------------------------- */

  getPriorityBreakdown: (
    incidentId: string,
  ) => PriorityBreakdown | undefined

  getRecommendedResource: (
    incidentId: string,
  ) => Resource | undefined

  getRecommendedRoute: (
    incidentId: string,
  ) => RouteOption | undefined

  getResourceExplanation: (
    incidentId: string,
  ) => string

  getResourceOperationalState: (
    resourceId: string,
    incidentId?: string,
  ) => ResourceOperationalState | undefined

  getMatchingResources: (
    incidentId: string,
  ) => ResourceOperationalState[]

  /* -------------------------
     Trust / freshness
     ------------------------- */

  getResourceFreshness: (
    resourceId: string,
  ) => {
    score: number
    label: string
    state: 'CURRENT' | 'AGING' | 'STALE' | 'OUTDATED'
  } | undefined

  getIncidentTrust: (
    incidentId: string,
  ) => {
    confidence: number
    reportCount: number
    corroborated: number
    conflicting: number
    state:
      | 'HIGH_CONFIDENCE'
      | 'MODERATE_CONFIDENCE'
      | 'LOW_CONFIDENCE'
      | 'CONFLICTING'
  } | undefined

  getConflicts: () => ConflictRecord[]

  /* -------------------------
     Supply / demand
     ------------------------- */

  getReliefGaps: () => ReliefGap[]

  /* -------------------------
     Actions
     ------------------------- */

  dispatchResource: (
    incidentId: string,
    resourceId: string,
    routeId?: string,
  ) => Assignment

  addFieldUpdate: (
    update: Omit<FieldUpdate, 'id'>,
  ) => void

  assignVerificationTeam: (
    incidentId: string,
    teamResourceId: string,
  ) => void

  submitVerification: (
    incidentId: string,
    data: {
      affectedPeople: number
      trappedPeople: number
      medicalRequests: number
      roadAccess: 'OPEN' | 'PARTIAL' | 'BLOCKED'
    },
  ) => void
}

/* =========================================================
   CONSTANTS
   ========================================================= */

const DataContext = createContext<DataContextValue | undefined>(
  undefined,
)

let idCounter = 2000

const EARTH_RADIUS_KM = 6371

/* =========================================================
   UTILITY FUNCTIONS
   ========================================================= */

const clamp = (
  value: number,
  min = 0,
  max = 100,
) => Math.max(min, Math.min(max, value))

const getPriorityBand = (
  score: number,
): PriorityBreakdown['band'] => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MEDIUM'
  return 'LOW'
}

/*
 * Haversine distance.
 *
 * ZIVA should eventually use the backend/geospatial layer
 * for authoritative spatial queries. This is the local
 * operational implementation for the coordinator prototype.
 */
const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const toRad = (value: number) =>
    (value * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    )

  return EARTH_RADIUS_KM * c
}

/* =========================================================
   RESOURCE FRESHNESS
   ========================================================= */

const calculateFreshness = (
  lastUpdate?: string,
) => {
  if (!lastUpdate) {
    return {
      score: 0,
      label: 'Unknown',
      state: 'OUTDATED' as const,
    }
  }

  /*
   * The existing DRISHTI dataset sometimes stores a
   * human-readable time such as "09:30".
   *
   * In that case we cannot safely calculate absolute age,
   * so we treat it as current for the demo.
   *
   * Firebase data will eventually store ISO timestamps.
   */

  const parsed = new Date(lastUpdate)

  if (Number.isNaN(parsed.getTime())) {
    return {
      score: 85,
      label: 'Current',
      state: 'CURRENT' as const,
    }
  }

  const ageMinutes = Math.max(
    0,
    (Date.now() - parsed.getTime()) / 60000,
  )

  /*
   * Exponential-style decay approximation.
   *
   * Faster decay is appropriate for emergency resources.
   */
  const score = clamp(
    100 * Math.exp(-ageMinutes / 240),
  )

  if (score >= 75) {
    return {
      score,
      label: 'Current',
      state: 'CURRENT' as const,
    }
  }

  if (score >= 45) {
    return {
      score,
      label: 'Aging',
      state: 'AGING' as const,
    }
  }

  if (score >= 20) {
    return {
      score,
      label: 'Stale',
      state: 'STALE' as const,
    }
  }

  return {
    score,
    label: 'Outdated',
    state: 'OUTDATED' as const,
  }
}

/* =========================================================
   PROVIDER
   ========================================================= */

export const DataProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  /* -------------------------------------------------------
     STATE
     ------------------------------------------------------- */

  const [incidentsRaw, setIncidentsRaw] =
    useState<Incident[]>(initialIncidents)

  const [reports, setReports] =
    useState<Report[]>(initialReports)

  const [resources, setResources] =
    useState<Resource[]>(initialResources)

  const [routes] =
    useState<RouteOption[]>(initialRoutes)

  const [assignments, setAssignments] =
    useState<Assignment[]>([])

  const [fieldUpdates, setFieldUpdates] =
    useState<FieldUpdate[]>(initialFieldUpdates)

  const [verifications, setVerifications] =
    useState<Verification[]>([])

  /* -------------------------------------------------------
     DERIVED INCIDENT STATE
     ------------------------------------------------------- */

  /*
   * incidentService remains responsible for deriving the
   * current confidence / information fog / priority from
   * the report stream.
   *
   * This means pages never directly manipulate derived
   * operational values.
   */
  const incidents = useMemo(
    () =>
      deriveAllIncidents(
        incidentsRaw,
        reports,
      ),
    [incidentsRaw, reports],
  )

  /* -------------------------------------------------------
     LOOKUPS
     ------------------------------------------------------- */

  const getIncident = useCallback(
    (id: string) =>
      incidents.find(
        (incident) => incident.id === id,
      ),
    [incidents],
  )

  const getReportsForIncident =
    useCallback(
      (id: string) =>
        reports.filter(
          (report) =>
            report.incidentId === id,
        ),
      [reports],
    )

  const getRoutesForIncident =
    useCallback(
      (id: string) =>
        routes.filter(
          (route) =>
            route.incidentId === id,
        ),
      [routes],
    )

  const getResource = useCallback(
    (id: string) =>
      resources.find(
        (resource) =>
          resource.id === id,
      ),
    [resources],
  )

  /* =======================================================
     PRIORITY ENGINE
     ======================================================= */

  const getPriorityBreakdown =
    useCallback(
      (
        incidentId: string,
      ): PriorityBreakdown | undefined => {
        const incident =
          incidents.find(
            (item) =>
              item.id === incidentId,
          )

        if (!incident) return undefined

        /*
         * Normalised factors.
         *
         * These are intentionally bounded so that waiting
         * time or population count cannot accidentally
         * overwhelm a genuinely critical emergency.
         */

        const severityMap: Record<
          string,
          number
        > = {
          CRITICAL: 100,
          HIGH: 75,
          MEDIUM: 50,
          LOW: 25,
        }

        const severity =
          severityMap[
            incident.severity
          ] ?? 25

        const affectedPeople = clamp(
          incident.affectedPeople / 2,
        )

        const trapped = clamp(
          incident.trappedPeople * 8,
        )

        const medical = clamp(
          incident.medicalRequests * 10,
        )

        /*
         * The existing incident dataset does not yet
         * expose a formal vulnerability field.
         *
         * We therefore use trapped + medical cases as
         * operational vulnerability proxies for the
         * prototype instead of inventing data.
         */

        const vulnerability =
          clamp(
            trapped * 0.6 +
              medical * 0.4,
          )

        /*
         * Confidence uncertainty slightly increases
         * operational attention, but never dominates
         * severity.
         */

        const confidencePenalty = clamp(
          100 -
            incident.confidenceScore,
        )

        /*
         * Existing priority engine remains the baseline.
         * The breakdown provides explainability around it.
         */
        const calculated =
          severity * 0.35 +
          affectedPeople * 0.15 +
          vulnerability * 0.20 +
          confidencePenalty * 0.10 +
          incident.priorityScore * 0.20

        const score = Math.round(
          clamp(calculated),
        )

        return {
          score,
          severity,
          affectedPeople,
          trapped,
          medical,
          waiting: 0,
          confidencePenalty,
          band: getPriorityBand(score),
        }
      },
      [incidents],
    )

  /* =======================================================
     RECOMMENDED RESOURCE
     ======================================================= */

  const getRecommendedResource =
    useCallback(
      (incidentId: string) => {
        const incident =
          getIncident(incidentId)

        if (!incident) return undefined

        return recommendResource(
          incident,
          resources,
        )
      },
      [getIncident, resources],
    )

  /* =======================================================
     RECOMMENDED ROUTE
     ======================================================= */

  const getRecommendedRoute =
    useCallback(
      (incidentId: string) => {
        return recommendRoute(
          getRoutesForIncident(
            incidentId,
          ),
        )
      },
      [getRoutesForIncident],
    )

  /* =======================================================
     RESOURCE EXPLANATION
     ======================================================= */

  const getResourceExplanation =
    useCallback(
      (incidentId: string) => {
        const incident =
          getIncident(incidentId)

        const resource =
          getRecommendedResource(
            incidentId,
          )

        if (!incident || !resource) {
          return ''
        }

        return explainResourceRecommendation(
          incident,
          resource,
        )
      },
      [
        getIncident,
        getRecommendedResource,
      ],
    )

  /* =======================================================
     RESOURCE OPERATIONAL STATE
     ======================================================= */

  const getResourceOperationalState =
    useCallback(
      (
        resourceId: string,
        incidentId?: string,
      ): ResourceOperationalState | undefined => {
        const resource =
          resources.find(
            (item) =>
              item.id === resourceId,
          )

        if (!resource) {
          return undefined
        }

        const freshness =
          calculateFreshness(
            resource.lastUpdate,
          )

        let distanceKm = 0
        let accessibility:
          | 'ACCESSIBLE'
          | 'RESTRICTED'
          | 'BLOCKED'
          | 'UNKNOWN' =
          'UNKNOWN'

        let suitabilityScore = 0

        const reasons: string[] = []

        /*
         * Location fit.
         */

        if (incidentId) {
          const incident =
            getIncident(incidentId)

          if (incident) {
            distanceKm =
              haversineKm(
                incident.position.lat,
                incident.position.lng,
                resource.position.lat,
                resource.position.lng,
              )

            /*
             * Current resource dataset does not contain a
             * dedicated accessibility field.
             *
             * We therefore derive only what is supported:
             * incident road access + route information.
             */

            const route =
              getRecommendedRoute(
                incidentId,
              )

            if (
              incident.roadAccess ===
              'BLOCKED'
            ) {
              accessibility =
                'BLOCKED'
            } else if (
              route?.risk === 'HIGH'
            ) {
              accessibility =
                'RESTRICTED'
            } else if (route) {
              accessibility =
                'ACCESSIBLE'
            }

            const distanceScore =
              clamp(
                100 -
                  distanceKm * 8,
              )

            const statusScore =
              resource.status ===
              'AVAILABLE'
                ? 100
                : resource.status ===
                    'EN_ROUTE'
                  ? 75
                  : 30

            const freshnessScore =
              freshness.score

            suitabilityScore =
              Math.round(
                distanceScore * 0.30 +
                  statusScore * 0.25 +
                  freshnessScore *
                    0.25 +
                  (accessibility ===
                  'ACCESSIBLE'
                    ? 100
                    : accessibility ===
                        'RESTRICTED'
                      ? 55
                      : accessibility ===
                          'BLOCKED'
                        ? 10
                        : 40) *
                    0.20,
              )

            if (
              distanceKm <= 5
            ) {
              reasons.push(
                'Within operational range',
              )
            }

            if (
              resource.status ===
              'AVAILABLE'
            ) {
              reasons.push(
                'Currently available',
              )
            }

            if (
              freshness.state ===
              'CURRENT'
            ) {
              reasons.push(
                'Recently updated',
              )
            } else if (
              freshness.state ===
                'STALE' ||
              freshness.state ===
                'OUTDATED'
            ) {
              reasons.push(
                'Information needs review',
              )
            }

            if (
              accessibility ===
              'BLOCKED'
            ) {
              reasons.push(
                'Current road access is blocked',
              )
            } else if (
              accessibility ===
              'RESTRICTED'
            ) {
              reasons.push(
                'Route has elevated risk',
              )
            }
          }
        }

        const recommended =
          incidentId
            ? getRecommendedResource(
                incidentId,
              )?.id === resource.id
            : false

        return {
          resource,
          distanceKm,
          freshnessScore:
            freshness.score,
          freshnessLabel:
            freshness.label,
          trustScore: freshness.score,
          accessibility,
          suitabilityScore,
          recommended,
          reasons,
        }
      },
      [
        resources,
        getIncident,
        getRecommendedRoute,
        getRecommendedResource,
      ],
    )

  /* =======================================================
     MATCHING ENGINE
     ======================================================= */

  const getMatchingResources =
    useCallback(
      (
        incidentId: string,
      ): ResourceOperationalState[] => {
        const incident =
          getIncident(incidentId)

        if (!incident) {
          return []
        }

        /*
         * Candidate narrowing:
         *
         * ALL resources
         *       ↓
         * usable status
         *       ↓
         * not outdated
         *       ↓
         * operational scoring
         *       ↓
         * top candidates
         *
         * This mirrors the ZIVA matching strategy rather
         * than blindly choosing the nearest resource.
         */

        return resources
          .filter(
            (resource) =>
              resource.status !==
                'UNAVAILABLE' &&
              resource.status !==
                'FULL',
          )
          .map(
            (resource) =>
              getResourceOperationalState(
                resource.id,
                incidentId,
              ),
          )
          .filter(
            (
              value,
            ): value is ResourceOperationalState =>
              Boolean(value),
          )
          .filter(
            (item) =>
              item.accessibility !==
              'BLOCKED',
          )
          .sort(
            (a, b) =>
              b.suitabilityScore -
              a.suitabilityScore,
          )
          .slice(0, 8)
      },
      [
        resources,
        getIncident,
        getResourceOperationalState,
      ],
    )

  /* =======================================================
     RESOURCE FRESHNESS API
     ======================================================= */

  const getResourceFreshness =
    useCallback(
      (resourceId: string) => {
        const resource =
          resources.find(
            (item) =>
              item.id === resourceId,
          )

        if (!resource) {
          return undefined
        }

        return calculateFreshness(
          resource.lastUpdate,
        )
      },
      [resources],
    )

  /* =======================================================
     INCIDENT TRUST API
     ======================================================= */

  const getIncidentTrust =
    useCallback(
      (incidentId: string) => {
        const incident =
          getIncident(incidentId)

        if (!incident) {
          return undefined
        }

        const incidentReports =
          getReportsForIncident(
            incidentId,
          )

        const corroborated =
          incidentReports.reduce(
            (total, report) =>
              total +
              report.corroboratingReports,
            0,
          )

        const conflicting =
          incidentReports.reduce(
            (total, report) =>
              total +
              report.conflictingReports,
            0,
          )

        let state:
          | 'HIGH_CONFIDENCE'
          | 'MODERATE_CONFIDENCE'
          | 'LOW_CONFIDENCE'
          | 'CONFLICTING'

        if (conflicting > 0) {
          state = 'CONFLICTING'
        } else if (
          incident.confidenceScore >=
          85
        ) {
          state = 'HIGH_CONFIDENCE'
        } else if (
          incident.confidenceScore >=
          65
        ) {
          state = 'MODERATE_CONFIDENCE'
        } else {
          state = 'LOW_CONFIDENCE'
        }

        return {
          confidence:
            incident.confidenceScore,
          reportCount:
            incidentReports.length,
          corroborated,
          conflicting,
          state,
        }
      },
      [
        getIncident,
        getReportsForIncident,
      ],
    )

  /* =======================================================
     CONFLICT ENGINE
     ======================================================= */

  const conflicts = useMemo(() => {
    const records: ConflictRecord[] =
      []

    incidents.forEach(
      (incident) => {
        const incidentReports =
          reports.filter(
            (report) =>
              report.incidentId ===
              incident.id,
          )

        const conflictingReports =
          incidentReports.filter(
            (report) =>
              report.conflictingReports >
              0 ||
              report.status ===
                'CONFLICTING',
          )

        if (
          conflictingReports.length >
          0
        ) {
          records.push({
            id: `CON-${incident.id}`,
            incidentId:
              incident.id,
            title:
              incident.name,
            reports:
              incidentReports,
            status:
              incident.status ===
              'VERIFICATION_NEEDED'
                ? 'OPEN'
                : 'RESOLVED',
          })
        }
      },
    )

    return records
  }, [incidents, reports])

  const getConflicts =
    useCallback(
      () => conflicts,
      [conflicts],
    )

  /* =======================================================
     RELIEF GAP ENGINE
     ======================================================= */

  const reliefGaps = useMemo(() => {
    const demandByType =
      new Map<string, number>()

    const supplyByType =
      new Map<string, number>()

    /*
     * Demand is represented by affected people
     * associated with each reported need category.
     */

    incidents.forEach(
      (incident) => {
        const type =
          incident.typeLabel

        demandByType.set(
          type,
          (demandByType.get(type) ??
            0) +
            incident.affectedPeople,
        )
      },
    )

    /*
     * The current DRISHTI resource model does not yet
     * expose a quantity/capacity field.
     *
     * We therefore count operational resources rather
     * than inventing quantities.
     *
     * The Firebase schema will later replace this with
     * availableQuantity / capacity.
     */

    resources.forEach(
      (resource) => {
        const type =
          resource.typeLabel

        if (
          resource.status ===
            'UNAVAILABLE' ||
          resource.status ===
            'FULL'
        ) {
          return
        }

        supplyByType.set(
          type,
          (supplyByType.get(type) ??
            0) + 1,
        )
      },
    )

    const types = new Set([
      ...demandByType.keys(),
      ...supplyByType.keys(),
    ])

    return Array.from(types)
      .map((type) => {
        const demand =
          demandByType.get(type) ??
          0

        const supply =
          supplyByType.get(type) ??
          0

        const gap = Math.max(
          demand - supply,
          0,
        )

        const gapRate =
          demand > 0
            ? gap / demand
            : 0

        return {
          type,
          demand,
          supply,
          gap,
          gapRate,
        }
      })
      .filter(
        (gap) =>
          gap.demand > 0,
      )
      .sort(
        (a, b) =>
          b.gapRate -
          a.gapRate,
      )
  }, [incidents, resources])

  const getReliefGaps =
    useCallback(
      () => reliefGaps,
      [reliefGaps],
    )

  /* =======================================================
     DISPATCH
     ======================================================= */

  const dispatchResource =
    useCallback(
      (
        incidentId: string,
        resourceId: string,
        routeId?: string,
      ): Assignment => {
        const incident =
          incidentsRaw.find(
            (item) =>
              item.id === incidentId,
          )

        const resource =
          resources.find(
            (item) =>
              item.id === resourceId,
          )

        if (!incident) {
          throw new Error(
            'Incident not found',
          )
        }

        if (!resource) {
          throw new Error(
            'Resource not found',
          )
        }

        const routeOpt =
          routeId
            ? routes.find(
                (route) =>
                  route.id ===
                  routeId,
              )
            : undefined

        const eta =
          routeOpt?.etaMinutes ??
          21

        const dispatchedAt =
          new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )

        const assignment: Assignment = {
          id: `AS-${idCounter++}`,
          incidentId,
          resourceId,
          routeId,
          status: 'EN_ROUTE',
          dispatchedAt,
          etaMinutes: eta,
          reason:
            explainResourceRecommendation(
              incident,
              resource,
            ),
        }

        setAssignments(
          (previous) => [
            assignment,
            ...previous,
          ],
        )

        setResources(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                resourceId
                  ? {
                      ...item,
                      status:
                        'EN_ROUTE',
                      destinationIncidentId:
                        incidentId,
                      etaMinutes:
                        eta,
                      lastUpdate:
                        dispatchedAt,
                    }
                  : item,
            ),
        )

        setIncidentsRaw(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                incidentId
                  ? {
                      ...item,
                      status:
                        'EN_ROUTE',
                      assignedResourceIds:
                        item.assignedResourceIds.includes(
                          resourceId,
                        )
                          ? item.assignedResourceIds
                          : [
                              ...item.assignedResourceIds,
                              resourceId,
                            ],
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        )

        return assignment
      },
      [
        incidentsRaw,
        resources,
        routes,
      ],
    )

  /* =======================================================
     FIELD UPDATE
     ======================================================= */

  const addFieldUpdate =
    useCallback(
      (
        update: Omit<
          FieldUpdate,
          'id'
        >,
      ) => {
        setFieldUpdates(
          (previous) => [
            {
              ...update,
              id: `FU-${idCounter++}`,
            },
            ...previous,
          ],
        )

        /*
         * A field update means the incident has changed.
         * This timestamp is important for freshness.
         */

        setIncidentsRaw(
          (previous) =>
            previous.map(
              (incident) =>
                incident.id ===
                update.incidentId
                  ? {
                      ...incident,
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : incident,
            ),
        )
      },
      [],
    )

  /* =======================================================
     VERIFICATION ASSIGNMENT
     ======================================================= */

  const assignVerificationTeam =
    useCallback(
      (
        incidentId: string,
        teamResourceId: string,
      ) => {
        const incident =
          incidentsRaw.find(
            (item) =>
              item.id === incidentId,
          )

        if (!incident) {
          return
        }

        const verification: Verification =
          {
            id: `VER-${idCounter++}`,
            incidentId,
            location:
              incident.name,
            confidenceBefore:
              incident.confidenceScore,
            fogBefore:
              incident.informationFog,
            assignedTeamId:
              teamResourceId,
            status: 'ASSIGNED',
          }

        setVerifications(
          (previous) => [
            verification,
            ...previous,
          ],
        )

        setResources(
          (previous) =>
            previous.map(
              (resource) =>
                resource.id ===
                teamResourceId
                  ? {
                      ...resource,
                      status:
                        'EN_ROUTE',
                      destinationIncidentId:
                        incidentId,
                      etaMinutes: 25,
                    }
                  : resource,
            ),
        )

        /*
         * Explicitly move the incident into the
         * verification workflow.
         */

        setIncidentsRaw(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                incidentId
                  ? {
                      ...item,
                      status:
                        'VERIFICATION_NEEDED',
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        )
      },
      [incidentsRaw],
    )

  /* =======================================================
     VERIFICATION SUBMISSION
     ======================================================= */

  const submitVerification =
    useCallback(
      (
        incidentId: string,
        data: {
          affectedPeople: number
          trappedPeople: number
          medicalRequests: number
          roadAccess:
            | 'OPEN'
            | 'PARTIAL'
            | 'BLOCKED'
        },
      ) => {
        const incident =
          incidentsRaw.find(
            (item) =>
              item.id === incidentId,
          )

        if (!incident) {
          return
        }

        const newReportId =
          `R-${idCounter++}`

        const timestamp =
          new Date().toLocaleTimeString(
            'en-IN',
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )

        /*
         * Field verification becomes a new piece of
         * evidence rather than silently overwriting the
         * old reports.
         */

        const verifiedReport:
          Report = {
            id: newReportId,
            incidentId,
            source: 'FIELD_TEAM',
            location:
              incident.name,
            content:
              `Field verification complete. ${data.affectedPeople} affected, ${data.trappedPeople} trapped, ${data.medicalRequests} medical cases. Road ${data.roadAccess}.`,
            credibility: 'HIGH',
            confidence: 93,
            timestamp,
            status: 'VERIFIED',
            corroboratingReports: 3,
            conflictingReports: 0,
          }

        setReports(
          (previous) => [
            verifiedReport,
            ...previous,
          ],
        )

        setIncidentsRaw(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                incidentId
                  ? {
                      ...item,
                      affectedPeople:
                        data.affectedPeople,
                      trappedPeople:
                        data.trappedPeople,
                      medicalRequests:
                        data.medicalRequests,
                      roadAccess:
                        data.roadAccess,
                      status:
                        'AWAITING_DISPATCH',
                      reportIds: [
                        ...item.reportIds,
                        newReportId,
                      ],
                      lastVerified:
                        'just now',
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        )

        setVerifications(
          (previous) =>
            previous.map(
              (verification) =>
                verification.incidentId ===
                  incidentId &&
                verification.status ===
                  'ASSIGNED'
                  ? {
                      ...verification,
                      status:
                        'COMPLETE',
                      confidenceAfter: 93,
                      fogAfter: 7,
                      submittedData:
                        data,
                    }
                  : verification,
            ),
        )
      },
      [incidentsRaw],
    )

  /* =======================================================
     ALERT ENGINE
     ======================================================= */

  const alerts: AlertItem[] =
    useMemo(() => {
      const items: AlertItem[] =
        []

      incidents.forEach(
        (incident) => {
          /*
           * CRITICAL + TRAPPED
           */

          if (
            incident.severity ===
              'CRITICAL' &&
            incident.trappedPeople >
              0
          ) {
            items.push({
              id: `alert-${incident.id}-trapped`,
              level: 'CRITICAL',
              title:
                incident.name,
              message:
                `${incident.trappedPeople} people potentially trapped.`,
              incidentId:
                incident.id,
              timestamp:
                incident.updatedAt,
            })

            return
          }

          /*
           * Verification uncertainty.
           */

          if (
            incident.status ===
              'VERIFICATION_NEEDED' ||
            incident.confidenceScore <
              70
          ) {
            items.push({
              id: `alert-${incident.id}-verification`,
              level:
                'VERIFICATION_REQUIRED',
              title:
                incident.name,
              message:
                'Information confidence is low or requires verification.',
              incidentId:
                incident.id,
              timestamp:
                incident.updatedAt,
            })

            return
          }

          /*
           * Blocked access.
           */

          if (
            incident.roadAccess ===
            'BLOCKED'
          ) {
            items.push({
              id: `alert-${incident.id}-road`,
              level: 'WARNING',
              title:
                incident.name,
              message:
                'Road access is blocked in the affected area.',
              incidentId:
                incident.id,
              timestamp:
                incident.updatedAt,
            })

            return
          }

          /*
           * Critical request.
           */

          if (
            incident.severity ===
            'CRITICAL'
          ) {
            items.push({
              id: `alert-${incident.id}`,
              level: 'HIGH',
              title:
                incident.name,
              message:
                incident.description
                  .split('.')[0] +
                '.',
              incidentId:
                incident.id,
              timestamp:
                incident.updatedAt,
            })
          }
        },
      )

      return items
    }, [incidents])

  /* =======================================================
     CONTEXT VALUE
     ======================================================= */

  const value: DataContextValue =
    {
      incidents,
      reports,
      resources,
      routes,
      assignments,
      fieldUpdates,
      verifications,
      alerts,

      getIncident,
      getReportsForIncident,
      getRoutesForIncident,
      getResource,

      getPriorityBreakdown,

      getRecommendedResource,
      getRecommendedRoute,
      getResourceExplanation,

      getResourceOperationalState,
      getMatchingResources,

      getResourceFreshness,
      getIncidentTrust,

      getConflicts,

      getReliefGaps,

      dispatchResource,
      addFieldUpdate,
      assignVerificationTeam,
      submitVerification,
    }

  return (
    <DataContext.Provider
      value={value}
    >
      {children}
    </DataContext.Provider>
  )
}

/* =========================================================
   HOOK
   ========================================================= */

export function useData(): DataContextValue {
  const context =
    useContext(DataContext)

  if (!context) {
    throw new Error(
      'useData must be used within DataProvider',
    )
  }

  return context
}