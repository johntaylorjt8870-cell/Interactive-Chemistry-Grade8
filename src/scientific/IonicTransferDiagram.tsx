import type { ReactNode } from 'react'
import { BohrAtom } from './BohrAtom'

export type IonicTransferDiagramProps = {
  caption?: ReactNode
  className?: string
}

/**
 * The textbook figure of page 14, redrawn as structured SVG/DOM:
 * Na (2-8-1) with its valence electron arrowing into Cl (2-8-7), then the
 * resulting ions Na⁺ (2-8) and Cl⁻ (2-8-8), then the electrically neutral
 * NaCl crystal cluster. Panel order and labels follow the printed figure
 * (left→right), and every electron remains a real addressable element.
 */
export function IonicTransferDiagram({ caption, className }: IonicTransferDiagramProps) {
  return (
    <figure className={['transfer-diagram', className].filter(Boolean).join(' ')} data-source-figure="p14">
      <div className="transfer-diagram__panels" dir="ltr">
        <BohrAtom symbol="Na" shells={[2, 8, 1]} highlightValence label="Na" size={118} />
        <span className="transfer-diagram__transfer-arrow" aria-hidden="true">
          <svg viewBox="0 0 64 40" width="64" height="40" focusable="false">
            <path d="M4 34 C 20 30, 40 22, 56 8" fill="none" />
            <path d="M48 8 L 58 6 L 54 16" fill="none" />
          </svg>
        </span>
        <BohrAtom symbol="Cl" shells={[2, 8, 7]} highlightValence label="Cl" size={118} />
        <span className="transfer-diagram__arrow" aria-hidden="true">
          <svg viewBox="0 0 40 16" width="40" height="16" focusable="false">
            <path d="M2 8 H 30" fill="none" />
            <path d="M24 3 L 34 8 L 24 13" fill="none" />
          </svg>
        </span>
        <span className="transfer-diagram__ion-pair">
          <BohrAtom symbol="Na" shells={[2, 8]} charge="+" label="Na" size={104} />
          <BohrAtom symbol="Cl" shells={[2, 8, 8]} charge="-" label="Cl" size={104} />
        </span>
        <span className="transfer-diagram__arrow" aria-hidden="true">
          <svg viewBox="0 0 40 16" width="40" height="16" focusable="false">
            <path d="M2 8 H 30" fill="none" />
            <path d="M24 3 L 34 8 L 24 13" fill="none" />
          </svg>
        </span>
        <span className="transfer-diagram__cluster-wrap">
          <NaClCluster size={96} />
          <span className="bohr__label" dir="ltr">
            NaCl
          </span>
        </span>
      </div>
      {caption ? <figcaption className="transfer-diagram__caption">{caption}</figcaption> : null}
    </figure>
  )
}

/** Packed crystal cluster: alternating anions (large, −) and cations (small, +). */
export function NaClCluster({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={['transfer-diagram__cluster', className].filter(Boolean).join(' ')}
      viewBox="0 0 96 84"
      width={size}
      height={(size * 84) / 96}
      role="img"
      aria-label="عنقود بلوري لكلوريد الصوديوم: أيونات سالبة وموجبة متراصة."
      focusable="false"
    >
      {CLUSTER.map((sphere, index) => (
        <g key={index} data-ion={sphere.sign === '-' ? 'Cl-' : 'Na+'}>
          <circle
            className={sphere.sign === '-' ? 'transfer-diagram__anion' : 'transfer-diagram__cation'}
            cx={sphere.x}
            cy={sphere.y}
            r={sphere.sign === '-' ? 12 : 9}
          />
          <text className="transfer-diagram__cluster-sign" x={sphere.x} y={sphere.y + 3.5} textAnchor="middle">
            {sphere.sign === '-' ? '\u2212' : '+'}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** Packed crystal cluster: alternating anions (large, −) and cations (small, +). */
const CLUSTER: Array<{ x: number; y: number; sign: '-' | '+' }> = [
  { x: 24, y: 22, sign: '-' },
  { x: 48, y: 16, sign: '+' },
  { x: 70, y: 24, sign: '-' },
  { x: 14, y: 46, sign: '+' },
  { x: 36, y: 44, sign: '-' },
  { x: 60, y: 44, sign: '+' },
  { x: 82, y: 46, sign: '-' },
  { x: 26, y: 66, sign: '-' },
  { x: 50, y: 68, sign: '+' },
  { x: 72, y: 66, sign: '-' },
]
