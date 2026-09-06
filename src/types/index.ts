// ─────────────────────────────────────────────────────────────────────────
// ZIVA — Shared Operational Data Models
//
// These models are shared by:
// Citizen App → Firebase → Coordinator Portal
//
// The current coordinator prototype still contains some legacy ZIVA
// compatibility fields. They are retained temporarily so existing demo
// data/services continue to work while the system is migrated.
// ─────────────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════════════
// COMMON
// ═══════════════════════════════════════════════════════════════════════════

export interface LatLng {
  lat: number
  lng: number
}

export type Severity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'


// ═══════════════════════════════════════════════════════════════════════════
// USERS / ROLES
// ═══════════════════════════════════════════════════════════════════════════

export type UserRole =
  | 'CITIZEN'
  | 'COORDINATOR'
  | 'PROVIDER'
  | 'VOLUNTEER'
  | 'ADMIN'

export interface User {
  id: string
  role: UserRole

  name?: string
  phone?: string

  /*
   * Exact location is private operational information.
   * It must never be exposed through public resource data.
   */
  exactLocation?: LatLng

  preferredLanguage?: string

  createdAt: string
  updatedAt: string
}


// ═══════════════════════════════════════════════════════════════════════════
// REQUEST / ASSISTANCE STATE
// ═══════════════════════════════════════════════════════════════════════════

/*
 * ZIVA request lifecycle:
 *
 * SUBMITTED
 *    ↓
 * TRIAGED
 *    ↓
 * PRIORITIZED
 *    ↓
 * MATCHED
 *    ↓
 * ASSIGNED
 *    ↓
 * IN_PROGRESS
 *    ↓
 * FULFILLED
 *    ↓
 * CLOSED
 *
 * Alternative terminal states:
 * CANCELLED / EXPIRED / UNFULFILLABLE
 */

export type RequestStatus =
  | 'SUBMITTED'
  | 'TRIAGED'
  | 'PRIORITIZED'
  | 'MATCHED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'FULFILLED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'UNFULFILLABLE'


/*
 * Legacy status values retained because the existing ZIVA-derived
 * incident services still use them.
 */
export type IncidentStatus =
  | 'ACTIVE'
  | 'AWAITING_DISPATCH'
  | 'TEAM_ASSIGNED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'VERIFICATION_NEEDED'
  | 'RESOLVED'


// ═══════════════════════════════════════════════════════════════════════════
// REQUEST / NEED TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NeedType =
  | 'WATER'
  | 'FOOD'
  | 'MEDICINE'
  | 'MEDICAL'
  | 'SHELTER'
  | 'RESCUE'
  | 'EVACUATION'
  | 'TRANSPORT'
  | 'CLOTHING'
  | 'SANITATION'
  | 'POWER'
  | 'COMMUNICATION'
  | 'OTHER'


/*
 * Legacy incident categories retained for current demo datasets.
 */

export type IncidentType =
  | 'FLOOD'
  | 'FLOOD_TRAPPED'
  | 'BUILDING_COLLAPSE'
  | 'LANDSLIDE'
  | 'WATERLOGGING'
  | 'ROAD_BLOCKAGE'
  | 'FIRE'
  | 'MEDICAL_EMERGENCY'


// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION / TRUST
// ═══════════════════════════════════════════════════════════════════════════

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'VERIFIED'
  | 'CONFLICTING'
  | 'OUTDATED'


export type Credibility =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'


export type ReportStatus =
  | 'VERIFIED'
  | 'REQUIRES_VERIFICATION'
  | 'REJECTED'
  | 'PENDING'
  | 'CONFLICTING'


export type EvidenceType =
  | 'PHOTO'
  | 'VIDEO'
  | 'FIELD_OBSERVATION'
  | 'OFFICIAL_SOURCE'
  | 'CITIZEN_REPORT'
  | 'PROVIDER_UPDATE'
  | 'SENSOR'
  | 'OTHER'


export interface Evidence {
  id: string
  type: EvidenceType

  /*
   * URL/storage reference rather than raw file data.
   */
  uri?: string

  description?: string

  submittedBy?: string
  submittedAt: string
}


// ═══════════════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════════════

export type ReportSource =
  | 'CITIZEN'
  | 'FIELD_TEAM'
  | 'OFFICIAL'
  | 'SOCIAL_MEDIA'
  | 'REMOTE_SENSING'
  | 'EMERGENCY_CALL'


export interface Report {
  id: string

  /*
   * A report can later belong to a request, resource or
   * general incident/area.
   */
  incidentId?: string
  requestId?: string
  resourceId?: string

