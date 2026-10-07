/**
 * Every valid charge spelling must reach the DOM as a REAL superscript, on
 * every surface, in every authored spelling.
 *
 * Why this suite exists: the notation layer was correct for the spellings a
 * component happened to recognise, but two gaps kept charges on the baseline —
 *
 *  1. glyph alphabet — `Ca²⁺` (Unicode superscript) and `NH₄⁺` (Unicode
 *     subscript + sign) were not understood by the formula parser, so they fell
 *     through as literal characters;
 *  2. coverage — several surfaces rendered content strings as plain text, so no
 *     renderer ever saw them (teacher rubric and matching lists, the student
 *     rubric, and two lab captions).
 *
 * The suite therefore asserts both halves: the parser/renderer contract on the
 * exact spellings the platform authors (`^` caret, ASCII, Unicode), and a
 * rendered-DOM audit proving no charge glyph survives outside a script element
 * anywhere in the app.
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChargeNotation, ChemicalFormula, IonNotation, ScientificNotationText, ScientificText } from '@/scientific'
import { splitScientificRuns } from '@/utils/scientificText'
import { ThemeProvider } from '@/app/theme'
import { AppRoutes } from '@/app/router'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { TeacherSection } from '@/teacher/TeacherSection'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TEACHER_LESSONS } from '@/teacher/teacherContent'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { chemistryLesson2 } from '@/data/curriculum/chemistryLesson2'
import { chemistryLesson3 } from '@/data/curriculum/chemistryLesson3'
import BohrEnergyTransition from '@/simulations/BohrEnergyTransition'
import IonFormationLab from '@/simulations/IonFormationLab'
import RutherfordScattering from '@/simulations/RutherfordScattering'
import ElectronShellBuilder from '@/simulations/ElectronShellBuilder'
import IsotopeLab from '@/simulations/IsotopeLab'
import IonicBondingLab from '@/simulations/IonicBondingLab'
import CovalentBondLab from '@/simulations/CovalentBondLab'
import ValenceModelLab from '@/simulations/ValenceModelLab'
import IonEquationLab from '@/simulations/IonEquationLab'
import FormulaBuilderLab from '@/simulations/FormulaBuilderLab'
import type { InteractiveProps } from '@/simulations/registry'
import { readProjectFile } from './utils/projectFiles'
import '@/data/testArea/register'

/* ---------------------------------------------------------------------------
 * The contract table: the same charge, authored three ways.
 * `sup` is the charge that must appear inside a single <sup>;
 * `sub` is the index that must appear inside a single <sub>.
 * ------------------------------------------------------------------------ */

type ChargeCase = {
  /** Textbook spelling used in prose (`H⁺`). */
  unicode: string
  /** ASCII spelling used in compact data (`H+`). */
  ascii: string
  /** Caret spelling used by the simulations (`H^+`). */
  caret: string
  /** Element symbols of the species, in source order. */
  body: string
  /** The charge that must sit inside one <sup>. */
  sup: string
  /** The index that must sit inside one <sub>, when the species has one. */
  sub?: string
  /** The coefficient stays on the baseline. */
  coefficient?: string
}

const CHARGE_CASES: ChargeCase[] = [
  { unicode: 'H⁺', ascii: 'H+', caret: 'H^+', body: 'H', sup: '+' },
  { unicode: '2H⁺', ascii: '2H+', caret: '2H^+', body: 'H', sup: '+', coefficient: '2' },
  { unicode: '3H⁺', ascii: '3H+', caret: '3H^+', body: 'H', sup: '+', coefficient: '3' },
  { unicode: 'Na⁺', ascii: 'Na+', caret: 'Na^+', body: 'Na', sup: '+' },
  { unicode: 'Cl⁻', ascii: 'Cl-', caret: 'Cl^-', body: 'Cl', sup: '\u2212' },
  { unicode: 'OH⁻', ascii: 'OH-', caret: 'OH^-', body: 'OH', sup: '\u2212' },
  { unicode: 'NH₄⁺', ascii: 'NH4+', caret: 'NH4^+', body: 'NH', sup: '+', sub: '4' },
  { unicode: 'Ca²⁺', ascii: 'Ca2+', caret: 'Ca^2+', body: 'Ca', sup: '2+' },
  { unicode: 'O²⁻', ascii: 'O2-', caret: 'O^2-', body: 'O', sup: '2\u2212' },
  { unicode: 'Al³⁺', ascii: 'Al3+', caret: 'Al^3+', body: 'Al', sup: '3+' },
  { unicode: 'SO₄²⁻', ascii: 'SO42-', caret: 'SO4^2-', body: 'SO', sup: '2\u2212', sub: '4' },
  { unicode: 'NO₃⁻', ascii: 'NO3-', caret: 'NO3^-', body: 'NO', sup: '\u2212', sub: '3' },
  { unicode: 'PO₄³⁻', ascii: 'PO43-', caret: 'PO4^3-', body: 'PO', sup: '3\u2212', sub: '4' },
  { unicode: 'e⁻', ascii: 'e-', caret: 'e^-', body: 'e', sup: '\u2212' },
  { unicode: '2e⁻', ascii: '2e-', caret: '2e^-', body: 'e', sup: '\u2212', coefficient: '2' },
]

