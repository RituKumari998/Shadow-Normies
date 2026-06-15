import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import {
  fetchHolders,
  fetchCanvasInfo,
  isValidAddress,
} from '../lib/api'
import { useNormieIndex } from '../hooks/useNormieIndex'
import {
  aggregateTraitDistribution,
  findRarestTrait,
  getRaritiesForAttributes,
} from '../lib/rarity'
import { averagePairwiseHamming } from '../lib/hamming'
import { walletGeneticDiversity } from '../lib/genetic'
import { analyzeMorphology } from '../lib/morphology'
import { walletArchetypeSpread } from '../lib/archetype'
import { getTraitEntry, getPixelsForId } from '../lib/index'
import { WalletSummary } from '../components/WalletSummary'

export function WalletPage() {
  const { address: rawAddress } = useParams<{ address: string }>()
  const address = rawAddress?.toLowerCase() ?? ''
  const valid = isValidAddress(address)

  const { index, loading: indexLoading, error: indexError } = useNormieIndex()
  const [tokenIds, setTokenIds] = useState<number[]>([])
  const [canvasResults, setCanvasResults] = useState<{ actionPoints: number; level: number; customized: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!valid) return

    setLoading(true)
    setError(null)

    fetchHolders(address)
      .then(async (data) => {
        const ids = data.tokenIds.sort((a, b) => a - b)
        setTokenIds(ids)

        const results = await Promise.all(
          ids.map((id) =>
            fetchCanvasInfo(id).catch(() => ({ actionPoints: 0, level: 1, customized: false })),
          ),
        )
        setCanvasResults(results)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [address, valid])

  const customizedCount = canvasResults.filter((c) => c.customized).length
  const canvasInvestment = canvasResults.reduce(
    (s, c) => s + c.actionPoints * 3 + c.level * 12,
    0,
  )

  const walletAnalysis = useMemo(() => {
    if (!index || tokenIds.length === 0) return null

    const traitDistribution = aggregateTraitDistribution(
      index.traits,
      tokenIds,
    )

    const allRarities = tokenIds.flatMap((id) => {
      const entry = getTraitEntry(index, id)
      if (!entry) return []
      return getRaritiesForAttributes(index.rarityIndex, entry.attributes)
    })

    const rarestTrait = findRarestTrait(allRarities)
    const avgHamming = averagePairwiseHamming(tokenIds, index.pixels)
    const geneticDiversity = walletGeneticDiversity(
      tokenIds,
      index.pixels,
      index.traits,
    )

    const archetypeSpread = walletArchetypeSpread(
      tokenIds,
      index.traits,
      (id) => {
        const pixels = getPixelsForId(index, id)
        return pixels ? analyzeMorphology(pixels) : null
      },
    )

    return {
      traitDistribution,
      rarestTrait,
      avgHamming,
      geneticDiversity,
      archetypeSpread,
    }
  }, [index, tokenIds])

  if (!valid) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">Invalid wallet address.</p>
        <Link to="/" className="mt-4 inline-block text-fg-soft hover:text-fg font-medium">
          Back to home
        </Link>
      </div>
    )
  }

  if (loading || indexLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      </div>
    )
  }

  if (error || indexError) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">{error ?? indexError}</p>
        <Link to="/" className="mt-4 inline-block text-fg-soft hover:text-fg font-medium">
          Back to home
        </Link>
      </div>
    )
  }

  if (tokenIds.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted">This wallet holds no Normies.</p>
        <Link to="/" className="mt-4 inline-block text-fg-soft hover:text-fg font-medium">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </Link>

      <div>
        <p className="section-label mb-2">Collection analysis</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
          Wallet DNA
        </h1>
        <p className="mt-2 text-muted text-sm">
          Genetic diversity across phenotype, genotype, and morphology layers.
        </p>
      </div>

      <WalletSummary
        address={address}
        tokenIds={tokenIds}
        customizedCount={customizedCount}
        rarestTrait={walletAnalysis?.rarestTrait ?? null}
        avgHamming={walletAnalysis?.avgHamming ?? null}
        geneticDiversity={walletAnalysis?.geneticDiversity ?? null}
        archetypeSpread={walletAnalysis?.archetypeSpread ?? new Map()}
        traitDistribution={walletAnalysis?.traitDistribution ?? new Map()}
        canvasInvestment={canvasInvestment}
        evolutionDepth={customizedCount}
      />
    </div>
  )
}
