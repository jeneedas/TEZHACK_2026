import React from 'react'
import { X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Incident } from '../../types'
import { Badge, severityTone } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useData } from '../../context/DataContext'

export const IncidentPanel: React.FC<{
  incident: Incident
  onClose: () => void
  onDispatch?: () => void
}> = ({ incident, onClose, onDispatch }) => {
  const { getRecommendedResource, getRecommendedRoute } = useData()
  const navigate = useNavigate()
  const recommendedResource = getRecommendedResource(incident.id)
  const recommendedRoute = getRecommendedRoute(incident.id)

  return (
    <div className="flex h-full flex-col border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div>
          <div className="text-xs font-semibold text-text-secondary">INCIDENT {incident.code}</div>
        </div>
        <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-1 text-lg font-bold text-text-primary">{incident.name}</div>
        <div className="mb-2 text-xs text-text-secondary">Kamrup District</div>
        <div className="mb-3 flex items-center gap-2">
          <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
          <span className="text-xs font-semibold text-text-secondary">{incident.typeLabel}</span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <MiniStat label="Priority" value={`${incident.priorityScore}/100`} tone="critical" />
          <MiniStat label="Confidence" value={`${incident.confidenceScore}%`} tone="primary" />
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <MiniStat label="Affected" value={`~${incident.affectedPeople}`} />
          <MiniStat label="Trapped" value={incident.trappedPeople} tone="critical" />
          <MiniStat label="Medical" value={incident.medicalRequests} />
        </div>

        <div className="mb-4 flex items-center justify-between border border-border rounded px-3 py-2 text-xs">
          <span className="font-semibold uppercase text-text-secondary">Road Access</span>
          <Badge tone={incident.roadAccess === 'BLOCKED' ? 'critical' : incident.roadAccess === 'PARTIAL' ? 'warning' : 'success'}>
            {incident.roadAccess}
          </Badge>
        </div>

        {recommendedResource && (
          <div className="mb-4 border border-border bg-infobg rounded p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              AI Recommendation
            </div>
            <div className="mb-1 text-sm font-semibold text-text-primary">Deploy: {recommendedResource.name}</div>
            {recommendedRoute && (
              <div className="mb-1 text-xs text-text-secondary">
                Recommended route: <b className="text-text-primary">{recommendedRoute.label}</b>
              </div>
            )}
            {recommendedRoute?.hazardNote && (
              <div className="text-xs text-text-secondary">Reason: {recommendedRoute.hazardNote}</div>
            )}
          </div>
        )}

        <div className="mb-4 text-xs leading-relaxed text-text-secondary">{incident.description}</div>

        <div className="flex flex-col gap-2">
          <Button variant="primary" className="w-full" onClick={onDispatch}>
            Dispatch Resource
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/incidents/${incident.id}`)}
          >
            View Full Incident <ArrowRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

const MiniStat: React.FC<{ label: string; value: string | number; tone?: 'critical' | 'primary' | 'default' }> = ({
  label,
  value,
  tone = 'default'
}) => {
  const color = tone === 'critical' ? 'text-critical' : tone === 'primary' ? 'text-primary' : 'text-text-primary'
  return (
    <div className="border border-border rounded px-2 py-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
      <div className={`text-base font-bold ${color}`}>{value}</div>
    </div>
  )
}
