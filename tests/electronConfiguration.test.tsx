import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  ElectronConfiguration,
  IonNotation,
  ScientificNotationText,
  ScientificTable,
  ScientificText,
} from '@/scientific'
import {
  containsScientificRun,
  isElectronConfiguration,
  parseElectronConfiguration,
  splitScientificRuns,
} from '@/utils/scientificText'
import { readProjectFile } from './utils/projectFiles'

/* ============================================================================
   Electron configuration RTL/BIDI regression coverage.

   The source value is always correct (`2-8-8`); the failure mode is rendering,
   so these tests assert the *structure* the browser lays out: one isolated LTR
   element per configuration, with Arabic prose left untouched around it.
   ========================================================================= */

/** Unicode bidi control characters must never be needed in educational text. */
const BIDI_CONTROLS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/u

/** Every configuration named in the task requirements. */
const REQUIRED_CONFIGURATIONS = ['2-8-8', '2-8-1', '2-8-7', '2-8-8-1', '2-8-18-7', '2-8-18-8']

/** Canonical Arabic RTL contexts from the requirements. */
const RTL_CONTEXTS = [
  'التوزيع الإلكتروني: 2-8-8',
  'الإجابة: التوزيع الإلكتروني هو 2-8-7',
  'التوزيع الإلكتروني للعنصر هو 2-8-18-8.',
]

function walkSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walkSourceFiles(path, files)
    else if (/\.tsx?$/.test(entry)) files.push(path)
  }
  return files
}

/**
 * Every electron configuration that actually exists in the project, read from
 * the current curriculum and simulation sources. Nothing is invented here.
 */
function projectConfigurations(): string[] {
  const found = new Set<string>()
  for (const file of walkSourceFiles('src')) {
    for (const match of readFileSync(file, 'utf8').matchAll(/\d+(?:-\d+)+/gu)) {
      if (isElectronConfiguration(match[0])) found.add(match[0])
    }
  }
  return [...found].sort()
}

describe('splitScientificRuns — one run per electron configuration', () => {
  it.each(REQUIRED_CONFIGURATIONS)('keeps %s as a single scientific run', (value) => {
    const runs = splitScientificRuns(value)

    expect(runs).toEqual([
      { kind: 'science', value, notation: 'electron-configuration' },
    ])
  })

  it('no longer splits 2-8-8 into 2, -8, -8', () => {
    const runs = splitScientificRuns('2-8-8')
    const science = runs.filter((run) => run.kind === 'science')

    expect(science).toHaveLength(1)
    expect(science[0]!.value).toBe('2-8-8')
    expect(runs.some((run) => run.value === '-8')).toBe(false)
  })

  it('preserves the logical value exactly, with no control characters', () => {
    for (const value of [...REQUIRED_CONFIGURATIONS, ...projectConfigurations()]) {
      expect(value).not.toMatch(BIDI_CONTROLS)
      expect(splitScientificRuns(value).map((run) => run.value).join('')).toBe(value)
    }
  })

  it.each(RTL_CONTEXTS)('keeps Arabic prose intact around the configuration in %s', (input) => {
    const runs = splitScientificRuns(input)
    const science = runs.filter((run) => run.kind === 'science')

    expect(science).toHaveLength(1)
    expect(science[0]!.notation).toBe('electron-configuration')
    expect(runs.map((run) => run.value).join('')).toBe(input)
    expect(containsScientificRun(input)).toBe(true)
    expect(input).not.toMatch(BIDI_CONTROLS)
    // The prose runs that remain are pure Arabic, never config fragments.
    for (const run of runs.filter((item) => item.kind === 'prose')) {
      expect(run.value).not.toMatch(/\d/u)
    }
  })

  it('reads shell occupancies in textbook order', () => {
    expect(parseElectronConfiguration('2-8-8')?.shells).toEqual(['2', '8', '8'])
    expect(parseElectronConfiguration('2-8-18-7')?.shells).toEqual(['2', '8', '18', '7'])
    expect(parseElectronConfiguration('2-8-8')?.tokens.map((token) => token.value).join('')).toBe('2-8-8')
  })

  it('does not label an unrelated hyphen-joined number as a distribution', () => {
    // A figure reference such as `4-2` is still one LTR run, but 4 cannot be a
    // first shell occupancy (2n²), so it is never labelled as a configuration.
    expect(parseElectronConfiguration('4-2')).toBeNull()
    expect(isElectronConfiguration('4-2')).toBe(false)
    expect(splitScientificRuns('شكل 4-2')).toEqual([
      { kind: 'prose', value: 'شكل ' },
      { kind: 'science', value: '4-2' },
    ])
  })

  it('still splits ordinary prose and measurements exactly as before', () => {
    expect(splitScientificRuns('كتلة العينة 5 g تقريباً')).toEqual([
      { kind: 'prose', value: 'كتلة العينة ' },
      { kind: 'science', value: '5 g' },
      { kind: 'prose', value: ' تقريباً' },
    ])
  })
})

