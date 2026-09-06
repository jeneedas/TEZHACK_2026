import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialFogAreas } from '../../data/kamrupFog'
import { Panel } from '../../components/ui/Panel'
import { IncidentMap } from '../../components/IncidentMap/IncidentMap'
import { Badge } from '../../components/ui/Badge'

export const InformationFog: React.FC = () => {
  const navigate = useNavigate()
  const sorted = [...initialFogAreas].sort((a, b) => b.fogPercent - a.fogPercent)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Information Fog</h1>
        <div className="mt-1 text-sm text-text-secondary">
          Locations where information is unreliable or insufficient for confident decision-making
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <IncidentMap height="560px" defaultLayers={{ informationFog: true }} />

        <Panel title="High Uncertainty Locations" noPadding>
          <ul className="divide-y divide-border">
            {sorted.map((f) => (
              <li
                key={f.id}
                onMouseEnter={() => setHovered(f.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => f.incidentId && navigate(`/incidents/${f.incidentId}`)}
                className={`px-4 py-3 ${f.incidentId ? 'cursor-pointer' : ''} ${
                  hovered === f.id ? 'bg-bg' : ''
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{f.location}</span>
                  <Badge tone={f.fogPercent >= 70 ? 'critical' : f.fogPercent >= 50 ? 'warning' : 'neutral'}>
                    {f.fogPercent}% FOG
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Confidence: {f.confidencePercent}%</span>
                  <span>Reports: {f.reports}</span>
                </div>
                <div className="mt-0.5 text-xs text-text-secondary">Last verified: {f.lastVerified}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
