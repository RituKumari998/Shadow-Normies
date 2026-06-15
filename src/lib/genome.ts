import type { TraitAttribute } from './api'
import type { RarityIndex } from './rarity'
import { getTraitRarity, traitKey } from './rarity'

export interface TraitGenome {
  keys: string[]
  signature: string
}

export function encodeGenome(attributes: TraitAttribute[]): TraitGenome {
  const keys = attributes.map((a) => traitKey(a.trait_type, a.value))
  const signature = keys.sort().join('|')
  return { keys, signature }
}

export function traitJaccard(a: TraitGenome, b: TraitGenome): number {
  const setA = new Set(a.keys)
  const setB = new Set(b.keys)
  let intersection = 0
  for (const k of setA) {
    if (setB.has(k)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return union > 0 ? intersection / union : 0
}

export function countMatchingTraits(a: TraitGenome, b: TraitGenome): number {
  const setB = new Set(b.keys)
  return a.keys.filter((k) => setB.has(k)).length
}

export function rarityScore(
  attributes: TraitAttribute[],
  rarityIndex: RarityIndex,
): number {
  let score = 0
  for (const attr of attributes) {
    const r = getTraitRarity(rarityIndex, attr.trait_type, attr.value)
    const p = Math.max(r.percent / 100, 0.0001)
    score -= Math.log2(p)
  }
  return score
}

export function rarityPercentile(score: number, maxScore = 40): number {
  return Math.min(100, (score / maxScore) * 100)
}

export interface GenotypeMatch {
  id: number
  matchingTraits: number
  jaccard: number
  geneticSimilarity: number
}

export function findGenotypeSiblings(
  genome: TraitGenome,
  allTraits: { id: number; attributes: TraitAttribute[] }[],
  excludeId: number,
  maxId: number,
  k = 8,
): GenotypeMatch[] {
  const results: GenotypeMatch[] = []

  for (let id = 0; id < maxId; id++) {
    if (id === excludeId) continue
    const entry = allTraits[id]
    if (!entry?.attributes) continue

    const other = encodeGenome(entry.attributes)
    const matching = countMatchingTraits(genome, other)
    if (matching < 4) continue

    const jaccard = traitJaccard(genome, other)
    results.push({
      id,
      matchingTraits: matching,
      jaccard,
      geneticSimilarity: jaccard * 100,
    })
  }

  return results
    .sort((a, b) => b.matchingTraits - a.matchingTraits || b.jaccard - a.jaccard)
    .slice(0, k)
}
