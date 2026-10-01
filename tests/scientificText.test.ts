import { describe, expect, it } from 'vitest'
import {
  chargeGlyph,
  containsScientificRun,
  formulaToUnicode,
  normalizeCharge,
  parseFormula,
  splitScientificRuns,
  toSubscript,
  toSuperscript,
} from '@/utils/scientificText'
import { formatNumber, splitExponent, unitToPlainText } from '@/utils/format'

describe('splitScientificRuns — RTL/LTR separation', () => {
  it('keeps Arabic prose intact and lifts out a value with a unit', () => {
    const runs = splitScientificRuns('كتلة الجسم 5 kg تقريباً')

    expect(runs).toEqual([
      { kind: 'prose', value: 'كتلة الجسم ' },
      { kind: 'science', value: '5 kg' },
      { kind: 'prose', value: ' تقريباً' },
    ])
  })

  it('isolates a temperature value', () => {
    const runs = splitScientificRuns('درجة الحرارة 25 °C في المثال')
    expect(runs.find((run) => run.kind === 'science')?.value).toBe('25 °C')
  })

  it('isolates an acceleration value with a compound unit', () => {
    const runs = splitScientificRuns('تسارع الجاذبية 9.8 m/s² هنا')
    expect(runs.find((run) => run.kind === 'science')?.value).toBe('9.8 m/s²')
  })

  it('isolates latin identifiers inside Arabic sentences', () => {
    const runs = splitScientificRuns('العالم Newton وضع القانون')
    expect(runs.filter((run) => run.kind === 'science').map((run) => run.value)).toEqual(['Newton'])
  })

  it('isolates scientific notation', () => {
    const runs = splitScientificRuns('عدد أفوغادرو 6.02×10²³ mol⁻¹ تقريباً')
    expect(runs.find((run) => run.kind === 'science')?.value).toBe('6.02×10²³ mol⁻¹')
  })

  it('never marks pure Arabic text as scientific', () => {
    const runs = splitScientificRuns('هذا نص عربي فقط بلا أي رمز.')
    expect(runs.every((run) => run.kind === 'prose')).toBe(true)
    expect(containsScientificRun('هذا نص عربي فقط.')).toBe(false)
  })

  it('handles an empty string without a zero-length match loop', () => {
    expect(splitScientificRuns('')).toEqual([])
  })

  it('terminates on adversarial input containing lone operators', () => {
    for (const input of ['= = =', '+ - ×', 'x', '5', '=', 'kg']) {
      expect(() => splitScientificRuns(input)).not.toThrow()
    }
  })
})

describe('normalizeCharge — charge ordering', () => {
  it('renders a standalone negative charge sign-first', () => {
    expect(normalizeCharge('-2').display).toBe('\u22122')
    expect(normalizeCharge('2-').display).toBe('\u22122')
    expect(normalizeCharge('-2').magnitude).toBe('2')
  })

  it('renders a standalone positive charge sign-first', () => {
    expect(normalizeCharge('+2').display).toBe('+2')
    expect(normalizeCharge('2+').display).toBe('+2')
  })

  it('normalises superscript spellings', () => {
    expect(normalizeCharge('²⁻').display).toBe('\u22122')
    expect(normalizeCharge('²⁺').display).toBe('+2')
  })

  it('handles a bare sign', () => {
    expect(normalizeCharge('-').display).toBe('\u2212')
    expect(normalizeCharge('+').display).toBe('+')
  })

  it('uses a typographic minus, not a hyphen', () => {
    expect(normalizeCharge('-2').display).not.toContain('-')
  })

  it('exposes the sign glyph helper', () => {
    expect(chargeGlyph('-')).toBe('\u2212')
    expect(chargeGlyph('+')).toBe('+')
    expect(chargeGlyph('')).toBe('')
  })
})

