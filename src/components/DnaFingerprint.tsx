import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFingerprint,
  faChartLine,
  faGhost,
  faDna,
} from '@fortawesome/free-solid-svg-icons'
import type { DnaFingerprint as FingerprintData } from '../lib/analysis'
import type { MorphologyProfile } from '../lib/morphology'
import type { Archetype } from '../lib/archetype'
import { Panel, SectionHeader } from './ui/Panel'

interface DnaFingerprintProps {
  fingerprint: FingerprintData
  morphology: MorphologyProfile
  archetype: Archetype
}

export function DnaFingerprint({
  fingerprint,
  morphology,
  archetype,
}: DnaFingerprintProps) {
  return (
    <Panel elevated className="p-6 sm:p-8 space-y-6">
      <SectionHeader
        icon={faFingerprint}
        label="Analysis"
        title="DNA Fingerprint"
        description="Composite identity score from pixel morphology, trait rarity entropy, and nearest-neighbor gap analysis."
      />

      <div className="card-dark p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-label text-white/50 mb-1">
              Archetype · {archetype.code}
            </p>
            <p className="text-2xl font-bold text-white tracking-tight">{archetype.name}</p>
            <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-md">
              {archetype.description}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-5xl font-bold text-white font-mono tracking-tight">
              {fingerprint.uniquenessIndex.toFixed(0)}
            </p>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-semibold">
              Uniqueness Index
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBar
          icon={faDna}
          label="Trait Rarity"
          value={fingerprint.rarityPercentile}
          hint={`Entropy ${fingerprint.rarityScore.toFixed(2)}`}
        />
        <MetricBar
          icon={faChartLine}
          label="Morphology Anomaly"
          value={fingerprint.morphologyAnomaly}
          hint="Deviation from collection mean"
        />
        <MetricBar
          icon={faGhost}
          label="Shadow Affinity"
          value={fingerprint.shadowAffinity}
          hint="Inverse complementarity"
        />
        <MetricBar
          icon={faFingerprint}
          label="Canvas evolution"
          value={fingerprint.canvasEvolution}
          hint="Transform depth + edit magnitude"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricBar
          icon={faChartLine}
          label="Phenotype drift"
          value={fingerprint.phenotypeDrift}
          hint="Live Canvas XOR delta score"
        />
        <MetricBar
          icon={faDna}
          label="Allele entropy"
          value={fingerprint.alleleEntropy * 25}
          hint={`bytes8 entropy ${fingerprint.alleleEntropy.toFixed(3)}`}
        />
        <MetricBar
          icon={faFingerprint}
          label="Genetic complexity"
          value={fingerprint.geneticComplexity}
          hint="Morphology + rarity + alleles"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-fg mb-3">
          Morphology profile · 40×40 bitmap
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <MorphStat label="Pixel density" value={`${(morphology.density * 100).toFixed(1)}%`} />
          <MorphStat label="H-symmetry" value={`${(morphology.horizontalSymmetry * 100).toFixed(1)}%`} />
          <MorphStat label="V-symmetry" value={`${(morphology.verticalSymmetry * 100).toFixed(1)}%`} />
          <MorphStat label="Spatial entropy" value={morphology.spatialEntropy.toFixed(3)} />
          <MorphStat label="Quadrant balance" value={`${(morphology.quadrantBalance * 100).toFixed(1)}%`} />
          <MorphStat
            label="Centroid"
            value={`(${morphology.centroidX.toFixed(1)}, ${morphology.centroidY.toFixed(1)})`}
          />
        </div>
      </div>

      <p className="text-xs text-muted font-mono border-t border-border pt-4">
        Nearest neighbor gap: {fingerprint.nearestNeighborBits} bits · Weights: 45% pixel · 35% trait · 20% morphology
      </p>
    </Panel>
  )
}

function MetricBar({
  icon,
  label,
  value,
  hint,
}: {
  icon: typeof faDna
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <div className="flex items-center gap-2 text-xs text-muted font-medium mb-2">
        <FontAwesomeIcon icon={icon} className="text-fg-soft" />
        {label}
      </div>
      <p className="text-2xl font-bold text-fg font-mono">{value.toFixed(0)}</p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-fg transition-all duration-700"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted">{hint}</p>
    </div>
  )
}

function MorphStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="font-mono text-sm font-semibold text-fg mt-0.5">{value}</p>
    </div>
  )
}
