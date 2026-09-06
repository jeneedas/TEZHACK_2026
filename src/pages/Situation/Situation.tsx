import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import { IncidentPanel } from '../../components/IncidentPanel/IncidentPanel'
import { Panel, StatBox } from '../../components/ui/Panel'
import { DispatchModal } from '../../components/DispatchModal/DispatchModal'
import type { Incident } from '../../types'

export const Situation: React.FC = () => {
  const { incidents, resources } = useData()
  const [selected, setSelected] = useState<Incident | null>(null)
  const [dispatching, setDispatching] = useState<Incident | null>(null)

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED')
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length
  const totalAffected = incidents.reduce((sum, i) => sum + i.affectedPeople, 0)
  const rescued = 12 // demo counter reflecting the Village C update
  const activeTeams = resources.filter((r) => r.status === 'EN_ROUTE' || r.status === 'ON_SCENE').length
  const highFogAreas = incidents.filter((i) => i.informationFog >= 60).length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Live Situation</h1>
        <div className="mt-1 text-sm text-text-secondary">Kamrup District · Real-time operational view</div>
      </div>

      <Panel title="Kamrup District Overview" className="mb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatBox label="Active Incidents" value={activeIncidents.length} />
          <StatBox label="Critical" value={String(criticalCount).padStart(2, '0')} tone="critical" />
          <StatBox label="People Affected" value={totalAffected.toLocaleString('en-IN')} tone="warning" />
          <StatBox label="People Rescued" value={rescued} tone="success" />
          <StatBox label="Active Response Teams" value={activeTeams} />
          <StatBox label="Information Fog" value={`${highFogAreas} high-risk`} tone="warning" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <IncidentMap height="680px" onSelectIncident={setSelected} />
        <div className="min-h-[300px]">
          {selected ? (
            <IncidentPanel
              incident={selected}
              onClose={() => setSelected(null)}
              onDispatch={() => setDispatching(selected)}
            />
          ) : (
            <Panel title="Instructions" className="h-full">
              <p className="text-sm text-text-secondary">
                Click any incident marker on the map to view priority, confidence, and AI recommendations.
                Toggle map layers to inspect affected zones, response teams, hospitals, relief camps, road
                hazards, and information fog.
              </p>
            </Panel>
          )}
        </div>
      </div>

      {dispatching && <DispatchModal incident={dispatching} onClose={() => setDispatching(null)} />}
    </div>
  )
}
