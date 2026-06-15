import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGem } from '@fortawesome/free-solid-svg-icons'
import type { TraitRarity } from '../lib/rarity'

interface TraitRarityListProps {
  rarities: TraitRarity[]
  collectionSize?: number
}

export function TraitRarityList({ rarities, collectionSize = 10000 }: TraitRarityListProps) {
  return (
    <div className="space-y-4">
      {rarities.map((trait) => (
        <div key={`${trait.trait_type}-${trait.value}`}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted font-medium">{trait.trait_type}</span>
            <span className="flex items-center gap-1.5 font-semibold text-fg">
              {trait.percent < 2 && (
                <FontAwesomeIcon icon={faGem} className="text-fg-soft text-xs" />
              )}
              {trait.value}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised border border-border">
              <div
                className="h-full rounded-full bg-fg transition-all duration-500"
                style={{ width: `${Math.max(trait.percent, 1)}%` }}
              />
            </div>
            <span className="w-14 text-right font-mono text-xs font-medium text-fg-soft">
              {trait.percent.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted">
            {trait.count.toLocaleString()} of {collectionSize.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}
