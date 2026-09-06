import React, { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import type { Incident } from '../../types'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useData } from '../../context/DataContext'

export const DispatchModal: React.FC<{
  incident: Incident
  onClose: () => void
}> = ({ incident, onClose }) => {
  const { getRecommendedResource, getRecommendedRoute, getResourceExplanation, dispatchResource } = useData()
  const [confirmed, setConfirmed] = useState<{ resourceName: string; eta: number } | null>(null)

  const resource = getRecommendedResource(incident.id)
  const route = getRecommendedRoute(incident.id)
  const reason = getResourceExplanation(incident.id)

  const handleDispatch = () => {
    if (!resource) return
    dispatchResource(incident.id, resource.id, route?.id)
    setConfirmed({ resourceName: resource.name, eta: route?.etaMinutes ?? 21 })
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[440px] rounded border border-border bg-panel">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
            {confirmed ? 'Dispatch Confirmed' : 'Dispatch Resource'}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {!confirmed ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <InfoRow label="Incident" value={incident.code} />
                <InfoRow label="Location" value={incident.name} />
                <InfoRow label="Priority" value={String(incident.priorityScore)} />
                <InfoRow label="Recommended Resource" value={resource?.name ?? 'None available'} />
              </div>

              {reason && (
                <div className="mb-4 border border-border bg-infobg rounded p-3 text-xs text-text-secondary">
                  <div className="mb-1 font-semibold uppercase tracking-wide text-primary">Reason</div>
                  {reason}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                disabled={!resource}
                onClick={handleDispatch}
              >
                Dispatch {resource?.name ?? '—'}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center py-3 text-center">
              <CheckCircle2 size={36} className="mb-3 text-success" />
              <div className="mb-1 text-base font-bold text-text-primary">{confirmed.resourceName}</div>
              <Badge tone="info" className="mb-3">
                Status: En Route
              </Badge>
              <div className="text-sm text-text-secondary">ETA: {confirmed.eta} minutes</div>
              <Button variant="secondary" className="mt-5 w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border border-border rounded px-2.5 py-1.5">
    <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
    <div className="font-semibold text-text-primary">{value}</div>
  </div>
)
