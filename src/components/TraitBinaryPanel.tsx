import { faDna } from '@fortawesome/free-solid-svg-icons'
import type { TraitAlleles } from '../lib/trait-binary'
import { traitCategoryLabels } from '../lib/trait-binary'
import { Panel, SectionHeader } from './ui/Panel'

interface TraitBinaryPanelProps {
  alleles: TraitAlleles
  decodedTraits: { trait_type: string; value: string }[]
}

export function TraitBinaryPanel({ alleles, decodedTraits }: TraitBinaryPanelProps) {
  const labels = traitCategoryLabels(alleles.bytes)

  return (
    <Panel className="p-6 sm:p-8">
      <SectionHeader
        icon={faDna}
        label="On-chain genome"
        title="Trait binary (bytes8)"
        description="Raw allele indices from GET /normie/:id/traits/binary — the exact bytes8 stored on Ethereum."
      />

      <div className="rounded-xl border border-border bg-surface-raised p-4 font-mono text-sm text-fg break-all">
        {alleles.hex}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Stat label="Fingerprint" value={alleles.fingerprint} />
        <Stat label="Allele entropy" value={alleles.alleleEntropy.toFixed(3)} />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 text-xs uppercase tracking-wider text-muted font-semibold">Category</th>
              <th className="pb-2 text-xs uppercase tracking-wider text-muted font-semibold">Index</th>
              <th className="pb-2 text-xs uppercase tracking-wider text-muted font-semibold">Decoded</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((row, i) => (
              <tr key={row.category} className="border-b border-border/50">
                <td className="py-2.5 text-muted">{row.category}</td>
                <td className="py-2.5 font-mono font-semibold text-fg">{row.index}</td>
                <td className="py-2.5 text-fg">{decodedTraits[i]?.value ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="font-mono text-xs font-semibold text-fg mt-0.5 break-all">{value}</p>
    </div>
  )
}
