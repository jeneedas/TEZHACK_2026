import React from 'react'

type Variant = 'primary' | 'secondary' | 'critical' | 'ghost'
type Size = 'sm' | 'md'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white border-primary hover:bg-primary-dark',
  secondary: 'bg-white text-text-primary border-border hover:bg-bg',
  critical: 'bg-critical text-white border-critical hover:opacity-90',
  ghost: 'bg-transparent text-primary border-transparent hover:bg-infobg'
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm'
}

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
> = ({ variant = 'secondary', size = 'md', className = '', children, ...rest }) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded border font-semibold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
