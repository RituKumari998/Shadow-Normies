import { popcountByte } from './hamming'

const GRID = 40
const TOTAL_BITS = 1600

export interface MorphologyProfile {
  density: number
  horizontalSymmetry: number
  verticalSymmetry: number
  spatialEntropy: number
  centroidX: number
  centroidY: number
  quadrantBalance: number
  complexity: number
}

function bitGrid(pixels: Uint8Array): Uint8Array {
  const grid = new Uint8Array(TOTAL_BITS)
  for (let i = 0; i < TOTAL_BITS; i++) {
    const byteIdx = Math.floor(i / 8)
    const bitIdx = 7 - (i % 8)
    grid[i] = (pixels[byteIdx]! >> bitIdx) & 1
  }
  return grid
}

export function analyzeMorphology(pixels: Uint8Array): MorphologyProfile {
  const grid = bitGrid(pixels)

  let onCount = 0
  let hMatch = 0
  let hTotal = 0
  let vMatch = 0
  let vTotal = 0
  let sumX = 0
  let sumY = 0
  const quadrants = [0, 0, 0, 0]

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const bit = grid[row * GRID + col]!
      if (bit) {
        onCount++
        sumX += col
        sumY += row
        const qx = col < GRID / 2 ? 0 : 1
        const qy = row < GRID / 2 ? 0 : 1
        quadrants[qy * 2 + qx]!++
      }

      if (col < GRID / 2) {
        const mirror = GRID - 1 - col
        if (grid[row * GRID + col] === grid[row * GRID + mirror]) hMatch++
        hTotal++
      }
      if (row < GRID / 2) {
        const mirror = GRID - 1 - row
        if (grid[row * GRID + col] === grid[mirror * GRID + col]) vMatch++
        vTotal++
      }
    }
  }

  const density = onCount / TOTAL_BITS

  const qMean = quadrants.reduce((a, b) => a + b, 0) / 4
  const qVariance =
    quadrants.reduce((s, q) => s + (q - qMean) ** 2, 0) / 4
  const quadrantBalance = onCount > 0 ? 1 - Math.min(1, qVariance / (onCount ** 2 * 0.25)) : 0

  let byteComplexity = 0
  for (let i = 0; i < pixels.length; i++) {
    byteComplexity += popcountByte(pixels[i]!)
  }

  const spatialEntropy = computeSpatialEntropy(grid, onCount)

  return {
    density,
    horizontalSymmetry: hTotal > 0 ? hMatch / hTotal : 0,
    verticalSymmetry: vTotal > 0 ? vMatch / vTotal : 0,
    spatialEntropy,
    centroidX: onCount > 0 ? sumX / onCount : GRID / 2,
    centroidY: onCount > 0 ? sumY / onCount : GRID / 2,
    quadrantBalance,
    complexity: byteComplexity / TOTAL_BITS,
  }
}

function computeSpatialEntropy(grid: Uint8Array, onCount: number): number {
  if (onCount === 0) return 0

  const zones = 4
  const counts = new Array(zones).fill(0)
  const mid = GRID / 2

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (!grid[row * GRID + col]) continue
      const zone = (row < mid ? 0 : 2) + (col < mid ? 0 : 1)
      counts[zone]!++
    }
  }

  let entropy = 0
  for (const c of counts) {
    if (c === 0) continue
    const p = c / onCount
    entropy -= p * Math.log2(p)
  }

  return entropy / Math.log2(zones)
}

export function morphologyDistance(a: MorphologyProfile, b: MorphologyProfile): number {
  const dims: (keyof MorphologyProfile)[] = [
    'density',
    'horizontalSymmetry',
    'verticalSymmetry',
    'spatialEntropy',
    'quadrantBalance',
    'complexity',
  ]

  let sum = 0
  for (const d of dims) {
    const diff = a[d] - b[d]
    sum += diff * diff
  }

  const cx = (a.centroidX - b.centroidX) / GRID
  const cy = (a.centroidY - b.centroidY) / GRID
  sum += cx * cx + cy * cy

  return Math.sqrt(sum)
}

export function morphologyUniqueness(
  profile: MorphologyProfile,
  collectionMean: MorphologyProfile,
): number {
  const dist = morphologyDistance(profile, collectionMean)
  return Math.min(100, dist * 120)
}

export function computeCollectionMorphologyMean(
  allPixels: Uint8Array,
  maxId: number,
  sampleSize = 500,
): MorphologyProfile {
  const step = Math.max(1, Math.floor(maxId / sampleSize))
  const accum: MorphologyProfile = {
    density: 0,
    horizontalSymmetry: 0,
    verticalSymmetry: 0,
    spatialEntropy: 0,
    centroidX: 0,
    centroidY: 0,
    quadrantBalance: 0,
    complexity: 0,
  }
  let n = 0

  for (let id = 0; id < maxId; id += step) {
    const offset = id * 200
    const slice = allPixels.subarray(offset, offset + 200)
    const m = analyzeMorphology(slice)
    accum.density += m.density
    accum.horizontalSymmetry += m.horizontalSymmetry
    accum.verticalSymmetry += m.verticalSymmetry
    accum.spatialEntropy += m.spatialEntropy
    accum.centroidX += m.centroidX
    accum.centroidY += m.centroidY
    accum.quadrantBalance += m.quadrantBalance
    accum.complexity += m.complexity
    n++
  }

  if (n === 0) return accum

  return {
    density: accum.density / n,
    horizontalSymmetry: accum.horizontalSymmetry / n,
    verticalSymmetry: accum.verticalSymmetry / n,
    spatialEntropy: accum.spatialEntropy / n,
    centroidX: accum.centroidX / n,
    centroidY: accum.centroidY / n,
    quadrantBalance: accum.quadrantBalance / n,
    complexity: accum.complexity / n,
  }
}

export function compareMorphology(a: Uint8Array, b: Uint8Array): number {
  return morphologyDistance(analyzeMorphology(a), analyzeMorphology(b))
}
