import React from 'react'

export type BadgeTone =
  | 'critical'
  | 'warning'
  | 'success'
  | 'info'
  | 'neutral'
  | 'primary'

const toneClasses: Record<BadgeTone, string> = {
  critical: 'bg-[#FBEAE8] text-critical border-[#F0C6C1]',
  warning: 'bg-[#FBF0E4] text-warning border-[#F0DAB8]',
  success: 'bg-[#E9F5EC] text-success border-[#C3E4CB]',
  info: 'bg-infobg text-primary border-[#C7DEF4]',
  neutral: 'bg-[#F0F1F2] text-text-secondary border-border',
  primary: 'bg-infobg text-primary border-[#C7DEF4]'
}

export const Badge: React.FC<{
  tone?: BadgeTone
  children: React.ReactNode
  className?: string
}> = ({ tone = 'neutral', children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function severityTone(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): BadgeTone {
  switch (severity) {
    case 'CRITICAL':
      return 'critical'
    case 'HIGH':
      return 'warning'
    case 'MEDIUM':
      return 'info'
    default:
      return 'neutral'
  }
}

export function statusTone(status: string): BadgeTone {
  if (status.includes('AVAILABLE') || status.includes('OPEN') || status.includes('RESOLVED') || status.includes('VERIFIED')) return 'success'
  if (status.includes('EN_ROUTE') || status.includes('EN ROUTE') || status.includes('ASSIGNED') || status.includes('PROGRESS')) return 'info'
  if (status.includes('STANDBY') || status.includes('LIMITED') || status.includes('PARTIAL')) return 'warning'
  if (status.includes('BLOCKED') || status.includes('CRITICAL') || status.includes('UNAVAILABLE')) return 'critical'
  return 'neutral'
}
