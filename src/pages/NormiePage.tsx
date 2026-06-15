import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCopy,
  faCheck,
  faGhost,
  faPalette,
  faLevelUpAlt,
  faWallet,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faFire,
} from '@fortawesome/free-solid-svg-icons'
import {
  fetchTraits,
  fetchTraitsBinary,
  fetchMetadata,
  fetchCanvasInfo,
  fetchOwner,
  fetchPixels,
  fetchOriginalPixels,
  fetchCanvasPixels,
  fetchCanvasDiff,
  fetchVersionHistory,
  normieImageUrl,
  burnedNormieImageUrl,
  isValidTokenId,
  isBurnedError,
  type TraitsResponse,
  type MetadataResponse,
  type CanvasInfo,
  type VersionEntry,
} from '../lib/api'
import { useNormieIndex } from '../hooks/useNormieIndex'
import { analyzeNormie, getTraitRaritiesForNormie } from '../lib/analysis'
import { analyzeTraitBinary } from '../lib/trait-binary'
import { analyzeCanvasScan, pristineCanvasReport, type CanvasScanReport } from '../lib/canvas-scan'
import { TraitRarityList } from '../components/TraitRarityList'
import { DnaFingerprint } from '../components/DnaFingerprint'
import { GeneticMatches } from '../components/GeneticMatches'
import { CanvasScanPanel } from '../components/CanvasScanPanel'
import { TraitBinaryPanel } from '../components/TraitBinaryPanel'
import { Panel } from '../components/ui/Panel'

