import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPaintbrush,
  faCodeBranch,
  faCheck,
  faTimes,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons'
import type { CanvasScanReport } from '../lib/canvas-scan'
import type { VersionEntry } from '../lib/api'
import {
  normieImageUrl,
  normieOriginalImageUrl,
  normieVersionImageUrl,
} from '../lib/api'
import { Panel, SectionHeader } from './ui/Panel'

interface CanvasScanPanelProps {
  id: number
  report: CanvasScanReport
  versions: VersionEntry[]
}

export function CanvasScanPanel({ id, report, versions }: CanvasScanPanelProps) {
  return (
    <Panel elevated className="p-6 sm:p-8 space-y-6">
      <SectionHeader
        icon={faPaintbrush}
        label="Canvas API"
        title="Canvas evolution scan"
        description="Live analysis from /original/pixels, /canvas/pixels, /canvas/diff, and /history/normie/versions — verifies on-chain XOR integrity."
      />

      {!report.customized ? (
        <div className="rounded-xl border border-border bg-surface-raised p-5 text-center">
          <p className="text-sm font-medium text-fg">Pristine bitmap</p>
          <p className="mt-1 text-xs text-muted">
            No Canvas transforms detected. Original and composited pixels are identical.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <CompareFrame label="Original" src={normieOriginalImageUrl(id)} />
            <CompareFrame label="Current" src={normieImageUrl(id)} highlight />
            {versions[0] && (
              <CompareFrame
                label={`v${versions[0].version}`}
                src={normieVersionImageUrl(id, versions[0].version)}
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Edit magnitude" value={`${report.editMagnitude.toFixed(1)}%`} />
            <Metric label="Phenotype drift" value={`${report.phenotypeDrift.toFixed(0)}`} />
            <Metric label="XOR layer density" value={`${report.xorLayerDensity.toFixed(1)}%`} />
            <Metric label="Evolution score" value={`${report.evolutionScore.toFixed(0)}`} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Pixels added" value={String(report.netPixelChange)} />
            <Metric label="Transform depth" value={String(report.evolutionDepth)} />
            <Metric label="Cumulative edits" value={String(report.cumulativeEdits)} />
            <Metric label="Spatial spread" value={`${report.spatialSpread.toFixed(1)}%`} />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3">
            <FontAwesomeIcon
              icon={report.xorIntegrityValid ? faCheck : faTimes}
              className={report.xorIntegrityValid ? 'text-green-600' : 'text-red-600'}
            />
            <span className="text-sm text-fg">
              XOR integrity: {report.xorIntegrityValid ? 'verified' : 'mismatch'}
            </span>
            <span className="text-xs text-muted font-mono">
              original ⊕ canvas_layer = composited
            </span>
          </div>
        </>
      )}

      {versions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faCodeBranch} className="text-fg-soft" />
            <h3 className="text-sm font-semibold text-fg">Version history</h3>
          </div>
          <div className="space-y-2">
            {versions.map((v) => (
              <div
                key={v.version}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-fg">v{v.version}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {v.changeCount} changes · {v.newPixelCount} new pixels
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted truncate max-w-[200px]">
                  {v.transformer.slice(0, 10)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Original density" value={`${report.originalDensity.toFixed(1)}%`} />
        <Metric label="Composited density" value={`${report.compositedDensity.toFixed(1)}%`} />
        <Metric label="Canvas investment" value={`${report.canvasInvestment.toFixed(0)}`} />
        <Metric label="AP × Level signal" value={`${report.canvasInvestment.toFixed(0)}`} />
      </div>
    </Panel>
  )
}

function CompareFrame({
  label,
  src,
  highlight,
}: {
  label: string
  src: string
  highlight?: boolean
}) {
  return (
    <div className={`text-center ${highlight ? 'ring-2 ring-fg rounded-xl' : ''}`}>
      <div className="normie-frame aspect-square">
        <img src={src} alt={label} className="h-full w-full object-contain" loading="lazy" />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center justify-center gap-1">
        {highlight && <FontAwesomeIcon icon={faLayerGroup} className="text-fg-soft" />}
        {label}
      </p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold">{label}</p>
      <p className="font-mono text-lg font-bold text-fg mt-0.5">{value}</p>
    </div>
  )
}