/** Charge glyphs that must never be left as bare text. */
const CHARGE_GLYPH = /[\u207A\u207B]/

/**
 * A charge on the baseline: a species immediately followed by a sign, where the
 * sign is NOT inside a script element. The species/sign pair is required to be
 * adjacent (no space), which is how chemistry is written and what keeps
 * parenthesised mathematics such as `(+3)(2) + (−2)(3) = 0` out of the audit.
 */
const BASELINE_CHARGE = /(?:[A-Za-z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*|\])[+\-\u2212\u207A\u207B]/

/**
 * Text nodes holding a charge sign outside a script element. Superscript
 * exponents in units (`mol⁻¹`) are not charges: their sign is followed by a
 * digit, so they are excluded.
 */
function baselineCharges(container: HTMLElement): string[] {
  const found: string[] = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const parent = node.parentElement
    const text = node.textContent ?? ''
    if (
      parent &&
      BASELINE_CHARGE.test(text) &&
      !/[\u207A\u207B][\u2070\u00B9\u00B2\u00B3\u2074-\u2079]/.test(text) &&
      !parent.closest('sup, sub, [data-math], .katex, script, style')
    ) {
      found.push(`"${text.trim().slice(0, 110)}" in <${parent.tagName.toLowerCase()}>`)
    }
    node = walker.nextNode()
  }
  return found
}

/** Asserts the rendered charge is one <sup> containing exactly `sup`. */
function expectSuperscriptCharge(container: HTMLElement, sup: string, label: string) {
  const sups = [...container.querySelectorAll('sup')]
  expect(sups.map((element) => element.textContent), label).toContain(sup)
  expect(baselineCharges(container), label).toEqual([])
}

