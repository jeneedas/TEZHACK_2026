import React from 'react'

export const MapLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-[190px] rounded border border-border bg-panel/95 p-2.5 text-xs shadow-sm ${className}`}>
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        Map Legend
      </div>
      <ul className="space-y-1">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-critical" /> Critical Incident
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> High Priority
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Active Response
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" /> Hospital
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#7C5CBF' }} /> Relief Camp
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 bg-critical" /> Blocked Road
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 border border-text-secondary bg-text-secondary/25" /> Information
          Fog
        </li>
      </ul>
    </div>
  )
}
