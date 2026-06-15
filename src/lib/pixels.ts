import { hamming, popcountByte } from './hamming'

const TOTAL_BITS = 1600
const PIXEL_BYTES = 200

export function pixelStringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(PIXEL_BYTES)
  const len = Math.min(str.length, TOTAL_BITS)
  for (let i = 0; i < len; i++) {
    if (str[i] === '1') {
      const byteIdx = Math.floor(i / 8)
      const bitIdx = 7 - (i % 8)
      bytes[byteIdx]! |= 1 << bitIdx
    }
  }
  return bytes
}

export function countOnBitsFromString(str: string): number {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '1') count++
  }
  return count
}

export function countOnBits(bytes: Uint8Array): number {
  let count = 0
  for (let i = 0; i < bytes.length; i++) {
    count += popcountByte(bytes[i]!)
  }
  return count
}

export function densityPercent(str: string): number {
  return (countOnBitsFromString(str) / TOTAL_BITS) * 100
}

export function xorPixelStrings(a: string, b: string): string {
  const len = Math.min(a.length, b.length, TOTAL_BITS)
  let out = ''
  for (let i = 0; i < len; i++) {
    const bitA = a[i] === '1' ? 1 : 0
    const bitB = b[i] === '1' ? 1 : 0
    out += (bitA ^ bitB) ? '1' : '0'
  }
  return out.padEnd(TOTAL_BITS, '0')
}

export function hammingStrings(a: string, b: string): number {
  const bytesA = pixelStringToBytes(a)
  const bytesB = pixelStringToBytes(b)
  return hamming(bytesA, bytesB)
}

export function editMagnitudePercent(original: string, composited: string): number {
  const dist = hammingStrings(original, composited)
  return ((TOTAL_BITS - dist) / TOTAL_BITS) * 100 === 100
    ? 0
    : (dist / TOTAL_BITS) * 100
}

export function verifyXorChain(
  original: string,
  xorLayer: string,
  composited: string,
): boolean {
  const expected = xorPixelStrings(original, xorLayer)
  return hammingStrings(expected, composited) === 0
}

export { TOTAL_BITS, PIXEL_BYTES }
