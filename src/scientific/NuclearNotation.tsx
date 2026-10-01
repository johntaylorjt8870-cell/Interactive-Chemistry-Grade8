import type { ReactNode } from 'react'
import { SciSup } from './ScientificText'

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'

function scriptDigitsToPlain(value: string, alphabet: string): string {
  return [...value].map((digit) => String(alphabet.indexOf(digit))).join('')
}

/**
 * Reads compact source text such as `³⁵₁₇Cl` or `₁₃Al` into structured values.
 * Rendering still uses independent DOM elements; Unicode script characters
 * are accepted only as a serialised input form for table data.
 */
export function parseCompactNuclearNotation(value: string): {
  symbol: string
  massNumber?: string
  atomicNumber: string
} | null {
  const match = value.trim().match(/^([⁰¹²³⁴⁵⁶⁷⁸⁹]+)?([₀₁₂₃₄₅₆₇₈₉]+)([A-Z][a-z]?)$/u)
  if (!match) return null
  const [, mass = '', atomic, symbol] = match
  return {
    symbol: symbol!,
    ...(mass ? { massNumber: scriptDigitsToPlain(mass, SUPERSCRIPT_DIGITS) } : {}),
    atomicNumber: scriptDigitsToPlain(atomic!, SUBSCRIPT_DIGITS),
  }
}

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
 * Absent values render no decorative content. A compact two-row index stack
 * keeps the mass number in the upper-left position and the atomic number in
 * the lower-left position, while the Latin symbol remains vertically centred
 * and visually attached to that stack.
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
