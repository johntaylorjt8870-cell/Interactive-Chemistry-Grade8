/**
 * Numeric / unit formatting helpers.
 *
 * Scientific values in this platform always use Western (ASCII) digits and a
 * decimal point, matching printed Syrian science textbooks, and are always
 * rendered LTR (see ScientificValue).
 */

export type FormatNumberOptions = {
  /** Fixed number of decimal places. */
  precision?: number
  /** Force a minimum number of integer digits (zero-padded). */
  padIntegerTo?: number
  /** Render thousands separators. Off by default for measurement values. */
  group?: boolean
}

/** Formats a numeric value deterministically and locale-independently. */
export function formatNumber(value: number | string, options: FormatNumberOptions = {}): string {
  const { precision, padIntegerTo, group = false } = options

  const numeric = typeof value === 'number' ? value : Number(String(value).trim())
  if (typeof value === 'string' && value.trim() === '') return ''
  if (!Number.isFinite(numeric)) {
    // Non-numeric input is passed through verbatim rather than silently zeroed.
    return String(value).trim()
  }

  // Without an explicit precision the written form is preserved: `9.8` stays
  // `9.8` (never `9.80`), and `1.50` stays `1.50`.
  let output =
    precision === undefined
      ? typeof value === 'number'
        ? String(numeric)
        : String(value).trim().replace(/^\+/, '')
      : numeric.toFixed(precision)

  if (group) {
    const [integer, decimals] = output.split('.')
    const grouped = integer!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    output = decimals === undefined ? grouped : `${grouped}.${decimals}`
  }

  if (padIntegerTo) {
    const [integer, decimals] = output.split('.')
    const padded = integer!.padStart(padIntegerTo, '0')
    output = decimals === undefined ? padded : `${padded}.${decimals}`
  }

  return output
}

/**
 * Splits a `value` + optional exponent into display text.
 * `6.02` with exponent `23` → `6.02 × 10²³` in structured parts.
 */
export function splitExponent(exponent: number | string): { base: string; power: string } {
  const raw = String(exponent).replace(/^\+/, '').replace(/^[−-]/, '-')
  return { base: '10', power: raw === '' ? '0' : raw }
}

/** `g·mol⁻¹` → `g·mol^-1` for contexts that cannot render superscript markup. */
export function unitToPlainText(unit: string): string {
  const SUPERSCRIPTS: Record<string, string> = {
    '⁰': '^0',
    '¹': '^1',
    '²': '^2',
    '³': '^3',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
    '⁻': '^-',
    '⁺': '^+',
  }
  return unit.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (char) => SUPERSCRIPTS[char] ?? char)
}
