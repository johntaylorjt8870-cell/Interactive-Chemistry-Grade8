/**
 * Scientific text utilities.
 *
 * These helpers are deliberately pure and framework-free so they can be unit
 * tested directly (see scientificText.test.ts) and reused by both the prose
 * layer (ScientificText) and the structured notation components.
 */

/** Structured notations that get their own renderer instead of a generic isolate. */
export type ScientificNotation = 'electron-configuration' | 'charge' | 'range' | 'expression'

export type ScientificRun =
  | { kind: 'prose'; value: string }
  | { kind: 'science'; value: string; notation?: ScientificNotation }

/** Latin identifier / unit / symbol fragment, e.g. `Cl`, `mol`, `g/mol`, `°C`. */
const UNIT = String.raw`[A-Za-zµΩÅ%°][A-Za-z0-9µΩÅ°⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺/^·\-]*`
const NUMBER = String.raw`\d+(?:[.,]\d+)?`
/**
 * Subscript and superscript glyphs printed inside Chemistry symbols travel
 * inside the same LTR isolate as the Latin symbol they belong to — never float
 * in the surrounding RTL prose. Charge signs (`⁺`, `⁻`) belong to the same
 * class as the digits they follow: `Cl⁻` is one species, never `Cl` plus a
 * loose sign the RTL paragraph is free to move.
 */
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const CHARGE_GLYPHS = '⁺⁻'
const SCRIPT_GLYPHS = `${SUBSCRIPT_DIGITS}${SUPERSCRIPT_DIGITS}`
const COMBINING_MARKS = '\u0300-\u036f'
/** Latin identifier carrying its own scripts or combining marks, e.g. `Cl₂`, `H₂O`, `C̈a`. */
const IDENT_EXT = String.raw`[A-Za-z][A-Za-z0-9_'’.\-${SCRIPT_GLYPHS}${COMBINING_MARKS}]*`
/** Scientific notation such as 6.02×10²³ or 3.2 x 10^-4 */
const EXPONENT = String.raw`(?:[×x*]\s?10\s?(?:\^?[-+−]?\d+|[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+))?`

/**
 * A hyphen-joined numeric sequence: `2-8-8`, `2-8-18-8`, `2-8-8-2`.
 * An electron configuration is one logical value; matching the whole sequence
 * keeps an RTL paragraph from reordering its shells as separate fragments.
 */
const NUMERIC_HYPHEN_SEQUENCE = String.raw`\d+(?:[-\u2212]\d+)+`

/**
 * Tokens that must be bidi-isolated (rendered LTR) inside Arabic prose after
 * `PRIORITY_RULES` has already claimed equations, ranges, distributions, and
 * Unicode-superscript charges:
 *
 *  0. compact nuclides with leading script digits — `¹⁶O`, `²³₁₁Na`, `₁₃Al`
 *  1. trailing-sign textbook charges / ASCII ions — `2+`, `2−`, `Mg2+`, `Ca2+`
 *  2. signed or unsigned values with optional exponent and unit — `5 g`, `25 °C`, `6.02×10²³ mol⁻¹`
 *  3. Latin/symbolic identifiers with optional parenthesized groups — `H₂O`, `Ca(OH)₂`, `g·mol⁻¹`, `C̈a`
 */
const SCIENTIFIC_RUN = new RegExp(
  [
    String.raw`(?:[${SCRIPT_GLYPHS}]+[A-Z][a-z]?)`,
    String.raw`(?:(?:${IDENT_EXT}\d*[+\-−]|${NUMBER}[+\-−])(?![\dA-Za-z]))`,
    String.raw`(?:(?:=\s?|[+\-−±])?${NUMBER}${EXPONENT}(?:\s?${UNIT})?(?!\())`,
    String.raw`(?:(?:[0-9]+\(${IDENT_EXT}\)|${IDENT_EXT}|\(${IDENT_EXT}\))(?:[A-Za-z0-9_'’.\-·/()${SCRIPT_GLYPHS}${CHARGE_GLYPHS}${COMBINING_MARKS}]*[A-Za-z0-9)${SCRIPT_GLYPHS}${CHARGE_GLYPHS}${COMBINING_MARKS}])?)`,
  ].join('|'),
  'gu',
)

/**
 * Trims outer prose parentheses wrapping an entire span (`(1/1860)` → `1/1860`)
 * and strips any unbalanced leading `(` or trailing `)` (`Q)` → `Q`), while
 * keeping internal or multi-group parentheses intact (`Ca(OH)2`, `Fe(III):3`,
 * `Na: K(2), L(8), M(1)`, `(+3)(2) + (−2)(3) = 0`).
 */
