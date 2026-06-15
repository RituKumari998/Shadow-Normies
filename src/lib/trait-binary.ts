const TRAIT_CATEGORIES = [
  'Type',
  'Gender',
  'Age',
  'Hair Style',
  'Facial Feature',
  'Eyes',
  'Expression',
  'Accessory',
] as const

export interface TraitAlleles {
  hex: string
  bytes: number[]
  fingerprint: string
  alleleEntropy: number
}

export function parseTraitHex(hex: string): number[] {
  const clean = hex.replace(/^0x/i, '')
  const bytes: number[] = []
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16))
  }
  return bytes.slice(0, 8)
}

export function analyzeTraitBinary(hex: string): TraitAlleles {
  const bytes = parseTraitHex(hex)
  const fingerprint = bytes.map((b) => b.toString(16).padStart(2, '0')).join(':')

  let entropy = 0
  const total = bytes.reduce((s, b) => s + b, 0) || 1
  for (const b of bytes) {
    if (b === 0) continue
    const p = b / total
    entropy -= p * Math.log2(p)
  }

  return {
    hex,
    bytes,
    fingerprint,
    alleleEntropy: entropy,
  }
}

export function traitCategoryLabels(bytes: number[]): { category: string; index: number }[] {
  return bytes.map((index, i) => ({
    category: TRAIT_CATEGORIES[i] ?? `Trait ${i}`,
    index,
  }))
}

export function compareTraitFingerprints(a: string, b: string): number {
  const bytesA = parseTraitHex(a)
  const bytesB = parseTraitHex(b)
  let matches = 0
  for (let i = 0; i < Math.min(bytesA.length, bytesB.length); i++) {
    if (bytesA[i] === bytesB[i]) matches++
  }
  return (matches / 8) * 100
}
