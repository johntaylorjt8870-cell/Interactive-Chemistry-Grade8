import type { ReactNode } from 'react'
import { SciSup } from './ScientificText'

export type NuclearNotationProps = {
  /** Chemical symbol, e.g. `C`, `U`, `He`. */
  symbol: string
  /** Mass number (A) — top-left of the symbol. */
  massNumber?: number | string
  /** Atomic number (Z) — bottom-left of the symbol. */
  atomicNumber?: number | string
  /** Optional ionic charge shown top-right. */
  charge?: string | number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Overrides the generated Arabic description for assistive technology. */
  label?: string
}

/**
 * Nuclide notation built from real DOM structure, not spacing tricks.
 *
 *   mass number    → upper-left of the symbol
 *   atomic number  → lower-left of the symbol
 *
 * Absent values render nothing at all: no empty blank marker slots are left
 * behind. The layout adapts (one row when only one of the numbers is given,
 * two rows when both are), so the symbol always stays vertically centred on
 * the numbers that actually exist.
 */
export function NuclearNotation({
  symbol,
  massNumber,
  atomicNumber,
  charge,
  size = 'md',
  className,
  label,
}: NuclearNotationProps) {
  const hasMass = massNumber !== undefined && massNumber !== ''
  const hasAtomic = atomicNumber !== undefined && atomicNumber !== ''
  const hasCharge = charge !== undefined && charge !== ''

  const rows = Number(hasMass) + Number(hasAtomic)
  const description =
    label ??
    [
      `الرمز ${symbol}`,
      hasMass ? `العدد الكتلي ${String(massNumber)}` : null,
      hasAtomic ? `العدد الذري ${String(atomicNumber)}` : null,
      hasCharge ? `الشحنة ${String(charge)}` : null,
    ]
      .filter(Boolean)
      .join('، ')

  return (
    <span
      className={['nuclear-notation', `nuclear-notation--${size}`, className].filter(Boolean).join(' ')}
      dir="ltr"
      role="math"
      aria-label={description}
      data-nuclear={symbol}
      data-rows={String(rows)}
    >
      <span className="nuclear-notation__numbers" aria-hidden="true">
        {hasMass ? <span className="nuclear-notation__mass">{massNumber}</span> : null}
        {hasAtomic ? <span className="nuclear-notation__atomic">{atomicNumber}</span> : null}
      </span>
      <span className="nuclear-notation__symbol" aria-hidden="true">
        {symbol}
        {hasCharge ? (
          <SciSup className="nuclear-notation__charge">{String(charge)}</SciSup>
        ) : null}
      </span>
    </span>
  )
}

export type NuclideSummaryProps = {
  symbol: string
  massNumber: number | string
  atomicNumber: number | string
  /** Short Arabic caption, e.g. `نيوكليونات`. Kept author-supplied. */
  caption?: ReactNode
}

/** Nuclide notation with a caption, for use inside tables and figure legends. */
export function NuclideSummary({ symbol, massNumber, atomicNumber, caption }: NuclideSummaryProps) {
  return (
    <span className="nuclide-summary">
      <NuclearNotation symbol={symbol} massNumber={massNumber} atomicNumber={atomicNumber} />
      {caption ? <span className="nuclide-summary__caption">{caption}</span> : null}
    </span>
  )
}