function trimBalancedSpan(raw: string): { offset: number; value: string } {
  let start = 0
  let end = raw.length

  while (start < end) {
    // Sentence punctuation at the end of a span (`H₂O.`) belongs to prose.
    if (/[.,;:]/.test(raw[end - 1]!)) {
      end -= 1
      while (end > start && /\s/.test(raw[end - 1]!)) end -= 1
      continue
    }

    // Strip outer wrapping `( ... )` only when index `start` closes at `end - 1`.
    if (raw[start] === '(' && raw[end - 1] === ')') {
      let depth = 0
      let closesAtEnd = true
      for (let i = start; i < end; i += 1) {
        if (raw[i] === '(') depth += 1
        else if (raw[i] === ')') {
          depth -= 1
          if (depth === 0 && i < end - 1) {
            closesAtEnd = false
            break
          }
          if (depth < 0) {
            closesAtEnd = false
            break
          }
        }
      }
      if (closesAtEnd && depth === 0) {
        start += 1
        end -= 1
        while (start < end && /\s/.test(raw[start]!)) start += 1
        while (end > start && /\s/.test(raw[end - 1]!)) end -= 1
        continue
      }
    }

    // Check overall balance inside [start, end) using an explicit stack of open `(`.
    const openStack: number[] = []
    let unmatchedCloseAt = -1
    for (let i = start; i < end; i += 1) {
      if (raw[i] === '(') openStack.push(i)
      else if (raw[i] === ')') {
        if (openStack.length === 0) {
          unmatchedCloseAt = i
          break
        }
        openStack.pop()
      }
    }

    if (unmatchedCloseAt !== -1) {
      end = unmatchedCloseAt
      while (end > start && /\s/.test(raw[end - 1]!)) end -= 1
      continue
    }
    if (openStack.length > 0) {
      const firstUnmatchedOpen = openStack[0]!
      if (firstUnmatchedOpen === start) {
        start += 1
        while (start < end && /\s/.test(raw[start]!)) start += 1
      } else {
        end = firstUnmatchedOpen
        while (end > start && /\s/.test(raw[end - 1]!)) end -= 1
      }
      continue
    }
    break
  }

  return { offset: start, value: raw.slice(start, end) }
}

/**
 * Builds a science run. Hyphen-joined numeric sequences that read as shell
 * occupancies are tagged so the renderer can promote them to the structured
 * <ElectronConfiguration /> notation instead of a generic isolate.
 */
function scienceRun(value: string): ScientificRun {
  return isElectronConfiguration(value)
    ? { kind: 'science', value, notation: 'electron-configuration' }
    : { kind: 'science', value }
}

/** The generic pass: lifts single Latin/numeric fragments out of Arabic prose. */
function splitGenericRuns(input: string): ScientificRun[] {
  const runs: ScientificRun[] = []
  let cursor = 0

  SCIENTIFIC_RUN.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = SCIENTIFIC_RUN.exec(input)) !== null) {
    const [raw] = match
    if (!raw) {
      // Defensive: never allow a zero-length match to spin the loop forever.
      SCIENTIFIC_RUN.lastIndex += 1
      continue
    }
    const { offset, value } = trimBalancedSpan(raw)
    if (!value) continue
    const actualStart = match.index + offset
    const actualEnd = actualStart + value.length
    if (actualStart > cursor) {
      runs.push({ kind: 'prose', value: input.slice(cursor, actualStart) })
    }
    runs.push(scienceRun(value))
    cursor = actualEnd
    SCIENTIFIC_RUN.lastIndex = actualEnd
  }

  if (cursor < input.length) {
    runs.push({ kind: 'prose', value: input.slice(cursor) })
  }

  return runs
}

/** Consecutive prose fragments are one fragment; empty prose is dropped. */
function mergeProse(runs: ScientificRun[]): ScientificRun[] {
  const merged: ScientificRun[] = []
  for (const run of runs) {
    const previous = merged[merged.length - 1]
    if (run.kind === 'prose') {
      if (run.value === '') continue
      if (previous?.kind === 'prose') {
        previous.value += run.value
        continue
      }
    }
    merged.push(run)
  }
  return merged
}

/**
 * Splits mixed Arabic/scientific prose into ordered runs.
 *
 * `"كمية المادة 1 mol تقريباً"` becomes
 * `[prose: "كمية المادة ", science: "1 mol", prose: " تقريباً"]`
 *
 * Values that must never be split — equations, ranges and charges — are claimed
 * by `collectPrioritySpans` first; the generic pass fills the remaining prose.
 */
export function splitScientificRuns(input: string): ScientificRun[] {
  if (!input) return []

  const spans = collectPrioritySpans(input)
  const runs: ScientificRun[] = []
  let cursor = 0

  for (const span of spans) {
    if (span.start > cursor) runs.push(...splitGenericRuns(input.slice(cursor, span.start)))
    runs.push(span.run)
    cursor = span.end
  }

  if (cursor < input.length) runs.push(...splitGenericRuns(input.slice(cursor)))

  return mergeProse(runs)
}

/** True when the string contains at least one run that needs LTR isolation. */
export function containsScientificRun(input: string): boolean {
  return splitScientificRuns(input).some((run) => run.kind === 'science')
}

/* ---------------------------------------------------------------------------
 * Electron configurations (`2-8-8`, `2-8-18-8`)
 * ------------------------------------------------------------------------ */

/** One rendered piece of a configuration: a shell count or its separator. */
export type ElectronConfigurationToken = {
  kind: 'shell' | 'separator'
  /** The exact character(s) from the source; never rewritten or reordered. */
  value: string
}

