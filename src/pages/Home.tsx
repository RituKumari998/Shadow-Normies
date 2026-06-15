import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFingerprint,
  faDatabase,
  faBolt,
  faMask,
  faGhost,
  faChartPie,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'
import { SearchBar } from '../components/SearchBar'
import { Panel } from '../components/ui/Panel'
import { fetchHistoryStats, fetchCanvasStatus, normieImageUrl, type HistoryStats, type CanvasStatus } from '../lib/api'
import { useNormieIndex } from '../hooks/useNormieIndex'

const FEATURES = [
  {
    icon: faFingerprint,
    title: 'DNA Fingerprint',
    description: 'Uniqueness index from nearest-neighbor gap, trait entropy, and morphology anomaly.',
  },
  {
    icon: faDatabase,
    title: 'Trait Genome',
    description: '8-allele encoding with Jaccard similarity and information-theoretic rarity.',
  },
  {
    icon: faBolt,
    title: 'Phenotype Twins',
    description: '1600-bit Hamming search across all 10,000 on-chain bitmaps in <50ms.',
  },
  {
    icon: faMask,
    title: 'Doppelgängers',
    description: 'Lookalike pixels with divergent genotypes — uncanny matches.',
  },
  {
    icon: faGhost,
    title: 'Shadow Twin',
    description: 'Bitwise inverse search — every Normie has a mathematical shadow.',
  },
  {
    icon: faCircleCheck,
    title: 'Canvas Evolution',
    description: 'XOR integrity verify, edit magnitude, version history, phenotype drift.',
  },
  {
    icon: faChartPie,
    title: 'Wallet Phylogeny',
    description: 'Collection genetic diversity, archetype spread, phenotype cohesion.',
  },
]

export function Home() {
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [canvasStatus, setCanvasStatus] = useState<CanvasStatus | null>(null)
  const [previewId, setPreviewId] = useState('42')
  const { index, loading: indexLoading, error: indexError } = useNormieIndex()

  useEffect(() => {
    fetchHistoryStats().then(setStats).catch(() => {})
    fetchCanvasStatus().then(setCanvasStatus).catch(() => {})
  }, [])

  const validPreview = /^\d+$/.test(previewId) && parseInt(previewId) >= 0 && parseInt(previewId) <= 9999

  return (
    <div className="space-y-16 animate-fade-up">
      {/* Hero */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 badge badge-dark mb-6">
          <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
          Normies Hackathon · Tool
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-fg sm:text-6xl sm:leading-[1.05]">
          Pixel intelligence for
          <br />
          <span className="text-fg-soft">10,000 on-chain faces</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
          Shadow Normies analyzes every Normie as a multi-layer genetic object —
          morphology, trait genome, shadow complementarity, and doppelgänger detection.
          Free API. No wallet required.
        </p>

        <div className="mt-10 flex justify-center">
          <SearchBar autoFocus large />
        </div>
      </section>

      {/* Live preview strip — like normies.art/tools */}
      <section>
        <Panel elevated className="overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-border">
              <p className="section-label mb-3">Preview any Normie</p>
              <h2 className="text-2xl font-bold text-fg tracking-tight">
                Enter a token ID
              </h2>
              <p className="mt-2 text-sm text-muted">
                See live API data in action — same flow as normies.art/tools.
              </p>

              <div className="mt-6 flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={9999}
                  value={previewId}
                  onChange={(e) => setPreviewId(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-surface-raised px-4 py-3 font-mono text-fg focus:border-fg-soft focus:outline-none focus:ring-2 focus:ring-fg/10"
                />
                <Link
                  to={validPreview ? `/normie/${previewId}` : '/normie/42'}
                  className="btn-primary shrink-0"
                >
                  Analyze
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniStat label="Indexed" value={index ? index.count.toLocaleString() : '…'} />
                <MiniStat label="API endpoints" value="18+" />
                <MiniStat label="Canvas" value={canvasStatus?.paused ? 'Paused' : 'Active'} />
                <MiniStat label="Bitmap" value="40×40" />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-surface-raised">
              <div className="normie-frame w-48 sm:w-56 aspect-square shadow-lg animate-float">
                <img
                  src={normieImageUrl(validPreview ? parseInt(previewId) : 42)}
                  alt={`Normie preview`}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-4 font-mono text-sm font-semibold text-fg">
                Normie #{validPreview ? previewId : '42'}
              </p>
              <Link
                to={`/normie/${validPreview ? previewId : 42}`}
                className="mt-3 text-sm font-medium text-fg-soft hover:text-fg underline underline-offset-4"
              >
                View full DNA report →
              </Link>
            </div>
          </div>
        </Panel>
      </section>

      {/* Feature grid — tools directory style */}
      <section>
        <div className="mb-8 text-center sm:text-left">
          <p className="section-label mb-2">Capabilities</p>
          <h2 className="text-2xl font-bold text-fg tracking-tight">
            What Shadow Normies does
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Panel key={f.title} className="p-5 hover:border-border-strong transition group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-border group-hover:bg-fg group-hover:border-fg transition">
                <FontAwesomeIcon
                  icon={f.icon}
                  className="text-fg-soft group-hover:text-white transition text-sm"
                />
              </div>
              <h3 className="mt-4 font-semibold text-fg">{f.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{f.description}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* How it works + stats */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-3 p-6 sm:p-8">
          <p className="section-label mb-3">Pipeline</p>
          <h2 className="text-xl font-bold text-fg">How it works</h2>
          <ol className="mt-6 space-y-4">
            {[
              'Morphology engine extracts density, symmetry, entropy from 40×40 bitmaps',
              'Trait genome encoded as 8 categorical alleles with Jaccard + rarity scoring',
              'Composite genetic distance: 45% pixel · 35% trait · 20% morphology',
              'Shadow complementarity = inverse match × (1 − genetic distance)',
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fg text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-muted leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel className="lg:col-span-2 p-6 sm:p-8">
          <p className="section-label mb-3">On-chain pulse</p>
          <h2 className="text-xl font-bold text-fg">Global stats</h2>
          {stats ? (
            <dl className="mt-6 space-y-4">
              <PulseRow label="Total Normies" value={stats.totalTokenData.toLocaleString()} />
              <PulseRow label="Canvas transforms" value={stats.totalTransforms.toLocaleString()} />
              <PulseRow label="Burned tokens" value={stats.totalBurnedTokens.toLocaleString()} />
              <PulseRow label="Action points" value={parseInt(stats.totalActionPointsDistributed).toLocaleString()} />
            </dl>
          ) : (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-5 w-full" />
              ))}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs text-muted">Canvas contract</p>
            {canvasStatus ? (
              <p className="mt-1 font-mono text-sm font-semibold text-fg-soft">
                {canvasStatus.paused ? 'Paused' : 'Active'} · max burn {canvasStatus.maxBurnPercent}%
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Loading…</p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted">Index status</p>
            {indexLoading && <p className="mt-1 text-sm font-medium text-fg">Loading…</p>}
            {indexError && <p className="mt-1 text-sm text-red-600">{indexError}</p>}
            {index && (
              <p className="mt-1 font-mono text-sm font-semibold text-fg-soft">
                {index.count.toLocaleString()} Normies indexed
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="font-mono text-sm font-semibold text-fg mt-0.5">{value}</p>
    </div>
  )
}

function PulseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-mono text-sm font-semibold text-fg">{value}</dd>
    </div>
  )
}