  source: ReportSource

  location: string
  position?: LatLng

  content: string

  credibility: Credibility
  confidence: number

  timestamp: string

  status: ReportStatus

  reason?: string

  corroboratingReports: number
  conflictingReports: number

  evidence?: Evidence[]

  submittedBy?: string

  createdAt?: string
  updatedAt?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// CITIZEN REQUEST
// ═══════════════════════════════════════════════════════════════════════════

export interface Request {
  id: string

  /*
   * Human-readable request identifier.
   * Example: ZV-1042
   */
  code: string

  requesterId?: string

  /*
   * Public operational information.
   * Exact requester identity/contact remains private.
   */
  needType: NeedType
  needLabel: string

  description: string

  position: LatLng
  locationLabel?: string

  peopleAffected: number

  /*
   * These fields are intentionally explicit because
   * priority depends on more than severity alone.
   */
  severity: Severity

  vulnerabilityScore: number

  priorityScore: number

  /*
   * 0–100.
   * Decision support, not proof of truth.
   */
  informationConfidence: number

  verificationStatus: VerificationStatus

  status: RequestStatus

  createdAt: string
  updatedAt: string

  lastVerifiedAt?: string

  assignedResourceIds: string[]

  assignmentIds: string[]

  reportIds: string[]

  privateRequesterNote?: string

  preferredLanguage?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// LEGACY INCIDENT / CURRENT OPERATIONAL COMPATIBILITY MODEL
// ═══════════════════════════════════════════════════════════════════════════

/*
 * This remains temporarily because the existing map, incidentService,
 * intelligenceService and demo datasets use Incident.
 *
 * Conceptually:
 *
 * Incident ≈ grouped operational request/report situation.
 *
 * We will eventually migrate the remaining code to Request.
 */

export interface Incident {
  id: string

  code: string
  name: string

  type: IncidentType
  typeLabel: string

  severity: Severity

  position: LatLng

  /*
   * Derived decision-support values.
   */
  priorityScore: number
  confidenceScore: number
  informationFog: number

  affectedPeople: number
  trappedPeople: number
  medicalRequests: number

  roadAccess:
    | 'OPEN'
    | 'PARTIAL'
    | 'BLOCKED'

  status: IncidentStatus

  description: string

  reportIds: string[]

  assignedResourceIds: string[]

  recommendedResourceId?: string
  recommendedRouteId?: string

  lastVerified: string

  createdAt: string
  updatedAt: string

  // ───────────────────────────────────────────────────────────────────────
  // ZIVA additions
  // ───────────────────────────────────────────────────────────────────────

  requestId?: string

  verificationStatus?: VerificationStatus

  vulnerabilityScore?: number

  needType?: NeedType

  locationLabel?: string

  /*
   * Current operational truth dimensions.
   */
  availabilityStatus?:
    | 'AVAILABLE'
    | 'LOW'
    | 'FULL'
    | 'UNAVAILABLE'

  accessibilityStatus?:
    | 'ACCESSIBLE'
    | 'RESTRICTED'
    | 'BLOCKED'
    | 'UNKNOWN'
}


// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE
// ═══════════════════════════════════════════════════════════════════════════

export type ResourceType =
  | 'RESCUE_BOAT'
  | 'RESCUE_TEAM'
  | 'AMBULANCE'
  | 'HEAVY_MACHINERY'
  | 'AIR_SUPPORT'
  | 'FIELD_VERIFICATION_TEAM'
  | 'WATER'
  | 'FOOD'
  | 'MEDICINE'
  | 'SHELTER'
  | 'TRANSPORT'
  | 'OTHER'


/*
 * Physical/operational movement state.
 */
export type ResourceStatus =
  | 'AVAILABLE'
  | 'EN_ROUTE'
  | 'STANDBY'
  | 'ON_SCENE'
  | 'UNAVAILABLE'
  | 'FULL'


/*
 * ZIVA deliberately separates availability from
 * verification and accessibility.
 */
export type ResourceAvailability =
  | 'AVAILABLE'
  | 'LOW'
  | 'FULL'
  | 'UNAVAILABLE'


export type AccessibilityStatus =
  | 'ACCESSIBLE'
  | 'RESTRICTED'
  | 'BLOCKED'
  | 'UNKNOWN'


export interface Resource {
  id: string

  name: string

  type: ResourceType
  typeLabel: string

  /*
   * Legacy operational status.
   */
  status: ResourceStatus

  position: LatLng

  locationLabel: string

  personnel?: number

  destinationIncidentId?: string

  etaMinutes?: number

