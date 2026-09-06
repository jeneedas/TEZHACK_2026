import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import { IncidentPanel } from '../../components/IncidentPanel/IncidentPanel'
import { DispatchModal } from '../../components/DispatchModal/DispatchModal'
import { Panel } from '../../components/ui/Panel'
import type { Incident } from '../../types'
import { useNavigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const { incidents } = useData()

  const [selected, setSelected] = useState<Incident | null>(null)
  const [dispatching, setDispatching] = useState<Incident | null>(null)

  const navigate = useNavigate()

  const activeIncidents = incidents.filter(
    (incident) => incident.status !== 'RESOLVED'
  )

  const criticalCount = incidents.filter(
    (incident) => incident.severity === 'CRITICAL'
  ).length

  const highFogCount = incidents.filter(
    (incident) => incident.informationFog >= 60
  ).length

  return (
    <div className="h-full">
      {/* Page heading */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            ZIVA Operations
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Live disaster information and assistance coordination
          </p>
        </div>

        <div className="hidden text-right text-xs text-text-secondary sm:block">
          <div className="font-semibold text-text-primary">
            KAMRUP DISTRICT
          </div>
          <div>Coordinator view</div>
        </div>
      </div>

      {/* Operational status line */}
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-2.5 text-xs">
        <span>
          <strong className="text-text-primary">
            {activeIncidents.length}
          </strong>{' '}
          active reports
        </span>

        <span>
          <strong className="text-critical">
            {criticalCount}
          </strong>{' '}
          critical
        </span>

        <span>
          <strong className="text-warning">
            {highFogCount}
          </strong>{' '}
          require verification
        </span>

        <span className="ml-auto text-text-secondary">
          Information updates continuously
        </span>
      </div>

      {/* Main operational workspace */}
      <div className="grid min-h-[620px] grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* MAP */}
        <Panel className="min-h-[620px] p-0 overflow-hidden">
          <div className="relative h-full min-h-[620px]">
            <IncidentMap
              height="620px"
              onSelectIncident={setSelected}
            />

            {/* Map label */}
            <div className="absolute left-3 top-3 z-[1000] border border-border bg-panel px-3 py-2 shadow-sm">
              <div className="text-xs font-semibold text-text-primary">
                LIVE OPERATIONAL MAP
              </div>

              <div className="mt-0.5 text-[10px] text-text-secondary">
                Reports · Resources · Response activity
              </div>
            </div>
          </div>
        </Panel>

        {/* RIGHT SIDE WORKSPACE */}
        <div className="flex min-h-[620px] flex-col">

          {selected ? (
            <IncidentPanel
              incident={selected}
              onClose={() => setSelected(null)}
              onDispatch={() => setDispatching(selected)}
            />
          ) : (
            <Panel
              title="Needs Attention"
              className="flex-1"
            >
              <div className="divide-y divide-border">

                {activeIncidents
                  .slice()
                  .sort((a, b) => {
                    const priority = {
                      CRITICAL: 3,
                      HIGH: 2,
                      MEDIUM: 1,
                      LOW: 0,
                    }

                    return (
                      (priority[b.severity] ?? 0) -
                      (priority[a.severity] ?? 0)
                    )
                  })
                  .slice(0, 7)
                  .map((incident) => (
                    <button
                      key={incident.id}
                      onClick={() => setSelected(incident)}
                      className="block w-full px-4 py-3 text-left hover:bg-bg"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-text-primary">
                            {incident.name}
                          </div>

                          <div className="mt-1 text-xs text-text-secondary">
                            {incident.typeLabel}
                          </div>
                        </div>

                        <span
                          className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide ${
                            incident.severity === 'CRITICAL'
                              ? 'text-critical'
                              : incident.severity === 'HIGH'
                                ? 'text-warning'
                                : 'text-text-secondary'
                          }`}
                        >
                          {incident.severity}
                        </span>

                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-text-secondary">
                        <span>
                          {incident.affectedPeople.toLocaleString('en-IN')}{' '}
                          affected
                        </span>

                        <span>
                          {incident.informationFog >= 60
                            ? 'Needs verification'
                            : 'Reported'}
                        </span>
                      </div>
                    </button>
                  ))}

                {activeIncidents.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    No active reports.
                  </div>
                )}

              </div>

              <div className="mt-auto border-t border-border px-4 py-3">
                <button
                  onClick={() => navigate('/incidents')}
                  className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                >
                  View all reports →
                </button>
              </div>
            </Panel>
          )}

          {/* Workflow hint */}
          {!selected && (
            <div className="mt-4 border-t border-border pt-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                ZIVA RESPONSE PIPELINE
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-text-primary">
                <span>Report</span>
                <span className="text-text-secondary">→</span>
                <span>Verify</span>
                <span className="text-text-secondary">→</span>
                <span>Prioritize</span>
                <span className="text-text-secondary">→</span>
                <span>Assist</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {dispatching && (
        <DispatchModal
          incident={dispatching}
          onClose={() => setDispatching(null)}
        />
      )}
    </div>
  )
}