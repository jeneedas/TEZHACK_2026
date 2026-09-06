import React, { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  ShieldAlert,
  Truck,
  AlertTriangle,
} from 'lucide-react'

import { Panel, StatBox } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import type {
  Resource,
  ResourceAvailability,
  VerificationStatus,
  AccessibilityStatus,
} from '../../types'


// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

const verificationLabel: Record<VerificationStatus, string> = {
  UNVERIFIED: 'Unverified',
  VERIFIED: 'Verified',
  CONFLICTING: 'Conflicting',
  OUTDATED: 'Outdated',
}

const availabilityLabel: Record<ResourceAvailability, string> = {
  AVAILABLE: 'Available',
  LOW: 'Low',
  FULL: 'Full',
  UNAVAILABLE: 'Unavailable',
}

const accessibilityLabel: Record<AccessibilityStatus, string> = {
  ACCESSIBLE: 'Accessible',
  RESTRICTED: 'Restricted',
  BLOCKED: 'Blocked',
  UNKNOWN: 'Unknown',
}

const getVerificationTone = (
  status: VerificationStatus,
): 'primary' | 'warning' | 'critical' | 'success' => {
  if (status === 'VERIFIED') return 'success'
  if (status === 'CONFLICTING') return 'critical'
  if (status === 'OUTDATED') return 'warning'
  return 'primary'
}


const getAvailabilityTone = (
  status: ResourceAvailability,
): 'primary' | 'warning' | 'critical' | 'success' => {
  if (status === 'AVAILABLE') return 'success'
  if (status === 'LOW') return 'warning'
  if (status === 'UNAVAILABLE') return 'critical'
  return 'primary'
}


const getAccessibilityTone = (
  status: AccessibilityStatus,
): 'primary' | 'warning' | 'critical' | 'success' => {
  if (status === 'ACCESSIBLE') return 'success'
  if (status === 'RESTRICTED') return 'warning'
  if (status === 'BLOCKED') return 'critical'
  return 'primary'
}


const getResourceAvailability = (
  resource: Resource,
): ResourceAvailability => {
  if (resource.availabilityStatus) {
    return resource.availabilityStatus
  }

  switch (resource.status) {
    case 'AVAILABLE':
      return 'AVAILABLE'

    case 'FULL':
      return 'FULL'

    case 'UNAVAILABLE':
      return 'UNAVAILABLE'

    case 'EN_ROUTE':
    case 'ON_SCENE':
    case 'STANDBY':
    default:
      return 'AVAILABLE'
  }
}


const getVerificationStatus = (
  resource: Resource,
): VerificationStatus => {
  return resource.verificationStatus ?? 'UNVERIFIED'
}


const getAccessibilityStatus = (
  resource: Resource,
): AccessibilityStatus => {
  return resource.accessibilityStatus ?? 'UNKNOWN'
}


const getFreshness = (resource: Resource) => {
  const value =
    resource.lastVerifiedAt ??
    resource.lastUpdate ??
    resource.updatedAt

  if (!value) {
    return {
      label: 'Unknown',
      tone: 'text-text-secondary',
    }
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return {
      label: 'Unknown',
      tone: 'text-text-secondary',
    }
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60000),
  )

  if (minutes < 15) {
    return {
      label: 'Current',
      tone: 'text-success',
    }
  }

  if (minutes < 60) {
    return {
      label: `${minutes}m ago`,
      tone: 'text-text-secondary',
    }
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return {
      label: `${hours}h ago`,
      tone: 'text-warning',
    }
  }

  return {
    label: `${Math.floor(hours / 24)}d ago`,
    tone: 'text-critical',
  }
}


const getOperationalState = (resource: Resource) => {
  const verification = getVerificationStatus(resource)
  const availability = getResourceAvailability(resource)
  const accessibility = getAccessibilityStatus(resource)

  if (verification === 'OUTDATED') {
    return 'STALE'
  }

  if (verification === 'CONFLICTING') {
    return 'CONFLICT'
  }

  if (
    availability === 'UNAVAILABLE' ||
    accessibility === 'BLOCKED'
  ) {
    return 'NOT_USABLE'
  }

  if (verification === 'UNVERIFIED') {
    return 'UNVERIFIED'
  }

  if (availability === 'LOW') {
    return 'LIMITED'
  }

  return 'READY'
}


// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────

