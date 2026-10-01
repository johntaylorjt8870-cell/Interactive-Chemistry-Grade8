import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ScientificText, ScientificValue } from '@/scientific'
import { splitScientificRuns } from '@/utils/scientificText'
import { readProjectFile } from './utils/projectFiles'

const tokensCss = readProjectFile('src/styles/tokens.css')
const baseCss = readProjectFile('src/styles/base.css')
const scientificCss = readProjectFile('src/styles/scientific.css')
const indexHtml = readProjectFile('index.html')

describe('document direction', () => {
  it('declares Arabic RTL on the document element', () => {
    expect(indexHtml).toContain('lang="ar"')
    expect(indexHtml).toContain('dir="rtl"')
  })

  it('does not force the whole document to LTR', () => {
    expect(indexHtml).not.toContain('dir="ltr"')
    expect(baseCss).not.toMatch(/body\s*\{[^}]*direction:\s*ltr/s)
  })
})

describe('isolation contract in CSS', () => {
  it('isolates scientific runs with both direction and unicode-bidi', () => {
    const block = scientificCss.match(/\.sci\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(block).toContain('direction: ltr')
    expect(block).toContain('unicode-bidi: isolate')
  })

  it('provides an RTL escape hatch for Arabic inside isolated runs', () => {
    expect(scientificCss).toMatch(/\.rtl\s*\{[^}]*direction:\s*rtl/s)
    expect(scientificCss).toMatch(/\.rtl\s*\{[^}]*unicode-bidi:\s*isolate/s)
  })

  it('keeps scientific values in tabular Latin figures', () => {
    const block = scientificCss.match(/\.sci-value\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(block).toContain('tabular-nums')
    expect(block).toContain('direction: ltr')
  })
})

describe('unit ordering inside Arabic prose', () => {
  it('accepts the three canonical measurement cases without reordering', () => {
    const cases: Array<[string, string]> = [
      ['كتلة 5 kg هنا', '5 kg'],
      ['حرارة 25 °C هنا', '25 °C'],
      ['تسارع 9.8 m/s² هنا', '9.8 m/s²'],
    ]

    for (const [input, expected] of cases) {
      const runs = splitScientificRuns(input)
      const science = runs.find((run) => run.kind === 'science')
      expect(science?.value).toBe(expected)
    }
  })

  it('renders the value before the unit in the DOM, in an LTR isolate', () => {
    const { container } = render(<ScientificValue value={25} unit="°C" />)
    const value = container.querySelector('.sci-value')!

    expect([...value.children].map((child) => child.textContent)).toEqual(['25', '°C'])
    expect(value.getAttribute('dir')).toBe('ltr')
  })

  it('never produces the reversed forms in rendered output', () => {
    const { container } = render(
      <p>
        <ScientificText>كتلة 5 kg</ScientificText>
        <ScientificText>حرارة 25 °C</ScientificText>
      </p>,
    )
    const text = container.textContent ?? ''

    expect(text).not.toContain('kg 5')
    expect(text).not.toContain('°C 25')
    expect(text).toContain('5 kg')
    expect(text).toContain('25 °C')
  })
})

describe('Arabic typography contract', () => {
  it('uses a high-quality Arabic font stack with a Latin override for science', () => {
    expect(tokensCss).toContain('--font-arabic')
    expect(tokensCss).toContain('Noto Sans Arabic')
    expect(tokensCss).toContain('--font-latin')
    expect(tokensCss).toContain('Inter')
  })

  it('gives Arabic body copy a comfortable line height', () => {
    const block = baseCss.match(/body\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(block).toContain('font-family: var(--font-arabic)')
  })
})