export function NormiePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = parseInt(idParam ?? '', 10)
  const valid = isValidTokenId(id)

  const { index, loading: indexLoading, error: indexError } = useNormieIndex()
  const [traits, setTraits] = useState<TraitsResponse | null>(null)
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null)
  const [canvas, setCanvas] = useState<CanvasInfo | null>(null)
  const [owner, setOwner] = useState<string | null>(null)
  const [isBurned, setIsBurned] = useState(false)
  const [traitHex, setTraitHex] = useState<string | null>(null)
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [canvasScan, setCanvasScan] = useState<CanvasScanReport | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!valid) return
    setApiLoading(true)
    setApiError(null)
    setIsBurned(false)

    async function load() {
      try {
        const [t, m, c, hex, vers] = await Promise.all([
          fetchTraits(id),
          fetchMetadata(id),
          fetchCanvasInfo(id),
          fetchTraitsBinary(id),
          fetchVersionHistory(id),
        ])

        setTraits(t)
        setMetadata(m)
        setCanvas(c)
        setTraitHex(hex)
        setVersions(vers)

        try {
          const o = await fetchOwner(id)
          setOwner(o.owner)
        } catch (err) {
          if (isBurnedError(err)) {
            setIsBurned(true)
            setOwner(null)
          }
        }

        const [original, composited, xorLayer, diff] = await Promise.all([
          fetchOriginalPixels(id),
          fetchPixels(id),
          fetchCanvasPixels(id),
          fetchCanvasDiff(id),
        ])

        const scan = analyzeCanvasScan({
          originalPixels: original,
          compositedPixels: composited,
          xorLayer,
          diff,
          versions: vers,
          canvasInfo: c,
        })

        setCanvasScan(scan)
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setApiLoading(false)
      }
    }

    load()
  }, [id, valid])

  const alleles = useMemo(
    () => (traitHex ? analyzeTraitBinary(traitHex) : null),
    [traitHex],
  )

  const report = useMemo(() => {
    if (!index || !traits || !valid) return null
    const live =
      canvasScan && alleles
        ? { canvas: canvasScan, alleles }
        : undefined
    return analyzeNormie(index, id, traits.attributes, live)
  }, [index, id, traits, valid, canvasScan, alleles])

  const rarities = useMemo(() => {
    if (!index || !traits) return []
    return getTraitRaritiesForNormie(index, traits.attributes)
  }, [index, traits])

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!valid) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Invalid token ID. Must be 0–9999.</p>
        <Link to="/" className="mt-4 inline-block text-fg-soft hover:text-fg font-medium">
          ← Back to home
        </Link>
      </div>
    )
  }

  const loading = apiLoading || indexLoading
  const scanReport = canvasScan ?? (canvas ? pristineCanvasReport(canvas) : null)

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="btn-secondary !py-2 !px-3">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to={`/normie/${Math.max(0, id - 1)}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-hover transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs text-muted" />
            </Link>
            <Link
              to={`/normie/${Math.min(9999, id + 1)}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-hover transition"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-xs text-muted" />
            </Link>
          </div>
        </div>
        <button onClick={copyLink} className="btn-secondary">
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          {copied ? 'Copied' : 'Share'}
        </button>
      </div>

      <div>
        <p className="section-label mb-2">Token DNA report</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-fg">
          {metadata?.name ?? `Normie #${id}`}
        </h1>
        <p className="mt-2 text-muted">
          18 live API endpoints · offline index · multi-layer genetic scan
        </p>
      </div>

      {(apiError || indexError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {apiError ?? indexError}
        </div>
      )}

      {isBurned && (
        <Panel className="p-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faFire} className="text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Burned token</p>
              <p className="text-sm text-red-700">This Normie was burned on-chain. Memorial image preserved via /history/burned/{id}/image.svg</p>
            </div>
          </div>
          <div className="mt-4 normie-frame w-32 aspect-square mx-auto opacity-80">
            <img src={burnedNormieImageUrl(id)} alt="Burned memorial" className="h-full w-full object-contain" />
          </div>
        </Panel>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-4">
          <Panel elevated className="overflow-hidden p-0">
            <div className="normie-frame !rounded-none !border-0 aspect-square">
              {loading ? (
                <div className="skeleton h-full w-full !rounded-none" />
              ) : (
                <img
                  src={normieImageUrl(id)}
                  alt={`Normie #${id}`}
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="p-4 border-t border-border bg-surface-raised">
              <p className="font-mono text-sm font-semibold text-fg">#{id}</p>
              {report && (
                <p className="text-xs text-muted mt-0.5">{report.archetype.name}</p>
              )}
            </div>
          </Panel>

          {canvas && (
            <div className="flex flex-wrap gap-2">
              {canvas.customized && <Badge icon={faPalette} label="Customized" />}
              <Badge icon={faLevelUpAlt} label={`Level ${canvas.level}`} />
              {canvas.actionPoints > 0 && (
                <Badge icon={faGhost} label={`${canvas.actionPoints} AP`} />
              )}
              {isBurned && <Badge icon={faFire} label="Burned" />}
            </div>
          )}

          {owner && (
            <Link
              to={`/wallet/${owner}`}
              className="card flex items-center gap-3 p-4 hover:border-border-strong transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised border border-border">
                <FontAwesomeIcon icon={faWallet} className="text-fg-soft text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Owner</p>
                <p className="font-mono text-sm text-fg truncate">
                  {owner.slice(0, 8)}…{owner.slice(-6)}
                </p>
              </div>
            </Link>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          {report && !loading && (
            <DnaFingerprint
              fingerprint={report.fingerprint}
              morphology={report.morphology}
              archetype={report.archetype}
            />
          )}

          {scanReport && !loading && (
            <CanvasScanPanel id={id} report={scanReport} versions={versions} />
          )}

          {alleles && traits && !loading && (
            <TraitBinaryPanel alleles={alleles} decodedTraits={traits.attributes} />
          )}

          <Panel className="p-6 sm:p-8">
            <p className="section-label mb-2">Traits</p>
            <h2 className="text-xl font-bold text-fg mb-5">Rarity breakdown</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-10 w-full" />
                ))}
              </div>
            ) : (
              <TraitRarityList rarities={rarities} collectionSize={index?.count ?? 10000} />
            )}
          </Panel>

          {report?.shadow && (
            <Panel elevated className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faGhost} className="text-fg-soft" />
                <p className="section-label">Shadow analysis</p>
              </div>
              <h2 className="text-xl font-bold text-fg">Shadow twin</h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Bitwise inverse search cross-referenced with composite genetic distance.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Inverse match" value={`${report.shadow.inverseMatch.toFixed(1)}%`} />
                <Stat label="Shadow affinity" value={`${report.shadow.complementarity.toFixed(1)}%`} />
                <Stat label="Twin ID" value={`#${report.shadow.twin.id}`} />
                <Stat label="Bit gap" value={`${report.shadow.twin.distance}`} />
              </div>
            </Panel>
          )}

          {report && (
            <GeneticMatches
              genotypeSiblings={report.genotypeSiblings}
              doppelgangers={report.doppelgangers}
              phenotypeTwins={report.phenotypeTwins}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function Badge({ icon, label }: { icon: typeof faGhost; label: string }) {
  return (
    <span className="badge">
      <FontAwesomeIcon icon={icon} className="text-fg-soft" />
      {label}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="font-mono text-sm font-semibold text-fg mt-0.5">{value}</p>
    </div>
  )
}
