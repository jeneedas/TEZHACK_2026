import React, { useState } from 'react'
import { kamrupReliefCamps } from '../../data/kamrupReliefCamps'
import { Panel } from '../../components/ui/Panel'
import { ReliefCampTable } from '../../components/ReliefCampTable/ReliefCampTable'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import type { ReliefCamp } from '../../types'

export const ReliefCamps: React.FC = () => {
  const [focused, setFocused] = useState<ReliefCamp | null>(null)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Relief Camps</h1>
        <div className="mt-1 text-sm text-text-secondary">Camp occupancy and resource availability</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <Panel title="Camp Status" noPadding>
          <ReliefCampTable camps={kamrupReliefCamps} onSelect={setFocused} />
        </Panel>
        <IncidentMap
          height="400px"
          showLayersControl={false}
          defaultLayers={{ incidents: false, affectedAreas: false, responseTeams: false, hospitals: false, roadHazards: false }}
          focusPosition={focused ? [focused.position.lat, focused.position.lng] : undefined}
          focusZoom={focused ? 13 : undefined}
        />
      </div>
    </div>
  )
}