describe('parseFormula — chemical structure', () => {
  it('parses elements with subscripts', () => {
    expect(parseFormula('H2O')).toEqual([
      { type: 'element', symbol: 'H', subscript: '2' },
      { type: 'element', symbol: 'O' },
    ])
  })

  it('parses two-letter element symbols', () => {
    expect(parseFormula('CaCO3')).toEqual([
      { type: 'element', symbol: 'Ca' },
      { type: 'element', symbol: 'C' },
      { type: 'element', symbol: 'O', subscript: '3' },
    ])
  })

  it('parses groups with subscripts', () => {
    const nodes = parseFormula('Ca(OH)2')
    expect(nodes[0]).toEqual({ type: 'element', symbol: 'Ca' })
    expect(nodes[1]).toMatchObject({ type: 'group', source: 'OH', subscript: '2' })
  })

  it('parses square-bracket complexes with a charge', () => {
    const nodes = parseFormula('[Cu(NH3)4]2+')
    // The trailing `2` is the complex charge; the `4` inside is NH₃'s subscript.
    expect(nodes[0]).toMatchObject({ type: 'group', source: 'Cu(NH3)4', charge: { sign: '+', magnitude: '2' } })
    expect(nodes[0]).not.toHaveProperty('subscript')
  })

  it('separates a subscript from a following charge in compact notation', () => {
    // SO₄²⁻ written compactly as SO42-
    expect(parseFormula('SO42-')).toEqual([
      { type: 'element', symbol: 'S' },
      { type: 'element', symbol: 'O', subscript: '4' },
      { type: 'charge', sign: '-', magnitude: '2' },
    ])
    // Ca²⁺ has no subscript at all.
    expect(parseFormula('Ca2+')).toEqual([
      { type: 'element', symbol: 'Ca' },
      { type: 'charge', sign: '+', magnitude: '2' },
    ])
  })

  it('parses hydrate dots', () => {
    const nodes = parseFormula('CuSO4·5H2O')
    expect(nodes.some((node) => node.type === 'literal' && node.value.includes('·'))).toBe(true)
  })

  it('parses a trailing charge written as 2-', () => {
    const nodes = parseFormula('SO4 2-')
    expect(nodes.at(-1)).toEqual({ type: 'charge', sign: '-', magnitude: '2' })
  })

  it('parses an explicit caret charge', () => {
    expect(parseFormula('SO4^2-')).toEqual([
      { type: 'element', symbol: 'S' },
      { type: 'element', symbol: 'O', subscript: '4' },
      { type: 'charge', sign: '-', magnitude: '2' },
    ])
  })

  it('keeps a plus sign between species as a literal operator', () => {
    const nodes = parseFormula('CaO + CO2')
    expect(nodes.filter((node) => node.type === 'literal')).toHaveLength(3)
  })

  it('always terminates, even on unusual input', () => {
    for (const input of ['((', '))', '[', '^', '2', 'H2O(?)', '']) {
      expect(() => parseFormula(input)).not.toThrow()
    }
  })
})

describe('formulaToUnicode — compact labels', () => {
  it('converts subscripts for non-DOM contexts', () => {
    expect(formulaToUnicode('H2O')).toBe('H₂O')
    expect(formulaToUnicode('CaCO3')).toBe('CaCO₃')
    expect(formulaToUnicode('Ca(OH)2')).toBe('Ca(OH)₂')
  })

  it('renders charges magnitude-then-sign inside a formula', () => {
    expect(formulaToUnicode('SO42-')).toBe('SO₄²⁻')
  })
})

describe('script helpers', () => {
  it('maps digits to subscripts and superscripts', () => {
    expect(toSubscript('1234567890')).toBe('₁₂₃₄₅₆₇₈₉₀')
    expect(toSuperscript('2-')).toBe('²⁻')
    expect(toSubscript('l')).toBe('l')
  })
})

describe('number and unit formatting', () => {
  it('keeps the precision the author wrote', () => {
    expect(formatNumber('1.50')).toBe('1.50')
    expect(formatNumber(5)).toBe('5')
    expect(formatNumber(9.8)).toBe('9.8')
    expect(formatNumber(9.8, { precision: 2 })).toBe('9.80')
  })

  it('formats with explicit options', () => {
    expect(formatNumber(9.80665, { precision: 2 })).toBe('9.81')
    expect(formatNumber(7, { padIntegerTo: 2 })).toBe('07')
    expect(formatNumber(12345, { group: true })).toBe('12,345')
  })

  it('passes through non-numeric input instead of zeroing it', () => {
    expect(formatNumber('—')).toBe('—')
  })

  it('splits an exponent for scientific notation', () => {
    expect(splitExponent('23')).toEqual({ base: '10', power: '23' })
    expect(splitExponent(-3)).toEqual({ base: '10', power: '-3' })
  })

  it('converts superscript units to plain text where markup is impossible', () => {
    expect(unitToPlainText('m/s²')).toBe('m/s^2')
    expect(unitToPlainText('kg')).toBe('kg')
  })
})
