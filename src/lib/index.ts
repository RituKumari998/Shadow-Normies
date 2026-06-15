import {
  buildRarityIndex,
  type RarityIndex,
  type TraitEntry,
} from './rarity'

const PIXEL_BYTES = 200
const TOTAL_NORMIES = 10000

export interface NormieIndex {
  pixels: Uint8Array
  traits: TraitEntry[]
  rarityIndex: RarityIndex
  loaded: boolean
  count: number
}

let cachedIndex: NormieIndex | null = null
let loadPromise: Promise<NormieIndex> | null = null

function parsePixelsBinary(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}

export async function loadNormieIndex(): Promise<NormieIndex> {
  if (cachedIndex?.loaded) return cachedIndex
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const [pixelsRes, traitsRes] = await Promise.all([
      fetch('/data/normies-pixels.bin'),
      fetch('/data/normies-traits.json'),
    ])

    if (!pixelsRes.ok || !traitsRes.ok) {
      throw new Error('Index data not found. Run: npm run build-index')
    }

    const pixels = parsePixelsBinary(await pixelsRes.arrayBuffer())
    const rawTraits = (await traitsRes.json()) as (TraitEntry | null)[]
    const pixelCount = Math.floor(pixels.length / PIXEL_BYTES)

    const traits: TraitEntry[] = []
    let count = 0
    for (let i = 0; i < Math.min(pixelCount, rawTraits.length); i++) {
      const entry = rawTraits[i]
      if (entry?.attributes) {
        traits[i] = entry.id !== undefined ? entry : { id: i, attributes: entry.attributes }
        count = i + 1
      }
    }

    if (count === 0) {
      for (const entry of rawTraits) {
        if (entry?.attributes && entry.id !== undefined) {
          traits[entry.id] = entry
          count = Math.max(count, entry.id + 1)
        }
      }
    }

    const traitList = traits.filter(Boolean) as TraitEntry[]

    const index: NormieIndex = {
      pixels,
      traits,
      rarityIndex: buildRarityIndex(traitList),
      loaded: true,
      count: count || traitList.length,
    }

    cachedIndex = index
    return index
  })()

  return loadPromise
}

export function getPixelsForId(index: NormieIndex, id: number): Uint8Array | null {
  if (id < 0 || id >= index.count) return null
  const offset = id * PIXEL_BYTES
  return index.pixels.subarray(offset, offset + PIXEL_BYTES)
}

export function getTraitEntry(index: NormieIndex, id: number): TraitEntry | null {
  return index.traits[id] ?? null
}

export { PIXEL_BYTES, TOTAL_NORMIES }