export const Resources: React.FC = () => {
  const { resources } = useData()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const resourceStats = useMemo(() => {
    const verified = resources.filter(
      (resource) =>
        getVerificationStatus(resource) === 'VERIFIED',
    ).length

    const unverified = resources.filter(
      (resource) =>
        getVerificationStatus(resource) === 'UNVERIFIED',
    ).length

    const conflicting = resources.filter(
      (resource) =>
        getVerificationStatus(resource) === 'CONFLICTING',
    ).length

    const outdated = resources.filter(
      (resource) =>
        getVerificationStatus(resource) === 'OUTDATED',
    ).length

    const available = resources.filter(
      (resource) =>
        getResourceAvailability(resource) === 'AVAILABLE',
    ).length

    const low = resources.filter(
      (resource) =>
        getResourceAvailability(resource) === 'LOW',
    ).length

    const blocked = resources.filter(
      (resource) =>
        getAccessibilityStatus(resource) === 'BLOCKED',
    ).length

    return {
      verified,
      unverified,
      conflicting,
      outdated,
      available,
      low,
      blocked,
    }
  }, [resources])


  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase()

    return resources
      .filter((resource) => {
        if (!query) return true

        return (
          resource.name.toLowerCase().includes(query) ||
          resource.typeLabel.toLowerCase().includes(query) ||
          resource.locationLabel.toLowerCase().includes(query) ||
          resource.providerName
            ?.toLowerCase()
            .includes(query)
        )
      })
      .filter((resource) => {
        if (filter === 'ALL') return true

        if (filter === 'VERIFICATION') {
          return (
            getVerificationStatus(resource) !== 'VERIFIED'
          )
        }

        if (filter === 'LOW') {
          return (
            getResourceAvailability(resource) === 'LOW'
          )
        }

        if (filter === 'BLOCKED') {
          return (
            getAccessibilityStatus(resource) === 'BLOCKED'
          )
        }

        if (filter === 'STALE') {
          return (
            getVerificationStatus(resource) === 'OUTDATED'
          )
        }

        return true
      })
      .sort((a, b) => {
        const stateOrder: Record<string, number> = {
          CONFLICT: 0,
          STALE: 1,
          NOT_USABLE: 2,
          UNVERIFIED: 3,
          LIMITED: 4,
          READY: 5,
        }

        return (
          stateOrder[getOperationalState(a)] -
          stateOrder[getOperationalState(b)]
        )
      })
  }, [resources, search, filter])


  const selectedResource =
    resources.find((resource) => resource.id === selectedId) ??
    null


  return (
    <div className="space-y-5">

      {/* ────────────────────────────────────────────────────────────────
          HEADER
      ──────────────────────────────────────────────────────────────── */}

      <div>

        <h1 className="text-2xl font-semibold text-text-primary">
          Resource Operations
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Know what resources exist, whether they can be trusted,
          whether they are available, and whether they can actually
          be reached.
        </p>

      </div>


      {/* ────────────────────────────────────────────────────────────────
          OPERATIONAL SUMMARY
      ──────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <StatBox
          label="Verified"
          value={resourceStats.verified}
          tone="success"
          sub={`${resourceStats.available} currently available`}
        />

        <StatBox
          label="Needs verification"
          value={
            resourceStats.unverified +
            resourceStats.conflicting +
            resourceStats.outdated
          }
          tone={
            resourceStats.unverified +
              resourceStats.conflicting +
              resourceStats.outdated >
            0
              ? 'warning'
              : 'default'
          }
          sub={`${resourceStats.conflicting} conflicting · ${resourceStats.outdated} outdated`}
        />

        <StatBox
          label="Limited supply"
          value={resourceStats.low}
          tone={
            resourceStats.low > 0
              ? 'warning'
              : 'default'
          }
          sub="Resources approaching depletion"
        />

        <StatBox
          label="Access blocked"
          value={resourceStats.blocked}
          tone={
            resourceStats.blocked > 0
              ? 'critical'
              : 'default'
          }
          sub="Cannot currently be reached"
        />

      </div>


      {/* ────────────────────────────────────────────────────────────────
          RESOURCE WORKSPACE
      ──────────────────────────────────────────────────────────────── */}

      <Panel noPadding>

        {/* TOOLBAR */}

        <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative min-w-0 flex-1 lg:max-w-md">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search resource, type, location or provider"
              className="w-full border border-border bg-panel py-2 pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
            />

          </div>


          <div className="flex flex-wrap gap-1.5">

            <FilterButton
              label="All"
              active={filter === 'ALL'}
              onClick={() => setFilter('ALL')}
            />

            <FilterButton
              label="Needs verification"
              active={filter === 'VERIFICATION'}
              onClick={() => setFilter('VERIFICATION')}
            />

            <FilterButton
              label="Low supply"
              active={filter === 'LOW'}
              onClick={() => setFilter('LOW')}
            />

            <FilterButton
              label="Blocked access"
              active={filter === 'BLOCKED'}
              onClick={() => setFilter('BLOCKED')}
            />

            <FilterButton
              label="Outdated"
              active={filter === 'STALE'}
              onClick={() => setFilter('STALE')}
            />

          </div>

        </div>


        {/* TABLE + DETAIL */}

        <div className="grid min-h-[500px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">

          {/* RESOURCE LIST */}

          <div className="overflow-x-auto">

            <table className="w-full border-collapse text-left text-sm">

              <thead>

                <tr className="border-b border-border bg-bg text-[10px] font-semibold uppercase tracking-wide text-text-secondary">

                  <th className="px-4 py-3">
                    Resource
                  </th>

                  <th className="px-4 py-3">
                    Verification
                  </th>

                  <th className="px-4 py-3">
                    Supply
                  </th>

                  <th className="px-4 py-3">
                    Access
                  </th>

                  <th className="px-4 py-3">
                    Freshness
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredResources.map((resource) => {

                  const verification =
                    getVerificationStatus(resource)

                  const availability =
                    getResourceAvailability(resource)

                  const accessibility =
                    getAccessibilityStatus(resource)

                  const freshness =
                    getFreshness(resource)

                  const state =
                    getOperationalState(resource)

                  return (

                    <tr
                      key={resource.id}
                      onClick={() =>
                        setSelectedId(resource.id)
                      }
                      className={`cursor-pointer border-b border-border last:border-0 hover:bg-bg ${
                        selectedId === resource.id
                          ? 'bg-infobg'
                          : ''
                      }`}
                    >

                      {/* RESOURCE */}

                      <td className="px-4 py-3">

                        <div className="flex items-start gap-3">

                          <div className="mt-0.5 text-text-secondary">
                            <Package size={16} />
                          </div>

                          <div>

                            <div className="font-semibold text-text-primary">
                              {resource.name}
                            </div>

                            <div className="mt-0.5 text-xs text-text-secondary">
                              {resource.typeLabel}
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-[11px] text-text-secondary">
                              <MapPin size={11} />
                              {resource.locationLabel}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* VERIFICATION */}

                      <td className="px-4 py-3">

                        <Badge
                          tone={getVerificationTone(
                            verification,
                          )}
                        >
                          {verificationLabel[verification]}
                        </Badge>

                      </td>


                      {/* SUPPLY */}

                      <td className="px-4 py-3">

                        <div className="font-semibold text-text-primary">
                          {availabilityLabel[availability]}
                        </div>

                        {resource.availableQuantity != null && (
                          <div className="mt-0.5 text-xs text-text-secondary">
                            {resource.availableQuantity}
                            {resource.unit
                              ? ` ${resource.unit}`
                              : ''}
                            {resource.capacity != null
                              ? ` / ${resource.capacity}`
                              : ''}
                          </div>
                        )}

                      </td>


                      {/* ACCESS */}

                      <td className="px-4 py-3">

                        <Badge
                          tone={getAccessibilityTone(
                            accessibility,
                          )}
                        >
                          {accessibilityLabel[
                            accessibility
                          ]}
                        </Badge>

                      </td>


                      {/* FRESHNESS */}

                      <td className="px-4 py-3">

                        <div className={freshness.tone}>
                          {freshness.label}
                        </div>

                        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-text-secondary">
                          {state === 'READY'
                            ? 'Operational'
                            : state === 'LIMITED'
                              ? 'Limited'
                              : state === 'STALE'
                                ? 'Revalidation needed'
                                : state === 'CONFLICT'
                                  ? 'Conflict'
                                  : state === 'NOT_USABLE'
                                    ? 'Not usable'
                                    : 'Review'}
                        </div>

                      </td>

                    </tr>

                  )
                })}

              </tbody>

            </table>


            {filteredResources.length === 0 && (
              <div className="flex min-h-[300px] items-center justify-center px-6 text-sm text-text-secondary">
                No resources match the current filters.
              </div>
            )}

          </div>


          {/* DETAIL PANEL */}

          <div className="border-t border-border lg:border-l lg:border-t-0">

            {selectedResource ? (

              <ResourceDetail
                resource={selectedResource}
              />

            ) : (

              <div className="flex h-full min-h-[300px] items-center justify-center p-6">

                <div className="max-w-xs text-center">

                  <Package
                    size={24}
                    className="mx-auto text-text-secondary"
                  />

                  <div className="mt-3 text-sm font-semibold text-text-primary">
                    Select a resource
                  </div>

                  <div className="mt-1 text-xs leading-5 text-text-secondary">
                    Select a resource from the operational list to inspect its current truth state.
                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </Panel>


      {/* ────────────────────────────────────────────────────────────────
          ZIVA PRINCIPLE
      ──────────────────────────────────────────────────────────────── */}

      <div className="border-l-2 border-primary bg-infobg px-4 py-3">

        <div className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Operational rule
        </div>

        <div className="mt-1 text-sm font-semibold text-text-primary">
          Verified does not mean available. Available does not mean reachable.
        </div>

        <div className="mt-1 text-xs leading-5 text-text-secondary">
          ZIVA evaluates verification, supply and accessibility separately before a resource is considered suitable for assistance.
        </div>

      </div>

    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE DETAIL
// ═══════════════════════════════════════════════════════════════════════════

const ResourceDetail: React.FC<{
  resource: Resource
}> = ({ resource }) => {

  const verification =
    getVerificationStatus(resource)

  const availability =
    getResourceAvailability(resource)

  const accessibility =
    getAccessibilityStatus(resource)

  const freshness =
    getFreshness(resource)

  const state =
    getOperationalState(resource)

  return (
    <div className="p-4">

      {/* HEADER */}

      <div className="border-b border-border pb-4">

        <div className="flex items-start justify-between gap-3">

          <div>

            <div className="text-lg font-semibold text-text-primary">
              {resource.name}
            </div>

            <div className="mt-1 text-xs text-text-secondary">
              {resource.typeLabel}
            </div>

          </div>

          <div
            className={`text-[10px] font-semibold uppercase tracking-wide ${
              state === 'READY'
                ? 'text-success'
                : state === 'LIMITED'
                  ? 'text-warning'
                  : state === 'NOT_USABLE'
                    ? 'text-critical'
                    : 'text-warning'
            }`}
          >
            {state.replace(/_/g, ' ')}
          </div>

        </div>

      </div>


      {/* TRUTH */}

      <div className="py-4">

        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          Current operational truth
        </div>


        <div className="mt-3 space-y-3">

          <TruthRow
            icon={<CheckCircle2 size={15} />}
            label="Verification"
            value={verificationLabel[verification]}
            tone={getVerificationTone(verification)}
          />

          <TruthRow
            icon={<Package size={15} />}
            label="Availability"
            value={availabilityLabel[availability]}
            tone={getAvailabilityTone(availability)}
          />

          <TruthRow
            icon={<Truck size={15} />}
            label="Accessibility"
            value={accessibilityLabel[accessibility]}
            tone={getAccessibilityTone(accessibility)}
          />

          <TruthRow
            icon={<Clock3 size={15} />}
            label="Freshness"
            value={freshness.label}
            tone="default"
          />

        </div>

      </div>


      {/* SUPPLY */}

      <div className="border-t border-border py-4">

        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          Supply
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">

          <DetailValue
            label="Available"
            value={
              resource.availableQuantity != null
                ? `${resource.availableQuantity}${resource.unit ? ` ${resource.unit}` : ''}`
                : 'Not reported'
            }
          />

          <DetailValue
            label="Capacity"
            value={
              resource.capacity != null
                ? `${resource.capacity}${resource.unit ? ` ${resource.unit}` : ''}`
                : 'Not reported'
            }
          />

        </div>

      </div>


      {/* LOCATION */}

      <div className="border-t border-border py-4">

        <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          Location
        </div>

        <div className="mt-2 flex items-start gap-2">

          <MapPin
            size={15}
            className="mt-0.5 text-text-secondary"
          />

          <div>

            <div className="text-sm font-semibold text-text-primary">
              {resource.locationLabel}
            </div>

            <div className="mt-1 font-mono text-[10px] text-text-secondary">
              {resource.position.lat.toFixed(5)},{' '}
              {resource.position.lng.toFixed(5)}
            </div>

          </div>

        </div>

      </div>


      {/* PROVIDER */}

      {(resource.providerName ||
        resource.publicContact) && (

        <div className="border-t border-border py-4">

          <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
            Provider
          </div>

          {resource.providerName && (
            <div className="mt-2 text-sm font-semibold text-text-primary">
              {resource.providerName}
            </div>
          )}

          {resource.publicContact && (
            <div className="mt-1 text-xs text-text-secondary">
              {resource.publicContact}
            </div>
          )}

        </div>

      )}


      {/* EVIDENCE */}

      <div className="border-t border-border py-4">

        <div className="flex items-center gap-2">

          {resource.evidence &&
          resource.evidence.length > 0 ? (
            <CheckCircle2
              size={15}
              className="text-success"
            />
          ) : (
            <ShieldAlert
              size={15}
              className="text-warning"
            />
          )}

          <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
            Evidence
          </div>

        </div>


        <div className="mt-2 text-xs leading-5 text-text-secondary">

          {resource.evidence &&
          resource.evidence.length > 0
            ? `${resource.evidence.length} evidence item${
                resource.evidence.length === 1
                  ? ''
                  : 's'
              } attached`
            : 'No supporting evidence attached'}

        </div>

      </div>


      {/* WARNING */}

      {(verification !== 'VERIFIED' ||
        availability === 'LOW' ||
        accessibility !== 'ACCESSIBLE') && (

        <div className="border-t border-border pt-4">

          <div className="flex items-start gap-2 border-l-2 border-warning bg-bg px-3 py-2.5">

            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-warning"
            />

            <div className="text-xs leading-5 text-text-secondary">

              {verification === 'CONFLICTING' &&
                'Conflicting reports exist. This resource should not be treated as fully trusted until reviewed.'}

              {verification === 'OUTDATED' &&
                'This resource has stale information and requires revalidation.'}

              {verification === 'UNVERIFIED' &&
                'This resource has not yet been verified.'}

              {verification === 'VERIFIED' &&
                availability === 'LOW' &&
                'Supply is low and may not satisfy a new request completely.'}

              {verification === 'VERIFIED' &&
                availability !== 'LOW' &&
                accessibility === 'RESTRICTED' &&
                'Access is restricted. Matching should account for route limitations.'}

              {verification === 'VERIFIED' &&
                accessibility === 'BLOCKED' &&
                'This resource is currently unreachable and should not be preferred for matching.'}

              {verification === 'VERIFIED' &&
                availability !== 'LOW' &&
                accessibility === 'UNKNOWN' &&
                'Accessibility has not been confirmed.'}

            </div>

          </div>

        </div>

      )}

    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// FILTER BUTTON
// ═══════════════════════════════════════════════════════════════════════════

const FilterButton: React.FC<{
  label: string
  active: boolean
  onClick: () => void
}> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
      active
        ? 'border-primary bg-infobg text-primary'
        : 'border-border bg-panel text-text-secondary hover:bg-bg'
    }`}
  >
    {label}
  </button>
)


// ═══════════════════════════════════════════════════════════════════════════
// TRUTH ROW
// ═══════════════════════════════════════════════════════════════════════════

const TruthRow: React.FC<{
  icon: React.ReactNode
  label: string
  value: string
  tone:
    | 'primary'
    | 'success'
    | 'warning'
    | 'critical'
    | 'default'
}> = ({
  icon,
  label,
  value,
  tone,
}) => {

  const toneClass =
    tone === 'success'
      ? 'text-success'
      : tone === 'warning'
        ? 'text-warning'
        : tone === 'critical'
          ? 'text-critical'
          : 'text-text-primary'

  return (
    <div className="flex items-center justify-between gap-3">

      <div className="flex items-center gap-2 text-text-secondary">

        {icon}

        <span className="text-xs">
          {label}
        </span>

      </div>

      <span
        className={`text-xs font-semibold ${toneClass}`}
      >
        {value}
      </span>

    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// DETAIL VALUE
// ═══════════════════════════════════════════════════════════════════════════

const DetailValue: React.FC<{
  label: string
  value: string
}> = ({
  label,
  value,
}) => (
  <div className="border border-border px-3 py-2.5">

    <div className="text-[10px] uppercase tracking-wide text-text-secondary">
      {label}
    </div>

    <div className="mt-1 text-sm font-semibold text-text-primary">
      {value}
    </div>

  </div>
)