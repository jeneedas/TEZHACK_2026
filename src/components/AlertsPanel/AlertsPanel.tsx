import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { AlertItem } from '../../types'
import { Badge, type BadgeTone } from '../ui/Badge'

const levelTone: Record<AlertItem['level'], BadgeTone> = {
  CRITICAL: 'critical',
  HIGH: 'warning',
  WARNING: 'warning',
  VERIFICATION_REQUIRED: 'info'
}

const levelLabel: Record<AlertItem['level'], string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  WARNING: 'Warning',
  VERIFICATION_REQUIRED: 'Verification Required'
}

export const AlertsPanel: React.FC<{ alerts: AlertItem[]; limit?: number }> = ({ alerts, limit }) => {
  const navigate = useNavigate()
  const rows = limit ? alerts.slice(0, limit) : alerts

  if (rows.length === 0) {
    return <div className="py-6 text-center text-sm text-text-secondary">No active alerts.</div>
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((a) => (
        <li
          key={a.id}
          onClick={() => a.incidentId && navigate(`/incidents/${a.incidentId}`)}
          className={`flex items-start gap-3 py-2.5 ${a.incidentId ? 'cursor-pointer hover:bg-bg' : ''}`}
        >
          <Badge tone={levelTone[a.level]} className="mt-0.5 whitespace-nowrap">
            {levelLabel[a.level]}
          </Badge>
          <div>
            <div className="text-sm font-semibold text-text-primary">{a.title}</div>
            <div className="text-xs text-text-secondary">{a.message}</div>
          </div>
        </li>
      ))}
    </ul>
  )
}
