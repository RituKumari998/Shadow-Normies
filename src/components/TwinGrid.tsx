import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import type { SimilarityResult } from '../lib/hamming'
import { NormieCard } from './NormieCard'

interface TwinGridProps {
  title: string
  subtitle?: string
  twins: SimilarityResult[]
  icon?: typeof faUsers
}

export function TwinGrid({ title, subtitle, twins, icon = faUsers }: TwinGridProps) {
  if (twins.length === 0) return null

  return (
    <section>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <FontAwesomeIcon icon={icon} className="text-accent" />
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {twins.map((twin) => (
          <NormieCard
            key={twin.id}
            id={twin.id}
            subtitle={`${twin.distance} bits apart`}
            similarity={twin.similarity}
            compact
          />
        ))}
      </div>
    </section>
  )
}
