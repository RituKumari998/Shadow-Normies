import { faUsers, faMask, faVenusMars } from '@fortawesome/free-solid-svg-icons'
import { NormieCard } from './NormieCard'
import { Panel, SectionHeader } from './ui/Panel'
import type { GenotypeMatch } from '../lib/genome'
import type { DoppelgangerMatch } from '../lib/genetic'
import type { SimilarityResult } from '../lib/hamming'

interface GeneticMatchesProps {
  genotypeSiblings: GenotypeMatch[]
  doppelgangers: DoppelgangerMatch[]
  phenotypeTwins: SimilarityResult[]
}

export function GeneticMatches({
  genotypeSiblings,
  doppelgangers,
  phenotypeTwins,
}: GeneticMatchesProps) {
  return (
    <div className="space-y-6">
      <Panel className="p-6 sm:p-8">
        <SectionHeader
          icon={faVenusMars}
          label="Genotype"
          title="Genotype siblings"
          description="Trait-genome matches sharing 4+ of 8 categorical alleles (Jaccard similarity on decoded metadata)."
        />
        {genotypeSiblings.length === 0 ? (
          <p className="text-sm text-muted">No close genotype siblings in index.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {genotypeSiblings.map((s) => (
              <NormieCard
                key={s.id}
                id={s.id}
                subtitle={`${s.matchingTraits}/8 · ${(s.jaccard * 100).toFixed(0)}% Jaccard`}
                similarity={s.geneticSimilarity}
                compact
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel className="p-6 sm:p-8">
        <SectionHeader
          icon={faMask}
          label="Anomaly"
          title="Doppelgängers"
          description="Phenotypic lookalikes with divergent genotypes — high pixel similarity (>75%) but low trait overlap (<50%)."
        />
        {doppelgangers.length === 0 ? (
          <p className="text-sm text-muted">No doppelgängers detected in index.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {doppelgangers.map((d) => (
              <NormieCard
                key={d.id}
                id={d.id}
                subtitle={`${d.pixelSimilarity.toFixed(0)}% px · ${(d.traitJaccard * 100).toFixed(0)}% trait`}
                similarity={d.divergence}
                compact
              />
            ))}
          </div>
        )}
      </Panel>

      <Panel className="p-6 sm:p-8">
        <SectionHeader
          icon={faUsers}
          label="Phenotype"
          title="Pixel twins"
          description="Top bitmap matches by 1600-bit Hamming distance (visual genotype)."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {phenotypeTwins.map((twin) => (
            <NormieCard
              key={twin.id}
              id={twin.id}
              subtitle={`${twin.distance} bits apart`}
              similarity={twin.similarity}
              compact
            />
          ))}
        </div>
      </Panel>
    </div>
  )
}
