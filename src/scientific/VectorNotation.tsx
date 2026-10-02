import { useId } from 'react'

/* ============================================================================
   VectorNotation — physics vector symbols (`w⃗`, `F₁⃗`, `F₂⃗`, `OM⃗`).

   The textbook spells a vector with a COMBINING arrow (U+20D7) glued to the
   Latin symbol. That character is a combining mark: it has no advance width of
   its own and the platform fonts (Inter / Noto Sans Arabic) carry no glyph for
   it, so the arrow is simply missing or invisible — measured in Chromium, `F⃗`
   and `F` are the same width and paint the same pixels.

   The notation is therefore rendered structurally instead of typographically:

     - the symbol and its subscript are real DOM (`<sub>`), never script glyphs,
     - the vector arrow is a real SVG arrow above the symbol: a stretched shaft
       plus a fixed-size arrowhead drawn with an SVG `marker`,
     - the whole notation is one LTR isolate, so Arabic prose can never reorder
       it, and the arrow inherits `currentColor`, so it stays visible in both
       themes and keeps the lesson's semantic force colours.

   No combining arrow character is ever emitted to the screen: the arrow is
   drawn, not typed.
   ========================================================================= */

/** The combining arrow the source text uses; parsed away, never rendered. */
const COMBINING_ARROW = '\u20D7'
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'

/** Semantic roles the lesson assigns to forces (F₁ green, F₂ blue, w⃗ red). */
export type VectorTone = 'f1' | 'f2' | 'weight' | 'resultant' | 'neutral'

export type ParsedVector = {
  /** Latin symbol without any vector mark, e.g. `F`, `OM`, `w`. */
  symbol: string
  /** Subscript as plain digits, e.g. `1` for F₁. Empty when absent. */
  subscript: string
  /** Prime marks (`F′`), kept separate so they render as real superscripts. */
  prime: string
  /** Semantic role → colour. */
  tone: VectorTone
  /** Printable label, e.g. `F₁`. Never contains a combining arrow. */
  label: string
}

export type VectorRun =
  | { kind: 'vector'; value: string; vector: ParsedVector }
  | { kind: 'text'; value: string }

/**
 * Matches one printed vector token inside a scientific run:
 * `F⃗`, `F₁⃗`, `F₂⃗`, `w⃗`, `OM⃗`, `F⃗'`.
 * The prime is accepted on either side of the arrow, the way textbooks print it.
 */
const VECTOR_TOKEN = new RegExp(
  `([A-Za-z][A-Za-z0-9]*)(['’]?)([${SUBSCRIPT_DIGITS}]*)${COMBINING_ARROW}(['’]?)`,
  'gu',
)

function toPlainDigits(scripts: string): string {
  return [...scripts].map((digit) => String(SUBSCRIPT_DIGITS.indexOf(digit))).join('')
}

/**
 * Semantic colour of a printed force symbol.
 *
 * The lesson assigns colours in the figure of page 56 («F₁⃗ أخضر وF₂⃗ أزرق …
 * ثقله w⃗ أحمر»); the resultant keeps the accent colour the vector labs already
 * use for it. Unrelated symbols (`R⃗`, `OX`) stay in the text colour.
 */
export function vectorTone(symbol: string, subscript: string): VectorTone {
  if (/^w$/i.test(symbol)) return 'weight'
  if (symbol === 'F') {
    if (subscript === '1') return 'f1'
    if (subscript === '2') return 'f2'
    return 'resultant'
  }
  if (symbol === 'OM') return 'resultant'
  return 'neutral'
}

/** Builds the structured form of one printed vector token. */
function buildVector(symbol: string, primeBefore: string, scripts: string, primeAfter: string): ParsedVector {
  const subscript = toPlainDigits(scripts)
  const prime = primeBefore || primeAfter
  return {
    symbol,
    subscript,
    prime,
    tone: vectorTone(symbol, subscript),
    label: symbol + (subscript === '' ? '' : scripts) + (prime === '' ? '' : '′'),
  }
}

/** `F₁⃗` → structured vector; anything else → null. */
export function parseVectorNotation(value: string): ParsedVector | null {
  const trimmed = value.trim()
  VECTOR_TOKEN.lastIndex = 0
  const match = VECTOR_TOKEN.exec(trimmed)
  if (match === null || match.index !== 0 || match[0].length !== trimmed.length) return null
  return buildVector(match[1]!, match[2]!, match[3]!, match[4]!)
}

