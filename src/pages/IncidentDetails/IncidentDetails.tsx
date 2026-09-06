import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldAlert,
  Users,
} from 'lucide-react'

import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import {
  Badge,
  severityTone,
  statusTone,
} from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { FieldUpdates } from '../../components/FieldUpdates/FieldUpdates'
import { DispatchModal } from '../../components/DispatchModal/DispatchModal'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'


// ─────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  AWAITING_DISPATCH: 'Awaiting dispatch',
  TEAM_ASSIGNED: 'Team assigned',
  EN_ROUTE: 'En route',
  IN_PROGRESS: 'In progress',
  VERIFICATION_NEEDED: 'Verification needed',
  RESOLVED: 'Resolved',
}

const getStatusLabel = (status: string) =>
  statusLabel[status] ?? status.replace(/_/g, ' ')


// ─────────────────────────────────────────────────────────────────────────
// PRIORITY
// ─────────────────────────────────────────────────────────────────────────

const getPriorityBand = (score: number) => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MEDIUM'
  return 'LOW'
}

const getPriorityColor = (score: number) => {
  if (score >= 80) return 'text-red-700'
  if (score >= 60) return 'text-orange-700'
  if (score >= 35) return 'text-yellow-700'
  return 'text-text-primary'
}


// ─────────────────────────────────────────────────────────────────────────
// FRESHNESS
// ─────────────────────────────────────────────────────────────────────────

const getFreshness = (updatedAt?: string) => {
  if (!updatedAt) {
    return {
      label: 'Unknown',
      tone: 'text-text-secondary',
    }
  }

  const time = new Date(updatedAt).getTime()

  if (Number.isNaN(time)) {
    return {
      label: 'Unknown',
      tone: 'text-text-secondary',
    }
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - time) / 60000),
  )

  if (minutes < 15) {
    return {
      label: 'Current',
      tone: 'text-green-700',
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
      tone: 'text-orange-700',
    }
  }

  return {
    label: `${Math.floor(hours / 24)}d ago`,
    tone: 'text-red-700',
  }
}


// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────

