import React, { useState } from 'react'
import { useData } from '../../context/DataContext'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CheckCircle2 } from 'lucide-react'

export const ReportVerification: React.FC = () => {
  const {
    incidents,
    reports,
    resources,
    verifications,
    assignVerificationTeam,
    submitVerification
  } = useData()

  const [assigningIncident, setAssigningIncident] = useState<string | null>(null)
  const [submittingIncident, setSubmittingIncident] = useState<string | null>(null)
  const [formData, setFormData] = useState({ affectedPeople: 240, trappedPeople: 18, medicalRequests: 7, roadAccess: 'BLOCKED' as 'OPEN' | 'PARTIAL' | 'BLOCKED' })

  const verifiedIncidentIds = new Set(verifications.map((v) => v.incidentId))
  const needsVerification = incidents.filter(
    (i) => i.status === 'VERIFICATION_NEEDED' || verifiedIncidentIds.has(i.id)
  )
  const verificationTeams = resources.filter((r) => r.type === 'FIELD_VERIFICATION_TEAM')

  const requiresVerificationReports = reports.filter((r) => r.status === 'REQUIRES_VERIFICATION')

  const handleAssign = (incidentId: string, teamId: string) => {
    assignVerificationTeam(incidentId, teamId)
    setAssigningIncident(null)
  }

  const handleSubmit = (incidentId: string) => {
    submitVerification(incidentId, formData)
    setSubmittingIncident(null)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-text-primary">Report Verification</h1>
        <div className="mt-1 text-sm text-text-secondary">
          Assess report credibility and coordinate field verification for low-confidence incidents
        </div>
      </div>

      <Panel title="Incoming Reports Requiring Verification" className="mb-5" noPadding>
        {requiresVerificationReports.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No reports currently require verification.</div>
        ) : (
          <ul className="divide-y divide-border">
            {requiresVerificationReports.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-text-primary">Report #{r.id}</span>
                  <Badge tone="critical">{r.credibility} CREDIBILITY</Badge>
                </div>
                <div className="mb-1.5 grid grid-cols-2 gap-2 text-xs text-text-secondary sm:grid-cols-4">
                  <span>Source: <b className="text-text-primary">{r.source.replace('_', ' ')}</b></span>
                  <span>Location: <b className="text-text-primary">{r.location}</b></span>
                  <span>Received: <b className="text-text-primary">{r.timestamp}</b></span>
                  <span>Confidence: <b className="text-text-primary">{r.confidence}%</b></span>
                </div>
                <div className="mb-1.5 text-sm italic text-text-primary">"{r.content}"</div>
                {r.reason && <div className="text-xs text-critical">Reason: {r.reason}</div>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Verification Workflow" noPadding>
        {needsVerification.length === 0 ? (
          <div className="p-4 text-sm text-text-secondary">No incidents currently require field verification.</div>
        ) : (
          <ul className="divide-y divide-border">
            {needsVerification.map((inc) => {
              const activeVerification = verifications.find(
                (v) => v.incidentId === inc.id && v.status !== 'COMPLETE'
              )
              const completedVerification = verifications.find(
                (v) => v.incidentId === inc.id && v.status === 'COMPLETE'
              )

              return (
                <li key={inc.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-base font-bold text-text-primary">{inc.name}</span>
                    <div className="flex gap-2">
                      <Badge tone="critical">CONFIDENCE {inc.confidenceScore}%</Badge>
                      <Badge tone="warning">FOG {inc.informationFog}%</Badge>
                    </div>
                  </div>

                  {!activeVerification && !completedVerification && (
                    <>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-critical">
                        Action: Field Verification Required
                      </div>
                      {assigningIncident === inc.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {verificationTeams.map((t) => (
                            <Button key={t.id} size="sm" variant="primary" onClick={() => handleAssign(inc.id, t.id)}>
                              Assign {t.name}
                            </Button>
                          ))}
                          <Button size="sm" variant="secondary" onClick={() => setAssigningIncident(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="primary" onClick={() => setAssigningIncident(inc.id)}>
                          Assign Verification Team
                        </Button>
                      )}
                    </>
                  )}

                  {activeVerification && activeVerification.status === 'ASSIGNED' && (
                    <>
                      <div className="mb-2 flex items-center gap-2 text-xs text-primary">
                        <Badge tone="info">Team Assigned</Badge>
                        Field verification team en route to {inc.name}.
                      </div>
                      {submittingIncident === inc.id ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                          <NumberField
                            label="Affected"
                            value={formData.affectedPeople}
                            onChange={(v) => setFormData((f) => ({ ...f, affectedPeople: v }))}
                          />
                          <NumberField
                            label="Trapped"
                            value={formData.trappedPeople}
                            onChange={(v) => setFormData((f) => ({ ...f, trappedPeople: v }))}
                          />
                          <NumberField
                            label="Medical"
                            value={formData.medicalRequests}
                            onChange={(v) => setFormData((f) => ({ ...f, medicalRequests: v }))}
                          />
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                              Road
                            </label>
                            <select
                              value={formData.roadAccess}
                              onChange={(e) =>
                                setFormData((f) => ({ ...f, roadAccess: e.target.value as any }))
                              }
                              className="w-full rounded border border-border px-2 py-1.5 text-sm"
                            >
                              <option value="OPEN">OPEN</option>
                              <option value="PARTIAL">PARTIAL</option>
                              <option value="BLOCKED">BLOCKED</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Button size="sm" variant="primary" className="w-full" onClick={() => handleSubmit(inc.id)}>
                              Submit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => setSubmittingIncident(inc.id)}>
                          Submit Field Verification Data
                        </Button>
                      )}
                    </>
                  )}

                  {completedVerification && (
                    <div className="flex items-center gap-4 border border-success/40 bg-[#E9F5EC] rounded p-3 text-sm">
                      <CheckCircle2 size={18} className="text-success" />
                      <div>
                        <div className="font-semibold text-text-primary">Verification Complete</div>
                        <div className="text-xs text-text-secondary">
                          Confidence: {completedVerification.confidenceBefore}% →{' '}
                          <b className="text-success">{completedVerification.confidenceAfter}%</b> · Information
                          Fog: {completedVerification.fogBefore}% →{' '}
                          <b className="text-success">{completedVerification.fogAfter}%</b>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>
    </div>
  )
}

const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({
  label,
  value,
  onChange
}) => (
  <div>
    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
      {label}
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded border border-border px-2 py-1.5 text-sm"
    />
  </div>
)