  lastUpdate?: string

  // ───────────────────────────────────────────────────────────────────────
  // ZIVA RESOURCE TRUTH
  // ───────────────────────────────────────────────────────────────────────

  providerId?: string
  providerName?: string

  /*
   * Quantity model.
   *
   * Example:
   * 5000 L water
   * 200 meal units
   * 30 beds
   */
  quantity?: number
  unit?: string

  capacity?: number
  availableQuantity?: number

  verificationStatus?: VerificationStatus

  availabilityStatus?: ResourceAvailability

  accessibilityStatus?: AccessibilityStatus

  lastVerifiedAt?: string

  /*
   * Evidence supporting the resource claim.
   */
  evidence?: Evidence[]

  /*
   * Public-facing contact.
   * Sensitive provider/private contact should not be
   * exposed to citizens.
   */
  publicContact?: string

  createdAt?: string
  updatedAt?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE UPDATES
// ═══════════════════════════════════════════════════════════════════════════

export interface ResourceUpdate {
  id: string

  resourceId: string

  previousAvailability?:
    ResourceAvailability

  newAvailability?:
    ResourceAvailability

  previousQuantity?: number
  newQuantity?: number

  verificationStatus?:
    VerificationStatus

  accessibilityStatus?:
    AccessibilityStatus

  message?: string

  updatedBy?: string

  timestamp: string
}


// ═══════════════════════════════════════════════════════════════════════════
// ROUTES / ACCESS
// ═══════════════════════════════════════════════════════════════════════════

export interface RouteOption {
  id: string
  label: string
  incidentId: string
  distanceKm: number
  etaMinutes: number
  risk: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'OPEN' | 'PARTIAL' | 'BLOCKED'
  hazardNote?: string
  score: number
  recommended?: boolean

  accessibility?:
    | 'ACCESSIBLE'
    | 'RESTRICTED'
    | 'BLOCKED'
    | 'UNKNOWN'

  updatedAt?: string
}

export interface RoadStatus {
  id: string

  roadName: string

  position?: LatLng

  status:
    | 'OPEN'
    | 'PARTIAL'
    | 'BLOCKED'
    | 'UNKNOWN'

  risk:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'

  reason?: string

  lastVerifiedAt?: string

  sourceReportIds?: string[]

  updatedAt: string
}


// ═══════════════════════════════════════════════════════════════════════════
// MATCHING
// ═══════════════════════════════════════════════════════════════════════════

export interface ResourceMatch {
  id: string

  requestId: string

  resourceId: string

  score: number

  /*
   * Explainability.
   */
  priorityFit: number
  trustFit: number
  freshnessFit: number
  capacityFit: number
  distanceFit: number
  accessibilityFit: number
  routeRiskPenalty: number

  reasons: string[]

  status:
    | 'RECOMMENDED'
    | 'SELECTED'
    | 'REJECTED'
    | 'EXPIRED'

  createdAt: string
  updatedAt: string
}


// ═══════════════════════════════════════════════════════════════════════════
// ASSIGNMENTS / ASSISTANCE
// ═══════════════════════════════════════════════════════════════════════════

export type AssignmentStatus =
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'COMPLETED'
  | 'CANCELLED'


export interface Assignment {
  id: string

  incidentId: string

  /*
   * New request linkage.
   */
  requestId?: string

  resourceId: string

  routeId?: string

  status: AssignmentStatus

  dispatchedAt: string

  etaMinutes: number

  reason: string

  startedAt?: string
  arrivedAt?: string
  completedAt?: string

  lastKnownPosition?: LatLng

  lastLocationUpdateAt?: string

  rerouteCount?: number
}


// ═══════════════════════════════════════════════════════════════════════════
// FIELD UPDATES
// ═══════════════════════════════════════════════════════════════════════════

export interface FieldUpdate {
  id: string

  time: string

  resourceId?: string

  resourceName: string

  incidentId?: string

  requestId?: string

  location: string

  position?: LatLng

  message: string

  metrics?: {
    rescued?: number
    remaining?: number
    floodDepthM?: number
    affected?: number

    road?:
      | 'OPEN'
      | 'PARTIAL'
      | 'BLOCKED'

    quantityRemaining?: number
  }

  requiresFollowUp?: boolean

  createdAt?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export type VerificationTaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'SUBMITTED'
  | 'COMPLETE'
  | 'CANCELLED'


export interface Verification {
  id: string

  incidentId: string

  requestId?: string

  location: string

  confidenceBefore: number

  confidenceAfter?: number

  fogBefore: number

  fogAfter?: number