describe('charge notation — every authored spelling becomes a real superscript', () => {
  it('parses the whole charge table through <ChemicalFormula />', () => {
    for (const testCase of CHARGE_CASES) {
      for (const source of [testCase.unicode, testCase.ascii, testCase.caret]) {
        const { container, unmount } = render(
          <div dir="rtl">
            <ChemicalFormula formula={source} />
          </div>,
        )

        expectSuperscriptCharge(container, testCase.sup, `${testCase.unicode} as "${source}"`)

        const subscripts = [...container.querySelectorAll('sub')].map((element) => element.textContent)
        expect(subscripts, `${source} subscript`).toEqual(testCase.sub ? [testCase.sub] : [])

        // The coefficient is a normal-size baseline run, never part of the charge.
        const coefficient = container.querySelector('.chem-formula__literal')
        if (testCase.coefficient) {
          expect(coefficient?.textContent, `${source} coefficient`).toBe(testCase.coefficient)
        }

        unmount()
      }
    }
  })

  it('parses the charge table through the prose splitter as ONE run', () => {
    // Prose is authored with Unicode glyphs; the splitter must claim the whole
    // species so the sign can never be reordered away from its symbol.
    for (const testCase of ['H⁺', 'Na⁺', 'Cl⁻', 'OH⁻', 'NH₄⁺', 'Ca²⁺', 'O²⁻', 'Al³⁺', 'SO₄²⁻', 'NO₃⁻', 'PO₄³⁻', 'e⁻', '2e⁻']) {
      const runs = splitScientificRuns(testCase)

      expect(runs, testCase).toHaveLength(1)
      expect(runs[0]).toMatchObject({ kind: 'science', value: testCase, notation: 'charge' })
    }
  })

  it('renders the charge table inside Arabic prose with no baseline sign', () => {
    for (const [index, testCase] of CHARGE_CASES.entries()) {
      if (testCase.coefficient) continue // `2H⁺` is a coefficient form, tested below
      const sentence = `الأيون ${testCase.unicode} في المحلول`
      const { container, unmount } = render(
        <p dir="rtl">
          <ScientificNotationText>{sentence}</ScientificNotationText>
        </p>,
      )

      const species = container.querySelector('.charge-notation, .ion-notation')
      expect(species, testCase.unicode).not.toBeNull()
      expect(species!.getAttribute('dir'), testCase.unicode).toBe('ltr')
      expect(container.querySelector('sup')!.textContent, testCase.unicode).toBe(testCase.sup)

      // The species body, the index and the charge all survive in source order.
      // Only the mechanism changes: raw Unicode glyphs become <sup>/<sub>.
      const rendered = `${testCase.body}${testCase.sub ?? ''}${testCase.sup}`
      expect(species!.textContent, testCase.unicode).toBe(rendered)
      expect(container.textContent, testCase.unicode).toBe(sentence.replace(testCase.unicode, rendered))
      expect(baselineCharges(container), `case ${index} ${testCase.unicode}`).toEqual([])

      unmount()
    }
  })

  it('keeps a coefficient on the baseline in `2H⁺` and `3H⁺`', () => {
    for (const [coefficient, source] of [['2', '2H⁺'], ['3', '3H⁺']] as const) {
      const { container } = render(
        <p dir="rtl">
          <ScientificText>{`يعادل ${source} واحداً`}</ScientificText>
        </p>,
      )

      // The coefficient and the symbol stay outside the charge isolate.
      const prose = [...container.querySelectorAll('span:not([dir])')].map((el) => el.textContent).join('')
      expect(prose).toContain(coefficient)
      expect(prose).not.toContain('⁺')

      const charge = container.querySelector('sup')!
      expect(charge.textContent).toBe('+')
      // The <sup> carries only the sign: the magnitude is empty for `+`.
      expect(charge.closest('.charge-notation, .ion-notation')).not.toBeNull()
      expect(baselineCharges(container)).toEqual([])
    }
  })

  it('keeps a polyatomic charge attached to the ion it belongs to', () => {
    const { container } = render(
      <p dir="rtl">
        <ScientificNotationText>الأمونيوم NH₄⁺ والنترات NO₃⁻ والفوسفات PO₄³⁻ والكبريتات SO₄²⁻.</ScientificNotationText>
      </p>,
    )

    const species = [...container.querySelectorAll('.charge-notation, .ion-notation')]
    expect(species.map((element) => element.textContent)).toEqual(['NH4+', 'NO3−', 'PO43−', 'SO42−'])

    // Each species is one LTR isolate, so RTL cannot reorder sign and symbol.
    for (const element of species) expect(element.getAttribute('dir')).toBe('ltr')

    const sups = [...container.querySelectorAll('sup')].map((element) => element.textContent)
    expect(sups).toEqual(['+', '\u2212', '3\u2212', '2\u2212'])
    expect(baselineCharges(container)).toEqual([])
  })

  it('does not mistake a unit exponent for a charge', () => {
    expect(baselineCharges(render(<span dir="ltr">6.02×10²³ mol⁻¹</span>).container)).toEqual([])
    expect(splitScientificRuns('g·mol⁻¹')).toEqual([{ kind: 'science', value: 'g·mol⁻¹' }])
  })

  it('keeps chemical subscripts correct and uncharged', () => {
    const cases: Array<[string, string[]]> = [
      ['H2O', ['2']],
      ['Ca(OH)2', ['2']],
      ['Al2(SO4)3', ['2', '4', '3']],
      ['NH4NO3', ['4', '3']],
      ['H2SO4', ['2', '4']],
    ]

    for (const [formula, expected] of cases) {
      const { container, unmount } = render(<ChemicalFormula formula={formula} />)
      expect([...container.querySelectorAll('sub')].map((element) => element.textContent), formula).toEqual(expected)
      expect(container.querySelectorAll('sup'), formula).toHaveLength(0)
      unmount()
    }
  })

  it('renders a standalone IonNotation charge as a superscript', () => {
    const { container } = render(<IonNotation formula="SO4" charge="2-" />)
    const charge = container.querySelector('sup')!

    expect(charge.textContent).toBe('2\u2212')
    expect(charge.querySelector('.ion-notation__magnitude')!.textContent).toBe('2')
    expect(charge.querySelector('.ion-notation__sign')!.textContent).toBe('\u2212')
    // Magnitude precedes the sign: the ionic convention, never `−2`.
    expect(charge.querySelector('.ion-notation__charge-run')!.textContent).toBe('2\u2212')
    expect(baselineCharges(container)).toEqual([])
  })

  it('renders a promoted ChargeNotation charge as a superscript', () => {
    const { container } = render(<ChargeNotation source="Ca²⁺" />)
    const charge = container.querySelector('sup')!

    expect(charge.textContent).toBe('2+')
    expect(container.querySelector('.charge-notation__body')!.textContent).toBe('Ca')
    // Magnitude precedes the sign: the ionic convention, never `+2`.
    expect(charge.querySelector('.charge-notation__magnitude')!.textContent).toBe('2')
    expect(charge.querySelector('.charge-notation__sign')!.textContent).toBe('+')
    expect(charge.querySelector('.charge-notation__charge-run')!.textContent).toBe('2+')
    expect(baselineCharges(container)).toEqual([])
  })
})

