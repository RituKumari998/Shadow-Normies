const BASE_URL = 'https://api.normies.art'

export interface TraitAttribute {
  trait_type: string
  value: string
}

export interface TraitsResponse {
  raw: string
  attributes: TraitAttribute[]
}

export interface MetadataResponse {
  name: string
  description: string
  image: string
  attributes: TraitAttribute[]
}

export interface CanvasInfo {
  actionPoints: number
  level: number
  customized: boolean
  delegate: string
  delegateSetBy: string
}

export interface OwnerResponse {
  tokenId: number
  owner: string
}

export interface HoldersResponse {
  address: string
  tokenIds: number[]
  count: number
}

export interface HistoryStats {
  totalBurnCommitments: number
  totalBurnedTokens: number
  totalTransforms: number
  totalTokenData: number
  totalActionPointsDistributed: string
}

export interface CanvasStatus {
  paused: boolean
  maxBurnPercent: number
  tierThresholds: number[]
  tierMinPercents: number[]
}

export interface PixelDiff {
  added: { x: number; y: number }[]
  removed: { x: number; y: number }[]
  addedCount: number
  removedCount: number
  netChange: number
}

export interface VersionEntry {
  version: number
  changeCount: number
  newPixelCount: number
  transformer: string
  blockNumber: string
  timestamp: string
  txHash: string
}

export interface BurnedTokenEntry {
  tokenId: string
  txHash: string
  blockNumber: string
  timestamp: string
}

export interface BurnCommitment {
  tokenId: string
  committer: string
  blockNumber: string
  timestamp: string
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  return res.text()
}

export function normieImageUrl(id: number): string {
  return `${BASE_URL}/normie/${id}/image.png`
}

export function normieOriginalImageUrl(id: number): string {
  return `${BASE_URL}/normie/${id}/original/image.png`
}

export function normieVersionImageUrl(id: number, version: number): string {
  return `${BASE_URL}/history/normie/${id}/version/${version}/image.svg`
}

export function burnedNormieImageUrl(id: number): string {
  return `${BASE_URL}/history/burned/${id}/image.svg`
}

export function fetchTraits(id: number): Promise<TraitsResponse> {
  return fetchJson<TraitsResponse>(`/normie/${id}/traits`)
}

export function fetchTraitsBinary(id: number): Promise<string> {
  return fetchText(`/normie/${id}/traits/binary`)
}

export function fetchMetadata(id: number): Promise<MetadataResponse> {
  return fetchJson<MetadataResponse>(`/normie/${id}/metadata`)
}

export function fetchCanvasInfo(id: number): Promise<CanvasInfo> {
  return fetchJson<CanvasInfo>(`/normie/${id}/canvas/info`)
}

export function fetchCanvasStatus(): Promise<CanvasStatus> {
  return fetchJson<CanvasStatus>('/canvas/status')
}

export function fetchOwner(id: number): Promise<OwnerResponse> {
  return fetchJson<OwnerResponse>(`/normie/${id}/owner`)
}

export function fetchHolders(address: string): Promise<HoldersResponse> {
  return fetchJson<HoldersResponse>(`/holders/${address}`)
}

export function fetchHistoryStats(): Promise<HistoryStats> {
  return fetchJson<HistoryStats>('/history/stats')
}

export function fetchPixels(id: number): Promise<string> {
  return fetchText(`/normie/${id}/pixels`)
}

export function fetchOriginalPixels(id: number): Promise<string> {
  return fetchText(`/normie/${id}/original/pixels`)
}

export function fetchCanvasPixels(id: number): Promise<string> {
  return fetchText(`/normie/${id}/canvas/pixels`)
}

export function fetchCanvasDiff(id: number): Promise<PixelDiff> {
  return fetchJson<PixelDiff>(`/normie/${id}/canvas/diff`)
}

export function fetchVersionHistory(id: number): Promise<VersionEntry[]> {
  return fetchJson<VersionEntry[]>(`/history/normie/${id}/versions`)
}

export function fetchBurnedTokens(limit = 50, offset = 0): Promise<BurnedTokenEntry[]> {
  return fetchJson<BurnedTokenEntry[]>(`/history/burned-tokens?limit=${limit}&offset=${offset}`)
}

export function fetchBurnCommitments(limit = 50, offset = 0): Promise<BurnCommitment[]> {
  return fetchJson<BurnCommitment[]>(`/history/burns?limit=${limit}&offset=${offset}`)
}

export function isValidTokenId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 9999
}

export function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr)
}

export function isBurnedError(err: unknown): boolean {
  return err instanceof Error && (err.message.includes('404') || err.message.includes('not found'))
}
