const POPCOUNT = new Uint8Array(256)
for (let i = 0; i < 256; i++) {
  POPCOUNT[i] = (i & 1) + POPCOUNT[i >> 1]
}

export function popcountByte(b: number): number {
  return POPCOUNT[b & 0xff]
}

export function hamming(a: Uint8Array, b: Uint8Array): number {
  let distance = 0
  for (let i = 0; i < a.length; i++) {
    distance += popcountByte(a[i]! ^ b[i]!)
  }
  return distance
}

export interface SimilarityResult {
  id: number
  distance: number
  similarity: number
}

export function similarityPercent(distance: number, totalBits = 1600): number {
  return ((totalBits - distance) / totalBits) * 100
}

export function findTopKSimilar(
  target: Uint8Array,
  allPixels: Uint8Array,
  excludeId?: number,
  k = 10,
  maxId?: number,
): SimilarityResult[] {
  const totalIds = maxId ?? allPixels.length / 200
  const heap: SimilarityResult[] = []

  for (let id = 0; id < totalIds; id++) {
    if (id === excludeId) continue

    const offset = id * 200
    const slice = allPixels.subarray(offset, offset + 200)
    const distance = hamming(target, slice)

    if (heap.length < k) {
      heap.push({ id, distance, similarity: similarityPercent(distance) })
      if (heap.length === k) {
        heap.sort((a, b) => b.distance - a.distance)
      }
    } else if (distance < heap[0]!.distance) {
      heap[0] = { id, distance, similarity: similarityPercent(distance) }
      heap.sort((a, b) => b.distance - a.distance)
    }
  }

  return heap.sort((a, b) => a.distance - b.distance)
}

export function averagePairwiseHamming(
  ids: number[],
  allPixels: Uint8Array,
): number | null {
  if (ids.length < 2) return null

  let total = 0
  let pairs = 0

  for (let i = 0; i < ids.length; i++) {
    const a = ids[i]!
    const aOffset = a * 200
    const aSlice = allPixels.subarray(aOffset, aOffset + 200)

    for (let j = i + 1; j < ids.length; j++) {
      const b = ids[j]!
      const bOffset = b * 200
      const bSlice = allPixels.subarray(bOffset, bOffset + 200)
      total += hamming(aSlice, bSlice)
      pairs++
    }
  }

  return pairs > 0 ? total / pairs : null
}
