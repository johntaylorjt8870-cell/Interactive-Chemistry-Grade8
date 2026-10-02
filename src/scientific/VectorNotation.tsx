import { useMemo } from 'react'
import type { ElementType } from 'react'
import { MathFormula } from './MathFormula'
import { parseVectorToken } from '@/utils/vectorText'
import { vectorLabelLayout } from '@/utils/vectorLabelMetrics'
import type { LabelAnchor } from '@/utils/vectorLabelMetrics'

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
   drawn as real SVG geometry above the symbol: a shaft plus a filled
   arrowhead. Everything is laid out by `vectorLabelLayout` in LTR *physical*
   coordinates from advance widths measured on the bundled KaTeX_Math face:

   - The page is RTL and SVG `text-anchor: start|end` follow the inherited
     `direction`, so the label forces `direction="ltr"` and centres the symbol
     (`text-anchor: middle`, symmetric in either direction). The accent is
     centred over the same point, so it can never drift off its letter.
   - The magnitude (`2.4 N`) is its own LTR run: without that, the bidi
     algorithm in an RTL page printed it as `N 2.4`.
   - A halo (surface-coloured stroke under glyphs and accent) keeps the label
     legible where it crosses springs, grid lines or carriers.
   - One inspectable <g data-vector-label> per label: real <line>/<path>
     accent, a real <tspan>-like subscript text, never a Unicode combining mark.
   ========================================================================= */

export type VectorSvgLabelProps = {
  x: number
  y: number
  symbol: string
  subscript?: string
  prime?: boolean
  tone?: VectorTone
  /**
   * Alignment of the whole label block (symbol row + magnitude) at (x, y):
   * `start` (default) begins at x, `end` finishes at x, `middle` centres on x.
   * Interpreted in physical left/right terms — never mirrored by the page direction.
   */
  anchor?: LabelAnchor
  /** Optional magnitude rendered under the label, e.g. `4 N`. */
  magnitude?: string
  /** Short Arabic caption to the right of the symbol (read first in RTL): «نسخة F₁». */
  prefix?: string
  /** Font size in SVG user units. */
  size?: number
}

export function VectorSvgLabel({
  x,
  y,
  symbol,
  subscript,
  prime,
  tone = 'neutral',
  anchor = 'start',
  magnitude,
  prefix,
  size,
}: VectorSvgLabelProps) {
  const layout = vectorLabelLayout({ symbol, subscript, prime, magnitude, prefix, anchor, size })
  const { accent } = layout
  const haloWidth = layout.size * 0.28
  const headBaseX = accent.x2 - accent.headLength
  // The shaft ends inside the head so no hairline gap can show between them.
  const shaftEnd = headBaseX + accent.headLength * 0.2
  const headPath = `M ${accent.x2} ${accent.y} L ${headBaseX} ${accent.y - accent.headHalf} L ${headBaseX} ${
    accent.y + accent.headHalf
  } Z`

  return (
    <g
      transform={`translate(${x} ${y})`}
      className={`vec-svg-label vec-svg-label--${tone}`}
      data-vector-label={symbol}
      data-vector-subscript={subscript ?? ''}
      data-has-arrow="true"
      data-label-anchor={anchor}
      direction="ltr"
      unicodeBidi="isolate"
    >
      {/* halo under the accent, so the arrow reads over springs and grid lines */}
      <g className="vec-svg-label__halo" aria-hidden="true">
        <line x1={accent.x1} y1={accent.y} x2={shaftEnd} y2={accent.y} strokeWidth={accent.strokeWidth + haloWidth} />
        <path d={headPath} strokeWidth={haloWidth} />
      </g>
      {/* arrow accent: real shaft + real arrowhead, never a text glyph */}
      <g className="vec-svg-label__accent" aria-hidden="true">
        <line x1={accent.x1} y1={accent.y} x2={shaftEnd} y2={accent.y} strokeWidth={accent.strokeWidth} />
        <path d={headPath} />
      </g>
      <text
        className="vec-svg-label__symbol"
        x={layout.cx}
        y={0}
        textAnchor="middle"
        fontSize={layout.size}
        direction="ltr"
        unicodeBidi="isolate"
      >
        {symbol}
      </text>
      {layout.sub && subscript ? (
        <text
          className="vec-svg-label__sub"
          x={layout.sub.x}
          y={layout.sub.y}
          textAnchor="start"
          fontSize={layout.sub.size}
          direction="ltr"
          unicodeBidi="isolate"
        >
          {subscript}
        </text>
      ) : null}
      {layout.prime ? (
        <text
          className="vec-svg-label__prime"
          x={layout.prime.x}
          y={layout.prime.y}
          textAnchor="start"
          fontSize={layout.prime.size}
          direction="ltr"
          unicodeBidi="isolate"
        >
          ′
        </text>
      ) : null}
      {layout.prefix && prefix ? (
        <text
          className="vec-svg-label__prefix"
          x={layout.prefix.x}
          y={layout.prefix.y}
          textAnchor="middle"
          fontSize={layout.prefix.size}
          direction="rtl"
          unicodeBidi="isolate"
        >
          {prefix}
        </text>
      ) : null}
      {layout.magnitude && magnitude ? (
        <text
          className="vec-svg-label__magnitude"
          x={layout.magnitude.x}
          y={layout.magnitude.y}
          textAnchor={anchor}
          fontSize={layout.magnitude.size}
          direction="ltr"
          unicodeBidi="isolate"
        >
          {magnitude}
        </text>
      ) : null}
    </g>
  )
}
