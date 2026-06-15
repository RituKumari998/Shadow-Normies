import { Link } from 'react-router-dom'
import { normieImageUrl } from '../lib/api'

interface NormieCardProps {
  id: number
  label?: string
  subtitle?: string
  similarity?: number
  compact?: boolean
}

export function NormieCard({ id, label, subtitle, similarity, compact }: NormieCardProps) {
  return (
    <Link
      to={`/normie/${id}`}
      className={`group block card hover:border-border-strong hover:shadow-md transition-all duration-200 ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="normie-frame aspect-square">
        <img
          src={normieImageUrl(id)}
          alt={`Normie #${id}`}
          loading="lazy"
          className="h-full w-full object-contain transition group-hover:scale-[1.02]"
        />
      </div>
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <p className={`font-semibold text-fg ${compact ? 'text-xs' : 'text-sm'}`}>
          {label ?? `#${id}`}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted truncate mt-0.5">{subtitle}</p>
        )}
        {similarity !== undefined && (
          <p className="mt-1 text-[11px] font-mono font-medium text-fg-soft">
            {similarity.toFixed(1)}% match
          </p>
        )}
      </div>
    </Link>
  )
}
