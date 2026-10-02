import { useMemo } from 'react'
import type { ElementType } from 'react'
import { MathFormula } from './MathFormula'
import { parseVectorToken } from '@/utils/vectorText'

/* ============================================================================
   VectorNotation — the platform's vector-symbol renderer.
   ----------------------------------------------------------------------------
   The textbook prints force vectors as an italic Latin symbol carrying a real
   arrow over it, with an optional subscript and prime: w⃗، F₁⃗، F₂⃗، OM⃗، F⃗'.
   The stored source strings use the combining glyph U+20D7, which the platform
   fonts do not draw — so this component typesets the notation structurally
   through KaTeX: real math accent geometry over a real math symbol, never a
   Unicode hack, never manual pixel offsets.

   One component covers every symbol (letter, letters, subscript, prime,
   magnitude): call sites pass `raw="F₁⃗"` or explicit parts. The result is
   always an LTR isolate, so surrounding Arabic/RTL prose can never reorder or
   split it, and it works identically in prose, headings, cards, tables,
   captions and equations.
   ========================================================================= */

export type VectorTone = 'force1' | 'force2' | 'resultant' | 'weight' | 'component1' | 'component2' | 'neutral'

export type VectorNotationProps = {
  /** Raw textbook token, e.g. `F₁⃗`. When given, parts below are ignored. */
  raw?: string
  /** Base symbol when building explicitly: `F`, `OM`, `w`, `R`… */
  symbol?: string
  /** Subscript as plain digits: `1` renders as a real subscript. */
  subscript?: string
  /** Prints a prime after the symbol (the equilibrant F⃗'). */
  prime?: boolean
  /**
   * `auto`            — short `\vec` accent for one letter, spanning
   *                     `\overrightarrow` for multi-letter symbols (OM⃗)
   * `vec`             — always the short accent
   * `overrightarrow`  — always the spanning arrow
   */
  arrow?: 'auto' | 'vec' | 'overrightarrow'
  /** Optional magnitude rendered after the symbol: F₁⃗ = 4 N. */
  magnitude?: string | number
  magnitudeUnit?: string
  size?: 'sm' | 'md' | 'lg'
  /** Semantic colour role — always paired with the symbol text itself. */
  tone?: VectorTone
  as?: ElementType
  className?: string
}

function buildTex(symbol: string, subscript: string | undefined, prime: boolean, arrow: 'auto' | 'vec' | 'overrightarrow'): string {
  const accent = arrow === 'auto' ? (symbol.length > 1 ? 'overrightarrow' : 'vec') : arrow
  // `\vec{F}_1` places the accent over the letter only, with the subscript
  // hanging below it — the printed textbook form. Multi-letter symbols (OM⃗)
  // use the spanning arrow over the whole symbol.
  const head =
    accent === 'vec'
      ? `\\vec{${symbol}}${subscript ? `_{${subscript}}` : ''}`
      : `\\overrightarrow{${symbol}${subscript ? `_{${subscript}}` : ''}}`
  return prime ? `${head}^{\\prime}` : head
}

/** Accessible Arabic reading of the symbol: «المتجه F1». */
function vectorLabel(symbol: string, subscript: string | undefined, prime: boolean): string {
  return `المتجه ${symbol}${subscript ?? ''}${prime ? ' ′' : ''}`
}

