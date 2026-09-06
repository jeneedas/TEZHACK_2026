import React from 'react'

export const Panel: React.FC<{
  title?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}> = ({ title, actions, children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-panel border border-border rounded ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-text-secondary">{title}</h2>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>{children}</div>
    </div>
  )
}

export const StatBox: React.FC<{
  label: string
  value: string | number
  tone?: 'default' | 'critical' | 'warning' | 'success'
  sub?: string
}> = ({ label, value, tone = 'default', sub }) => {
  const valueColor =
    tone === 'critical'
      ? 'text-critical'
      : tone === 'warning'
      ? 'text-warning'
      : tone === 'success'
      ? 'text-success'
      : 'text-text-primary'

  return (
    <div className="bg-panel border border-border rounded px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">{label}</div>
      <div className={`mt-1 text-2xl font-bold leading-none ${valueColor}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-text-secondary">{sub}</div>}
    </div>
  )
}
