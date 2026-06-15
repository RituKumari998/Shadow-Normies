import { findTopKSimilar, type SimilarityResult } from './hamming'

export function flipBits(pixels: Uint8Array): Uint8Array {
  const inverted = new Uint8Array(pixels.length)
  for (let i = 0; i < pixels.length; i++) {
    inverted[i] = pixels[i]! ^ 0xff
  }
  return inverted
}

export function findShadowTwin(
  target: Uint8Array,
  allPixels: Uint8Array,
  excludeId?: number,
  maxId?: number,
): SimilarityResult | null {
  const inverted = flipBits(target)
  const results = findTopKSimilar(inverted, allPixels, excludeId, 1, maxId)
  return results[0] ?? null
}

export function inverseMatchPercent(distance: number, totalBits = 1600): number {
  return ((totalBits - distance) / totalBits) * 100
}
