import React, { useState } from 'react'
import { kamrupHospitals } from '../../data/kamrupHospitals'
import { Panel } from '../../components/ui/Panel'
import { HospitalTable } from '../../components/HospitalTable/HospitalTable'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import type { Hospital } from '../../types'

export const Hospitals: React.FC = () => {
  const [focused, setFocused] = useState<Hospital | null>(null)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Hospital Capacity</h1>
        <div className="mt-1 text-sm text-text-secondary">Medical facility availability near active incident zones</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <Panel title="Hospital Status" noPadding>
          <HospitalTable hospitals={kamrupHospitals} onSelect={setFocused} />
        </Panel>
        <IncidentMap
          height="400px"
          showLayersControl={false}
          defaultLayers={{ incidents: false, affectedAreas: false, responseTeams: false, reliefCamps: false, roadHazards: false }}
          focusPosition={focused ? [focused.position.lat, focused.position.lng] : undefined}
          focusZoom={focused ? 13 : undefined}
        />
      </div>
    </div>
  )
}
