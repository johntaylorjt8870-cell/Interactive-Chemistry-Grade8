import type { ElementType, ReactNode } from 'react'
import { isElectronConfiguration, parseCompactCharge, splitScientificRuns } from '@/utils/scientificText'
import { ChargeNotation } from './ChargeNotation'
import { ChemicalFormula } from './ChemicalFormula'
import { ElectronConfiguration } from './ElectronConfiguration'
import { IonNotation } from './IonNotation'
import { NuclearNotation, parseCompactNuclearNotation } from './NuclearNotation'
import { Sci, type SciVariant } from './ScientificText'

const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const COMPACT_NUCLEAR_SOURCE = '(?:[⁰¹²³⁴⁵⁶⁷⁸⁹]+[₀₁₂₃₄₅₆₇₈₉]*|[₀₁₂₃₄₅₆₇₈₉]+)[A-Z][a-z]?'
const COMPACT_ION_SOURCE = '(?:[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]'
const COMPACT_CHARGE_SOURCE = '(?<![A-Za-z₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻])\\d*(?:[A-Za-z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*)[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻](?![⁰¹²³⁴⁵⁶⁷⁸⁹])'
// A formula core consumes the whole Latin run (`Cl₂`, `H₂O`, `CH₄`, `AlCl₃`)
// and may not be embedded in a longer word: the trailing lookahead rejects
// mid-word matches such as the `H` in `pH` or the initial letters of
// `Avogadro`. Only tokens carrying a real subscript are promoted; plain runs
// like `NaCl` stay inside the isolated science span.
const COMPACT_FORMULA_CORE = '(?:[A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+'
const COMPACT_FORMULA_SOURCE = `(?:${COMPACT_FORMULA_CORE}(?:\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]*)*|\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]+)(?![A-Za-z₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹])`
const NUMERIC_HYPHEN_SOURCE = '\\d+(?:[-\\u2212]\\d+)+'
const INNER_COMPOUND_TOKEN = new RegExp(
  `${COMPACT_NUCLEAR_SOURCE}|${COMPACT_ION_SOURCE}|${COMPACT_CHARGE_SOURCE}|${COMPACT_FORMULA_SOURCE}|${NUMERIC_HYPHEN_SOURCE}`,
  'gu',
)
const EXACT_COMPACT_FORMULA = new RegExp(
  `^(?:${COMPACT_FORMULA_CORE}(?:\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]*)*|\\(${COMPACT_FORMULA_CORE}\\)[₀₁₂₃₄₅₆₇₈₉]+)$`,
  'u',
)
const WORD_CHAR = /[A-Za-z₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/u
const HAS_STRUCTURED_GLYPH_OR_CONFIG = /[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]|\d[-\u2212]\d/u

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
  if (!/[₀₁₂₃₄₅₆₇₈₉]/u.test(trimmed) && !/\d/.test(trimmed)) return null
  return trimmed.replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) => plainDigits(digit, SUBSCRIPT_DIGITS))
}

function renderInnerCompoundRun(value: string): ReactNode {
  if (!HAS_STRUCTURED_GLYPH_OR_CONFIG.test(value)) return value

  const nodes: ReactNode[] = []
  let cursor = 0
  INNER_COMPOUND_TOKEN.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = INNER_COMPOUND_TOKEN.exec(value)) !== null) {
    const token = match[0]
    const preceding = match.index > 0 ? value[match.index - 1] ?? '' : ''
    const precededByWord = WORD_CHAR.test(preceding)
    const precededByLetter = /[A-Za-z]/u.test(preceding)

    const nuclear = !precededByWord ? parseCompactNuclearNotation(token) : null
    const ion = !precededByLetter ? parseCompactIonNotation(token) : null
    const charge = !nuclear && !ion && !precededByLetter && parseCompactCharge(token) ? token : null
    const formula = !nuclear && !ion && !charge && !precededByWord ? parseCompactFormulaNotation(token) : null
    const config =
      !nuclear && !ion && !charge && !formula && isElectronConfiguration(token) ? token : null

    if (!nuclear && !ion && !charge && !formula && !config) continue

    if (match.index > cursor) {
      nodes.push(value.slice(cursor, match.index))
    }

    if (nuclear) {
      nodes.push(
        <NuclearNotation
          key={`nuclear-${match.index}`}
          symbol={nuclear.symbol}
          massNumber={nuclear.massNumber}
          atomicNumber={nuclear.atomicNumber}
          size="sm"
        />,
      )
    } else if (ion) {
      nodes.push(<IonNotation key={`ion-${match.index}`} formula={ion.formula} charge={ion.charge} size="sm" />)
    } else if (charge) {
      nodes.push(<ChargeNotation key={`charge-${match.index}`} source={charge} size="sm" />)
    } else if (formula) {
      nodes.push(<ChemicalFormula key={`formula-${match.index}`} formula={formula} size="sm" />)
    } else if (config) {
      nodes.push(<ElectronConfiguration key={`cfg-${match.index}`} value={config} />)
    }

    cursor = match.index + token.length
  }

  if (nodes.length === 0) return value
  if (cursor < value.length) nodes.push(value.slice(cursor))
  return nodes
}

export type ScientificNotationTextProps<T extends ElementType = 'span'> = {
  children: string
  as?: T
  className?: string
  scienceVariant?: SciVariant
}

/**
 * Mixed Arabic/scientific prose with bidi isolation applied BEFORE structured
 * token promotion, so compound equations (`H₃PO₄ → 3H⁺ + PO₄³⁻`, `Ca = 2-8-8-2`)
 * stay inside one LTR isolate while standalone nuclides, ions, formulas,
 * charges, and electron configurations promote directly to structured DOM.
 */
export function ScientificNotationText<T extends ElementType = 'span'>({
  children,
  as,
  className,
  scienceVariant = 'textual',
}: ScientificNotationTextProps<T>) {
  const Component = (as ?? 'span') as ElementType
  const runs = splitScientificRuns(children)

  return (
    <Component className={className}>
      {runs.map((run, index) => {
        if (run.kind !== 'science') return <span key={index}>{run.value}</span>

        const nuclear = parseCompactNuclearNotation(run.value)
        if (nuclear) {
          return (
            <NuclearNotation
              key={index}
              symbol={nuclear.symbol}
              massNumber={nuclear.massNumber}
              atomicNumber={nuclear.atomicNumber}
              size="sm"
            />
          )
        }

        const ion = parseCompactIonNotation(run.value)
        if (ion) {
          return <IonNotation key={index} formula={ion.formula} charge={ion.charge} size="sm" />
        }

        const formula = parseCompactFormulaNotation(run.value)
        if (formula) {
          return <ChemicalFormula key={index} formula={formula} size="sm" />
        }

        if (run.notation === 'charge') {
          return <ChargeNotation key={index} source={run.value} size="sm" />
        }

        if (run.notation === 'electron-configuration') {
          return <ElectronConfiguration key={index} value={run.value} />
        }

        return (
          <Sci key={index} variant={scienceVariant} notation={run.notation}>
            {renderInnerCompoundRun(run.value)}
          </Sci>
        )
      })}
    </Component>
  )
}