/**
 * Splits a scientific run into vector tokens and the text between them.
 *
 * Runs are produced by `splitScientificRuns`, which already keeps a vector with
 * its subscript (`F₁⃗`) as one LTR unit; this only lifts the vector tokens out
 * of a longer run (`F⃗ = 100 N`) without ever reordering characters.
 */
export function splitVectorRuns(value: string): VectorRun[] {
  if (!value.includes(COMBINING_ARROW)) return [{ kind: 'text', value }]

  const runs: VectorRun[] = []
  let cursor = 0

  VECTOR_TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = VECTOR_TOKEN.exec(value)) !== null) {
    const [token] = match
    if (token === '') {
      VECTOR_TOKEN.lastIndex += 1
      continue
    }
    if (match.index > cursor) {
      runs.push({ kind: 'text', value: value.slice(cursor, match.index) })
    }
    runs.push({ kind: 'vector', value: token, vector: buildVector(match[1]!, match[2]!, match[3]!, match[4]!) })
    cursor = match.index + token.length
  }

  if (cursor < value.length) runs.push({ kind: 'text', value: value.slice(cursor) })
  return runs
}

export type VectorNotationProps = {
  /** Latin symbol, e.g. `F`, `OM`, `w`. */
  symbol: string
  /** Subscript as plain digits (`1`) or compact notation (`₁`). */
  subscript?: string
  /** Prime mark, rendered as a real superscript (`F′`). */
  prime?: string
  /** Semantic role → colour. Inferred from the symbol when omitted. */
  tone?: VectorTone
  className?: string
  /** Accessible label; defaults to `المتجه …`. */
  label?: string
}

/**
 * Renders one vector symbol: real mathematics, LTR isolated, arrow drawn.
 *
 * Layout note: the wrapper is an `inline-block` whose last line box is the
 * symbol, so the browser aligns the symbol on the surrounding text baseline and
 * the arrow simply occupies the space above it — no absolute positioning, no
 * negative margins, no per-expression tuning.
 */
export function VectorNotation({
  symbol,
  subscript = '',
  prime = '',
  tone,
  className,
  label,
}: VectorNotationProps) {
  // One marker per instance: a shared id would be ambiguous in a document that
  // renders dozens of vectors, and `useId` keeps ids stable across renders.
  const markerId = `vector-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  // Subscripts may arrive as compact Unicode (`₁`); the printed form is one
  // real <sub> element either way, never a bare script glyph in the prose.
  const plainSubscript = [...subscript]
    .map((char) => (SUBSCRIPT_DIGITS.includes(char) ? String(SUBSCRIPT_DIGITS.indexOf(char)) : char))
    .join('')
  const resolvedTone = tone ?? vectorTone(symbol, plainSubscript)

  return (
    <span
      className={['vector-notation', `vector-notation--${resolvedTone}`, className].filter(Boolean).join(' ')}
      dir="ltr"
      role="math"
      aria-label={label ?? `المتجه ${symbol}${plainSubscript}${prime === '' ? '' : '′'}`}
      data-vector={`${symbol}${plainSubscript}${prime === '' ? '' : '′'}`}
      data-tone={resolvedTone}
    >
      <span className="vector-notation__arrow" aria-hidden="true">
        <svg
          className="vector-notation__shaft"
          viewBox="0 0 10 10"
          preserveAspectRatio="none"
          focusable="false"
          aria-hidden="true"
        >
          <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" />
        </svg>
        <svg className="vector-notation__head" viewBox="0 0 10 10" focusable="false" aria-hidden="true">
          <defs>
            {/* `markerWidth` is counted in stroke-widths: 4 × 2.2 = 8.8 user
                units, so the head grows from the short stub to the tip and the
                tip lands exactly on the right edge of this box. */}
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 Z" fill="currentColor" />
            </marker>
          </defs>
          <line
            x1="0"
            y1="5"
            x2="1.2"
            y2="5"
            stroke="currentColor"
            strokeWidth={2.2}
            markerEnd={`url(#${markerId})`}
          />
        </svg>
      </span>
      <span className="vector-notation__symbol">
        {symbol}
        {plainSubscript === '' ? null : <sub className="sci-sub vector-notation__subscript">{plainSubscript}</sub>}
        {prime === '' ? null : <sup className="sci-sup vector-notation__prime">{prime}</sup>}
      </span>
    </span>
  )
}
