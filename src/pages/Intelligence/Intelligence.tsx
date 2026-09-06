import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import { AIAssessment, PriorityFactorsExplainer, AIDecisionLoop } from '../../components/AIAssessment/AIAssessment'
import { Badge, severityTone } from '../../components/ui/Badge'

export const Intelligence: React.FC = () => {
  const { incidents } = useData()
  const navigate = useNavigate()
  const sorted = [...incidents].sort((a, b) => b.priorityScore - a.priorityScore)
  const [selectedId, setSelectedId] = useState(sorted[0]?.id)
  const selected = incidents.find((i) => i.id === selectedId) ?? sorted[0]

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">AI Situation Assessment</h1>
        <div className="mt-1 text-sm text-text-secondary">
          Machine-assisted priority scoring, confidence estimation, and resource recommendation
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Panel title="Select Incident" noPadding>
          <ul className="max-h-[540px] overflow-y-auto divide-y divide-border">
            {sorted.map((inc) => (
              <li
                key={inc.id}
                onClick={() => setSelectedId(inc.id)}
                className={`cursor-pointer px-3 py-2.5 ${
                  selected?.id === inc.id ? 'bg-infobg' : 'hover:bg-bg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">{inc.name}</span>
                  <span className="text-sm font-bold text-text-primary">{inc.priorityScore}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
                  <span className="text-xs text-text-secondary">{inc.typeLabel}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="flex flex-col gap-4">
          {selected && (
            <Panel
              title={`Assessment — ${selected.name} (${selected.code})`}
              actions={
                <button
                  onClick={() => navigate(`/incidents/${selected.id}`)}
                  className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                >
                  View Incident →
                </button>
              }
            >
              <AIAssessment incident={selected} />
            </Panel>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Panel title="How Priority Is Calculated">
              <PriorityFactorsExplainer />
            </Panel>
            <Panel title="AI Decision Loop">
              <AIDecisionLoop />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}
