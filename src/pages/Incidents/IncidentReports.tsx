import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Search,
  ShieldAlert,
} from 'lucide-react'

import { useData } from '../../context/DataContext'
import { Badge, severityTone, statusTone } from '../../components/ui/Badge'

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  AWAITING_DISPATCH: 'Awaiting dispatch',
  TEAM_ASSIGNED: 'Assigned',
  EN_ROUTE: 'En route',
  IN_PROGRESS: 'In progress',
  VERIFICATION_NEEDED: 'Needs verification',
  RESOLVED: 'Resolved',
}

type QueueFilter =
  | 'ALL'
  | 'CRITICAL'
  | 'VERIFICATION'
  | 'ACTIVE'
  | 'RESOLVED'

type SortKey = 'priority' | 'newest' | 'affected'

const getStatusLabel = (status: string) =>
  statusLabel[status] ?? status.replace(/_/g, ' ')

const getPriorityBand = (score: number) => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MEDIUM'
  return 'LOW'
}

const getPriorityClass = (score: number) => {
  if (score >= 80) return 'text-red-700'
  if (score >= 60) return 'text-orange-700'
  if (score >= 35) return 'text-yellow-700'
  return 'text-text-primary'
}

const getFreshness = (updatedAt?: string) => {
  if (!updatedAt) {
    return {
      label: 'Unknown',
      className: 'text-text-secondary',
    }
  }

  const updated = new Date(updatedAt).getTime()

  if (Number.isNaN(updated)) {
    return {
      label: 'Unknown',
      className: 'text-text-secondary',
    }
  }

  const minutes = Math.max(0, Math.floor((Date.now() - updated) / 60000))

  if (minutes < 15) {
    return {
      label: 'Just updated',
      className: 'text-green-700',
    }
  }

  if (minutes < 60) {
    return {
      label: `${minutes}m ago`,
      className: 'text-text-secondary',
    }
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return {
      label: `${hours}h ago`,
      className: 'text-orange-700',
    }
  }

  const days = Math.floor(hours / 24)

  return {
    label: `${days}d ago`,
    className: 'text-red-700',
  }
}