  assignedTeamId?: string

  status: VerificationTaskStatus

  /*
   * What was actually verified.
   */
  submittedData?: {
    affectedPeople: number
    trappedPeople: number
    medicalRequests: number

    roadAccess:
      | 'OPEN'
      | 'PARTIAL'
      | 'BLOCKED'

    resourceAvailable?: boolean
    resourceQuantity?: number
  }

  evidence?: Evidence[]

  assignedAt?: string
  submittedAt?: string
  completedAt?: string

  verifierId?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// AUDIT / HISTORY
// ═══════════════════════════════════════════════════════════════════════════

export type AuditEntityType =
  | 'REQUEST'
  | 'RESOURCE'
  | 'REPORT'
  | 'ASSIGNMENT'
  | 'VERIFICATION'
  | 'ROAD'


export interface AuditEvent {
  id: string

  entityType: AuditEntityType

  entityId: string

  action: string

  previousValue?: unknown
  newValue?: unknown

  performedBy?: string

  timestamp: string
}


// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType =
  | 'REQUEST_CREATED'
  | 'REQUEST_PRIORITY_CHANGED'
  | 'VERIFICATION_REQUIRED'
  | 'RESOURCE_UPDATED'
  | 'RESOURCE_OUTDATED'
  | 'CONFLICT_DETECTED'
  | 'MATCH_FOUND'
  | 'ASSIGNMENT_CREATED'
  | 'ROAD_BLOCKED'
  | 'ASSISTANCE_COMPLETED'


export interface Notification {
  id: string

  type: NotificationType

  title: string

  message: string

  requestId?: string
  incidentId?: string
  resourceId?: string
  assignmentId?: string

  read: boolean

  createdAt: string
}


// ═══════════════════════════════════════════════════════════════════════════
// OFFLINE / SYNC
// ═══════════════════════════════════════════════════════════════════════════

export type SyncOperationType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'


export type SyncOperationStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SERVER_RECEIVED'
  | 'CONFIRMED'
  | 'FAILED'


export interface SyncOperation {
  id: string

  entityType:
    | 'REQUEST'
    | 'REPORT'
    | 'RESOURCE'
    | 'ASSIGNMENT'
    | 'FIELD_UPDATE'

  entityId: string

  operation: SyncOperationType

  payload: unknown

  status: SyncOperationStatus

  retryCount: number

  createdAt: string

  lastAttemptAt?: string

  error?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// HOSPITALS
// ═══════════════════════════════════════════════════════════════════════════

export interface Hospital {
  id: string

  name: string

  position: LatLng

  distanceKm: number

  beds: number

  icu: number

  emergency:
    | 'Available'
    | 'Limited'

  status:
    | 'OPEN'
    | 'LIMITED'
    | 'FULL'

  /*
   * ZIVA additions.
   */
  availableBeds?: number
  availableIcu?: number

  lastVerifiedAt?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// RELIEF CAMPS / SHELTERS
// ═══════════════════════════════════════════════════════════════════════════

export interface ReliefCamp {
  id: string

  name: string

  location: string

  position: LatLng

  capacity: number

  occupied: number

  water:
    | 'Available'
    | 'Low'

  food:
    | 'Available'
    | 'Low'

  /*
   * ZIVA additions.
   */
  availabilityStatus?:
    | 'AVAILABLE'
    | 'LOW'
    | 'FULL'
    | 'UNAVAILABLE'

  accessibilityStatus?:
    | 'ACCESSIBLE'
    | 'RESTRICTED'
    | 'BLOCKED'
    | 'UNKNOWN'

  lastVerifiedAt?: string
}


// ═══════════════════════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════════════════════

export interface AlertItem {
  id: string

  level:
    | 'CRITICAL'
    | 'HIGH'
    | 'WARNING'
    | 'VERIFICATION_REQUIRED'

  title: string

  message: string

  incidentId?: string

  requestId?: string

  resourceId?: string

  timestamp: string
}


// ═══════════════════════════════════════════════════════════════════════════
// INFORMATION UNCERTAINTY
// ═══════════════════════════════════════════════════════════════════════════

export interface InformationFogArea {
  id: string

  location: string

  fogPercent: number

  confidencePercent: number

  reports: number

  lastVerified: string

  position: LatLng

  incidentId?: string

  /*
   * ZIVA interpretation:
   *
   * Low reporting ≠ low need.
   * This is an uncertainty indicator, not a safety indicator.
   */
  informationState?:
    | 'LOW_INFORMATION'
    | 'NORMAL'
    | 'CONFLICTING'
    | 'STALE'
}