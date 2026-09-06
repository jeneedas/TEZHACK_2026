import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import { Badge, statusTone } from '../../components/ui/Badge'
import { FieldUpdates } from '../../components/FieldUpdates/FieldUpdates'
import { Button } from '../../components/ui/Button'

export const FieldTeams: React.FC = () => {
  const { resources, incidents, fieldUpdates, addFieldUpdate } = useData()
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

  const teams = resources.filter(
    (r) => r.type === 'RESCUE_TEAM' || r.type === 'RESCUE_BOAT' || r.type === 'FIELD_VERIFICATION_TEAM'
  )
  const selected = teams.find((t) => t.id === selectedResourceId) ?? teams.find((t) => t.status === 'EN_ROUTE') ?? teams[0]
  const destinationIncident = selected?.destinationIncidentId
    ? incidents.find((i) => i.id === selected.destinationIncidentId)
    : undefined

  const handleSimulateUpdate = () => {
    if (!selected) return
    addFieldUpdate({
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      resourceName: selected.name,
      resourceId: selected.id,
      incidentId: selected.destinationIncidentId,
      location: destinationIncident?.name ?? selected.locationLabel,
      message: 'Team confirms arrival on scene. Situation assessment in progress.'
    })
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Field Teams</h1>
        <div className="mt-1 text-sm text-text-secondary">Track deployed teams and their live status</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Panel title="Teams" noPadding>
          <ul className="divide-y divide-border">
            {teams.map((t) => (
              <li
                key={t.id}
                onClick={() => setSelectedResourceId(t.id)}
                className={`cursor-pointer px-4 py-3 ${selected?.id === t.id ? 'bg-infobg' : 'hover:bg-bg'}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-semibold text-text-primary">{t.name}</span>
                  <Badge tone={statusTone(t.status)}>{t.status.replace('_', ' ')}</Badge>
                </div>
                <div className="text-xs text-text-secondary">{t.typeLabel}</div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-4">
          {selected && (
            <Panel title={selected.name}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <InfoBox label="Current Status" value={selected.status.replace('_', ' ')} />
                <InfoBox label="Destination" value={destinationIncident?.name ?? '—'} />
                <InfoBox label="ETA" value={selected.etaMinutes != null ? `${selected.etaMinutes} min` : '—'} />
                <InfoBox label="Personnel" value={selected.personnel ?? '—'} />
              </div>
              <div className="mt-3 text-xs text-text-secondary">
                Last update: {selected.lastUpdate ?? '—'}
              </div>
              <div className="mt-4">
                <Button size="sm" variant="secondary" onClick={handleSimulateUpdate}>
                  Log Field Update
                </Button>
              </div>
            </Panel>
          )}

          <Panel title="Field Updates">
            <FieldUpdates updates={fieldUpdates} />
          </Panel>
        </div>
      </div>
    </div>
  )
}

const InfoBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="border border-border rounded px-3 py-2">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
    <div className="text-sm font-semibold text-text-primary">{value}</div>
  </div>
)