export const IncidentReports: React.FC = () => {
  const { incidents } = useData()
  const navigate = useNavigate()

  const [queueFilter, setQueueFilter] = useState<QueueFilter>('ALL')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [sortKey, setSortKey] = useState<SortKey>('priority')

  const types = useMemo(() => {
    return Array.from(
      new Set(incidents.map((incident) => incident.typeLabel)),
    ).sort()
  }, [incidents])

  const counts = useMemo(() => {
    return {
      all: incidents.length,

      critical: incidents.filter(
        (incident) => incident.priorityScore >= 80,
      ).length,

      verification: incidents.filter(
        (incident) =>
          incident.status === 'VERIFICATION_NEEDED' ||
          incident.confidenceScore < 70,
      ).length,

      active: incidents.filter(
        (incident) => incident.status !== 'RESOLVED',
      ).length,

      resolved: incidents.filter(
        (incident) => incident.status === 'RESOLVED',
      ).length,
    }
  }, [incidents])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        incident.code.toLowerCase().includes(query) ||
        incident.name.toLowerCase().includes(query) ||
        incident.typeLabel.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query)

      const matchesType =
        typeFilter === 'ALL' || incident.typeLabel === typeFilter

      let matchesQueue = true

      if (queueFilter === 'CRITICAL') {
        matchesQueue = incident.priorityScore >= 80
      }

      if (queueFilter === 'VERIFICATION') {
        matchesQueue =
          incident.status === 'VERIFICATION_NEEDED' ||
          incident.confidenceScore < 70
      }

      if (queueFilter === 'ACTIVE') {
        matchesQueue = incident.status !== 'RESOLVED'
      }

      if (queueFilter === 'RESOLVED') {
        matchesQueue = incident.status === 'RESOLVED'
      }

      return matchesSearch && matchesType && matchesQueue
    })

    return [...result].sort((a, b) => {
      if (sortKey === 'affected') {
        return b.affectedPeople - a.affectedPeople
      }

      if (sortKey === 'newest') {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        )
      }

      return b.priorityScore - a.priorityScore
    })
  }, [incidents, queueFilter, search, typeFilter, sortKey])

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-text-primary">
              Requests
            </h1>

            <span className="text-sm text-text-secondary">
              {filtered.length} shown
            </span>
          </div>

          <p className="mt-1 text-sm text-text-secondary">
            Coordinate reported needs from first triage to assistance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-green-600" />
          Information updating continuously
        </div>
      </div>

      {/* OPERATIONAL QUEUE */}

      <div className="border-y border-border bg-panel">
        <div className="flex flex-wrap items-center">
          <button
            onClick={() => setQueueFilter('ALL')}
            className={`border-r border-border px-5 py-3 text-left ${
              queueFilter === 'ALL'
                ? 'bg-bg'
                : 'hover:bg-bg'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              All requests
            </div>

            <div className="mt-0.5 text-lg font-semibold text-text-primary">
              {counts.all}
            </div>
          </button>

          <button
            onClick={() => setQueueFilter('CRITICAL')}
            className={`border-r border-border px-5 py-3 text-left ${
              queueFilter === 'CRITICAL'
                ? 'bg-bg'
                : 'hover:bg-bg'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-700">
              <AlertTriangle size={13} />
              Critical
            </div>

            <div className="mt-0.5 text-lg font-semibold text-text-primary">
              {counts.critical}
            </div>
          </button>

          <button
            onClick={() => setQueueFilter('VERIFICATION')}
            className={`border-r border-border px-5 py-3 text-left ${
              queueFilter === 'VERIFICATION'
                ? 'bg-bg'
                : 'hover:bg-bg'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-orange-700">
              <ShieldAlert size={13} />
              Verification
            </div>

            <div className="mt-0.5 text-lg font-semibold text-text-primary">
              {counts.verification}
            </div>
          </button>

          <button
            onClick={() => setQueueFilter('ACTIVE')}
            className={`border-r border-border px-5 py-3 text-left ${
              queueFilter === 'ACTIVE'
                ? 'bg-bg'
                : 'hover:bg-bg'
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
              Active
            </div>

            <div className="mt-0.5 text-lg font-semibold text-text-primary">
              {counts.active}
            </div>
          </button>

          <button
            onClick={() => setQueueFilter('RESOLVED')}
            className={`px-5 py-3 text-left ${
              queueFilter === 'RESOLVED'
                ? 'bg-bg'
                : 'hover:bg-bg'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-green-700">
              <CheckCircle2 size={13} />
              Resolved
            </div>

            <div className="mt-0.5 text-lg font-semibold text-text-primary">
              {counts.resolved}
            </div>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search request, location or report..."
            className="h-9 w-full border border-border bg-panel pl-9 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-9 border border-border bg-panel px-3 text-sm text-text-primary outline-none focus:border-primary"
          >
            <option value="ALL">All needs</option>

            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setSortKey(
                sortKey === 'priority'
                  ? 'newest'
                  : sortKey === 'newest'
                    ? 'affected'
                    : 'priority',
              )
            }
            className="flex h-9 items-center gap-2 border border-border bg-panel px-3 text-sm text-text-secondary hover:bg-bg"
          >
            <ArrowUpDown size={14} />

            {sortKey === 'priority'
              ? 'Priority'
              : sortKey === 'newest'
                ? 'Newest'
                : 'Affected'}
          </button>
        </div>
      </div>

      {/* REQUEST TABLE */}

      <div className="overflow-hidden border border-border bg-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-[10px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Need</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">People</th>
                <th className="px-4 py-3">Information</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>

            <tbody>
              {filtered.map((incident) => {
                const priorityBand = getPriorityBand(
                  incident.priorityScore,
                )

                const freshness = getFreshness(
                  incident.updatedAt,
                )

                const needsVerification =
                  incident.status === 'VERIFICATION_NEEDED' ||
                  incident.confidenceScore < 70

                return (
                  <tr
                    key={incident.id}
                    onClick={() =>
                      navigate(`/incidents/${incident.id}`)
                    }
                    className="group cursor-pointer border-b border-border last:border-0 hover:bg-bg"
                  >
                    {/* REQUEST */}

                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-bg text-text-secondary">
                          {needsVerification ? (
                            <ShieldAlert size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-text-primary">
                            {incident.name}
                          </div>

                          <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                            <span className="font-mono">
                              {incident.code}
                            </span>

                            <span>·</span>

                            <span>
                              incident.name
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NEED */}

                    <td className="px-4 py-3.5">
                      <div className="text-text-primary">
                        {incident.typeLabel}
                      </div>

                      <div className="mt-0.5 max-w-[190px] truncate text-xs text-text-secondary">
                        {incident.description}
                      </div>
                    </td>

                    {/* PRIORITY */}

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${getPriorityClass(
                            incident.priorityScore,
                          )}`}
                        >
                          {incident.priorityScore}
                        </span>

                        <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                          {priorityBand}
                        </span>
                      </div>

                      <div className="mt-1 h-1 w-20 bg-border">
                        <div
                          className={`h-1 ${
                            incident.priorityScore >= 80
                              ? 'bg-red-600'
                              : incident.priorityScore >= 60
                                ? 'bg-orange-500'
                                : incident.priorityScore >= 35
                                  ? 'bg-yellow-500'
                                  : 'bg-text-secondary'
                          }`}
                          style={{
                            width: `${Math.min(
                              incident.priorityScore,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* PEOPLE */}

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-text-primary">
                        {incident.affectedPeople}
                      </div>

                      <div className="mt-0.5 text-xs text-text-secondary">
                        affected
                      </div>
                    </td>

                    {/* INFORMATION */}

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            incident.confidenceScore < 70
                              ? 'text-orange-700'
                              : 'text-text-primary'
                          }`}
                        >
                          {incident.confidenceScore}%
                        </span>

                        <span className="text-xs text-text-secondary">
                          confidence
                        </span>
                      </div>

                      {needsVerification && (
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700">
                          Review required
                        </div>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-3.5">
                      <Badge
                        tone={statusTone(incident.status)}
                      >
                        {getStatusLabel(incident.status)}
                      </Badge>
                    </td>

                    {/* UPDATED */}

                    <td className="px-4 py-3.5">
                      <div
                        className={`text-xs font-medium ${freshness.className}`}
                      >
                        {freshness.label}
                      </div>
                    </td>

                    {/* OPEN */}

                    <td className="px-2 py-3.5">
                      <ChevronRight
                        size={16}
                        className="text-text-secondary transition-transform group-hover:translate-x-0.5"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="border-t border-border px-6 py-14 text-center">
            <div className="text-sm font-semibold text-text-primary">
              No requests match the current filters.
            </div>

            <div className="mt-1 text-xs text-text-secondary">
              Try another queue, need type or search term.
            </div>
          </div>
        )}
      </div>

      {/* FOOTER INFORMATION */}

      <div className="flex flex-col gap-1 border-t border-border pt-3 text-xs text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>
          Requests are ordered by operational priority.
        </span>

        <span>
          Verification confidence is decision support, not proof of truth.
        </span>
      </div>
    </div>
  )
}