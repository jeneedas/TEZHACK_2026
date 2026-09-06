import React from 'react'

export interface MapLayers {
  incidents: boolean
  affectedAreas: boolean
  responseTeams: boolean
  hospitals: boolean
  reliefCamps: boolean
  roadHazards: boolean
  informationFog: boolean
}

export const defaultMapLayers: MapLayers = {
  incidents: true,
  affectedAreas: false,
  responseTeams: true,
  hospitals: true,
  reliefCamps: true,
  roadHazards: true,
  informationFog: true,
}

const layerLabels: { key: keyof MapLayers; label: string }[] = [
  {
    key: 'incidents',
    label: 'Citizen Reports',
  },
  {
    key: 'affectedAreas',
    label: 'Affected Areas',
  },
  {
    key: 'responseTeams',
    label: 'Resources',
  },
  {
    key: 'hospitals',
    label: 'Medical',
  },
  {
    key: 'reliefCamps',
    label: 'Shelters',
  },
  {
    key: 'roadHazards',
    label: 'Road Status',
  },
  {
    key: 'informationFog',
    label: 'Verification Status',
  },
]

export const MapLayersControl: React.FC<{
  layers: MapLayers
  onChange: (layers: MapLayers) => void
  className?: string
}> = ({ layers, onChange, className = '' }) => {
  const toggle = (key: keyof MapLayers) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    })
  }

  return (
    <div
      className={`w-[190px] rounded border border-border bg-panel/95 p-2.5 text-xs shadow-sm ${className}`}
    >
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        Map Layers
      </div>

      <ul className="space-y-1.5">
        {layerLabels.map(({ key, label }) => (
          <li key={key}>
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggle(key)}
                className="h-3.5 w-3.5 rounded-sm accent-[#1558A6]"
              />

              {label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}