import type { CanvasInfo, PixelDiff, VersionEntry } from './api'
import {
  countOnBitsFromString,
  densityPercent,
  editMagnitudePercent,
  verifyXorChain,
  TOTAL_BITS,
} from './pixels'

export interface CanvasScanInput {
  originalPixels: string
  compositedPixels: string
  xorLayer: string
  diff: PixelDiff
  versions: VersionEntry[]
  canvasInfo: CanvasInfo
}

export interface CanvasScanReport {
  customized: boolean
  editMagnitude: number
  phenotypeDrift: number
  xorLayerDensity: number
  xorIntegrityValid: boolean
  originalDensity: number
  compositedDensity: number
  netPixelChange: number
  evolutionDepth: number
  cumulativeEdits: number
  spatialSpread: number
  canvasInvestment: number
  evolutionScore: number
}

function spatialSpread(coords: { x: number; y: number }[]): number {
  if (coords.length === 0) return 0

  let minX = 40, maxX = 0, minY = 40, maxY = 0
  for (const { x, y } of coords) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  const area = (maxX - minX + 1) * (maxY - minY + 1)
  return Math.min(100, (area / 1600) * 100 * 10)
}

export function analyzeCanvasScan(input: CanvasScanInput): CanvasScanReport {
  const {
    originalPixels,
    compositedPixels,
    xorLayer,
    diff,
    versions,
    canvasInfo,
  } = input

  const customized = canvasInfo.customized || versions.length > 0 || diff.netChange !== 0
  const editMagnitude = editMagnitudePercent(originalPixels, compositedPixels)
  const xorLayerDensity = (countOnBitsFromString(xorLayer) / TOTAL_BITS) * 100
  const xorIntegrityValid = verifyXorChain(originalPixels, xorLayer, compositedPixels)

  const evolutionDepth = versions.length
  const cumulativeEdits = versions.reduce((s, v) => s + v.changeCount, 0)
  const allCoords = [...diff.added, ...diff.removed]
  const spread = spatialSpread(allCoords)

  const phenotypeDrift = Math.min(
    100,
    editMagnitude * 0.6 +
      xorLayerDensity * 0.2 +
      Math.min(cumulativeEdits, 50) * 0.4,
  )

  const canvasInvestment = Math.min(
    100,
    canvasInfo.actionPoints * 3 +
      canvasInfo.level * 12 +
      evolutionDepth * 8,
  )

  const evolutionScore = Math.min(
    100,
    evolutionDepth * 15 +
      cumulativeEdits * 2 +
      diff.addedCount * 1.5 +
      canvasInfo.level * 10,
  )

  return {
    customized,
    editMagnitude,
    phenotypeDrift,
    xorLayerDensity,
    xorIntegrityValid,
    originalDensity: densityPercent(originalPixels),
    compositedDensity: densityPercent(compositedPixels),
    netPixelChange: diff.netChange,
    evolutionDepth,
    cumulativeEdits,
    spatialSpread: spread,
    canvasInvestment,
    evolutionScore,
  }
}

export function pristineCanvasReport(canvasInfo: CanvasInfo): CanvasScanReport {
  return {
    customized: false,
    editMagnitude: 0,
    phenotypeDrift: 0,
    xorLayerDensity: 0,
    xorIntegrityValid: true,
    originalDensity: 0,
    compositedDensity: 0,
    netPixelChange: 0,
    evolutionDepth: 0,
    cumulativeEdits: 0,
    spatialSpread: 0,
    canvasInvestment: canvasInfo.level * 5,
    evolutionScore: 0,
  }
}

export function walletCanvasMetrics(
  reports: CanvasScanReport[],
): {
  avgDrift: number
  totalEvolution: number
  customizedPct: number
  avgInvestment: number
} {
  if (reports.length === 0) {
    return { avgDrift: 0, totalEvolution: 0, customizedPct: 0, avgInvestment: 0 }
  }

  const customized = reports.filter((r) => r.customized).length
  const avgDrift =
    reports.reduce((s, r) => s + r.phenotypeDrift, 0) / reports.length
  const totalEvolution = reports.reduce((s, r) => s + r.evolutionDepth, 0)
  const avgInvestment =
    reports.reduce((s, r) => s + r.canvasInvestment, 0) / reports.length

  return {
    avgDrift,
    totalEvolution,
    customizedPct: (customized / reports.length) * 100,
    avgInvestment,
  }
}
