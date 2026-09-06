import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Incident } from '../../types'
import { Badge, statusTone } from '../ui/Badge'

const statusLabel: Record<Incident['status'], string> = {
  ACTIVE: 'Active',
  AWAITING_DISPATCH: 'Awaiting dispatch',
  TEAM_ASSIGNED: 'Team assigned',
  EN_ROUTE: 'En route',
  IN_PROGRESS: 'In progress',
  VERIFICATION_NEEDED: 'Verification needed',
  RESOLVED: 'Resolved'
}

export const PriorityTable: React.FC<{ incidents: Incident[]; limit?: number }> = ({ incidents, limit }) => {
  const navigate = useNavigate()
  const sorted = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore)
  const rows = limit ? sorted.slice(0, limit) : sorted

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-3 py-2">Priority</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Incident</th>
            <th className="px-3 py-2">Confidence</th>
            <th className="px-3 py-2">People at Risk</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((inc) => (
            <tr
              key={inc.id}
              onClick={() => navigate(`/incidents/${inc.id}`)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-bg"
            >
              <td className="px-3 py-2.5 font-bold text-text-primary">{inc.priorityScore}</td>
              <td className="px-3 py-2.5">{inc.name}</td>
              <td className="px-3 py-2.5 text-text-secondary">{inc.typeLabel}</td>
              <td className="px-3 py-2.5">{inc.confidenceScore}%</td>
              <td className="px-3 py-2.5">{inc.trappedPeople > 0 ? inc.trappedPeople : '—'}</td>
              <td className="px-3 py-2.5">
                <Badge tone={statusTone(inc.status)}>{statusLabel[inc.status]}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
