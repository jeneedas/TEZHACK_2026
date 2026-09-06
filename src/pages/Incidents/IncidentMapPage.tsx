import React, { useState } from 'react'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import { IncidentPanel } from '../../components/IncidentPanel/IncidentPanel'
import { DispatchModal } from '../../components/DispatchModal/DispatchModal'
import type { Incident } from '../../types'

export const IncidentMapPage: React.FC = () => {
  const [selected, setSelected] = useState<Incident | null>(null)
  const [dispatching, setDispatching] = useState<Incident | null>(null)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Incident Map</h1>
        <div className="mt-1 text-sm text-text-secondary">Kamrup District · Full operational map view</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <IncidentMap height="calc(100vh - 210px)" onSelectIncident={setSelected} />
        <div className="min-h-[300px]">
          {selected && (
            <IncidentPanel
              incident={selected}
              onClose={() => setSelected(null)}
              onDispatch={() => setDispatching(selected)}
            />
          )}
        </div>
      </div>

      {dispatching && <DispatchModal incident={dispatching} onClose={() => setDispatching(null)} />}
    </div>
  )
}