export type ParsedElectronConfiguration = {
  /** The value exactly as authored. */
  value: string
  /** Shell occupancies in textbook order, e.g. `['2', '8', '8']`. */
  shells: string[]
  /** Verbatim tokens, alternating shell counts and separators. */
  tokens: ElectronConfigurationToken[]
}

/**
 * Maximum number of electrons in the n-th principal shell (n is 1-based):
 * the textbook rule y = 2n². Used only to tell a real shell occupancy list
 * from an ordinary hyphen-joined number such as a figure reference (`4-2`).
 */
function shellCapacity(shellIndex: number): number {
  return 2 * (shellIndex + 1) ** 2
}

/** Anchor the same shape used by the splitter, so both stay in step. */
const NUMERIC_HYPHEN_SEQUENCE_PATTERN = new RegExp(`^${NUMERIC_HYPHEN_SEQUENCE}$`, 'u')

/* ---------------------------------------------------------------------------
 * High-priority runs
 * ---------------------------------------------------------------------------
 * The generic splitter is deliberately conservative: it lifts Latin and numeric
 * fragments out of Arabic prose one at a time. That is right for a measurement
 * (`5 g`) but wrong for a token that is ONE logical value spread over several
 * fragments — an equation, a range or a charge. Each fragment would become its
 * own isolate, and an RTL paragraph lays sibling isolates out right-to-left, so
 * `2 + 3 = 5` reaches the eye as `5 = 3 + 2`.
 *
 * These rules therefore claim those spans BEFORE the generic pass sees the
 * text, so the whole value arrives as one LTR isolate. They are ordered from
 * the most specific to the least specific, and a span already claimed by an
 * earlier rule is never re-matched by a later one.
 * ------------------------------------------------------------------------ */

/** `e⁻`, `2e⁻`, `Cl⁻`, `Na⁺`, `Ca²⁺`, `O²⁻`, `Al³⁺`, `SO₄²⁻` — one species. */
const CHARGE_NOTATION_PARTS = String.raw`(?<![A-Za-z${SCRIPT_GLYPHS}${CHARGE_GLYPHS}])(\d+)?([A-Za-z][A-Za-z0-9${SUBSCRIPT_DIGITS}]*)([${SUPERSCRIPT_DIGITS}]*)([${CHARGE_GLYPHS}])(?![${SUPERSCRIPT_DIGITS}])`

/** `18–23`, `1 – 2 – 3 – 4 – 5 – 6 – 7`, `K–O` — an en/em-dash numeric or symbol range. */
const NUMERIC_RANGE_SOURCE = String.raw`(?:\d+(?:[.,]\d+)?(?:\s?[–—]\s?\d+(?:[.,]\d+)?)+(?![\d]|[.,]\d|-\d)|(?<![A-Za-z0-9${SCRIPT_GLYPHS}])[A-Z][a-z]?[–—][A-Z][a-z]?(?![A-Za-z0-9(${SCRIPT_GLYPHS}]))`

/**
 * Widest candidate span for a complete symbolic/mathematical relation, ratio,
 * fraction, reaction chain, or Latin symbol list (`Ca = 2-8-8-2`, `1/1860`,
 * `56:32`, `H₃PO₄ → 3H⁺ + PO₄³⁻`, `K, L, M, N, O, P, Q`).
 *
 * Parentheses inside an expression must be balanced (`trimBalancedSpan`), dots
 * must be decimal/hydrate/ellipsis (`1.56`, `(......)`) rather than sentence
 * endings (`. `), and colons must be compact ratios (`56:32`, `Fe(III):3`),
 * symmetric numeric ratios (`1 : 2`), or uppercase symbol labels (`Na: K(2)`).
 */
const EXPR_COLON = String.raw`(?::(?=[A-Za-z0-9(])|(?<=\d)\s:\s(?=\d)|(?<=(?<![A-Za-z0-9${SCRIPT_GLYPHS}${CHARGE_GLYPHS})])[A-Z][a-z]?):\s(?=[0-9(+\-−]|[KLMNOPQ]\())`
const EXPR_DOT = String.raw`(?:\.{2,}|\.(?=[A-Za-z0-9]))`
const EXPRESSION_SOURCE = String.raw`(?<![–—A-Za-z0-9])[A-Za-z0-9(+\-−${SCRIPT_GLYPHS}](?:[A-Za-z0-9\s,;()|—=≈≠≤≥→⟶⇌⇒+\-−×÷·±√/%°^${SCRIPT_GLYPHS}${CHARGE_GLYPHS}${COMBINING_MARKS}]|${EXPR_COLON}|${EXPR_DOT})*(?:[A-Za-z0-9)²³%°${SCRIPT_GLYPHS}${CHARGE_GLYPHS}]|[A-Za-z0-9][+\-−])`

