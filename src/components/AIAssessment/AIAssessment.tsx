import React from 'react'
import type { Incident } from '../../types'
import { fogLevel, credibilityFromConfidence } from '../../services/intelligenceService'
import { Badge, severityTone } from '../ui/Badge'
import { useData } from '../../context/DataContext'

export const AIAssessment: React.FC<{ incident: Incident }> = ({ incident }) => {
  const { getRecommendedResource, getRecommendedRoute, getResourceExplanation } = useData()
  const resource = getRecommendedResource(incident.id)
  const route = getRecommendedRoute(incident.id)
  const fog = fogLevel(incident.informationFog)
  const credibility = credibilityFromConfidence(incident.confidenceScore)

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricBox label="Priority Score" value={`${incident.priorityScore}/100`} tone="critical" />
        <MetricBox label="Confidence" value={`${incident.confidenceScore}%`} tone="primary" />
        <MetricBox label="Information Fog" value={fog} tone={fog === 'HIGH' ? 'critical' : fog === 'MEDIUM' ? 'warning' : 'success'} />
        <MetricBox
          label="Report Credibility"
          value={credibility}
          tone={credibility === 'HIGH' ? 'success' : credibility === 'MEDIUM' ? 'warning' : 'critical'}
        />
      </div>

      {resource && (
        <div className="mb-4 border border-border bg-infobg rounded p-3.5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary">
            Recommended Action
          </div>
          <div className="mb-1 text-sm font-semibold text-text-primary">
            Deploy {resource.typeLabel.toLowerCase()}.
          </div>
          <div className="text-sm text-text-secondary">
            Recommended response: <b className="text-text-primary">{resource.name}</b>
          </div>
          {route && (
            <div className="mt-1 text-sm text-text-secondary">
              Recommended route: <b className="text-text-primary">{route.label}</b> ({route.risk} risk)
            </div>
          )}
          <div className="mt-2 text-xs text-text-secondary">{getResourceExplanation(incident.id)}</div>
        </div>
      )}

      <div className="text-xs text-text-secondary">
        Severity classification: <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
      </div>
    </div>
  )
}

const MetricBox: React.FC<{ label: string; value: string; tone: 'critical' | 'primary' | 'warning' | 'success' }> = ({
  label,
  value,
  tone
}) => {
  const color =
    tone === 'critical' ? 'text-critical' : tone === 'primary' ? 'text-primary' : tone === 'warning' ? 'text-warning' : 'text-success'
  return (
    <div className="border border-border rounded px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
      <div className={`mt-0.5 text-lg font-bold ${color}`}>{value}</div>
    </div>
  )
}

export const PriorityFactorsExplainer: React.FC = () => (
  <div className="text-sm text-text-secondary">
    <div className="mb-2 font-semibold text-text-primary">How Priority Is Calculated</div>
    <p className="mb-2">The AI considers the following factors when computing a priority score (0–100):</p>
    <ul className="mb-3 list-disc space-y-1 pl-5">
      <li>Severity</li>
      <li>People affected</li>
      <li>People trapped</li>
      <li>Medical emergencies</li>
      <li>Infrastructure damage</li>
      <li>Report credibility</li>
      <li>Number of corroborating reports</li>
      <li>Freshness of evidence</li>
      <li>Geographic clustering</li>
      <li>Accessibility</li>
    </ul>
    <p>Higher score = more urgent response required.</p>
  </div>
)

const decisionSteps = [
  'Multiple Reports',
  'Credibility Analysis',
  'Confidence Score',
  'Information Fog',
  'Priority Score',
  'Resource Recommendation',
  'Field Verification',
  'Updated Situation'
]

export const AIDecisionLoop: React.FC = () => (
  <div className="flex flex-col items-center gap-1">
    {decisionSteps.map((step, i) => (
      <React.Fragment key={step}>
        <div className="w-full max-w-[280px] rounded border border-border bg-bg px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-text-primary">
          {step}
        </div>
        {i < decisionSteps.length - 1 && <div className="h-4 w-px bg-border" />}
      </React.Fragment>
    ))}
  </div>
)