export function VectorNotation({
  raw,
  symbol: symbolProp,
  subscript: subscriptProp,
  prime: primeProp,
  arrow = 'auto',
  magnitude,
  magnitudeUnit,
  size = 'md',
  tone = 'neutral',
  as,
  className,
}: VectorNotationProps) {
  const parsed = useMemo(() => {
    if (raw !== undefined) {
      const token = parseVectorToken(raw)
      if (token) return token
    }
    return {
      raw: raw ?? symbolProp ?? '',
      symbol: symbolProp ?? raw ?? '',
      subscript: subscriptProp,
      prime: primeProp ?? false,
    }
  }, [raw, symbolProp, subscriptProp, primeProp])

  const { symbol, subscript, prime } = parsed
  const tex = useMemo(() => buildTex(symbol, subscript, prime, arrow), [symbol, subscript, prime, arrow])
  const Component = (as ?? 'span') as ElementType

  return (
    <Component
      dir="ltr"
      className={['vector-notation', `vector-notation--${size}`, `vector-notation--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      data-vector="true"
      data-vector-symbol={symbol}
      data-vector-subscript={subscript ?? ''}
      data-vector-prime={prime ? 'true' : 'false'}
      data-has-arrow="true"
    >
      <MathFormula tex={tex} display="inline" label={vectorLabel(symbol, subscript, prime)} />
      {magnitude !== undefined ? (
        <span className="vector-notation__magnitude" data-vector-magnitude="true">
          <span aria-hidden="true">=</span>
          <span className="vector-notation__magnitude-value">{magnitude}</span>
          {magnitudeUnit ? <span className="vector-notation__magnitude-unit">{magnitudeUnit}</span> : null}
        </span>
      ) : null}
    </Component>
  )
}

/* ============================================================================
   VectorSvgLabel — the same notation inside SVG diagrams.
   ----------------------------------------------------------------------------
   Diagram labels are coordinate-positioned (not bidi-flowed), so the arrow is
   drawn as real SVG geometry above the symbol: a shaft line plus an arrowhead
   path. The symbol is italic math serif, the subscript is a real smaller
   <tspan>, and every label is one inspectable <g data-vector-label>.
   ========================================================================= */

export type VectorSvgLabelProps = {
  x: number
  y: number
  symbol: string
  subscript?: string
  prime?: boolean
  tone?: VectorTone
  /** `start` (default) draws the label to the right of (x, y), `middle` centres. */
  anchor?: 'start' | 'middle' | 'end'
  /** Optional magnitude rendered under the label, e.g. `4 N`. */
  magnitude?: string
}

/** Geometry of the arrow accent above an SVG vector label. */
function accentGeometry(symbol: string) {
  const half = 5 + 4.4 * symbol.length
  return { half, y: -12 }
}

export function VectorSvgLabel({ x, y, symbol, subscript, prime, tone = 'neutral', anchor = 'start', magnitude }: VectorSvgLabelProps) {
  const { half, y: accentY } = accentGeometry(symbol)
  const head = 3.2
  // Keep the accent centred over the symbol for every text anchor.
  const accentShift = anchor === 'middle' ? 0 : anchor === 'end' ? -half : half
  return (
    <g
      transform={`translate(${x} ${y})`}
      className={`vec-svg-label vec-svg-label--${tone}`}
      data-vector-label={symbol}
      data-vector-subscript={subscript ?? ''}
      data-has-arrow="true"
      textAnchor={anchor === 'middle' ? 'middle' : anchor === 'end' ? 'end' : 'start'}
    >
      {/* arrow accent: real shaft + real arrowhead, never a text glyph */}
      <g className="vec-svg-label__accent" aria-hidden="true" transform={`translate(${accentShift} 0)`}>
        <line x1={-half} y1={accentY} x2={half - 0.6} y2={accentY} />
        <path d={`M ${half} ${accentY} L ${half - head * 1.9} ${accentY - head} L ${half - head * 1.9} ${accentY + head} Z`} />
      </g>
      <text className="vec-svg-label__symbol">
        {symbol}
        {subscript ? (
          <tspan className="vec-svg-label__sub" dx="0.5">
            {subscript}
          </tspan>
        ) : null}
        {prime ? <tspan className="vec-svg-label__prime">′</tspan> : null}
      </text>
      {magnitude ? (
        <text className="vec-svg-label__magnitude" y={13}>
          {magnitude}
        </text>
      ) : null}
    </g>
  )
}
