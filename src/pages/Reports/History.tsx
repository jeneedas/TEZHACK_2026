import React from 'react'
import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import { Badge, statusTone } from '../../components/ui/Badge'

export const History: React.FC = () => {
  const { incidents, assignments, verifications, getResource } = useData()
  const resolved = incidents.filter((i) => i.status === 'RESOLVED')

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">History</h1>
        <div className="mt-1 text-sm text-text-secondary">Past incidents, dispatch actions, and verification records</div>
      </div>

      <Panel title="Resolved Incidents" className="mb-5" noPadding>
        {resolved.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No resolved incidents.</div>
        ) : (
          <ul className="divide-y divide-border">
            {resolved.map((i) => (
              <li key={i.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-mono text-xs text-text-secondary">{i.code}</span>{' '}
                  <span className="font-semibold text-text-primary">{i.name}</span>
                </div>
                <Badge tone="success">RESOLVED</Badge>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Dispatch Log" className="mb-5" noPadding>
        {assignments.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No dispatch history.</div>
        ) : (
          <ul className="divide-y divide-border">
            {assignments.map((a) => {
              const resource = getResource(a.resourceId)
              const incident = incidents.find((i) => i.id === a.incidentId)
              return (
                <li key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="font-mono text-xs text-text-secondary">{a.dispatchedAt}</span>{' '}
                    <span className="font-semibold text-text-primary">{resource?.name}</span> → {incident?.name}
                  </div>
                  <Badge tone={statusTone(a.status)}>{a.status.replace('_', ' ')}</Badge>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Verification History" noPadding>
        {verifications.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No verification records.</div>
        ) : (
          <ul className="divide-y divide-border">
            {verifications.map((v) => (
              <li key={v.id} className="px-4 py-3 text-sm">
                <div className="font-semibold text-text-primary">{v.location}</div>
                <div className="text-xs text-text-secondary">
                  Confidence {v.confidenceBefore}% {v.confidenceAfter ? `→ ${v.confidenceAfter}%` : ''} · Fog{' '}
                  {v.fogBefore}% {v.fogAfter ? `→ ${v.fogAfter}%` : ''}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
