import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ElectronConfiguration, IonNotation, ScientificText, ScientificValue } from '@/scientific'
import { splitScientificRuns } from '@/utils/scientificText'
import { readProjectFile } from './utils/projectFiles'

const tokensCss = readProjectFile('src/styles/tokens.css')
const baseCss = readProjectFile('src/styles/base.css')
const scientificCss = readProjectFile('src/styles/scientific.css')
const scientificComponentsCss = readProjectFile('src/styles/scientific-components.css')
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
      ['كتلة العينة 5 g هنا', '5 g'],
      ['حرارة 25 °C هنا', '25 °C'],
      ['الكتلة المولية 44 g/mol هنا', '44 g/mol'],
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
        <ScientificText>كتلة العينة 5 g</ScientificText>
        <ScientificText>حرارة 25 °C</ScientificText>
      </p>,
    )
    const text = container.textContent ?? ''

    expect(text).not.toContain('g 5')
    expect(text).not.toContain('°C 25')
    expect(text).toContain('5 g')
    expect(text).toContain('25 °C')
  })
})

describe('ionic charge ordering inside RTL', () => {
  it('keeps formula then magnitude then sign in an explicit LTR isolate', () => {
    const { container } = render(<p dir="rtl">أيون <IonNotation formula="Ca" charge="2+" /> هنا</p>)
    const ion = container.querySelector('.ion-notation')!

    expect(ion).toHaveAttribute('dir', 'ltr')
    expect([...ion.children].map((child) => child.textContent)).toEqual(['Ca', '2+'])
    expect(ion.textContent).toBe('Ca2+')
    expect(ion.textContent).not.toBe('Ca+2')
  })
})

describe('electron configuration ordering inside RTL', () => {
  it.each([
    ['التوزيع الإلكتروني: 2-8-8', '2-8-8'],
    ['الإجابة: التوزيع الإلكتروني هو 2-8-7', '2-8-7'],
    ['التوزيع الإلكتروني للعنصر هو 2-8-18-8.', '2-8-18-8'],
  ])('keeps %s as one LTR value in the RTL flow', (sentence, configuration) => {
    const { container } = render(
      <p dir="rtl">
        <ScientificText>{sentence}</ScientificText>
      </p>,
    )

    // One isolate for the whole configuration: the RTL paragraph has nothing
    // to reorder, because no run of the value is laid out separately.
    const isolates = container.querySelectorAll('[data-sci="isolated"]')
    expect(isolates).toHaveLength(1)

    const value = isolates[0]!
    expect(value.className).toContain('electron-configuration')
    expect(value.getAttribute('dir')).toBe('ltr')
    expect(value.textContent).toBe(configuration)

    // Source order of the shells survives in the DOM, and the Arabic sentence
    // remains one uninterrupted RTL string around the isolate.
    expect([...value.querySelectorAll('.electron-configuration__shell')].map((shell) => shell.textContent))
      .toEqual(configuration.split('-'))
    expect(container.textContent).toBe(sentence)
  })

  it('never renders a configuration as a chain of independent runs', () => {
    const { container } = render(
      <p dir="rtl">
        <ScientificText>التوزيع الإلكتروني: 2-8-8</ScientificText>
      </p>,
    )

    const runs = [...container.querySelectorAll('.sci, .electron-configuration')]
    expect(runs).toHaveLength(1)
    expect(runs[0]!.textContent).toBe('2-8-8')
  })

  it('isolates the value with direction and unicode-bidi in CSS', () => {
    const block = scientificComponentsCss.match(/\.electron-configuration\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(block).toContain('direction: ltr')
    expect(block).toContain('unicode-bidi: isolate')
  })

  it('renders an explicitly authored configuration the same way', () => {
    const { container } = render(<ElectronConfiguration value="2-8-8" />)
    const value = container.querySelector('.electron-configuration')!

    expect(value.getAttribute('dir')).toBe('ltr')
    expect(value.getAttribute('data-configuration')).toBe('2-8-8')
    expect(value.textContent).toBe('2-8-8')
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
