import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDna,
  faPalette,
  faGem,
  faChartPie,
  faShuffle,
  faPaintbrush,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { similarityPercent } from '../lib/hamming'
import type { TraitRarity } from '../lib/rarity'
import { Panel } from './ui/Panel'

interface WalletSummaryProps {
  address: string
  tokenIds: number[]
  customizedCount: number
  rarestTrait: TraitRarity | null
  avgHamming: number | null
  geneticDiversity: number | null
  archetypeSpread: Map<string, number>
  traitDistribution: Map<string, number>
  canvasInvestment?: number
  evolutionDepth?: number
}

export function WalletSummary({
  address,
  tokenIds,
  customizedCount,
  rarestTrait,
  avgHamming,
  geneticDiversity,
  archetypeSpread,
  traitDistribution,
  canvasInvestment = 0,
  evolutionDepth = 0,
}: WalletSummaryProps) {
  const customizedPct =
    tokenIds.length > 0 ? (customizedCount / tokenIds.length) * 100 : 0

  const cohesion =
    avgHamming !== null ? similarityPercent(avgHamming) : null

  const topTraits = [...traitDistribution.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const archetypes = [...archetypeSpread.entries()]
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <Panel elevated className="p-6 sm:p-8">
        <p className="section-label mb-2">Wallet</p>
        <p className="font-mono text-sm text-muted break-all">{address}</p>
        <p className="mt-3 text-4xl font-extrabold tracking-tight text-fg">
          {tokenIds.length}
          <span className="text-lg font-medium text-muted ml-2">Normies</span>
        </p>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={faDna}
          label="Phenotype cohesion"
          value={cohesion !== null ? `${cohesion.toFixed(1)}%` : 'N/A'}
          hint="Avg Hamming similarity between pairs"
        />
        <StatCard
          icon={faShuffle}
          label="Genetic diversity"
          value={
            geneticDiversity !== null
              ? `${(100 - geneticDiversity).toFixed(1)}%`
              : 'N/A'
          }
          hint="Inverse composite distance score"
        />
        <StatCard
          icon={faPalette}
          label="Customized"
          value={`${customizedPct.toFixed(0)}%`}
          hint={`${customizedCount} of ${tokenIds.length} on Canvas`}
        />
        <StatCard
          icon={faGem}
          label="Rarest trait"
          value={rarestTrait?.value ?? '—'}
          hint={
            rarestTrait
              ? `${rarestTrait.trait_type} · ${rarestTrait.percent.toFixed(1)}%`
              : 'No traits'
          }
        />
        <StatCard
          icon={faChartPie}
          label="Archetypes"
          value={archetypes.length.toString()}
          hint={`${archetypes.length} distinct phenotypes`}
        />
        <StatCard
          icon={faPaintbrush}
          label="Canvas investment"
          value={canvasInvestment > 0 ? canvasInvestment.toFixed(0) : '—'}
          hint={`${evolutionDepth} customized in wallet`}
        />
      </div>

      {archetypes.length > 0 && (
        <Panel className="p-6">
          <p className="section-label mb-3">Composition</p>
          <h3 className="text-lg font-bold text-fg mb-4">Archetype spread</h3>
          <div className="space-y-3">
            {archetypes.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-36 sm:w-44 truncate text-sm font-medium text-fg">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-raised border border-border">
                  <div
                    className="h-full rounded-full bg-fg transition-all"
                    style={{ width: `${(count / tokenIds.length) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs font-semibold text-muted">×{count}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {topTraits.length > 0 && (
        <Panel className="p-6">
          <p className="section-label mb-3">Traits</p>
          <h3 className="text-lg font-bold text-fg mb-4">Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {topTraits.map(([trait, count]) => (
              <span key={trait} className="badge">
                {trait}
                <span className="font-mono font-semibold text-fg">×{count}</span>
              </span>
            ))}
          </div>
        </Panel>
      )}

      <div>
        <p className="section-label mb-3">Collection</p>
        <h3 className="text-lg font-bold text-fg mb-4">Owned Normies</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {tokenIds.map((id) => (
            <Link
              key={id}
              to={`/normie/${id}`}
              className="card p-1.5 text-center hover:border-border-strong hover:shadow-md transition"
            >
              <div className="normie-frame aspect-square">
                <img
                  src={`https://api.normies.art/normie/${id}/image.png`}
                  alt={`#${id}`}
                  loading="lazy"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="mt-1.5 block font-mono text-[11px] text-muted">#{id}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: typeof faDna
  label: string
  value: string
  hint: string
}) {
  return (
    <Panel className="p-4">
      <FontAwesomeIcon icon={icon} className="text-fg-soft mb-2" />
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="mt-1 text-xl font-bold text-fg truncate">{value}</p>
      <p className="mt-1 text-[11px] text-muted line-clamp-2">{hint}</p>
    </Panel>
  )
}
