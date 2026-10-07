import type { ElementType, ReactNode } from 'react'
import { ChemicalFormula } from './ChemicalFormula'
import { IonNotation } from './IonNotation'
import { NuclearNotation, parseCompactNuclearNotation } from './NuclearNotation'
import { ScientificText, type SciVariant } from './ScientificText'

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const COMPACT_NUCLEAR_SOURCE = '[⁰¹²³⁴⁵⁶⁷⁸⁹]*[₀₁₂₃₄₅₆₇₈₉]+[A-Z][a-z]?'
const COMPACT_ION_SOURCE = '(?:[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]'
// A formula core consumes the whole Latin run (`Cl₂`, `H₂O`, `CH₄`, `AlCl₃`)
// and may not be embedded in a longer word: the trailing lookahead rejects
// mid-word matches such as the `H` in `pH` or the initial letters of
// `Avogadro`. Only tokens carrying a real subscript are promoted; plain runs
// like `NaCl` fall back to ScientificText, which already isolates them.
const COMPACT_FORMULA_CORE = '(?:[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+'
// Book formulas group radicals in parentheses — `Ca(OH)₂`, `Al₂(SO₄)₃`,
// `Al(NO₃)₃` — so the formula token optionally continues with one or more
// parenthesised cores, each optionally followed by its repetition count.
// Without this the trailing count after `)` is stranded in the RTL flow and
// the bidi algorithm scrambles it.
const COMPACT_FORMULA_SOURCE = `(?:${COMPACT_FORMULA_CORE}(?:\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]*)*|\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]+)(?![A-Za-z₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹])`
const COMPACT_NOTATION_RUN = new RegExp(
  `${COMPACT_NUCLEAR_SOURCE}|${COMPACT_ION_SOURCE}|${COMPACT_FORMULA_SOURCE}`,
  'gu',
)
const EXACT_COMPACT_FORMULA = new RegExp(
  `^(?:${COMPACT_FORMULA_CORE}(?:\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]*)*|\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]+)$`,
  'u',
)
const WORD_CHAR = /[A-Za-z₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/u

function plainDigits(value: string, alphabet: string): string {
  return [...value].map((digit) => String(alphabet.indexOf(digit))).join('')
}

export function parseCompactIonNotation(value: string): { formula: string; charge: string } | null {
  const match = value.trim().match(/^((?:[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+)([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/u)
  if (!match) return null
  const formula = match[1]!.replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) => plainDigits(digit, SUBSCRIPT_DIGITS))
  const magnitude = plainDigits(match[2]!, SUPERSCRIPT_DIGITS)
  const sign = match[3] === '⁺' ? '+' : '-'
  return { formula, charge: `${magnitude}${sign}` }
}

/**
 * Normalizes a compact formula run (`Cl₂`) to the ASCII source that
 * ChemicalFormula parses (`Cl2`). Returns null when the value is not a
 * complete compact formula.
 */
export function parseCompactFormulaNotation(value: string): string | null {
  const trimmed = value.trim()
  if (!EXACT_COMPACT_FORMULA.test(trimmed)) return null
  // Without a subscript there is nothing to structure: `NaCl` is already one
  // indivisible LTR run for ScientificText, and promoting bare words would
  // wrap ordinary identifiers in chemical-formula semantics.
  if (!/[₀₁₂₃₄₅₆₇₈₉]/u.test(trimmed) && !/\d/.test(trimmed)) return null
  return trimmed.replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) => plainDigits(digit, SUBSCRIPT_DIGITS))
}

export type ScientificNotationTextProps<T extends ElementType = 'span'> = {
  children: string
  as?: T
  className?: string
  scienceVariant?: SciVariant
}

/**
 * Mixed Arabic/scientific prose with compact nuclide and ion runs promoted to
 * structured renderers. Formula, charge magnitude and charge sign therefore
 * remain separate LTR-isolated DOM elements even inside an RTL sentence.
 */
export function ScientificNotationText<T extends ElementType = 'span'>({
  children,
  as,
  className,
  scienceVariant = 'textual',
}: ScientificNotationTextProps<T>) {
  const Component = (as ?? 'span') as ElementType
  const parts: ReactNode[] = []
  let cursor = 0

  COMPACT_NOTATION_RUN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = COMPACT_NOTATION_RUN.exec(children)) !== null) {
    const nuclear = parseCompactNuclearNotation(match[0])
    const ion = parseCompactIonNotation(match[0])
    // A formula token glued to a preceding word character (`pH`) is part of
    // that word: leave the whole run to ScientificText, which isolates it as
    // one unit instead of splitting it.
    const preceding = match.index > 0 ? children[match.index - 1] ?? '' : ''
    const formula = WORD_CHAR.test(preceding) ? null : parseCompactFormulaNotation(match[0])
    if (!nuclear && !ion && !formula) continue

    if (match.index > cursor) {
      parts.push(
        <ScientificText key={`text-${cursor}`} scienceVariant={scienceVariant}>
          {children.slice(cursor, match.index)}
        </ScientificText>,
      )
    }

    if (nuclear) {
      parts.push(
        <NuclearNotation
          key={`nuclear-${match.index}`}
          symbol={nuclear.symbol}
          massNumber={nuclear.massNumber}
          atomicNumber={nuclear.atomicNumber}
          size="sm"
        />,
      )
    } else if (ion) {
      parts.push(
        <IonNotation
          key={`ion-${match.index}`}
          formula={ion.formula}
          charge={ion.charge}
          size="sm"
        />,
      )
    } else if (formula) {
      parts.push(<ChemicalFormula key={`formula-${match.index}`} formula={formula} size="sm" />)
    }
    cursor = match.index + match[0].length
  }

  if (cursor < children.length) {
    parts.push(
      <ScientificText key={`text-${cursor}`} scienceVariant={scienceVariant}>
        {children.slice(cursor)}
      </ScientificText>,
    )
  }

  return <Component className={className}>{parts.length > 0 ? parts : <ScientificText scienceVariant={scienceVariant}>{children}</ScientificText>}</Component>
}
