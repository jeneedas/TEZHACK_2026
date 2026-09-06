import React from 'react'
import type { ReliefCamp } from '../../types'
import { Badge } from '../ui/Badge'

export const ReliefCampTable: React.FC<{ camps: ReliefCamp[]; onSelect?: (c: ReliefCamp) => void }> = ({
  camps,
  onSelect
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-3 py-2">Camp</th>
            <th className="px-3 py-2">Location</th>
            <th className="px-3 py-2">Capacity</th>
            <th className="px-3 py-2">Occupied</th>
            <th className="px-3 py-2">Water</th>
            <th className="px-3 py-2">Food</th>
          </tr>
        </thead>
        <tbody>
          {camps.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect?.(c)}
              className={`border-b border-border last:border-0 ${onSelect ? 'cursor-pointer hover:bg-bg' : ''}`}
            >
              <td className="px-3 py-2.5 font-semibold text-text-primary">{c.name}</td>
              <td className="px-3 py-2.5">{c.location}</td>
              <td className="px-3 py-2.5">{c.capacity}</td>
              <td className="px-3 py-2.5">{c.occupied}</td>
              <td className="px-3 py-2.5">
                <Badge tone={c.water === 'Available' ? 'success' : 'warning'}>{c.water}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <Badge tone={c.food === 'Available' ? 'success' : 'warning'}>{c.food}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