const EXPRESSION_RELATION =
  /[=≈≠≤≥→⟶⇌|]|(?:[+\-−]\d|[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻)])\s*⇒\s*[A-Za-z0-9(+\-−]|\s[+\-−×÷±]\s|[A-Za-z0-9)]:[A-Za-z0-9(]|\d+\s:\s\d+|(?<![A-Za-z0-9⁰¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉)])[A-Z][a-z]?:\s+(?:[0-9(+\-−]|[KLMNOPQ]\()|(?:\d|[⁰¹²³⁴⁵⁶⁷⁸⁹])\s*\/\s*[A-Za-z0-9(]|[A-Za-z0-9)]\s*\/\s*\d|[A-Za-z)]\s*,\s*[A-Za-z(]|[A-Za-z0-9₀₁₂₃₄₅₆₇₈₉)]\s*—\s*[A-Za-z(]|÷/u

const SCIENTIFIC_EXPONENT_AT_TIMES = /^×\s?10\s?(?:\^?[-+−]?\d+|[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/u

/**
 * True when the run is one complete arithmetic, ratio, chemical-reaction, or
 * symbolic relation. Measurements (`25 °C`, `6.02×10²³ mol⁻¹`, `44 g/mol`) do
 * not match, keeping them on the plain measurement path.
 */
export function isMathExpression(value: string): boolean {
  const candidate = value.trim()
  if (!/[A-Za-z0-9]/.test(candidate)) return false
  if (/[\u0600-\u06ff]/.test(candidate)) return false
  // Bare operators without operands on both sides are not expressions.
  if (/^[=≈≠≤≥→⟶⇌⇒|:.,+\-−×÷±/\s]+$/u.test(candidate)) return false
  if (EXPRESSION_RELATION.test(candidate)) return true
  // Unspaced multiplication such as `2×2` (excluding `6.02×10²³` exponents).
  let idx = candidate.indexOf('×')
  while (idx !== -1) {
    if (!SCIENTIFIC_EXPONENT_AT_TIMES.test(candidate.slice(idx))) return true
    idx = candidate.indexOf('×', idx + 1)
  }
  return false
}

type PriorityRule = {
  pattern: RegExp
  trimBalanced?: boolean
  resolve: (value: string) => ScientificRun | null
}

const PRIORITY_RULES: PriorityRule[] = [
  {
    // Numeric and symbol ranges (`18–23`, `1 – 2 – 3 – 4 – 5 – 6 – 7`, `K–O`)
    // claim en/em-dash spans first so adjacent parenthesized lists never steal
    // their trailing endpoint.
    pattern: new RegExp(NUMERIC_RANGE_SOURCE, 'gu'),
    resolve: (value) => ({ kind: 'science', value, notation: 'range' }),
  },
  {
    // Claim complete relations/equations before inner `2-8-8-2` or `3H⁺`
    // tokens so `Ca = 2-8-8-2` and `H₃PO₄ → 3H⁺ + PO₄³⁻` stay one LTR isolate.
    pattern: new RegExp(EXPRESSION_SOURCE, 'gu'),
    trimBalanced: true,
    resolve: (value) =>
      isMathExpression(value) ? { kind: 'science', value, notation: 'expression' } : null,
  },
  {
    // Standalone hyphen-joined numeric sequences (`2-8-8`, `4-2`).
    pattern: new RegExp(NUMERIC_HYPHEN_SEQUENCE, 'gu'),
    resolve: (value) => scienceRun(value),
  },
  {
    // Standalone charge-bearing tokens (`e⁻`, `2e⁻`, `Cl⁻`, `Ca²⁺`, `SO₄²⁻`).
    pattern: new RegExp(CHARGE_NOTATION_PARTS, 'gu'),
    resolve: (value) =>
      parseCompactCharge(value) === null ? null : { kind: 'science', value, notation: 'charge' },
  },
]

type PrioritySpan = { start: number; end: number; run: ScientificRun }

/**
 * Collects the highest-priority non-overlapping spans of `input`.
 * A later rule may never cut into a span an earlier rule has claimed.
 */
function collectPrioritySpans(input: string): PrioritySpan[] {
  const spans: PrioritySpan[] = []
  const overlaps = (start: number, end: number): boolean =>
    spans.some((span) => start < span.end && end > span.start)

  for (const rule of PRIORITY_RULES) {
    rule.pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = rule.pattern.exec(input)) !== null) {
      const raw = match[0]
      if (!raw) {
        // Defensive: never allow a zero-length match to spin the loop forever.
        rule.pattern.lastIndex += 1
        continue
      }
      const rawEnd = match.index + raw.length
      const { offset, value } = rule.trimBalanced ? trimBalancedSpan(raw) : { offset: 0, value: raw }
      if (!value) continue
      const start = match.index + offset
      const end = start + value.length
      if (overlaps(start, end)) {
        if (end < rawEnd) rule.pattern.lastIndex = Math.max(match.index + 1, end)
        continue
      }
      const run = rule.resolve(value)
      if (run === null) {
        if (end < rawEnd) rule.pattern.lastIndex = Math.max(match.index + 1, end)
        continue
      }
      spans.push({ start, end, run })
      rule.pattern.lastIndex = end
    }
  }

  return spans.sort((a, b) => a.start - b.start)
}

/**
 * Reads an electron configuration as shell occupancies.
 *
 * Returns `null` when the value is not a hyphen-joined numeric sequence or when
 * the numbers could not be shell occupancies (each term must fit 2n² and be
 * non-zero), so an unrelated number range is never labelled as a distribution.
 * The parsed `value` and every token are the source characters verbatim — the
 * helper never inserts, removes or reorders anything.
 */
export function parseElectronConfiguration(value: string): ParsedElectronConfiguration | null {
  const input = value.trim()
  if (!NUMERIC_HYPHEN_SEQUENCE_PATTERN.test(input)) return null

  const shells: string[] = []
  const separators: string[] = []
  let index = 0
  while (index < input.length) {
    let digits = ''
    while (index < input.length && /\d/.test(input[index]!)) {
      digits += input[index]
      index += 1
    }
    if (digits !== '') shells.push(digits)
    if (index >= input.length) break
    separators.push(input[index]!)
    index += 1
  }

  if (shells.length !== separators.length + 1) return null

  const plausible = shells.every((shell, position) => {
    const count = Number(shell)
    return Number.isInteger(count) && count >= 1 && count <= shellCapacity(position)
  })
  if (!plausible) return null

  const tokens: ElectronConfigurationToken[] = []
  shells.forEach((shell, position) => {
    if (position > 0) tokens.push({ kind: 'separator', value: separators[position - 1]! })
    tokens.push({ kind: 'shell', value: shell })
  })

  return { value: input, shells, tokens }
}

/** True when the value is a hyphen-joined sequence of plausible shell counts. */
export function isElectronConfiguration(value: string): boolean {
  return parseElectronConfiguration(value) !== null
}


/* ---------------------------------------------------------------------------
 * Charge handling (ions, standalone charge values, nuclear particles)
 * ------------------------------------------------------------------------ */

/** Typographic minus — never a hyphen when rendering a scientific sign. */
export const MINUS_SIGN = '\u2212'

export type ChargeSign = '+' | '-' | ''

export type Charge = {
  /** Signed magnitude, e.g. `2`, `3` — empty string means a bare sign. */
  magnitude: string
  sign: ChargeSign
  /** Conventional rendering: `−2`, `+2`, `−`, `2` — never `2−`. */
  display: string
}

/**
 * Normalises any conventional charge spelling into a canonical form.
 * Accepts `2-`, `-2`, `²⁻`, `+2`, `2`, `2+`, `2+`/`2-` magnitude order.
 *
 * The display value always places the sign first, which is the form used for
 * standalone charge values (−2, +2) and never the reversed `2−` / `2+`.
 */
export function normalizeCharge(raw: string | number): Charge {
  const input = String(raw).trim()
  if (!input) return { magnitude: '', sign: '', display: '' }

  const signMatch = input.match(/[+\-−⁻⁺]/)
  const sign: ChargeSign =
    signMatch === null ? '' : signMatch[0] === '+' || signMatch[0] === '⁺' ? '+' : '-'

  const magnitude = input
    .replace(/[+\-−⁻⁺^]/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (digit) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(digit)))
    .trim()

  const signGlyph = sign === '+' ? '+' : sign === '-' ? MINUS_SIGN : ''
  return { magnitude, sign, display: `${signGlyph}${magnitude}` }
}

/** Renders a bare sign character: `+`, `−` or an empty string. */
export function chargeGlyph(sign: ChargeSign): string {
  if (sign === '+') return '+'
  if (sign === '-') return MINUS_SIGN
  return ''
}

/** One parsed compact charge token: `e⁻`, `2e⁻`, `Cl⁻`, `Ca²⁺`, `SO₄²⁻`. */
export type CompactChargeNotation = {
  /** The source characters verbatim, e.g. `Ca²⁺`. Never re-spelled. */
  source: string
  /** Leading coefficient of a multi-electron token (`2e⁻`); empty otherwise. */
  coefficient: string
  /** Species body verbatim, e.g. `Cl`, `Ca`, `e`, `SO₄`. */
  body: string
  /** Plain ASCII formula for <ChemicalFormula /> when the body is one. */
  formula: string | null
  /** Charge magnitude in ASCII digits (`2`); empty for a bare sign. */
  magnitude: string
  sign: '+' | '-'
}

const EXACT_CHARGE_NOTATION = new RegExp(`^${CHARGE_NOTATION_PARTS}$`, 'u')

/** `2` → `₂`: converts glyphs of one alphabet; unknown glyphs pass through. */
function plainDigits(value: string, alphabet: string): string {
  return [...value]
    .map((glyph) => {
      const index = alphabet.indexOf(glyph)
      return index === -1 ? glyph : String(index)
    })
    .join('')
}

/**
 * Reads a compact charge token that was authored in Unicode superscript form.
 *
 * `e⁻` and `2e⁻` are the electron spellings used throughout Unit 1; `Cl⁻`,
 * `Na⁺`, `Ca²⁺`, `O²⁻`, `Al³⁺` and `SO₄²⁻` are the ionic spellings. The parser
 * only ever *reads* the source: the renderer re-emits the same characters,
 * with the charge carried by real <sup> markup instead of raw glyphs.
 *
 * Returns `null` for negative exponents such as `mol⁻¹`, whose sign is not
 * final, so unit strings are never mistaken for ions.
 */
export function parseCompactCharge(value: string): CompactChargeNotation | null {
  const match = value.match(EXACT_CHARGE_NOTATION)
  if (!match) return null

  const body = match[2] ?? ''
  if (body === '') return null

  const ascii = plainDigits(body, SUBSCRIPT_DIGITS)
  return {
    source: value,
    coefficient: match[1] ?? '',
    body,
    formula: /^[A-Z][A-Za-z0-9]*$/.test(ascii) ? ascii : null,
    magnitude: plainDigits(match[3] ?? '', SUPERSCRIPT_DIGITS),
    sign: match[4] === '⁺' ? '+' : '-',
  }
}

/* ---------------------------------------------------------------------------
 * Sub / superscript characters (compact inline notation only)
 * ------------------------------------------------------------------------ */

const SUPERSCRIPT_CHARS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '−': '⁻',
}