describe('ElectronConfiguration — one isolated LTR scientific value', () => {
  it.each(REQUIRED_CONFIGURATIONS)('renders %s as one LTR isolate', (value) => {
    const { container } = render(<ElectronConfiguration value={value} />)
    const config = container.querySelector('.electron-configuration')!

    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config).toHaveAttribute('data-sci', 'isolated')
    expect(config).toHaveAttribute('data-configuration', value)
    expect(config.textContent).toBe(value)
    // Exactly one isolate element for the value — never a chain of runs.
    expect(container.querySelectorAll('[data-sci="isolated"]')).toHaveLength(1)
  })

  it('keeps shell counts and separators in source order', () => {
    const { container } = render(<ElectronConfiguration value="2-8-18-8" />)
    const parts = [...container.querySelectorAll('.electron-configuration > *')].map((part) => ({
      className: part.className,
      value: part.textContent,
    }))

    expect(parts).toEqual([
      { className: 'electron-configuration__shell', value: '2' },
      { className: 'electron-configuration__separator', value: '-' },
      { className: 'electron-configuration__shell', value: '8' },
      { className: 'electron-configuration__separator', value: '-' },
      { className: 'electron-configuration__shell', value: '18' },
      { className: 'electron-configuration__separator', value: '-' },
      { className: 'electron-configuration__shell', value: '8' },
    ])
  })

  it('never reverses the value in the rendered markup', () => {
    const { container } = render(<ElectronConfiguration value="2-8-8" />)
    const text = container.textContent ?? ''

    expect(text).toBe('2-8-8')
    expect(text).not.toBe('8-8-2')
    expect(container.innerHTML).not.toMatch(BIDI_CONTROLS)
  })
})

describe('electron configurations inside Arabic RTL prose', () => {
  it.each(RTL_CONTEXTS)('renders exactly one isolated configuration in %s', (sentence) => {
    const { container } = render(
      <p dir="rtl">
        <ScientificText>{sentence}</ScientificText>
      </p>,
    )
    const isolates = container.querySelectorAll('[data-sci="isolated"]')
    const config = container.querySelector('.electron-configuration')!

    expect(isolates).toHaveLength(1)
    expect(config).toBe(isolates[0])
    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config.textContent).toBe(
      sentence.match(/\d+(?:-\d+)+/)![0],
    )
    // The Arabic sentence stays exactly as authored, in the same element.
    expect(container.textContent).toBe(sentence)
    // The configuration sits between two Arabic prose siblings (RTL context).
    expect(config.previousSibling?.textContent).toMatch(/[\u0600-\u06FF]/u)
    expect(config.nextSibling?.textContent ?? '').toMatch(/^[\s.،؛]*$/u)
  })

  it('keeps the Arabic sentence outside the isolate, not inside it', () => {
    const { container } = render(
      <ScientificText>{'التوزيع الإلكتروني للعنصر هو 2-8-18-8.'}</ScientificText>,
    )
    const isolate = container.querySelector('[data-sci="isolated"]')!

    expect(isolate.textContent).toBe('2-8-18-8')
    expect(isolate.previousSibling?.textContent).toBe('التوزيع الإلكتروني للعنصر هو ')
    expect(isolate.nextSibling?.textContent).toBe('.')
  })

  it('isolates every configuration that exists in the project sources', () => {
    const configurations = projectConfigurations()

    // The project really does contain configurations — the scan is not vacuous.
    expect(configurations).toContain('2-8-8')
    expect(configurations).toContain('2-8-8-1')
    expect(configurations.length).toBeGreaterThanOrEqual(10)

    for (const value of configurations) {
      const { container, unmount } = render(
        <p dir="rtl">
          <ScientificText>{`التوزع الإلكتروني ${value} للذرة.`}</ScientificText>
        </p>,
      )
      const isolates = container.querySelectorAll('[data-sci="isolated"]')

      expect(isolates, value).toHaveLength(1)
      expect(isolates[0]!.textContent, value).toBe(value)
      expect(isolates[0]!.getAttribute('dir'), value).toBe('ltr')
      expect(container.textContent, value).toBe(`التوزع الإلكتروني ${value} للذرة.`)
      unmount()
    }
  })

  it('keeps the surrounding prose run free of any configuration fragment', () => {
    const runs = splitScientificRuns('التوزيع الإلكتروني: 2-8-8')
    const prose = runs.filter((run) => run.kind === 'prose').map((run) => run.value).join('')

    expect(prose).toBe('التوزيع الإلكتروني: ')
  })
})

