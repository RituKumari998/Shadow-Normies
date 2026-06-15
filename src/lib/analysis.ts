import type { TraitAttribute } from './api'
import type { NormieIndex } from './index'
import { getPixelsForId, getTraitEntry } from './index'
import { findTopKSimilar, type SimilarityResult } from './hamming'
import { findShadowTwin, inverseMatchPercent, flipBits } from './shadow'
import {
  analyzeMorphology,
  computeCollectionMorphologyMean,
  morphologyUniqueness,
  type MorphologyProfile,
} from './morphology'
import {
  encodeGenome,
  rarityScore,
  rarityPercentile,
  findGenotypeSiblings,
  type GenotypeMatch,
} from './genome'
import {
  computeGeneticDistance,
  findDoppelgangers,
  nearestNeighborGap,
  type DoppelgangerMatch,
} from './genetic'
import { classifyArchetype, type Archetype } from './archetype'
import { getRaritiesForAttributes } from './rarity'
import type { CanvasScanReport } from './canvas-scan'
import type { TraitAlleles } from './trait-binary'

export interface CanvasScanContext {
  canvas: CanvasScanReport
  alleles: TraitAlleles
}

export interface DnaFingerprint {
  uniquenessIndex: number
  rarityPercentile: number
  rarityScore: number
  nearestNeighborBits: number
  shadowAffinity: number
  geneticComplexity: number
  morphologyAnomaly: number
  phenotypeDrift: number
  canvasEvolution: number
  alleleEntropy: number
}

export interface ShadowAnalysis {
  twin: SimilarityResult
  inverseMatch: number
  complementarity: number
  geneticDistanceToShadow: number
}

export interface NormieDnaReport {
  morphology: MorphologyProfile
  archetype: Archetype
  fingerprint: DnaFingerprint
  phenotypeTwins: SimilarityResult[]
  genotypeSiblings: GenotypeMatch[]
  doppelgangers: DoppelgangerMatch[]
  shadow: ShadowAnalysis | null
  geneticWeights: { pixel: number; trait: number; morphology: number }
}

let cachedMorphologyMean: MorphologyProfile | null = null
let cachedMorphologyMeanFor = 0

function getMorphologyMean(index: NormieIndex): MorphologyProfile {
  if (cachedMorphologyMean && cachedMorphologyMeanFor === index.count) {
    return cachedMorphologyMean
  }
  cachedMorphologyMean = computeCollectionMorphologyMean(
    index.pixels,
    index.count,
  )
  cachedMorphologyMeanFor = index.count
  return cachedMorphologyMean
}

export function analyzeNormie(
  index: NormieIndex,
  id: number,
  attributes: TraitAttribute[],
  live?: CanvasScanContext,
): NormieDnaReport | null {
  const pixels = getPixelsForId(index, id)
  if (!pixels) return null

  const morphology = analyzeMorphology(pixels)
  const genome = encodeGenome(attributes)
  const archetype = classifyArchetype(attributes, morphology)
  const morphMean = getMorphologyMean(index)

  const phenotypeTwins = findTopKSimilar(
    pixels,
    index.pixels,
    id,
    10,
    index.count,
  )

  const genotypeSiblings = findGenotypeSiblings(
    genome,
    index.traits,
    id,
    index.count,
  )

  const doppelgangers = findDoppelgangers(
    pixels,
    genome,
    index.pixels,
    index.traits,
    id,
    index.count,
  )

  const shadowTwin = findShadowTwin(pixels, index.pixels, id, index.count)
  let shadow: ShadowAnalysis | null = null

  if (shadowTwin) {
    const shadowPixels = getPixelsForId(index, shadowTwin.id)
    const shadowTraits = getTraitEntry(index, shadowTwin.id)
    let geneticDistanceToShadow = 1

    if (shadowPixels && shadowTraits?.attributes) {
      const shadowGenome = encodeGenome(shadowTraits.attributes)
      geneticDistanceToShadow = computeGeneticDistance(
        flipBits(pixels),
        shadowPixels,
        genome,
        shadowGenome,
      ).composite
    }

    const inverseMatch = inverseMatchPercent(shadowTwin.distance)
    shadow = {
      twin: shadowTwin,
      inverseMatch,
      complementarity: inverseMatch * (1 - geneticDistanceToShadow),
      geneticDistanceToShadow: geneticDistanceToShadow * 100,
    }
  }

  const rScore = rarityScore(attributes, index.rarityIndex)
  const nnGap = nearestNeighborGap(phenotypeTwins)
  const morphAnomaly = morphologyUniqueness(morphology, morphMean)

  const nnUniqueness = (nnGap / 1600) * 100
  const driftBoost = live?.canvas.phenotypeDrift ?? 0
  const evolutionBoost = live?.canvas.evolutionScore ?? 0
  const alleleBoost = (live?.alleles.alleleEntropy ?? 0) * 10

  const uniquenessIndex = Math.min(
    100,
    nnUniqueness * 0.4 +
      morphAnomaly * 0.25 +
      rarityPercentile(rScore) * 0.15 +
      driftBoost * 0.12 +
      evolutionBoost * 0.08,
  )

  const geneticComplexity =
    morphology.complexity * 40 +
    morphology.spatialEntropy * 30 +
    (1 - morphology.horizontalSymmetry) * 15 +
    rarityPercentile(rScore) * 0.15

  const fingerprint: DnaFingerprint = {
    uniquenessIndex,
    rarityPercentile: rarityPercentile(rScore),
    rarityScore: rScore,
    nearestNeighborBits: nnGap,
    shadowAffinity: shadow?.complementarity ?? 0,
    geneticComplexity: Math.min(100, geneticComplexity + alleleBoost),
    morphologyAnomaly: morphAnomaly,
    phenotypeDrift: driftBoost,
    canvasEvolution: evolutionBoost,
    alleleEntropy: live?.alleles.alleleEntropy ?? 0,
  }

  return {
    morphology,
    archetype,
    fingerprint,
    phenotypeTwins,
    genotypeSiblings,
    doppelgangers,
    shadow,
    geneticWeights: { pixel: 0.45, trait: 0.35, morphology: 0.2 },
  }
}

export function getTraitRaritiesForNormie(
  index: NormieIndex,
  attributes: TraitAttribute[],
) {
  return getRaritiesForAttributes(index.rarityIndex, attributes)
}