/** `2` → `₂`. Non-digits pass through untouched. */
export function toSubscript(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[Number(digit)])
}

/** `2` → `²`, `-` → `⁻`. */
export function toSuperscript(value: string | number): string {
  return String(value)
    .split('')
    .map((char) => SUPERSCRIPT_CHARS[char] ?? char)
    .join('')
}

/* ---------------------------------------------------------------------------
 * Chemical formula parsing
 * ------------------------------------------------------------------------ */

export type FormulaCharge = { type: 'charge'; sign: '+' | '-'; magnitude: string }

export type FormulaNode =
  | { type: 'element'; symbol: string; subscript?: string }
  | {
      type: 'group'
      /** Raw inner text of the group, e.g. `OH` for `(OH)₂`. */
      source: string
      nodes: FormulaNode[]
      subscript?: string
      charge?: { sign: '+' | '-'; magnitude: string }
    }
  | FormulaCharge
  /** Structural characters: `·`, `→`, `(aq)`, `+` between species, spaces. */
  | { type: 'literal'; value: string }

const DIGIT = /\d/
const SIGN_CHAR = /[+\-−⁺⁻]/
/** Unicode script alphabets, so authored glyphs become real DOM scripts. */
const SUBSCRIPT_DIGIT_GLYPHS = '₀₁₂₃₄₅₆₇₈₉'
const SUPERSCRIPT_DIGIT_GLYPHS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/** True for the Unicode subscript digits used in authored formulas (`NH₄⁺`). */
function isSubscriptDigit(char: string): boolean {
  return SUBSCRIPT_DIGIT_GLYPHS.includes(char)
}

