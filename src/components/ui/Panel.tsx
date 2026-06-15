import type { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface PanelProps {
  children: ReactNode
  className?: string
  dark?: boolean
  elevated?: boolean
}

export function Panel({ children, className = '', dark, elevated }: PanelProps) {
  const base = dark ? 'card-dark' : elevated ? 'card-elevated' : 'card'
  return <div className={`${base} ${className}`}>{children}</div>
}

interface SectionHeaderProps {
  icon?: IconDefinition
  label?: string
  title: string
  description?: string
  dark?: boolean
}

export function SectionHeader({ icon, label, title, description, dark }: SectionHeaderProps) {
  return (
    <div className="mb-5">
      {label && (
        <p className={`section-label mb-2 ${dark ? 'text-white/50' : ''}`}>{label}</p>
      )}
      <h2 className={`flex items-center gap-2.5 text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-fg'}`}>
        {icon && <FontAwesomeIcon icon={icon} className={dark ? 'text-white/70' : 'text-fg-soft'} />}
        {title}
      </h2>
      {description && (
        <p className={`mt-1.5 text-sm leading-relaxed ${dark ? 'text-white/60' : 'text-muted'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

interface StatPillProps {
  label: string
  value: string
}

export function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-semibold text-fg">{value}</p>
    </div>
  )
}