describe('superscript raise — the markup is actually lifted off the baseline', () => {
  const scientificCss = readProjectFile('src/styles/scientific.css')
  const tokensCss = readProjectFile('src/styles/tokens.css')

  it('raises every shared <sup> from design tokens', () => {
    // The symptom the platform reported — a sign sitting on the normal baseline
    // — is what a missing raise token or a lost `position: relative` produces,
    // even when the DOM is right. Both halves are asserted here.
    const scriptBlock = scientificCss.match(/\.sci-sup,\s*\.sci-sub\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(scriptBlock).toContain('position: relative')

    // Match the standalone rules (`…,\n.sci-sub {` shares a block, so the
    // offset property is what identifies the rule that positions the script).
    const supBlock = scientificCss.match(/\.sci-sup\s*\{[^}]*top:[^}]*\}/s)?.[0] ?? ''
    expect(supBlock).toContain('top: calc(-1 * var(--sci-sup-raise))')

    const subBlock = scientificCss.match(/\.sci-sub\s*\{[^}]*bottom:[^}]*\}/s)?.[0] ?? ''
    expect(subBlock).toContain('bottom: var(--sci-sub-drop)')

    // The tokens the rules depend on must exist, or `calc()` resolves to
    // nothing and the script returns to the baseline.
    expect(tokensCss).toMatch(/--sci-sup-raise:\s*[\d.]+em/)
    expect(tokensCss).toMatch(/--sci-sub-drop:\s*-?[\d.]+em/)
    expect(tokensCss).toMatch(/--sci-sup-size:\s*[\d.]+em/)
  })

  it('gives every charge component a shared <sup> element', () => {
    const componentFiles = [
      'src/scientific/ChemicalFormula.tsx',
      'src/scientific/IonNotation.tsx',
      'src/scientific/ChargeNotation.tsx',
    ]

    for (const file of componentFiles) {
      const source = readProjectFile(file)
      expect(source, `${file} must use SciSup`).toContain('SciSup')
      // No charge component may fake a superscript with Unicode glyphs.
      expect(source, `${file} must not pre-bake superscript glyphs`).not.toMatch(/toSuperscript\(/)
    }
  })
})

