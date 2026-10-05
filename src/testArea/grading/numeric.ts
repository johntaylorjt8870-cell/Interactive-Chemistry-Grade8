import type { NumericAnswerSpec } from '@/data/testArea/types'
import { type Grade, GRADE_UNANSWERED } from './types'

/* ============================================================================
   Numeric grading
   ----------------------------------------------------------------------------
   The answer policy is declared by the question, never inferred:

   - `correctValue` / `acceptedValues` — the accepted targets.
   - `tolerance` — absolute tolerance; default 0 (exact).
   - `integerOnly` — counts of particles are integers; 2.5 electrons is wrong.
   - `decimals.max` — rejects entries finer than the source prints.
   - `unit` — absent means the unit is not part of the answer, so a missing
     unit can never fail it. Present means a *supplied* unit must be accepted,
     and `required` makes supplying it mandatory.

   Parsing is deliberately narrow: it accepts Arabic-Indic digits, a decimal
   comma, and (only when the question allows it) a fraction `a/b`. Everything
   else is `invalid`, never a silent zero.
   ========================================================================= */

export type NumericParse =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'ok'; value: number; decimalPlaces: number }

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const EXTENDED_INDIC_FROM = 0x06f0 // ۰
const EXTENDED_INDIC_TO = 0x06f9 // ۹

export function toAsciiDigits(input: string): string {
  return [...input]
    .map((char) => {
      const arabic = ARABIC_INDIC.indexOf(char)
      if (arabic >= 0) return String(arabic)
      const code = char.codePointAt(0) ?? 0
      if (code >= EXTENDED_INDIC_FROM && code <= EXTENDED_INDIC_TO) {
        return String(code - EXTENDED_INDIC_FROM)
      }
      return char
    })
    .join('')
}

/** Accepted decimal separators and minus shapes, normalised to ASCII. */
function normaliseShape(text: string): string {
  return text
    .replace(/[\s\u00a0]/g, '')
    .replace(/[٫،]/g, '.')
    .replace(/,/g, '.')
    .replace(/[−–—‐-]/g, '-')
}

export function parseNumericInput(raw: string, options: { allowFraction?: boolean } = {}): NumericParse {
  const text = toAsciiDigits(raw ?? '')
    .split('')
    .map((char) => char)
    .join('')
  const trimmed = text.trim()
  if (trimmed === '') return { status: 'empty' }

  if (trimmed.includes('/')) {
    if (!options.allowFraction) return { status: 'invalid' }
    const parts = trimmed.split('/')
    if (parts.length !== 2) return { status: 'invalid' }
    const [numerator, denominator] = parts.map((part) => normaliseShape(part))
    if (!/^[+-]?\d+$/.test(numerator) || !/^[+-]?\d+$/.test(denominator)) {
      return { status: 'invalid' }
    }
    const den = Number(denominator)
    if (den === 0) return { status: 'invalid' }
    return { status: 'ok', value: Number(numerator) / den, decimalPlaces: 0 }
  }

  const normalised = normaliseShape(trimmed)
  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(normalised)) return { status: 'invalid' }
  const value = Number(normalised)
  if (!Number.isFinite(value)) return { status: 'invalid' }
  const decimalPlaces = normalised.includes('.') ? (normalised.split('.')[1]?.length ?? 0) : 0
  return { status: 'ok', value, decimalPlaces }
}

/**
 * Reads the first number out of a piece of prose (`32 إلكتروناً` → 32).
 *
 * Deliberately separate from `parseNumericInput`: a student's answer must be a
 * number, so that parser stays strict; an authored sentence in a solution is
 * prose, so this one is tolerant. Mixing the two would let nonsense entries
 * pass as answers.
 */
export function extractNumericValue(
  text: string,
  options: { allowFraction?: boolean } = {},
): NumericParse {
  const source = toAsciiDigits(text ?? '')
  const pattern = options.allowFraction
    ? /[+-]?\d+(?:\s*\/\s*\d+)?|[+-]?[.,]\d+/
    : /[+-]?\d+(?:[.,]\d+)?|[+-]?[.,]\d+/
  const match = source.match(pattern)
  if (!match) return { status: 'empty' }
  return parseNumericInput(match[0], options)
}

export type NumericResponse = { value: string; unit?: string } | null | undefined

export function gradeNumeric(spec: NumericAnswerSpec, response: NumericResponse): Grade {
  if (!response) return GRADE_UNANSWERED

  const parsed = parseNumericInput(response.value ?? '', {
    allowFraction: spec.allowFractionInput ?? false,
  })

  if (parsed.status === 'empty') {
    if (spec.unit?.required) return { outcome: 'unanswered', ratio: 0, notes: ['unit-required'] }
    return GRADE_UNANSWERED
  }

  if (parsed.status === 'invalid') {
    return { outcome: 'invalid', ratio: 0, notes: ['invalid-input'] }
  }

  if (spec.integerOnly && !Number.isInteger(parsed.value)) {
    return { outcome: 'incorrect', ratio: 0, notes: ['not-integer'] }
  }

  if (spec.decimals?.max !== undefined && parsed.decimalPlaces > spec.decimals.max) {
    return { outcome: 'incorrect', ratio: 0, notes: ['too-many-decimals'] }
  }

  const tolerance = spec.tolerance ?? 0
  const targets = [spec.correctValue, ...(spec.acceptedValues ?? [])]
  const valueWithinRange = targets.some(
    (target) => Math.abs(parsed.value - target) <= tolerance + 1e-9,
  )

  const notes: string[] = []
  let unitOk = true
  if (spec.unit) {
    const provided = (response.unit ?? '').trim()
    if (spec.unit.required && provided === '') {
      unitOk = false
      notes.push('unit-required')
    } else if (provided !== '') {
      const accepted = spec.unit.accepted.map((unit) => unit.trim().toLowerCase())
      if (!accepted.includes(provided.toLowerCase())) {
        unitOk = false
        notes.push('unit-mismatch')
      }
    }
  }

  const correct = valueWithinRange && unitOk
  return {
    outcome: correct ? 'correct' : 'incorrect',
    ratio: correct ? 1 : 0,
    notes,
  }
}
