/**
 * Scientific text utilities.
 *
 * These helpers are deliberately pure and framework-free so they can be unit
 * tested directly (see scientificText.test.ts) and reused by both the prose
 * layer (ScientificText) and the structured notation components.
 */

/** Structured notations that get their own renderer instead of a generic isolate. */
export type ScientificNotation = 'electron-configuration'

export type ScientificRun =
  | { kind: 'prose'; value: string }
  | { kind: 'science'; value: string; notation?: ScientificNotation }

/** Latin identifier / unit / symbol fragment, e.g. `Cl`, `mol`, `g/mol`, `°C`. */
const UNIT = String.raw`[A-Za-zµΩÅ%°][A-Za-z0-9µΩÅ°⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺/^·\-]*`
const NUMBER = String.raw`\d+(?:[.,]\d+)?`
/**
 * Subscript and superscript glyphs printed inside Chemistry symbols travel
 * inside the same LTR isolate as the Latin symbol they belong to — never float
 * in the surrounding RTL prose.
 */
const SCRIPT_GLYPHS = '₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁹'
/** Latin identifier carrying its own scripts, e.g. `Cl₂`, `H₂O`, `CaCO₃`. */
const IDENT_EXT = String.raw`[A-Za-z][A-Za-z0-9_'’.\-${SCRIPT_GLYPHS}]*`
/**
 * A complete mathematical or symbolic run that must read as ONE left-to-right
 * unit inside Arabic prose. Splitting it into several isolates would let the
 * RTL paragraph reorder its pieces, so the run starts at a letter/digit, spans
 * formula glyphs, and ends on a meaningful character (never on a stray space
 * or operator). Arabic text and Arabic punctuation are not in the class, so
 * prose always terminates the run.
 */
const MATH_RUN = String.raw`[A-Za-z0-9](?:[A-Za-z0-9\s=+\-−×÷·±√/()%°²³${SCRIPT_GLYPHS}'’._]*[A-Za-z0-9)²³])?`
/** Scientific notation such as 6.02×10²³ or 3.2 x 10^-4 */
const EXPONENT = String.raw`(?:[×x*]\s?10\s?(?:\^?[-+−]?\d+|[⁻⁺²³⁴⁵⁶⁷⁸⁹]+))?`

/**
 * A hyphen-joined numeric sequence: `2-8-8`, `2-8-18-8`, `2-8-8-2`.
 * An electron configuration is one logical value; matching the whole sequence
 * keeps an RTL paragraph from reordering its shells as separate fragments.
 */
const NUMERIC_HYPHEN_SEQUENCE = String.raw`\d+(?:[-\u2212]\d+)+`

/**
 * Tokens that must be bidi-isolated (rendered LTR) inside Arabic prose:
 *
 *  0. a hyphen-joined numeric sequence — `2-8-8`, never `2` + `-8` + `-8`
 *  1. a value with an optional scientific exponent and optional unit
 *     — `5 g`, `25 °C`, `6.02×10²³ mol⁻¹`
 *  2. a Latin word or identifier, optionally chained into a short expression
 *     — `H₂O`, `Cl₂`, `Ca²⁺`
 *
 * Arabic text never matches these classes, so prose is always preserved
 * verbatim; only Latin/technical runs are lifted out of the RTL flow.
 */
const SCIENTIFIC_RUN = new RegExp(
  [
    String.raw`(?:${NUMERIC_HYPHEN_SEQUENCE})`,
    String.raw`(?:${NUMBER}${EXPONENT}(?:\s?${UNIT})?)`,
    String.raw`(?:${MATH_RUN})`,
    String.raw`(?:${IDENT_EXT}(?:(?:\s?[=+\-−×÷·]\s?)[A-Za-z0-9_'’.\-₀₁₂₃₄₅₆₇₈⁰¹²³⁴⁵⁶⁸⁹]+)*)`,
    String.raw`(?:[=+\-−×÷·]\s?${NUMBER})`,
  ].join('|'),
  'gu',
)

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

/**
 * Splits mixed Arabic/scientific prose into ordered runs.
 *
 * `"كمية المادة 1 mol تقريباً"` becomes
 * `[prose: "كمية المادة ", science: "1 mol", prose: " تقريباً"]`
 */
