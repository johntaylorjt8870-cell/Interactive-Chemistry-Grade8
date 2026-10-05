import type { ExactAnswerSpec, ExactKind } from '@/data/testArea/types'
import { GRADE_UNANSWERED, type Grade } from './types'
import { toAsciiDigits } from './numeric'

/* ============================================================================
   Exact grading
   ----------------------------------------------------------------------------
   Used for answers that are structured rather than measured: an electron
   distribution (`2-8-1`), a formula (`MgCl2`), an ion (`Ca2+`) or a fraction
   printed by the book (`1/1860`).

   Each kind owns one normaliser. Equivalence is decided on the normalised
   form, so `H₂O` and `H2O`, or `٢-٨-١` and `2-8-1`, are the same answer — and
   a genuinely different answer is never accepted.
   ========================================================================= */

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉'
const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

function foldScriptDigits(value: string): string {
  return [...value]
    .map((char) => {
      const sub = SUBSCRIPTS.indexOf(char)
      if (sub >= 0) return String(sub)
      const sup = SUPERSCRIPTS.indexOf(char)
      if (sup >= 0) return String(sup)
      if (char === '⁺') return '+'
      if (char === '⁻') return '-'
      return char
    })
    .join('')
}

/** `2 - 8 - 1`, `٢-٨-١` and `2،8،1` all normalise to `2-8-1`. */
export function normaliseDistribution(value: string): string {
  return toAsciiDigits(value)
    .replace(/[\s\u00a0]/g, '')
    .replace(/[–—ـ]+/g, '-')
    .replace(/[،,;؛.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** `H₂O` → `H2O`; spaces are not part of a formula. */
export function normaliseFormula(value: string): string {
  return foldScriptDigits(toAsciiDigits(value))
    .replace(/[\s\u00a0]/g, '')
    .replace(/[⋅·]/g, '')
}

/**
 * `Ca²⁺`, `Ca2+` and `Ca+2` all normalise to `Ca2+` — magnitude before sign,
 * the conventional ionic spelling used across the platform.
 */
export function normaliseIon(value: string): string {
  const folded = foldScriptDigits(toAsciiDigits(value)).replace(/[\s\u00a0]/g, '')
  const match = folded.match(/^(.*?)([0-9]*)([+-])$/)
  if (!match) return normaliseFormula(folded)
  const [, body = '', magnitude = '', sign = ''] = match
  const normalisedMagnitude = magnitude === '1' ? '' : magnitude
  return `${normaliseFormula(body)}${normalisedMagnitude}${sign}`
}

function gcd(a: number, b: number): number {
  let left = Math.abs(a)
  let right = Math.abs(b)
  while (right !== 0) {
    const next = left % right
    left = right
    right = next
  }
  return left === 0 ? 1 : left
}

/** `2/3720` and `1/1860` are the same value; `1/1861` is not. */
export function normaliseFraction(value: string): string {
  const folded = toAsciiDigits(value).replace(/[\s\u00a0]/g, '')
  const match = folded.match(/^([+-]?\d+)\/([+-]?\d+)$/)
  if (!match) return folded
  const numerator = Number(match[1])
  const denominator = Number(match[2])
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return folded
  }
  const negative = numerator < 0 !== denominator < 0
  const absN = Math.abs(numerator)
  const absD = Math.abs(denominator)
  const divisor = gcd(absN, absD)
  return `${negative ? '-' : ''}${absN / divisor}/${absD / divisor}`
}

/** Plain prose answer: whitespace collapsed, optional case folding. */
export function normaliseText(value: string, caseSensitive: boolean): string {
  const collapsed = toAsciiDigits(value).trim().replace(/\s+/g, ' ')
  return caseSensitive ? collapsed : collapsed.toLowerCase()
}

export function normaliseExact(kind: ExactKind, value: string, caseSensitive = false): string {
  switch (kind) {
    case 'distribution':
      return normaliseDistribution(value)
    case 'formula':
      return normaliseFormula(value)
    case 'ion':
      return normaliseIon(value)
    case 'fraction':
      return normaliseFraction(value)
    case 'text':
      return normaliseText(value, caseSensitive)
  }
}

export type ExactResponse = { value: string } | null | undefined

export function gradeExact(spec: ExactAnswerSpec, response: ExactResponse): Grade {
  if (!response) return GRADE_UNANSWERED
  if (response.value.trim() === '') return GRADE_UNANSWERED

  const given = normaliseExact(spec.kind, response.value, spec.caseSensitive ?? false)
  if (given === '') return GRADE_UNANSWERED

  const accepted = spec.acceptedAnswers.map((answer) =>
    normaliseExact(spec.kind, answer, spec.caseSensitive ?? false),
  )

  return accepted.includes(given)
    ? { outcome: 'correct', ratio: 1, notes: [] }
    : { outcome: 'incorrect', ratio: 0, notes: [] }
}
