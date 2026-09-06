import React from 'react'
import type { Resource } from '../../types'
import { Badge, statusTone } from '../ui/Badge'

export const ResourceTable: React.FC<{ resources: Resource[]; onSelect?: (r: Resource) => void }> = ({
  resources,
  onSelect
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-3 py-2">Resource</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">ETA</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr
              key={r.id}
              onClick={() => onSelect?.(r)}
              className={`border-b border-border last:border-0 ${onSelect ? 'cursor-pointer hover:bg-bg' : ''}`}
            >
              <td className="px-3 py-2.5 font-semibold text-text-primary">{r.name}</td>
              <td className="px-3 py-2.5 text-text-secondary">{r.typeLabel}</td>
              <td className="px-3 py-2.5">
                <Badge tone={statusTone(r.status)}>{r.status.replace('_', ' ')}</Badge>
              </td>
              <td className="px-3 py-2.5">{r.locationLabel}</td>
              <td className="px-3 py-2.5">{r.etaMinutes != null ? `${r.etaMinutes} min` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