export function splitScientificRuns(input: string): ScientificRun[] {
  if (!input) return []

  const runs: ScientificRun[] = []
  let cursor = 0

  SCIENTIFIC_RUN.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = SCIENTIFIC_RUN.exec(input)) !== null) {
    const [value] = match
    if (!value) {
      // Defensive: never allow a zero-length match to spin the loop forever.
      SCIENTIFIC_RUN.lastIndex += 1
      continue
    }
    if (match.index > cursor) {
      runs.push({ kind: 'prose', value: input.slice(cursor, match.index) })
    }
    runs.push(scienceRun(value))
    cursor = match.index + value.length
  }

  if (cursor < input.length) {
    runs.push({ kind: 'prose', value: input.slice(cursor) })
  }

  return runs
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

/* ---------------------------------------------------------------------------
 * Sub / superscript characters (compact inline notation only)
 * ------------------------------------------------------------------------ */

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
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

  const digitsAt = (): string => {
    let digits = ''
    while (index < formula.length && DIGIT.test(formula[index]!)) {
      digits += formula[index]
      index += 1
    }
    return digits
  }

  /**
   * A digit run immediately before a sign is ambiguous in compact notation:
   * `SO42-` means SO₄²⁻ (subscript 4, charge 2) while `Ca2+` means Ca²⁺
   * (no subscript, charge 2). Chemical convention resolves it: the last digit
   * belongs to the charge, any preceding digits are the subscript. When no
   * sign follows, the whole run is a subscript.
   */
  const readDigitsAndCharge = (digits: string): { subscript?: string; charge: FormulaCharge | null } => {
    const next = formula[index]
    if (next === undefined || !SIGN_CHAR.test(next)) {
      return { subscript: digits === '' ? undefined : digits, charge: null }
    }
    const magnitude = digits === '' ? '' : digits.slice(-1)
    const subscript = digits.length > 1 ? digits.slice(0, -1) : ''
    index += 1
    while (index < formula.length && SIGN_CHAR.test(formula[index]!)) index += 1
    return {
      subscript: subscript === '' ? undefined : subscript,
      charge: { type: 'charge', sign: next === '+' || next === '⁺' ? '+' : '-', magnitude },
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
      const split = readDigitsAndCharge(digitsAt())
      nodes.push({
        type: 'group',
        source,
        nodes: parseNodes(source),
        ...(split.subscript ? { subscript: split.subscript } : {}),
        ...(split.charge ? { charge: { sign: split.charge.sign, magnitude: split.charge.magnitude } } : {}),
      })
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
      const split = readDigitsAndCharge(digitsAt())
      nodes.push({ type: 'element', symbol, ...(split.subscript ? { subscript: split.subscript } : {}) })
      if (split.charge) nodes.push(split.charge)
      continue
    }

    // --- Bare digits: coefficient (2H2O) or trailing charge (SO4 2-) -----
    if (DIGIT.test(char)) {
      const digits = digitsAt()
      const next = formula[index]
      if (next !== undefined && SIGN_CHAR.test(next)) {
        const split = readDigitsAndCharge(digits)
        if (split.charge) {
          nodes.push(split.charge)
          continue
        }
      }
      nodes.push({ type: 'literal', value: digits })
      continue
    }

    // --- Explicit caret superscript: SO4^2- ------------------------------
    if (char === '^') {
      index += 1
      const digits = digitsAt()
      const sign = formula[index]
      if (sign !== undefined && SIGN_CHAR.test(sign)) {
        index += 1
        while (index < formula.length && SIGN_CHAR.test(formula[index]!)) index += 1
        nodes.push({ type: 'charge', sign: sign === '+' || sign === '⁺' ? '+' : '-', magnitude: digits })
      } else if (digits !== '') {
        nodes.push({ type: 'literal', value: `^${digits}` })
      }
      continue
    }

    // --- Bare sign character: a charge when it belongs to a species ------
    if (SIGN_CHAR.test(char)) {
      const next = formula[index + 1]
      const sign = char === '+' || char === '⁺' ? '+' : '-'
      if (next !== undefined && DIGIT.test(next)) {
        index += 1
        const digits = digitsAt()
        nodes.push({ type: 'charge', sign, magnitude: digits })
        continue
      }
      // A sign attached to the preceding species closes it: `Na+`, `Cl-`.
      // A free-standing sign between species (`CaO + CO2`) stays an operator.
      const previous = formula[index - 1]
      const attached = previous !== undefined && /[A-Za-z0-9)\]⁺⁻]/.test(previous)
      if (attached) {
        nodes.push({ type: 'charge', sign, magnitude: '' })
        index += 1
        continue
      }
      nodes.push({ type: 'literal', value: char === '−' ? MINUS_SIGN : char })
      index += 1
      continue
    }

    // --- Everything else: operators, spaces, state symbols, Arabic -------
    let literal = ''
    while (
      index < formula.length &&
      !/[A-Z\d([^+\-−⁺⁻]/.test(formula[index]!)
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