describe('charge coverage — no surface may leave a charge on the baseline', () => {
  beforeEach(() => {
    teacherAccess.lock()
  })

  it('covers every lesson step of lessons 1–3', () => {
    for (const lesson of [chemistryLesson1, chemistryLesson2, chemistryLesson3]) {
      for (const step of lesson.steps) {
        const { container, unmount } = render(
          <div dir="rtl">
            <ContentBlocks blocks={step.blocks} />
          </div>,
        )
        expect(baselineCharges(container), `${lesson.id} / ${step.id}`).toEqual([])
        unmount()
      }
    }
  })

  it('covers the teacher area for every lesson and section', () => {
    teacherAccess.unlock(TEACHER_PASSWORD)

    for (const kind of ['book-solutions', 'final-test-solutions'] as const) {
      for (const entry of TEACHER_LESSONS) {
        const { container, unmount } = render(
          <ThemeProvider>
            <MemoryRouter
              initialEntries={[`/teacher/x?lesson=${entry.lessonId}`]}
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <TeacherSection kind={kind} />
            </MemoryRouter>
          </ThemeProvider>,
        )
        expect(baselineCharges(container), `teacher ${kind} / ${entry.lessonId}`).toEqual([])
        unmount()
      }
    }
  })

  it('covers every student route including the Test Area and its solutions', () => {
    const paths = [
      '/',
      '/chemistry',
      '/chemistry/structural-chemistry',
      '/chemistry/structural-chemistry/atom-and-element',
      '/chemistry/structural-chemistry/chemical-bonds',
      '/chemistry/structural-chemistry/chemical-formulas',
      '/test-area',
      '/test-area/chem-u1',
      '/test-area/chem-u1/solutions',
      '/test-area/chem-u1-l3/solutions',
    ]

    for (const path of paths) {
      const { container, unmount } = render(
        <ThemeProvider>
          <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </MemoryRouter>
        </ThemeProvider>,
      )
      expect(baselineCharges(container), path).toEqual([])
      unmount()
    }
  })

  it('covers every registered interactive', () => {
    const simulations: Array<[string, (props: InteractiveProps) => JSX.Element]> = [
      ['bohr-energy-transition', BohrEnergyTransition],
      ['ion-formation-lab', IonFormationLab],
      ['rutherford-scattering', RutherfordScattering],
      ['electron-shell-builder', ElectronShellBuilder],
      ['isotope-lab', IsotopeLab],
      ['ionic-bonding-lab', IonicBondingLab],
      ['covalent-bond-lab', CovalentBondLab],
      ['valence-model-lab', ValenceModelLab],
      ['ion-equation-lab', IonEquationLab],
      ['formula-builder-lab', FormulaBuilderLab],
    ]

    for (const [id, Component] of simulations) {
      const { container, unmount } = render(
        <ThemeProvider>
          <Component interactiveId={id} reducedMotion />
        </ThemeProvider>,
      )
      expect(baselineCharges(container), id).toEqual([])
      unmount()
    }
  })

  it('renders every charged simulation formula with a real superscript', () => {
    const { container } = render(
      <ThemeProvider>
        <IonEquationLab interactiveId="ion-equation-lab" reducedMotion />
      </ThemeProvider>,
    )

    // The lab's decomposition equation: Na → Na⁺ + e⁻.
    const sups = [...container.querySelectorAll('sup')].map((element) => element.textContent)
    expect(sups).toContain('+')
    expect(sups).toContain('\u2212')
    expect(container.textContent).not.toContain('\u207A')
    expect(container.textContent).not.toContain('\u207B')
  })

  it('keeps the shorthand guard: no raw charge glyph may be rendered as text', () => {
    // A direct check that the glyphs themselves never reach the text layer in
    // the surfaces that carry them most, independent of the attribute walk.
    const surfaces = [
      render(<ThemeProvider><IonicBondingLab interactiveId="ionic-bonding-lab" reducedMotion /></ThemeProvider>).container,
      render(<ThemeProvider><IonEquationLab interactiveId="ion-equation-lab" reducedMotion /></ThemeProvider>).container,
      render(<ThemeProvider><FormulaBuilderLab interactiveId="formula-builder-lab" reducedMotion /></ThemeProvider>).container,
    ]

    for (const container of surfaces) {
      const charged = [...container.querySelectorAll('*')].filter(
        (element) => element.children.length === 0 && CHARGE_GLYPH.test(element.textContent ?? ''),
      )
      for (const element of charged) {
        // A leaf holding a charge glyph must itself be the <sup>, not a text node.
        expect(element.tagName.toLowerCase(), element.outerHTML).toBe('sup')
      }
    }
  })
})
