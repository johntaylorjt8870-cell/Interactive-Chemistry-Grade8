import { describe, expect, it } from 'vitest'
import {
  chargeGlyph,
  containsScientificRun,
  formulaToUnicode,
  isElectronConfiguration,
  normalizeCharge,
  parseElectronConfiguration,
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

describe('physics notation stays one logical run (vectors and printed equations)', () => {
  it('keeps a vector symbol with its combining arrow inside one isolate', () => {
    const runs = splitScientificRuns('وليكن الشعاع OM⃗ .')
    expect(runs).toEqual([
      { kind: 'prose', value: 'وليكن الشعاع ' },
      { kind: 'science', value: 'OM⃗' },
      { kind: 'prose', value: ' .' },
    ])
  })

  it('keeps subscripted force symbols intact', () => {
    const sciences = splitScientificRuns('يمثّلان المركّبتين F₁⃗ ، F₂⃗ .').filter((run) => run.kind === 'science')
    expect(sciences.map((run) => run.value)).toEqual(['F₁⃗', 'F₂⃗'])
  })

  it('keeps the printed graphical-scale equation one run', () => {
    expect(splitScientificRuns('حسب مقياس الرسم: F = 6 × 1 = 6 N').find((run) => run.kind === 'science')?.value).toBe('F = 6 × 1 = 6 N')
  })

  it('keeps the printed Pythagoras equation one run', () => {
    const value = splitScientificRuns('تُحسب من العلاقة: F = √(F₁² + F₂²) أو من الرسم.').find((run) => run.kind === 'science')?.value
    expect(value).toBe('F = √(F₁² + F₂²)')
  })

  it('isolates angles and scale values with their units', () => {
    const runs = splitScientificRuns('زاوية 60° ومقياس 1cm يمثل 1N')
    const sciences = runs.filter((run) => run.kind === 'science').map((run) => run.value)
    expect(sciences).toEqual(['60°', '1cm', '1N'])
  })

  it('never swallows Arabic prose that follows an equation', () => {
    const runs = splitScientificRuns('الشدّة: F = 100 N ويمكن أن نحسب')
    expect(runs[0]).toEqual({ kind: 'prose', value: 'الشدّة: ' })
    expect(runs[1]).toEqual({ kind: 'science', value: 'F = 100 N' })
    expect(runs[2]).toEqual({ kind: 'prose', value: ' ويمكن أن نحسب' })
  })
})

describe('electron configurations stay one logical run', () => {
  it.each(['2-8-8', '2-8-1', '2-8-7', '2-8-8-1', '2-8-18-7', '2-8-18-8'])(
    'matches %s as a single scientific run',
    (value) => {
      expect(splitScientificRuns(value)).toEqual([
        { kind: 'science', value, notation: 'electron-configuration' },
      ])
      expect(containsScientificRun(value)).toBe(true)
    },
  )

  it('does not produce 2, -8, -8 fragments', () => {
    const values = splitScientificRuns('2-8-8').map((run) => run.value)

    expect(values).toEqual(['2-8-8'])
    expect(values).not.toContain('-8')
  })

  it('keeps the configuration in one run inside an Arabic sentence', () => {
    const runs = splitScientificRuns('التوزيع الإلكتروني: 2-8-8')

    expect(runs).toEqual([
      { kind: 'prose', value: 'التوزيع الإلكتروني: ' },
      { kind: 'science', value: '2-8-8', notation: 'electron-configuration' },
    ])
  })

  it('parses shells in source order and keeps the tokens verbatim', () => {
    const parsed = parseElectronConfiguration('2-8-18-8')

    expect(parsed?.shells).toEqual(['2', '8', '18', '8'])
    expect(parsed?.value).toBe('2-8-18-8')
    expect(parsed?.tokens.map((token) => token.value).join('')).toBe('2-8-18-8')
  })

  it('accepts the typographic minus as a separator without rewriting it', () => {
    const parsed = parseElectronConfiguration('2\u22128')

    expect(parsed?.shells).toEqual(['2', '8'])
    expect(parsed?.tokens.map((token) => token.value).join('')).toBe('2\u22128')
  })

  it('rejects values that cannot be shell occupancies', () => {
    // 4 and 3 exceed the first shell capacity (2n² = 2), and 40 cannot sit in
    // the third shell (2n² = 18). Their rendering is still one LTR run.
    for (const value of ['4-2', '0-9', '3-1', '2-8-40', '2-18', '9-1']) {
      expect(isElectronConfiguration(value), value).toBe(false)
    }
    expect(isElectronConfiguration('2-8')).toBe(true)
  })

  it('still isolates non-configuration number sequences as one run', () => {
    expect(splitScientificRuns('انظر شكل 4-2 هنا')).toEqual([
      { kind: 'prose', value: 'انظر شكل ' },
      { kind: 'science', value: '4-2' },
      { kind: 'prose', value: ' هنا' },
    ])
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
