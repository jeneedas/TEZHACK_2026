import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  collection,
  onSnapshot
} from 'firebase/firestore'

import { db } from '../firebase'

import type {
  Incident,
  Report,
  Resource,
  RouteOption,
  Assignment,
  FieldUpdate,
  Verification,
  AlertItem,
  IncidentType,
  Severity
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
  explainResourceRecommendation
} from '../services/intelligenceService'


/* =========================================================
   FIREBASE → ZIVA INCIDENT HELPERS
   ========================================================= */

function timestampToIso(value: unknown): string {
  if (!value) {
    return new Date().toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (
      (value as { toDate: () => Date })
        .toDate()
        .toISOString()
    )
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return new Date().toISOString()
}


function normalizeText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}


function getEmergencyLabel(emergencyType: unknown): string {
  const value = normalizeText(emergencyType)

  if (value.includes('MEDICAL')) return 'Medical Emergency'
  if (value.includes('FLOOD')) return 'Flood Emergency'
  if (value.includes('FIRE')) return 'Fire Emergency'
  if (value.includes('LANDSLIDE')) return 'Landslide'
  if (value.includes('COLLAPSE')) return 'Building Collapse'
  if (value.includes('TRAPPED')) return 'Person Trapped'
  if (value.includes('RESCUE')) return 'Rescue Request'
  if (value.includes('EVAC')) return 'Evacuation Request'
  if (value.includes('WATER')) return 'Water Emergency'
  if (value.includes('FOOD')) return 'Food Emergency'

  return 'Emergency SOS'
}


function getIncidentType(
  emergencyType: unknown
): IncidentType {
  const value = normalizeText(emergencyType)

  if (value.includes('MEDICAL')) {
    return 'MEDICAL_EMERGENCY'
  }

  if (value.includes('FIRE')) {
    return 'FIRE'
  }

  if (value.includes('LANDSLIDE')) {
    return 'LANDSLIDE'
  }

  if (value.includes('COLLAPSE')) {
    return 'BUILDING_COLLAPSE'
  }

  if (value.includes('TRAPPED')) {
    return 'FLOOD_TRAPPED'
  }

  if (value.includes('ROAD')) {
    return 'ROAD_BLOCKAGE'
  }

  if (value.includes('WATERLOG')) {
    return 'WATERLOGGING'
  }

  if (value.includes('FLOOD')) {
    return 'FLOOD'
  }

  return 'FLOOD'
}


function getSeverity(
  emergencyType: unknown,
  status: unknown
): Severity {
  const emergency = normalizeText(emergencyType)
  const currentStatus = normalizeText(status)

  if (
    currentStatus === 'RESOLVED' ||
    currentStatus === 'CLOSED'
  ) {
    return 'LOW'
  }

  if (
    emergency.includes('TRAPPED') ||
    emergency.includes('MEDICAL') ||
    emergency.includes('COLLAPSE') ||
    emergency.includes('RESCUE')
  ) {
    return 'CRITICAL'
  }

  if (
    emergency.includes('FLOOD') ||
    emergency.includes('FIRE') ||
    emergency.includes('LANDSLIDE')
  ) {
    return 'HIGH'
  }

  return 'MEDIUM'
}


function getIncidentStatus(
  status: unknown
): Incident['status'] {
  const value = normalizeText(status)

  switch (value) {
    case 'EN_ROUTE':
      return 'EN_ROUTE'

    case 'IN_PROGRESS':
      return 'IN_PROGRESS'

    case 'RESOLVED':
    case 'FULFILLED':
    case 'CLOSED':
      return 'RESOLVED'

    case 'ASSIGNED':
      return 'TEAM_ASSIGNED'

    case 'TRIAGED':
    case 'PRIORITIZED':
    case 'MATCHED':
      return 'AWAITING_DISPATCH'

    default:
      return 'ACTIVE'
  }
}


/* =========================================================
   FIREBASE SOS → COORDINATOR INCIDENT
   ========================================================= */