/** True for the Unicode superscript digits used in authored charges (`Ca²⁺`). */
function isSuperscriptDigit(char: string): boolean {
  return SUPERSCRIPT_DIGIT_GLYPHS.includes(char)
}

/** ASCII value of any digit glyph; non-digit input is returned unchanged. */
function digitValue(char: string): string {
  if (char >= '0' && char <= '9') return char
  if (isSubscriptDigit(char)) return String(SUBSCRIPT_DIGIT_GLYPHS.indexOf(char))
  if (isSuperscriptDigit(char)) return String(SUPERSCRIPT_DIGIT_GLYPHS.indexOf(char))
  return char
}

/** Canonical sign of any authored sign glyph. */
function signOf(char: string): '+' | '-' {
  return char === '+' || char === '⁺' ? '+' : '-'
}

/**
 * A digit run written in any of the three alphabets, normalised to ASCII.
 * The alphabet it was authored in is preserved, because it carries meaning:
 * `NH₄⁺` has a *subscript* four, while `Ca²⁺` has a *superscript* two that
 * belongs to the charge.
 */
type DigitRun = {
  /** ASCII digits, e.g. `4`. */
  value: string
  /** The run used Unicode subscript glyphs. */
  sub: boolean
  /** The run used Unicode superscript glyphs. */
  sup: boolean
}

/**
 * Parses a chemical formula into a structured tree so that subscripts and
 * charges become real DOM nodes rather than character-level hacks.
 *
 * Supported: elements (`H2O`), nested groups (`Ca(OH)2`, `[Cu(NH3)4]2+`),
 * hydrate dots (`CuSO4·5H2O`), explicit carets (`SO4^2-`), trailing charges
 * (`SO4 2-`, `Ca2+`) and species separators (`CaCO3 -> CaO + CO2`).
 */
export function parseFormula(formula: string): FormulaNode[] {
  return parseNodes(formula)
}

