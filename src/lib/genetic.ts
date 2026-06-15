import { hamming, similarityPercent, type SimilarityResult } from './hamming'
import { encodeGenome, traitJaccard, type TraitGenome } from './genome'
import { compareMorphology } from './morphology'
import type { TraitAttribute } from './api'

export interface GeneticDistance {
  pixel: number
  trait: number
  morphology: number
  composite: number
}

const WEIGHTS = {
  pixel: 0.45,
  trait: 0.35,
  morphology: 0.2,
} as const

export function computeGeneticDistance(
  pixelsA: Uint8Array,
  pixelsB: Uint8Array,
  genomeA: TraitGenome,
  genomeB: TraitGenome,
): GeneticDistance {
  const pixelDist = hamming(pixelsA, pixelsB) / 1600
  const traitDist = 1 - traitJaccard(genomeA, genomeB)
  const morphDist = Math.min(1, compareMorphology(pixelsA, pixelsB) / 2)

  const composite =
    WEIGHTS.pixel * pixelDist +
    WEIGHTS.trait * traitDist +
    WEIGHTS.morphology * morphDist

  return {
    pixel: pixelDist,
    trait: traitDist,
    morphology: morphDist,
    composite,
  }
}

export function geneticSimilarityPercent(distance: GeneticDistance): number {
  return (1 - distance.composite) * 100
}

export interface DoppelgangerMatch {
  id: number
  pixelSimilarity: number
  traitJaccard: number
  divergence: number
}

export function findDoppelgangers(
  pixels: Uint8Array,
  genome: TraitGenome,
  allPixels: Uint8Array,
  allTraits: { id: number; attributes: TraitAttribute[] }[],
  excludeId: number,
  maxId: number,
  k = 5,
): DoppelgangerMatch[] {
  const candidates: DoppelgangerMatch[] = []

  for (let id = 0; id < maxId; id++) {
    if (id === excludeId) continue
    const entry = allTraits[id]
    if (!entry?.attributes) continue

    const offset = id * 200
    const slice = allPixels.subarray(offset, offset + 200)
    const dist = hamming(pixels, slice)
    const pixelSim = similarityPercent(dist)

    if (pixelSim < 75) continue

    const otherGenome = encodeGenome(entry.attributes)
    const jaccard = traitJaccard(genome, otherGenome)

    if (jaccard > 0.5) continue

    candidates.push({
      id,
      pixelSimilarity: pixelSim,
      traitJaccard: jaccard,
      divergence: pixelSim * (1 - jaccard),
    })
  }

  return candidates
    .sort((a, b) => b.divergence - a.divergence)
    .slice(0, k)
}

export function walletGeneticDiversity(
  ids: number[],
  allPixels: Uint8Array,
  allTraits: { id: number; attributes: TraitAttribute[] }[],
): number | null {
  if (ids.length < 2) return null

  let totalComposite = 0
  let pairs = 0

  for (let i = 0; i < ids.length; i++) {
    const idA = ids[i]!
    const entryA = allTraits[idA]
    if (!entryA?.attributes) continue

    const offsetA = idA * 200
    const pixelsA = allPixels.subarray(offsetA, offsetA + 200)
    const genomeA = encodeGenome(entryA.attributes)

    for (let j = i + 1; j < ids.length; j++) {
      const idB = ids[j]!
      const entryB = allTraits[idB]
      if (!entryB?.attributes) continue

      const offsetB = idB * 200
      const pixelsB = allPixels.subarray(offsetB, offsetB + 200)
      const genomeB = encodeGenome(entryB.attributes)

      totalComposite += computeGeneticDistance(
        pixelsA,
        pixelsB,
        genomeA,
        genomeB,
      ).composite
      pairs++
    }
  }

  return pairs > 0 ? (totalComposite / pairs) * 100 : null
}

export function nearestNeighborGap(
  twins: SimilarityResult[],
): number {
  return twins[0]?.distance ?? 1600
}