export const IncidentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    getIncident,
    getReportsForIncident,
    getRoutesForIncident,
    fieldUpdates,
    resources,
  } = useData()

  const [dispatching, setDispatching] = useState(false)

  const incident = id ? getIncident(id) : undefined

  if (!incident) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/incidents')}
        >
          <ArrowLeft size={14} />
          Back to requests
        </Button>

        <div className="mt-4 text-sm text-text-secondary">
          Request not found.
        </div>
      </div>
    )
  }

  const reports = getReportsForIncident(incident.id)

  const routes = getRoutesForIncident(incident.id)

  const updates = fieldUpdates.filter(
    (update) => update.incidentId === incident.id,
  )

  const assignedResources = resources.filter((resource) =>
    incident.assignedResourceIds.includes(resource.id),
  )

  const freshness = getFreshness(incident.updatedAt)

  const needsVerification =
    incident.status === 'VERIFICATION_NEEDED' ||
    incident.confidenceScore < 70

  const priorityBand = getPriorityBand(
    incident.priorityScore,
  )

  const verificationSummary =
    incident.status === 'VERIFICATION_NEEDED'
      ? 'Coordinator review required'
      : incident.confidenceScore < 50
        ? 'Low confidence'
        : incident.confidenceScore < 70
          ? 'Needs corroboration'
          : incident.confidenceScore < 85
            ? 'Moderate confidence'
            : 'High confidence'

  return (
    <div className="space-y-5">

      {/* ────────────────────────────────────────────────────────────────
          BACK
      ──────────────────────────────────────────────────────────────── */}

      <button
        onClick={() => navigate('/incidents')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary hover:text-primary"
      >
        <ArrowLeft size={13} />
        Back to requests
      </button>


      {/* ────────────────────────────────────────────────────────────────
          REQUEST HEADER
      ──────────────────────────────────────────────────────────────── */}

      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <span className="font-mono text-sm font-semibold text-text-secondary">
              {incident.code}
            </span>

            <Badge tone={severityTone(incident.severity)}>
              {incident.severity}
            </Badge>

            <Badge tone={statusTone(incident.status)}>
              {getStatusLabel(incident.status)}
            </Badge>

          </div>


          <h1 className="mt-2 text-2xl font-semibold text-text-primary">
            {incident.name}
          </h1>


          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">

            <span>
              {incident.typeLabel}
            </span>

            <span>·</span>

            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              Kamrup District
            </span>

            <span>·</span>

            <span className={freshness.tone}>
              Updated {freshness.label}
            </span>

          </div>

        </div>


        <div className="flex items-center gap-2">

          {needsVerification && (
            <Button
              variant="secondary"
              onClick={() => navigate('/verification')}
            >
              <ShieldAlert size={15} />
              Review verification
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => setDispatching(true)}
          >
            Match assistance
          </Button>

        </div>

      </div>


      {/* ────────────────────────────────────────────────────────────────
          ZIVA OPERATIONAL PIPELINE
      ──────────────────────────────────────────────────────────────── */}

      <div className="border-y border-border bg-panel">

        <div className="flex flex-wrap">

          <Stage
            label="Report"
            active
            complete
          />

          <Stage
            label="Verify"
            active={needsVerification}
            complete={!needsVerification}
            warning={needsVerification}
          />

          <Stage
            label="Prioritize"
            active
            complete
          />

          <Stage
            label="Match"
            active={assignedResources.length === 0}
            complete={assignedResources.length > 0}
          />

          <Stage
            label="Assist"
            active={
              assignedResources.length > 0 &&
              incident.status !== 'RESOLVED'
            }
            complete={incident.status === 'RESOLVED'}
          />

          <Stage
            label="Update"
            active={updates.length > 0}
            complete={incident.status === 'RESOLVED'}
          />

        </div>

      </div>


      {/* ────────────────────────────────────────────────────────────────
          MAIN WORKSPACE
      ──────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">


        {/* ═══════════════════════════════════════════════════════════════
            LEFT — OPERATIONAL SITUATION
        ═══════════════════════════════════════════════════════════════ */}

        <div className="space-y-5">


          {/* SITUATION */}

          <Panel title="Situation">

            <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4">

              <Stat
                icon={<Users size={15} />}
                label="Affected"
                value={incident.affectedPeople}
              />

              <Stat
                icon={<AlertTriangle size={15} />}
                label="Trapped"
                value={incident.trappedPeople}
                critical
              />

              <Stat
                icon={<ShieldAlert size={15} />}
                label="Medical"
                value={incident.medicalRequests}
              />

              <Stat
                icon={<MapPin size={15} />}
                label="Road access"
                value={incident.roadAccess}
              />

            </div>


            <div className="pt-4">

              <p className="text-sm leading-6 text-text-secondary">
                {incident.description}
              </p>

            </div>

          </Panel>


          {/* OPERATIONAL MAP */}

          <Panel
            title="Operational location"
            actions={
              <button
                onClick={() => navigate('/incident-map')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Open live map
              </button>
            }
          >

            <IncidentMap
              height="390px"
              showLayersControl={false}
              focusPosition={[
                incident.position.lat,
                incident.position.lng,
              ]}
              focusZoom={13}
            />


            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-text-secondary">

              <span>
                Exact requester location is restricted to operational use.
              </span>

              <span className="font-mono">
                {incident.position.lat.toFixed(5)},{' '}
                {incident.position.lng.toFixed(5)}
              </span>

            </div>

          </Panel>


          {/* ROUTES */}

          {routes.length > 0 && (
            <Panel title="Access and route assessment">

              <div className="overflow-hidden border border-border">

                <table className="w-full border-collapse text-left text-sm">

                  <thead>

                    <tr className="border-b border-border bg-bg text-[10px] font-semibold uppercase tracking-wide text-text-secondary">

                      <th className="px-3 py-2.5">
                        Route
                      </th>

                      <th className="px-3 py-2.5">
                        Distance
                      </th>

                      <th className="px-3 py-2.5">
                        ETA
                      </th>

                      <th className="px-3 py-2.5">
                        Risk
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {routes.map((route) => (

                      <tr
                        key={route.id}
                        className={`border-b border-border last:border-0 ${
                          route.recommended
                            ? 'bg-infobg'
                            : ''
                        }`}
                      >

                        <td className="px-3 py-3">

                          <div className="flex items-center gap-2">

                            <span className="font-semibold text-text-primary">
                              {route.label}
                            </span>

                            {route.recommended && (
                              <Badge tone="primary">
                                Recommended
                              </Badge>
                            )}

                          </div>


                          {route.hazardNote && (
                            <div className="mt-1 text-xs text-text-secondary">
                              {route.hazardNote}
                            </div>
                          )}

                        </td>


                        <td className="px-3 py-3 text-text-secondary">
                          {route.distanceKm} km
                        </td>


                        <td className="px-3 py-3 text-text-secondary">
                          {route.etaMinutes} min
                        </td>


                        <td className="px-3 py-3">

                          <Badge
                            tone={
                              route.risk === 'HIGH'
                                ? 'critical'
                                : route.risk === 'MEDIUM'
                                  ? 'warning'
                                  : 'success'
                            }
                          >
                            {route.risk}
                          </Badge>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              <div className="mt-3 text-xs text-text-secondary">
                Route selection considers distance, travel time and reported hazard risk rather than distance alone.
              </div>

            </Panel>
          )}


          {/* ASSISTANCE */}

          <Panel
            title="Assistance"
            actions={
              assignedResources.length === 0 ? (
                <Button
                  variant="primary"
                  onClick={() => setDispatching(true)}
                >
                  Find assistance
                </Button>
              ) : undefined
            }
          >

            {assignedResources.length === 0 ? (

              <div className="border-l-2 border-orange-500 py-1 pl-3">

                <div className="text-sm font-semibold text-text-primary">
                  No assistance assigned
                </div>

                <div className="mt-1 text-xs leading-5 text-text-secondary">
                  Review suitable resources and assign assistance once the request is ready.
                </div>

              </div>

            ) : (

              <div className="divide-y divide-border">

                {assignedResources.map((resource) => (

                  <div
                    key={resource.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >

                    <div>

                      <div className="font-semibold text-text-primary">
                        {resource.name}
                      </div>

                      <div className="mt-0.5 text-xs text-text-secondary">
                        {resource.typeLabel}
                      </div>

                    </div>


                    <div className="text-right">

                      <Badge
                        tone={statusTone(resource.status)}
                      >
                        {resource.status.replace(/_/g, ' ')}
                      </Badge>


                      {resource.etaMinutes != null && (
                        <div className="mt-1 text-xs text-text-secondary">
                          ETA {resource.etaMinutes} min
                        </div>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </Panel>


          {/* FIELD UPDATES */}

          <Panel title="Operational updates">

            {updates.length === 0 ? (

              <div className="flex items-center gap-2 text-sm text-text-secondary">

                <Clock3 size={15} />

                No field updates have been received.

              </div>

            ) : (

              <FieldUpdates updates={updates} />

            )}

          </Panel>

        </div>


        {/* ═══════════════════════════════════════════════════════════════
            RIGHT — DECISION PANEL
        ═══════════════════════════════════════════════════════════════ */}

        <div className="space-y-5">


          {/* PRIORITY */}

          <Panel title="Priority decision">

            <div className="flex items-end justify-between border-b border-border pb-4">

              <div>

                <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                  Operational priority
                </div>

                <div
                  className={`mt-1 text-4xl font-semibold ${getPriorityColor(
                    incident.priorityScore,
                  )}`}
                >
                  {incident.priorityScore}
                </div>

              </div>


              <div className="text-right">

                <div className="text-xs font-semibold text-text-primary">
                  {priorityBand}
                </div>

                <div className="mt-1 text-[10px] uppercase tracking-wide text-text-secondary">
                  priority band
                </div>

              </div>

            </div>


            <div className="mt-4 space-y-3">

              <DecisionFactor
                label="Severity"
                value={incident.severity}
              />

              <DecisionFactor
                label="People affected"
                value={`${incident.affectedPeople}`}
              />

              <DecisionFactor
                label="Trapped"
                value={`${incident.trappedPeople}`}
                critical
              />

              <DecisionFactor
                label="Medical requests"
                value={`${incident.medicalRequests}`}
              />

              <DecisionFactor
                label="Information confidence"
                value={`${incident.confidenceScore}%`}
              />

            </div>


            <div className="mt-4 border-t border-border pt-3 text-xs leading-5 text-text-secondary">
              Priority is decision support. Coordinators retain responsibility for the final operational decision.
            </div>

          </Panel>


          {/* TRUST */}

          <Panel title="Information trust">

            <div className="flex items-start gap-3">

              <div
                className={`mt-0.5 ${
                  needsVerification
                    ? 'text-orange-600'
                    : 'text-green-700'
                }`}
              >

                {needsVerification ? (
                  <ShieldAlert size={19} />
                ) : (
                  <CheckCircle2 size={19} />
                )}

              </div>


              <div>

                <div className="text-sm font-semibold text-text-primary">
                  {verificationSummary}
                </div>

                <div className="mt-1 text-xs leading-5 text-text-secondary">
                  Confidence: {incident.confidenceScore}% ·{' '}
                  {reports.length} supporting report
                  {reports.length === 1 ? '' : 's'}
                </div>

              </div>

            </div>


            <div className="mt-4 border-t border-border pt-3">

              <div className="flex items-center justify-between text-xs">

                <span className="text-text-secondary">
                  Information freshness
                </span>

                <span
                  className={`font-semibold ${freshness.tone}`}
                >
                  {freshness.label}
                </span>

              </div>


              {needsVerification && (

                <button
                  onClick={() => navigate('/verification')}
                  className="mt-3 flex w-full items-center justify-between border border-border px-3 py-2.5 text-left text-xs font-semibold text-text-primary hover:bg-bg"
                >

                  <span>
                    Open verification queue
                  </span>

                  <ChevronRight size={14} />

                </button>

              )}

            </div>

          </Panel>


          {/* SOURCE REPORTS */}

          <Panel title="Source reports">

            {reports.length === 0 ? (

              <div className="text-sm text-text-secondary">
                No source reports attached.
              </div>

            ) : (

              <div className="divide-y divide-border">

                {reports.map((report) => (

                  <div
                    key={report.id}
                    className="py-3 first:pt-0 last:pb-0"
                  >

                    <div className="flex items-center justify-between gap-2">

                      <span className="font-mono text-[11px] font-semibold text-text-primary">
                        {report.id}
                      </span>

                      <Badge
                        tone={
                          report.credibility === 'HIGH'
                            ? 'success'
                            : report.credibility === 'MEDIUM'
                              ? 'warning'
                              : 'critical'
                        }
                      >
                        {report.credibility}
                      </Badge>

                    </div>


                    <p className="mt-2 text-xs leading-5 text-text-secondary">
                      {report.content}
                    </p>


                    <div className="mt-2 text-[10px] uppercase tracking-wide text-text-secondary">
                      Source ·{' '}
                      {report.source.replace(/_/g, ' ')}
                    </div>

                  </div>

                ))}

              </div>

            )}

          </Panel>


          {/* COORDINATOR ACTIONS */}

          <Panel title="Coordinator action">

            <div className="space-y-2">

              {needsVerification && (
                <ActionRow
                  icon={<ShieldAlert size={15} />}
                  title="Verify information"
                  description="Review sources and resolve uncertainty."
                  onClick={() => navigate('/verification')}
                />
              )}


              <ActionRow
                icon={<ChevronRight size={15} />}
                title="Match assistance"
                description="Find a suitable resource for this need."
                onClick={() => setDispatching(true)}
              />


              <ActionRow
                icon={<MapPin size={15} />}
                title="View operational map"
                description="Inspect demand, resources and access."
                onClick={() => navigate('/incident-map')}
              />

            </div>

          </Panel>


          {/* DECISION SUPPORT */}

          <Panel title="Decision support">

            <div className="border-l-2 border-border pl-3">

              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                AI assistance
              </div>

              <div className="mt-1 text-xs leading-5 text-text-secondary">
                Automated analysis may help classify or summarize incoming information. It does not verify truth or make autonomous emergency decisions.
              </div>

            </div>

          </Panel>

        </div>

      </div>


      {/* ────────────────────────────────────────────────────────────────
          MATCH / DISPATCH MODAL
      ──────────────────────────────────────────────────────────────── */}

      {dispatching && (
        <DispatchModal
          incident={incident}
          onClose={() => setDispatching(false)}
        />
      )}

    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════
// STAGE
// ═══════════════════════════════════════════════════════════════════════════

const Stage: React.FC<{
  label: string
  active?: boolean
  complete?: boolean
  warning?: boolean
}> = ({
  label,
  active = false,
  complete = false,
  warning = false,
}) => (
  <div
    className={`border-r border-border px-4 py-3 last:border-r-0 ${
      active || complete
        ? 'bg-panel'
        : 'bg-bg'
    }`}
  >

    <div className="flex items-center gap-2">

      <span
        className={`h-2 w-2 rounded-full ${
          warning
            ? 'bg-orange-500'
            : complete
              ? 'bg-green-600'
              : active
                ? 'bg-primary'
                : 'bg-border'
        }`}
      />

      <span
        className={`text-[10px] font-semibold uppercase tracking-wide ${
          active || complete
            ? 'text-text-primary'
            : 'text-text-secondary'
        }`}
      >
        {label}
      </span>

    </div>

  </div>
)


// ═══════════════════════════════════════════════════════════════════════════
// STAT
// ═══════════════════════════════════════════════════════════════════════════

const Stat: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | number
  critical?: boolean
}> = ({
  icon,
  label,
  value,
  critical = false,
}) => (
  <div className="border-r border-border px-3 py-3 last:border-r-0">

    <div className="flex items-center gap-1.5 text-text-secondary">

      {icon}

      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>

    </div>


    <div
      className={`mt-1 text-xl font-semibold ${
        critical
          ? 'text-red-700'
          : 'text-text-primary'
      }`}
    >
      {value}
    </div>

  </div>
)


// ═══════════════════════════════════════════════════════════════════════════
// DECISION FACTOR
// ═══════════════════════════════════════════════════════════════════════════

const DecisionFactor: React.FC<{
  label: string
  value: string
  critical?: boolean
}> = ({
  label,
  value,
  critical = false,
}) => (
  <div className="flex items-center justify-between text-xs">

    <span className="text-text-secondary">
      {label}
    </span>

    <span
      className={`font-semibold ${
        critical
          ? 'text-red-700'
          : 'text-text-primary'
      }`}
    >
      {value}
    </span>

  </div>
)


// ═══════════════════════════════════════════════════════════════════════════
// ACTION ROW
// ═══════════════════════════════════════════════════════════════════════════

const ActionRow: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}> = ({
  icon,
  title,
  description,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex w-full items-center gap-3 border-b border-border px-1 py-3 text-left last:border-b-0 hover:bg-bg"
  >

    <div className="text-text-secondary">
      {icon}
    </div>

    <div className="min-w-0 flex-1">

      <div className="text-sm font-semibold text-text-primary">
        {title}
      </div>

      <div className="mt-0.5 text-xs text-text-secondary">
        {description}
      </div>

    </div>

    <ChevronRight
      size={15}
      className="shrink-0 text-text-secondary"
    />

  </button>
)