function firebaseSosToIncident(
  requestId: string,
  data: Record<string, unknown>
): Incident {
  const latitude = Number(data.latitude ?? 0)
  const longitude = Number(data.longitude ?? 0)

  const emergencyType = data.emergencyType

  const emergencyLabel =
    getEmergencyLabel(emergencyType)

  const incidentType =
    getIncidentType(emergencyType)

  const severity =
    getSeverity(
      emergencyType,
      data.status
    )

  const status =
    getIncidentStatus(data.status)

  const timestamp =
    timestampToIso(
      data.serverReceivedAt ??
        data.timestamp
    )

  const notes =
    String(data.notes ?? '').trim()

  const connectivity =
    String(
      data.connectivityState ?? 'ONLINE'
    )

  const battery =
    data.batteryLevel !== undefined
      ? ` Battery ${Number(data.batteryLevel)}%.`
      : ''

  const bleHops =
    Number(data.bleHops ?? 0)

  const description =
    notes ||
    `${emergencyLabel} received from ZIVA citizen app.${battery} Connectivity: ${connectivity}. BLE hops: ${bleHops}.`

  const trappedPeople =
    normalizeText(emergencyType).includes('TRAPPED')
      ? 1
      : 0

  const medicalRequests =
    normalizeText(emergencyType).includes('MEDICAL')
      ? 1
      : 0

  const priorityScore =
    severity === 'CRITICAL'
      ? 95
      : severity === 'HIGH'
        ? 80
        : severity === 'MEDIUM'
          ? 60
          : 30

  const confidenceScore =
    connectivity.includes('OFFLINE')
      ? 70
      : 90

  const informationFog =
    100 - confidenceScore

  const codeSuffix =
    requestId.length > 6
      ? requestId.slice(-6).toUpperCase()
      : requestId.toUpperCase()

  return {
    id: `SOS-${requestId}`,

    code: `ZV-${codeSuffix}`,

    name: `ZIVA SOS • ${emergencyLabel}`,

    type: incidentType,

    typeLabel: emergencyLabel,

    severity,

    position: {
      lat: latitude,
      lng: longitude
    },

    priorityScore,

    confidenceScore,

    informationFog,

    affectedPeople: 1,

    trappedPeople,

    medicalRequests,

    roadAccess: 'OPEN',

    status,

    description,

    reportIds: [],

    assignedResourceIds: [],

    lastVerified: 'Not verified',

    createdAt: timestamp,

    updatedAt: timestamp,

    requestId,

    verificationStatus: 'UNVERIFIED',

    vulnerabilityScore:
      severity === 'CRITICAL'
        ? 90
        : severity === 'HIGH'
          ? 75
          : 50,

    locationLabel:
      `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
  }
}


/* =========================================================
   CONTEXT
   ========================================================= */

interface DataContextValue {
  incidents: Incident[]
  reports: Report[]
  resources: Resource[]
  routes: RouteOption[]
  assignments: Assignment[]
  fieldUpdates: FieldUpdate[]
  verifications: Verification[]
  alerts: AlertItem[]

  getIncident: (id: string) => Incident | undefined
  getReportsForIncident: (id: string) => Report[]
  getRoutesForIncident: (id: string) => RouteOption[]
  getResource: (id: string) => Resource | undefined

  getRecommendedResource:
    (incidentId: string) => Resource | undefined

  getRecommendedRoute:
    (incidentId: string) => RouteOption | undefined

  getResourceExplanation:
    (incidentId: string) => string

  dispatchResource:
    (
      incidentId: string,
      resourceId: string,
      routeId?: string
    ) => Assignment

  addFieldUpdate:
    (update: Omit<FieldUpdate, 'id'>) => void

  assignVerificationTeam:
    (
      incidentId: string,
      teamResourceId: string
    ) => void

  submitVerification:
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
      }
    ) => void
}


const DataContext =
  createContext<DataContextValue | undefined>(
    undefined
  )


let idCounter = 2000


/* =========================================================
   DATA PROVIDER
   ========================================================= */

export const DataProvider:
  React.FC<{ children: React.ReactNode }> =
  ({ children }) => {

    const [incidentsRaw, setIncidentsRaw] =
      useState<Incident[]>(
        initialIncidents
      )

    const [reports, setReports] =
      useState<Report[]>(
        initialReports
      )

    const [resources, setResources] =
      useState<Resource[]>(
        initialResources
      )

    const [routes] =
      useState<RouteOption[]>(
        initialRoutes
      )

    const [assignments, setAssignments] =
      useState<Assignment[]>([])

    const [fieldUpdates, setFieldUpdates] =
      useState<FieldUpdate[]>(
        initialFieldUpdates
      )

    const [verifications, setVerifications] =
      useState<Verification[]>([])


    /* =======================================================
       FIREBASE REALTIME SOS LISTENER
       ======================================================= */

    useEffect(() => {

      const sosCollection =
        collection(
          db,
          'sos_requests'
        )

      const unsubscribe =
        onSnapshot(
          sosCollection,
          (snapshot) => {

            const firebaseIncidents =
              snapshot.docs.map(
                (document) => {

                  const data =
                    document.data() as Record<
                      string,
                      unknown
                    >

                  return firebaseSosToIncident(
                    document.id,
                    data
                  )
                }
              )

            setIncidentsRaw(
              (previous) => {

                const next = [
                  ...previous
                ]

                firebaseIncidents.forEach(
                  (firebaseIncident) => {

                    const existingIndex =
                      next.findIndex(
                        (incident) =>
                          incident.id ===
                          firebaseIncident.id
                      )

                    if (
                      existingIndex >= 0
                    ) {
                      /*
                       * Firebase is the source of truth
                       * for ZIVA SOS records.
                       *
                       * Preserve coordinator-side
                       * assignments if they already exist.
                       */

                      const existing =
                        next[
                          existingIndex
                        ]

                      next[
                        existingIndex
                      ] = {
                        ...firebaseIncident,

                        assignedResourceIds:
                          existing.assignedResourceIds,

                        recommendedResourceId:
                          existing.recommendedResourceId,

                        recommendedRouteId:
                          existing.recommendedRouteId,

                        reportIds:
                          existing.reportIds
                      }

                    } else {

                      /*
                       * New SOS received.
                       * Add it without removing
                       * existing demo incidents.
                       */

                      next.unshift(
                        firebaseIncident
                      )
                    }
                  }
                )

                return next
              }
            )
          },
          (error) => {
            console.error(
              'ZIVA Firebase SOS listener error:',
              error
            )
          }
        )

      return () => {
        unsubscribe()
      }

    }, [])


    /* =======================================================
       DERIVED INCIDENTS
       ======================================================= */

    const incidents =
      useMemo(
        () =>
          deriveAllIncidents(
            incidentsRaw,
            reports
          ),
        [
          incidentsRaw,
          reports
        ]
      )


    /* =======================================================
       GETTERS
       ======================================================= */

    const getIncident =
      useCallback(
        (id: string) =>
          incidents.find(
            (i) => i.id === id
          ),
        [incidents]
      )


    const getReportsForIncident =
      useCallback(
        (id: string) =>
          reports.filter(
            (r) =>
              r.incidentId === id
          ),
        [reports]
      )


    const getRoutesForIncident =
      useCallback(
        (id: string) =>
          routes.filter(
            (r) =>
              r.incidentId === id
          ),
        [routes]
      )


    const getResource =
      useCallback(
        (id: string) =>
          resources.find(
            (r) => r.id === id
          ),
        [resources]
      )


    /* =======================================================
       INTELLIGENCE
       ======================================================= */

    const getRecommendedResource =
      useCallback(
        (incidentId: string) => {

          const incident =
            getIncident(
              incidentId
            )

          if (!incident) {
            return undefined
          }

          return recommendResource(
            incident,
            resources
          )

        },
        [
          getIncident,
          resources
        ]
      )


    const getRecommendedRoute =
      useCallback(
        (incidentId: string) =>
          recommendRoute(
            getRoutesForIncident(
              incidentId
            )
          ),
        [
          getRoutesForIncident
        ]
      )


    const getResourceExplanation =
      useCallback(
        (incidentId: string) => {

          const incident =
            getIncident(
              incidentId
            )

          const resource =
            getRecommendedResource(
              incidentId
            )

          if (
            !incident ||
            !resource
          ) {
            return ''
          }

          return explainResourceRecommendation(
            incident,
            resource
          )

        },
        [
          getIncident,
          getRecommendedResource
        ]
      )


    /* =======================================================
       DISPATCH RESOURCE
       ======================================================= */

    const dispatchResource =
      useCallback(
        (
          incidentId: string,
          resourceId: string,
          routeId?: string
        ): Assignment => {

          const incident =
            incidentsRaw.find(
              (i) =>
                i.id === incidentId
            )

          const routeOpt =
            routeId
              ? routes.find(
                  (r) =>
                    r.id === routeId
                )
              : undefined

          const eta =
            routeOpt?.etaMinutes ??
            21

          const assignment:
            Assignment = {

            id:
              `AS-${idCounter++}`,

            incidentId,

            resourceId,

            routeId,

            status:
              'EN_ROUTE',

            dispatchedAt:
              new Date().toLocaleTimeString(
                'en-IN',
                {
                  hour: '2-digit',
                  minute: '2-digit'
                }
              ),

            etaMinutes:
              eta,

            reason:
              incident
                ? explainResourceRecommendation(
                    incident,
                    resources.find(
                      (r) =>
                        r.id === resourceId
                    ) as Resource
                  )
                : ''
          }


          setAssignments(
            (prev) => [
              assignment,
              ...prev
            ]
          )


          setResources(
            (prev) =>
              prev.map(
                (r) =>
                  r.id === resourceId
                    ? {
                        ...r,

                        status:
                          'EN_ROUTE',

                        destinationIncidentId:
                          incidentId,

                        etaMinutes:
                          eta,

                        lastUpdate:
                          assignment.dispatchedAt
                      }
                    : r
              )
          )


          setIncidentsRaw(
            (prev) =>
              prev.map(
                (i) =>
                  i.id === incidentId
                    ? {
                        ...i,

                        status:
                          'EN_ROUTE',

                        assignedResourceIds:
                          [
                            ...i.assignedResourceIds,
                            resourceId
                          ],

                        updatedAt:
                          new Date().toISOString()
                      }
                    : i
              )
          )


          return assignment

        },
        [
          incidentsRaw,
          resources,
          routes
        ]
      )


    /* =======================================================
       FIELD UPDATE
       ======================================================= */

    const addFieldUpdate =
      useCallback(
        (
          update:
            Omit<FieldUpdate, 'id'>
        ) => {

          setFieldUpdates(
            (prev) => [
              {
                ...update,
                id:
                  `fu-${idCounter++}`
              },
              ...prev
            ]
          )

        },
        []
      )


    /* =======================================================
       ASSIGN VERIFICATION TEAM
       ======================================================= */

    const assignVerificationTeam =
      useCallback(
        (
          incidentId: string,
          teamResourceId: string
        ) => {

          const incident =
            incidentsRaw.find(
              (i) =>
                i.id === incidentId
            )

          if (!incident) {
            return
          }


          setVerifications(
            (prev) => [
              {
                id:
                  `VER-${idCounter++}`,

                incidentId,

                location:
                  incident.name,

                confidenceBefore:
                  incident.confidenceScore,

                fogBefore:
                  incident.informationFog,

                assignedTeamId:
                  teamResourceId,

                status:
                  'ASSIGNED'
              },

              ...prev
            ]
          )


          setResources(
            (prev) =>
              prev.map(
                (r) =>
                  r.id === teamResourceId
                    ? {
                        ...r,

                        status:
                          'EN_ROUTE',

                        destinationIncidentId:
                          incidentId,

                        etaMinutes:
                          25
                      }
                    : r
              )
          )

        },
        [
          incidentsRaw
        ]
      )


    /* =======================================================
       SUBMIT VERIFICATION
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
          }
        ) => {

          const newReportId =
            `R-${idCounter++}`

          const incident =
            incidentsRaw.find(
              (i) =>
                i.id === incidentId
            )


          setReports(
            (prev) => [
              ...prev,

              {
                id:
                  newReportId,

                incidentId,

                source:
                  'FIELD_TEAM',

                location:
                  incident?.name ?? '',

                content:
                  `Field verification complete. ${data.affectedPeople} affected, ${data.trappedPeople} trapped, ${data.medicalRequests} medical cases. Road ${data.roadAccess}.`,

                credibility:
                  'HIGH',

                confidence:
                  93,

                timestamp:
                  new Date().toLocaleTimeString(
                    'en-IN',
                    {
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  ),

                status:
                  'VERIFIED',

                corroboratingReports:
                  3,

                conflictingReports:
                  0
              }
            ]
          )


          setIncidentsRaw(
            (prev) =>
              prev.map(
                (i) =>
                  i.id === incidentId
                    ? {
                        ...i,

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

                        reportIds:
                          [
                            ...i.reportIds,
                            newReportId
                          ],

                        lastVerified:
                          'just now',

                        updatedAt:
                          new Date().toISOString()
                      }
                    : i
              )
          )


          setVerifications(
            (prev) =>
              prev.map(
                (v) =>
                  v.incidentId === incidentId &&
                  v.status === 'ASSIGNED'
                    ? {
                        ...v,

                        status:
                          'COMPLETE',

                        confidenceAfter:
                          88,

                        fogAfter:
                          19,

                        submittedData:
                          data
                      }
                    : v
              )
          )

        },
        [
          incidentsRaw
        ]
      )


    /* =======================================================
       ALERT ENGINE
       ======================================================= */

    const alerts:
      AlertItem[] =
      useMemo(
        () => {

          const items:
            AlertItem[] = []


          incidents.forEach(
            (inc) => {

              if (
                inc.severity ===
                  'CRITICAL' &&
                inc.trappedPeople >
                  0
              ) {

                items.push({
                  id:
                    `alert-${inc.id}`,

                  level:
                    'CRITICAL',

                  title:
                    inc.name,

                  message:
                    `${inc.trappedPeople} people potentially trapped.`,

                  incidentId:
                    inc.id,

                  requestId:
                    inc.requestId,

                  timestamp:
                    inc.updatedAt
                })

              } else if (
                inc.severity ===
                'CRITICAL'
              ) {

                items.push({
                  id:
                    `alert-${inc.id}`,

                  level:
                    'HIGH',

                  title:
                    inc.name,

                  message:
                    inc.description
                      .split('.')[0] +
                    '.',

                  incidentId:
                    inc.id,

                  requestId:
                    inc.requestId,

                  timestamp:
                    inc.updatedAt
                })

              } else if (
                inc.status ===
                'VERIFICATION_NEEDED'
              ) {

                items.push({
                  id:
                    `alert-${inc.id}`,

                  level:
                    'VERIFICATION_REQUIRED',

                  title:
                    inc.name,

                  message:
                    'Conflicting reports require field verification.',

                  incidentId:
                    inc.id,

                  requestId:
                    inc.requestId,

                  timestamp:
                    inc.updatedAt
                })

              } else if (
                inc.roadAccess ===
                'BLOCKED'
              ) {

                items.push({
                  id:
                    `alert-${inc.id}`,

                  level:
                    'WARNING',

                  title:
                    inc.name,

                  message:
                    'Road access blocked in affected area.',

                  incidentId:
                    inc.id,

                  requestId:
                    inc.requestId,

                  timestamp:
                    inc.updatedAt
                })
              }
            }
          )


          return items

        },
        [
          incidents
        ]
      )


    /* =======================================================
       CONTEXT VALUE
       ======================================================= */

    const value:
      DataContextValue = {

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

      getRecommendedResource,

      getRecommendedRoute,

      getResourceExplanation,

      dispatchResource,

      addFieldUpdate,

      assignVerificationTeam,

      submitVerification
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

export function useData():
  DataContextValue {

  const ctx =
    useContext(
      DataContext
    )

  if (!ctx) {
    throw new Error(
      'useData must be used within DataProvider'
    )
  }

  return ctx
}