describe('configurations rendered outside prose paragraphs', () => {
  it('isolates a configuration cell in the lesson table', () => {
    const { container } = render(
      <ScientificTable
        caption="عناصر جدول لويس في الكتاب"
        columns={[{ key: 'symbol', header: 'الرمز', rowHeader: true }, { key: 'distribution', header: 'التوزع الإلكتروني' }]}
        rows={[{ id: 'li', cells: { symbol: 'Li', distribution: <ElectronConfiguration value="2-1" size="sm" /> } }]}
      />,
    )
    const config = container.querySelector('.electron-configuration')!

    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config.textContent).toBe('2-1')
    expect(config.className).toContain('electron-configuration--sm')
  })

  it('renders the simulation read-out through the shared component', async () => {
    const { default: ElectronShellBuilder } = await import('@/simulations/ElectronShellBuilder')
    const { container } = render(<ElectronShellBuilder interactiveId="electron-shell-builder" reducedMotion />)
    const config = container.querySelector('.electron-configuration')!

    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config).toHaveAttribute('data-configuration', '2-8-1')
    expect(config.textContent).toBe('2-8-1')
  })

  it('renders the neutral-atom distribution in the ion lab through the shared component', async () => {
    const { default: IonFormationLab } = await import('@/simulations/IonFormationLab')
    const { container } = render(<IonFormationLab interactiveId="ion-formation-lab" reducedMotion />)
    const config = container.querySelector('.electron-configuration')!

    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config.textContent).toBe('2-8-8-1')
  })
})

describe('content fidelity', () => {
  it('keeps the textbook spellings untouched in the curriculum source', () => {
    const lesson = readProjectFile('src/data/curriculum/chemistryLesson1.ts')

    // Verbatim textbook values, never rewritten or reordered.
    const tokens = [...lesson.matchAll(/\d+(?:-\d+)+/gu)].map((match) => match[0])
    expect(tokens).toContain('2-8-8')
    expect(tokens).toContain('2-8-8-1')
    expect(tokens).toContain('2-8-8-2')
    expect(tokens).toContain('2-8-6')
    expect(tokens).not.toContain('8-8-2')
    expect(tokens).not.toContain('1-8-8-2')
    expect(lesson).not.toMatch(BIDI_CONTROLS)
  })

  it('contains no bidi control characters anywhere in the lesson content', () => {
    for (const file of walkSourceFiles('src/data')) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(BIDI_CONTROLS)
    }
  })
})

describe('the existing ion rendering is preserved', () => {
  it.each([
    ['K⁺ — التوزع قبل الفقد 2-8-8-1', 'K+', '2-8-8-1'],
    ['Ca²⁺ — التوزع قبل الفقد 2-8-8-2', 'Ca2+', '2-8-8-2'],
    ['O²⁻ — التوزع قبل الاكتساب 2-6', 'O2−', '2-6'],
    ['SO₄²⁻ في المحلول 2-8-8-2', 'SO42−', '2-8-8-2'],
  ])('renders both the ion and the configuration in %s', (caption, ionLabel, configuration) => {
    const { container } = render(
      <p dir="rtl">
        <ScientificNotationText>{caption}</ScientificNotationText>
      </p>,
    )
    const ion = container.querySelector('.ion-notation')!
    const config = container.querySelector('.electron-configuration')!

    // Ion: unchanged from PR #2 — body then magnitude-sign charge, LTR.
    expect(ion).toHaveAttribute('dir', 'ltr')
    expect(ion).toHaveAttribute('data-ion', ionLabel)
    expect(ion.querySelector('.ion-notation__charge-run')).toHaveAttribute('dir', 'ltr')

    // Configuration: one isolate, value untouched.
    expect(config).toHaveAttribute('dir', 'ltr')
    expect(config.textContent).toBe(configuration)
    expect(container.querySelectorAll('[data-sci="isolated"]')).toHaveLength(1)
  })

  it.each([
    ['Ca²⁺', 'Ca'],
    ['Ca²⁻', 'Ca'],
    ['O²⁻', 'O'],
    ['SO₄²⁻', 'SO4'],
  ])('still promotes compact %s to structured ion DOM', (compact, formula) => {
    const { container } = render(
      <p dir="rtl">
        <ScientificNotationText>{`${compact} أيون`}</ScientificNotationText>
      </p>,
    )
    const ion = container.querySelector('.ion-notation')!

    expect(ion).toHaveAttribute('dir', 'ltr')
    expect(ion.getAttribute('data-ion')?.startsWith(formula)).toBe(true)
    expect(container.querySelector('.electron-configuration')).toBeNull()
  })

  it('renders an explicitly authored ion unchanged', () => {
    const { container } = render(<IonNotation formula="Ca" charge="2+" />)
    const ion = container.querySelector('.ion-notation')!

    expect(ion).toHaveAttribute('dir', 'ltr')
    expect([...ion.children].map((child) => child.textContent)).toEqual(['Ca', '2+'])
  })
})

describe('bidi isolation contract in CSS', () => {
  const componentsCss = readProjectFile('src/styles/scientific-components.css')

  it('declares direction and unicode-bidi on the configuration isolate', () => {
    const block = componentsCss.match(/\.electron-configuration\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(block).toContain('direction: ltr')
    expect(block).toContain('unicode-bidi: isolate')
  })

  it('lays the value out as a row so children cannot be reordered', () => {
    const block = componentsCss.match(/\.electron-configuration\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(block).toContain('display: inline-flex')
    expect(block).toMatch(/white-space:\s*nowrap/)
  })

  it('never positions the value with offsets or transforms', () => {
    const block = componentsCss.match(/\.electron-configuration\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(block).not.toMatch(/position:\s*absolute/)
    expect(block).not.toMatch(/transform:/)
    expect(block).not.toMatch(/margin-inline-start:\s*-/)
  })
})