function parseNodes(formula: string): FormulaNode[] {
  const nodes: FormulaNode[] = []
  let index = 0
  /**
   * Element symbols pushed since the current species began. It is what tells a
   * monatomic ion from a polyatomic one: `Ca2+` is Ca²⁺ (one element, so the
   * trailing count is the charge), while `NO3-` is NO₃⁻ and `NH4+` is NH₄⁺
   * (several elements, so the trailing count is a subscript and the sign is
   * the bare charge). Reset by any operator, coefficient or completed charge.
   */
  let speciesElements = 0

  /** Reads ASCII digits and Unicode subscript glyphs — the index position. */
  const readIndexDigits = (): DigitRun => {
    let value = ''
    let sub = false
    while (index < formula.length) {
      const char = formula[index]!
      if (DIGIT.test(char)) value += char
      else if (isSubscriptDigit(char)) {
        value += digitValue(char)
        sub = true
      } else break
      index += 1
    }
    return { value, sub, sup: false }
  }

  /** Reads Unicode superscript glyphs — an authored charge magnitude. */
  const readSuperscriptDigits = (): string => {
    let value = ''
    while (index < formula.length && isSuperscriptDigit(formula[index]!)) {
      value += digitValue(formula[index]!)
      index += 1
    }
    return value
  }

  /** Reads a digit run in any alphabet, merged to ASCII (carets, coefficients). */
  const readAnyDigits = (): string => {
    let value = ''
    while (index < formula.length) {
      const char = formula[index]!
      if (DIGIT.test(char) || isSubscriptDigit(char) || isSuperscriptDigit(char)) {
        value += digitValue(char)
        index += 1
      } else break
    }
    return value
  }

  /** Consumes the remaining sign glyphs of one charge (`+`, `2+`, `²⁺`). */
  const consumeSign = (): '+' | '-' => {
    const sign = signOf(formula[index]!)
    index += 1
    while (index < formula.length && SIGN_CHAR.test(formula[index]!)) index += 1
    return sign
  }

  /**
   * Reads what follows an element or group: its subscript and, when present,
   * its charge.
   *
   * The source is read in three phases — index digits, then superscript digits,
   * then the sign — which removes the ambiguity the old single-run rule had:
   *
   *  - `Ca²⁺`, `SO₄²⁻`, `PO₄³⁻` — a Unicode superscript run before the sign is
   *    the charge magnitude, so the charge reads `2+`, `2−`, `3−`, and any
   *    subscript that preceded it stays a subscript.
   *  - `NH₄⁺`, `NO₃⁻` — a Unicode *subscript* glyph is an index, never a charge
   *    magnitude, so the sign is the bare charge.
   *  - `Ca2+`, `NO3-`, `NH4+`, `SO42-` — ASCII digits are genuinely ambiguous,
   *    and chemistry resolves it: a species built from ONE element symbol is a
   *    monatomic ion, so its single trailing count is the magnitude (`O2-` is
   *    O²⁻); a species built from TWO or more element symbols writes the charge
   *    after a subscript (`NO3-` is NO₃⁻, `NH4+` is NH₄⁺) or after two digits
   *    (`SO42-` is SO₄²⁻).
   */
  const readElementTail = (elementsBefore: number): { subscript?: string; charge: FormulaCharge | null } => {
    const indexDigits = readIndexDigits()
    const superscriptDigits = readSuperscriptDigits()
    const next = formula[index]
    const followedBySign = next !== undefined && SIGN_CHAR.test(next)

    if (!followedBySign) {
      const subscript = `${indexDigits.value}${superscriptDigits}`
      return { subscript: subscript === '' ? undefined : subscript, charge: null }
    }

    const sign = consumeSign()

    // An authored superscript run is the charge magnitude.
    if (superscriptDigits !== '') {
      return {
        ...(indexDigits.value === '' ? {} : { subscript: indexDigits.value }),
        charge: { type: 'charge', sign, magnitude: superscriptDigits },
      }
    }

    // An authored subscript glyph is an index: `NH₄⁺` is NH₄ with a bare charge.
    const singleTrailingAsciiDigit = !indexDigits.sub && indexDigits.value.length === 1
    if (indexDigits.sub || (singleTrailingAsciiDigit && elementsBefore >= 2)) {
      return {
        ...(indexDigits.value === '' ? {} : { subscript: indexDigits.value }),
        charge: { type: 'charge', sign, magnitude: '' },
      }
    }

    const magnitude = indexDigits.value === '' ? '' : indexDigits.value.slice(-1)
    const subscript = indexDigits.value.length > 1 ? indexDigits.value.slice(0, -1) : ''
    return {
      subscript: subscript === '' ? undefined : subscript,
      charge: { type: 'charge', sign, magnitude },
    }
  }

  while (index < formula.length) {
    const start = index
    const char = formula[index]!

    // --- Group: (OH)2, [Cu(NH3)4]2+ -------------------------------------
    if (char === '(' || char === '[') {
      const close = char === '(' ? ')' : ']'
      index += 1
      const innerStart = index
      let depth = 1
      while (index < formula.length) {
        const current = formula[index]!
        if (current === char) depth += 1
        else if (current === close) {
          depth -= 1
          if (depth === 0) break
        }
        index += 1
      }
      const source = formula.slice(innerStart, index)
      if (index < formula.length) index += 1 // consume closer
      // A group is already one unit, so a count written after its bracket is
      // its repetition and a count written against the sign is the charge
      // (`[Cu(NH3)4]2+`). It therefore counts as a single species member.
      const split = readElementTail(1)
      nodes.push({
        type: 'group',
        source,
        nodes: parseNodes(source),
        ...(split.subscript ? { subscript: split.subscript } : {}),
        ...(split.charge ? { charge: { sign: split.charge.sign, magnitude: split.charge.magnitude } } : {}),
      })
      speciesElements += 1
      if (split.charge) speciesElements = 0
      continue
    }

    // --- Element: H, He, H2, Ca2+ ---------------------------------------
    if (/[A-Z]/.test(char)) {
      let symbol = char
      index += 1
      if (index < formula.length && /[a-z]/.test(formula[index]!)) {
        symbol += formula[index]
        index += 1
      }
      const split = readElementTail(speciesElements + 1)
      nodes.push({ type: 'element', symbol, ...(split.subscript ? { subscript: split.subscript } : {}) })
      speciesElements += 1
      if (split.charge) {
        nodes.push(split.charge)
        speciesElements = 0
      }
      continue
    }

    // --- Bare digits: coefficient (2H2O) or trailing charge (SO4 2-) -----
    if (DIGIT.test(char)) {
      const digits = readAnyDigits()
      const next = formula[index]
      // A digit run against a sign with no species before it is a charge
      // written after a space (`SO4 2-`); otherwise it is a coefficient.
      if (next !== undefined && SIGN_CHAR.test(next) && speciesElements === 0) {
        const sign = consumeSign()
        nodes.push({ type: 'charge', sign, magnitude: digits })
        continue
      }
      nodes.push({ type: 'literal', value: digits })
      speciesElements = 0
      continue
    }

    // --- Explicit caret superscript: SO4^2- ------------------------------
    if (char === '^') {
      index += 1
      const digits = readAnyDigits()
      const sign = formula[index]
      if (sign !== undefined && SIGN_CHAR.test(sign)) {
        const chargeSign = consumeSign()
        nodes.push({ type: 'charge', sign: chargeSign, magnitude: digits })
        speciesElements = 0
      } else if (digits !== '') {
        nodes.push({ type: 'literal', value: `^${digits}` })
      }
      continue
    }

    // --- Bare sign character: a charge when it belongs to a species ------
    if (SIGN_CHAR.test(char)) {
      const next = formula[index + 1]
      const sign = signOf(char)
      // Sign first, magnitude second: `+2`, `⁻¹`-style spellings.
      if (next !== undefined && (DIGIT.test(next) || isSubscriptDigit(next) || isSuperscriptDigit(next))) {
        index += 1
        const digits = readAnyDigits()
        nodes.push({ type: 'charge', sign, magnitude: digits })
        speciesElements = 0
        continue
      }
      // A sign attached to the preceding species closes it: `Na+`, `Cl-`.
      // A free-standing sign between species (`CaO + CO2`) stays an operator.
      const previous = formula[index - 1]
      const attached = previous !== undefined && /[A-Za-z0-9)\]⁺⁻]/.test(previous)
      if (attached) {
        nodes.push({ type: 'charge', sign, magnitude: '' })
        index += 1
        speciesElements = 0
        continue
      }
      nodes.push({ type: 'literal', value: char === '−' ? MINUS_SIGN : char })
      index += 1
      speciesElements = 0
      continue
    }

    // --- Everything else: operators, spaces, state symbols, Arabic -------
    let literal = ''
    while (
      index < formula.length &&
      !/[A-Z\d([^+\-−⁺⁻]/.test(formula[index]!) &&
      !isSubscriptDigit(formula[index]!) &&
      !isSuperscriptDigit(formula[index]!)
    ) {
      literal += formula[index]
      index += 1
    }
    if (literal === '' || index === start) {
      // Guarantee forward progress even for unexpected characters.
      literal = formula[start]!
      index = start + 1
    }
    nodes.push({ type: 'literal', value: literal })
    // Operators, spaces and state symbols end the species being counted.
    if (/[\s]|->|→|\+|·/.test(literal)) speciesElements = 0
  }

  return nodes
}

/**
 * Compact textual form of a formula (`H₂O`, `CaCO₃`) for space-constrained
 * contexts such as `<option>` labels, table headers and document titles.
 * Interactive surfaces should use <ChemicalFormula /> so subscripts are real
 * DOM elements with accessible markup.
 */
export function formulaToUnicode(formula: string): string {
  const render = (nodes: FormulaNode[]): string =>
    nodes
      .map((node) => {
        switch (node.type) {
          case 'element':
            return `${node.symbol}${node.subscript ? toSubscript(node.subscript) : ''}`
          case 'group': {
            const charge = node.charge
              ? `${toSuperscript(node.charge.magnitude)}${toSuperscript(node.charge.sign)}`
              : ''
            return `(${render(node.nodes)})${node.subscript ? toSubscript(node.subscript) : ''}${charge}`
          }
          case 'charge':
            return `${toSuperscript(node.magnitude)}${toSuperscript(node.sign)}`
          case 'literal':
            return node.value
        }
      })
      .join('')

  return render(parseFormula(formula))
}
