import React from 'react'
import type { Hospital } from '../../types'
import { Badge, statusTone } from '../ui/Badge'

export const HospitalTable: React.FC<{ hospitals: Hospital[]; onSelect?: (h: Hospital) => void }> = ({
  hospitals,
  onSelect
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            <th className="px-3 py-2">Hospital</th>
            <th className="px-3 py-2">Distance</th>
            <th className="px-3 py-2">Beds</th>
            <th className="px-3 py-2">ICU</th>
            <th className="px-3 py-2">Emergency</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr
              key={h.id}
              onClick={() => onSelect?.(h)}
              className={`border-b border-border last:border-0 ${onSelect ? 'cursor-pointer hover:bg-bg' : ''}`}
            >
              <td className="px-3 py-2.5 font-semibold text-text-primary">{h.name}</td>
              <td className="px-3 py-2.5">{h.distanceKm} km</td>
              <td className="px-3 py-2.5">{h.beds}</td>
              <td className="px-3 py-2.5">{h.icu}</td>
              <td className="px-3 py-2.5">{h.emergency}</td>
              <td className="px-3 py-2.5">
                <Badge tone={statusTone(h.status)}>{h.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-[11px] text-text-secondary">
        Demo data for proof-of-concept purposes. Not verified live facility data.
      </div>
    </div>
  )
}
