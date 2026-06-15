import type { TraitAttribute } from './api'

export interface TraitEntry {
  id: number
  attributes: TraitAttribute[]
}

export interface TraitRarity {
  trait_type: string
  value: string
  count: number
  percent: number
}

export interface RarityIndex {
  byKey: Map<string, number>
  total: number
}

export function traitKey(traitType: string, value: string): string {
  return `${traitType}::${value}`
}

export function buildRarityIndex(traits: TraitEntry[]): RarityIndex {
  const byKey = new Map<string, number>()
  for (const entry of traits) {
    for (const attr of entry.attributes) {
      const key = traitKey(attr.trait_type, attr.value)
      byKey.set(key, (byKey.get(key) ?? 0) + 1)
    }
  }
  return { byKey, total: traits.length }
}

export function getTraitRarity(
  index: RarityIndex,
  traitType: string,
  value: string,
): TraitRarity {
  const key = traitKey(traitType, value)
  const count = index.byKey.get(key) ?? 0
  const percent = index.total > 0 ? (count / index.total) * 100 : 0
  return { trait_type: traitType, value, count, percent }
}

export function getRaritiesForAttributes(
  index: RarityIndex,
  attributes: TraitAttribute[],
): TraitRarity[] {
  return attributes.map((attr) => getTraitRarity(index, attr.trait_type, attr.value))
}

export function findRarestTrait(rarities: TraitRarity[]): TraitRarity | null {
  if (rarities.length === 0) return null
  return rarities.reduce((best, curr) =>
    curr.percent < best.percent ? curr : best,
  )
}

export function aggregateTraitDistribution(
  traits: TraitEntry[],
  ids: number[],
): Map<string, number> {
  const dist = new Map<string, number>()
  const idSet = new Set(ids)

  for (const entry of traits) {
    if (!idSet.has(entry.id)) continue
    for (const attr of entry.attributes) {
      const key = `${attr.trait_type}: ${attr.value}`
      dist.set(key, (dist.get(key) ?? 0) + 1)
    }
  }

  return dist
}
