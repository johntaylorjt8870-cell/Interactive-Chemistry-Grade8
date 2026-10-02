/**
 * Vector notation utilities.
 *
 * The textbook writes vector quantities as a Latin symbol (optionally with a
 * subscript and/or a prime) carrying the combining right-arrow-above glyph
 * U+20D7: `w⃗`, `F₁⃗`, `F₂⃗`, `OM⃗`, `F⃗'`. That combining glyph is not rendered
 * by the platform text fonts, so a raw string can never be displayed as-is.
 *
 * These helpers are pure and framework-free: they detect vector tokens inside
 * mixed Arabic/scientific prose so a renderer can promote each token to
 * structured markup (real arrow geometry + real subscript). The source strings
 * themselves are never rewritten — promotion is a rendering concern only.
 */

/** Unicode script glyphs the textbook prints inside vector symbols. */
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'

/**
 * One vector token: one or two Latin letters, optional subscript digits,
 * the combining arrow U+20D7, and an optional prime (`'` or `′`).
 * Examples: `w⃗`, `F₁⃗`, `OM⃗`, `F⃗'`, `R′⃗`.
 */
export const VECTOR_TOKEN_SOURCE = String.raw`[A-Za-z][A-Za-z]?[${SUBSCRIPT_DIGITS}]*⃗(?:['’′])?`
const VECTOR_TOKEN = new RegExp(VECTOR_TOKEN_SOURCE, 'gu')

export type VectorToken = {
  /** The raw matched text, exactly as stored in the source data. */
  raw: string
  /** Base Latin symbol, e.g. `F`, `OM`, `w`. */
  symbol: string
  /** Subscript converted to plain digits, e.g. `1`. Undefined when absent. */
  subscript?: string
  /** True when the printed symbol carries a prime mark. */
  prime: boolean
  index: number
}

function plainSubscript(value: string): string | undefined {
  if (!value) return undefined
  const digits = [...value].map((digit) => String(SUBSCRIPT_DIGITS.indexOf(digit))).join('')
  return digits.length > 0 ? digits : undefined
}

/** Parses one complete vector token (`F₁⃗`). Returns null when it is not one. */
export function parseVectorToken(raw: string): Omit<VectorToken, 'index'> | null {
  const match = raw.match(new RegExp(`^([A-Za-z][A-Za-z]?)([${SUBSCRIPT_DIGITS}]*)⃗((?:['’′])?)$`, 'u'))
  if (!match) return null
  return {
    raw,
    symbol: match[1]!,
    subscript: plainSubscript(match[2]!),
    prime: match[3]!.length > 0,
  }
}

export type VectorRun =
  | { kind: 'prose'; value: string }
  | { kind: 'vector'; value: string; token: Omit<VectorToken, 'index'> }

/**
 * Splits mixed prose into Arabic/symbol runs, promoting every vector token.
 *
 * `"قوّتان F₁⃗ ، F₂⃗"` becomes
 * `[prose, vector(F₁⃗), prose(" ، "), vector(F₂⃗), prose]`.
 */
export function splitVectorRuns(input: string): VectorRun[] {
  if (!input) return []
  const runs: VectorRun[] = []
  let cursor = 0

  VECTOR_TOKEN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = VECTOR_TOKEN.exec(input)) !== null) {
    const [value] = match
    if (!value) {
      VECTOR_TOKEN.lastIndex += 1
      continue
    }
    const token = parseVectorToken(value)
    if (!token) continue
    if (match.index > cursor) {
      runs.push({ kind: 'prose', value: input.slice(cursor, match.index) })
    }
    runs.push({ kind: 'vector', value, token })
    cursor = match.index + value.length
  }

  if (cursor < input.length) {
    runs.push({ kind: 'prose', value: input.slice(cursor) })
  }
  return runs
}

/**
 * True when the whole string is exactly one vector token, e.g. `OM⃗`.
 * Useful for call sites that hold a bare symbol rather than mixed prose.
 */
export function isExactVectorToken(value: string): boolean {
  return parseVectorToken(value.trim()) !== null
}
