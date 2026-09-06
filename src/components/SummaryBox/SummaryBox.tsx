import React from 'react'

export const SummaryBox: React.FC<{
  label: string
  value: string | number
  tone?: 'default' | 'critical' | 'warning' | 'success'
}> = ({ label, value, tone = 'default' }) => {
  const valueColor =
    tone === 'critical'
      ? 'text-critical'
      : tone === 'warning'
      ? 'text-warning'
      : tone === 'success'
      ? 'text-success'
      : 'text-text-primary'

  return (
    <div className="border border-border bg-panel rounded px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
      <div className={`mt-1 text-2xl font-bold leading-none ${valueColor}`}>{value}</div>
    </div>
  )
}
