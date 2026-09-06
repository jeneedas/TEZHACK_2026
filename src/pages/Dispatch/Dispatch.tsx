import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import { Badge, severityTone, statusTone } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DispatchModal } from '../../components/DispatchModal/DispatchModal'

export const Dispatch: React.FC = () => {
  const { incidents, assignments, getResource } = useData()
  const [dispatchingId, setDispatchingId] = useState<string | null>(null)

  const pending = incidents
    .filter((i) => i.status === 'AWAITING_DISPATCH')
    .sort((a, b) => b.priorityScore - a.priorityScore)

  const dispatching = pending.find((i) => i.id === dispatchingId)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Resource Dispatch</h1>
        <div className="mt-1 text-sm text-text-secondary">Deploy resources to incidents awaiting response</div>
      </div>

      <Panel title="Awaiting Dispatch" className="mb-5" noPadding>
        {pending.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No incidents currently awaiting dispatch.</div>
        ) : (
          <ul className="divide-y divide-border">
            {pending.map((inc) => (
              <li key={inc.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-text-secondary">{inc.code}</span>
                    <span className="font-semibold text-text-primary">{inc.name}</span>
                    <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Priority {inc.priorityScore} · Confidence {inc.confidenceScore}% · {inc.typeLabel}
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => setDispatchingId(inc.id)}>
                  Dispatch Resource
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent Dispatch Log" noPadding>
        {assignments.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No dispatches yet.</div>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Resource</th>
                <th className="px-4 py-2.5">Incident</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">ETA</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => {
                const resource = getResource(a.resourceId)
                const incident = incidents.find((i) => i.id === a.incidentId)
                return (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs">{a.dispatchedAt}</td>
                    <td className="px-4 py-2.5 font-semibold text-text-primary">{resource?.name}</td>
                    <td className="px-4 py-2.5">{incident?.name}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={statusTone(a.status)}>{a.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-2.5">{a.etaMinutes} min</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {dispatching && <DispatchModal incident={dispatching} onClose={() => setDispatchingId(null)} />}
    </div>
  )
}
