import React from 'react'
import type { FieldUpdate } from '../../types'

export const FieldUpdates: React.FC<{ updates: FieldUpdate[]; limit?: number }> = ({ updates, limit }) => {
  const rows = limit ? updates.slice(0, limit) : updates

  if (rows.length === 0) {
    return <div className="py-6 text-center text-sm text-text-secondary">No field updates yet.</div>
  }

  return (
    <ul className="divide-y divide-border">
      {rows.map((u) => (
        <li key={u.id} className="py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-semibold text-text-primary">{u.time}</span>
            <span className="font-semibold text-primary">{u.resourceName}</span>
            <span className="text-text-secondary">· {u.location}</span>
          </div>
          <div className="mt-1 text-sm text-text-primary">{u.message}</div>
          {u.metrics && (
            <div className="mt-1 flex gap-3 text-xs text-text-secondary">
              {u.metrics.rescued != null && <span>Rescued: <b className="text-success">{u.metrics.rescued}</b></span>}
              {u.metrics.remaining != null && <span>Remaining: <b className="text-critical">{u.metrics.remaining}</b></span>}
              {u.metrics.floodDepthM != null && <span>Depth: {u.metrics.floodDepthM} m</span>}
              {u.metrics.affected != null && <span>Affected: ~{u.metrics.affected}</span>}
              {u.metrics.road && <span>Road: {u.metrics.road}</span>}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
