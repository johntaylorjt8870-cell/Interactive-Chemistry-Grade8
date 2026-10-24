import { describe, expect, it } from 'vitest'
import { fireEvent, render, within } from '@testing-library/react'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { ScientificShowcase } from '@/pages/home/ScientificShowcase'
import { MathFormula, ScientificNotationText } from '@/scientific'
import AtomInventoryLab from '@/simulations/AtomInventoryLab'
import BondStepsLab from '@/simulations/BondStepsLab'
import IonEquationLab from '@/simulations/IonEquationLab'
import IonFormationLab from '@/simulations/IonFormationLab'
import Lesson2LewisAnatomyDiagram from '@/simulations/Lesson2LewisAnatomyDiagram'
import Lesson2TransferMechanismDiagram from '@/simulations/Lesson2TransferMechanismDiagram'
import LewisDotLab from '@/simulations/LewisDotLab'
import ShellCapacityLab from '@/simulations/ShellCapacityLab'
import { finalTest as lesson5FinalTest } from '@/data/curriculum/chemistryLesson5Test'
import { splitScientificRuns } from '@/utils/scientificText'
import { strayScriptGlyphs } from './utils/strayGlyphs'

describe('post-PR #29 RTL & scientific-notation regressions', () => {
  describe('splitScientificRuns keeps compound scientific expressions in a single LTR run', () => {
    it.each([
      ['الكالسيوم Ca = 2-8-8-2 والأكسجين O = 2-6.', ['Ca = 2-8-8-2', 'O = 2-6']],
      ['كتلة الإلكترون (1/1860) من كتلة البروتون.', ['1/1860']],
      ['أربع نقاط مشتركة (2×2) بين الذرتين.', ['2×2']],
      ['النسبة الكتلية 56:32 وتبسيطها 7:4 وبنسبة 1 : 2.', ['56:32', '7:4', '1 : 2']],
      ['النسبة الثابتة 10/1.56 ≈ 6.41 أي Pb/S ≈ 6.41.', ['10/1.56 ≈ 6.41', 'Pb/S ≈ 6.41']],
      ['التكافؤات مثل Zn:2 وFe(III):3 وMg: 12 − 10 = +2.', ['Zn:2', 'Fe(III):3', 'Mg: 12 − 10 = +2']],
      ['لها الأرقام (1 – 2 – 3 – 4 – 5 – 6 – 7) والرموز (K, L, M, N, O, P, Q).', ['1 – 2 – 3 – 4 – 5 – 6 – 7', 'K, L, M, N, O, P, Q']],
      ['التوزيع Na: K(2), L(8), M(1) في الذرة.', ['Na: K(2), L(8), M(1)']],
      ['الفرق 60−5 = 55 g في التفاعل.', ['60−5 = 55 g']],
      ['ترتيب الكتاب هو «2+» و«2−» مثل الرمز Mg2+ وCa2+.', ['2+', '2−', 'Mg2+', 'Ca2+']],
      ['نكتبها وفق لويس بالشكل C̈a لأنها تحوي إلكترونين سطحيين.', ['C̈a']],
    ])('does not fragment %s across RTL prose', (sentence, expectedRuns) => {
      const scienceRuns = splitScientificRuns(sentence)
        .filter((run) => run.kind === 'science')
        .map((run) => run.value)

      expect(scienceRuns).toEqual(expectedRuns)
    })

    it('keeps units attached after binary operators in Arabic sentences without swallowing Arabic words', () => {
      const runs = splitScientificRuns('(1) 10g رصاص + 1.56g كبريت ← 11.56g كبريتيد الرصاص')
      const scienceRuns = runs.filter((run) => run.kind === 'science').map((run) => run.value)

      expect(scienceRuns).toEqual(['1', '10g', '1.56g', '11.56g'])
    })
  })

  describe('ScientificNotationText promotes structured notation without reversing compound equations', () => {
    it('promotes mass-only isotopes (¹⁶O, ¹⁷O, ¹⁸O) to LTR NuclearNotation', () => {
      const { container } = render(
        <p dir="rtl">
          <ScientificNotationText>نظائر الأكسجين ¹⁶O و¹⁷O و¹⁸O متماثلة كيميائياً.</ScientificNotationText>
        </p>,
      )

      const nuclides = [...container.querySelectorAll('.nuclear-notation')]
      expect(nuclides).toHaveLength(3)
      for (const el of nuclides) {
        expect(el.getAttribute('dir')).toBe('ltr')
      }
      expect(nuclides.map((el) => el.querySelector('.nuclear-notation__mass')?.textContent)).toEqual([
        '16',
        '17',
        '18',
      ])
      expect(strayScriptGlyphs(container)).toEqual([])
    })

    it('keeps inline chemical and ionic equations inside one LTR isolate while promoting inner formulas and ions', () => {
      const { container } = render(
        <div dir="rtl">
          <p data-testid="ion-eq">
            <ScientificNotationText>
              في معادلة التأين H₃PO₄ → 3H⁺ + PO₄³⁻، ماذا يعني الرقم 3 قبل H⁺؟
            </ScientificNotationText>
          </p>
          <p data-testid="mol-eq">
            <ScientificNotationText>التفاعل CaO + 2HCl → CaCl₂ + H₂O مغلق.</ScientificNotationText>
          </p>
          <p data-testid="cfg-eq">
            <ScientificNotationText>توزيع Ca = 2-8-8-2 وتوزيع O = 2-6.</ScientificNotationText>
          </p>
        </div>,
      )

      const ionEq = container.querySelector('[data-testid="ion-eq"] [data-notation="expression"]')
      expect(ionEq).not.toBeNull()
      expect(ionEq!.getAttribute('dir')).toBe('ltr')
      expect(ionEq!.textContent).toBe('H3PO4 → 3H+ + PO43−')
      expect(ionEq!.querySelector('.chem-formula[data-formula="H3PO4"]')).not.toBeNull()
      expect(ionEq!.querySelector('.ion-notation')).not.toBeNull()

      const molEq = container.querySelector('[data-testid="mol-eq"] [data-notation="expression"]')
      expect(molEq).not.toBeNull()
      expect(molEq!.getAttribute('dir')).toBe('ltr')
      expect(molEq!.textContent).toBe('CaO + 2HCl → CaCl2 + H2O')

      const cfgEqs = [...container.querySelectorAll('[data-testid="cfg-eq"] [data-notation="expression"]')]
      expect(cfgEqs.map((el) => el.textContent)).toEqual(['Ca = 2-8-8-2', 'O = 2-6'])
      expect(cfgEqs[0]!.querySelector('.electron-configuration')).not.toBeNull()
      expect(strayScriptGlyphs(container)).toEqual([])
    })
  })

  describe('Lesson 1–3 interactive labs and diagrams isolate scientific notation and sign-first charges', () => {
    it('isolates electron configurations, arithmetic, ratios, and sign-first charges in BondStepsLab', () => {
      const { container } = render(
        <div dir="rtl">
          <BondStepsLab interactiveId="bond-steps-lab" reducedMotion />
        </div>,
      )

      // Stage 1: 2-8-1 and 2-8-7 must be structured LTR ElectronConfiguration, not raw RTL text.
      const configs = [...container.querySelectorAll('.l2-steps-lab__explain .electron-configuration')]
      expect(configs.map((el) => el.textContent)).toEqual(['2-8-1', '2-8-7'])

      // Switch to MgCl₂ and advance to Stage 5 (index 4).
      fireEvent.click(within(container).getByRole('button', { name: /MgCl/i }))
      const nextBtn = within(container).getByRole('button', { name: 'التالي' })
      for (let i = 0; i < 4; i += 1) fireEvent.click(nextBtn)

      // Stage 5 ratio 1 : 2 must live inside an LTR isolate in stage text, conclusion, and ion summary.
      const isolatedTexts = [...container.querySelectorAll('[dir="ltr"]')].map((el) => el.textContent?.trim())
      expect(isolatedTexts.filter((text) => text?.includes('1 : 2')).length).toBeGreaterThanOrEqual(3)

      // Standalone charge arithmetic in KaTeX must be sign-first (+2), never magnitude-first (2+).
      const mathLabels = [...container.querySelectorAll('[data-math]')].map((el) => el.getAttribute('aria-label') ?? el.textContent ?? '')
      expect(mathLabels.join(' ')).not.toContain('2+) +')
      expect(container.querySelector('.l2-steps-lab__formula')?.textContent).not.toContain('(2+)')
    })

    it('uses sign-first standalone charges, LTR SVG charge labels, and isolated ratios in Lesson2TransferMechanismDiagram', () => {
      const caO = render(
        <div dir="rtl">
          <Lesson2TransferMechanismDiagram interactiveId="lesson2-transfer-cao" reducedMotion />
        </div>,
      )

      // CaO: standalone charges in KaTeX must read +2 and −2, never 2+ / 2−.
      const caOMath = [...caO.container.querySelectorAll('.katex')].map((el) => el.textContent ?? '').join(' ')
      expect(caOMath).toContain('+2')
      expect(caOMath).not.toContain('=2+')
      expect(caOMath).not.toContain('(2+)')

      // MgCl₂: ratio 1 : 2 must be LTR-isolated and SVG charge circles must have direction="ltr".
      const mgCl2 = render(
        <div dir="rtl">
          <Lesson2TransferMechanismDiagram interactiveId="lesson2-transfer-mgcl2" reducedMotion />
        </div>,
      )
      const formulaSummary = mgCl2.container.querySelector('.l2-transfer__formula')!
      const isolatedInFormula = [...formulaSummary.querySelectorAll('[dir="ltr"]')].map((el) => el.textContent)
      expect(isolatedInFormula).toContain('1 : 2')

      const svgCharges = [...mgCl2.container.querySelectorAll('.l2-transfer__sign')]
      expect(svgCharges).toHaveLength(3)
      for (const node of svgCharges) {
        expect(node.getAttribute('direction')).toBe('ltr')
      }
      expect(svgCharges.map((el) => el.textContent)).toEqual(['+2', '−1', '−1'])
    })

    it('isolates electron configurations and nuclide presets in LewisDotLab, ShellCapacityLab, IonEquationLab, and AtomInventoryLab', () => {
      const lewis = render(<div dir="rtl"><LewisDotLab interactiveId="lewis-dot-lab" reducedMotion /></div>)
      expect(
        [...lewis.container.querySelectorAll('.lab__conclusion .electron-configuration')].map((el) => el.textContent),
      ).toEqual(['2-4', '2-8-8', '2-1'])

      const capacity = render(<div dir="rtl"><ShellCapacityLab interactiveId="shell-capacity-lab" reducedMotion /></div>)
      expect(capacity.container.querySelector('.capacity-note .electron-configuration')?.textContent).toBe('2-8-8-2')
      expect(
        [...capacity.container.querySelectorAll('.capacity-note [dir="ltr"]')].map((el) => el.textContent),
      ).toContain('2-8-10')

      const ionEq = render(<div dir="rtl"><IonEquationLab interactiveId="ion-equation-lab" reducedMotion /></div>)
      expect(
        [...ionEq.container.querySelectorAll('.electron-configuration')].map((el) => el.textContent),
      ).toEqual(['2-8-1', '2-8-1'])

      const inventory = render(<div dir="rtl"><AtomInventoryLab interactiveId="atom-inventory-lab" reducedMotion /></div>)
      expect(strayScriptGlyphs(inventory.container)).toEqual([])
      expect(inventory.container.querySelectorAll('.atom-presets .nuclear-notation').length).toBeGreaterThanOrEqual(2)

      const ionForm = render(<div dir="rtl"><IonFormationLab interactiveId="ion-formation-lab" reducedMotion /></div>)
      const arrowRun = ionForm.container.querySelector('.ion-process__arrow [dir="ltr"]')
      expect(arrowRun?.textContent).toBe('⟶ e−')
      expect(arrowRun?.querySelector('sup')?.textContent).toBe('−')
      fireEvent.click(within(ionForm.container).getByRole('button', { name: 'افقد إلكتروناً' }))
      expect(
        [...ionForm.container.querySelectorAll('.lab__measurements strong [dir="ltr"]')].map((el) => el.textContent),
      ).toContain('+1')
    })
  })

  describe('KaTeX formulas never render double-backslash linebreaks or control-character errors', () => {
    it('renders real fraction and square-root nodes on Home ScientificShowcase and isolates 2+', () => {
      const { container } = render(
        <div dir="rtl">
          <ScientificShowcase />
        </div>,
      )

      expect(container.querySelectorAll('[data-math-error="true"]')).toHaveLength(0)
      expect(container.querySelector('.katex .mfrac')).not.toBeNull()
      expect(container.querySelector('.katex .sqrt')).not.toBeNull()
      expect(container.textContent).not.toContain('frac12')
      expect(container.textContent).not.toContain('sqrt2')

      const inlineNotes = container.querySelectorAll('.showcase-inline-note [dir="ltr"]')
      expect([...inlineNotes].map((el) => el.textContent)).toContain('2+')
    })

    it('renders \\times as × (not literal "times") in Lesson2LewisAnatomyDiagram', () => {
      const { container } = render(
        <div dir="rtl">
          <Lesson2LewisAnatomyDiagram interactiveId="lesson2-lewis-anatomy" reducedMotion />
        </div>,
      )

      expect(container.querySelectorAll('[data-math-error="true"]')).toHaveLength(0)
      const katexHtml = [...container.querySelectorAll('.katex-html')].map((el) => el.textContent ?? '').join(' ')
      expect(katexHtml).toContain('×')
      expect(katexHtml).not.toContain('times')
    })

    it('renders every solution formula in chemistryLesson5Test without KaTeX errors or control characters', () => {
      const solutionBlocks = lesson5FinalTest.questions.flatMap((q) => q.solutionBlocks ?? [])
      const { container } = render(
        <div dir="rtl">
          <ContentBlocks blocks={solutionBlocks} />
        </div>,
      )

      expect(container.querySelectorAll('[data-math-error="true"]')).toHaveLength(0)
      const formulaBlocks = solutionBlocks.filter(
        (b): b is Extract<(typeof solutionBlocks)[number], { kind: 'formula' }> => b.kind === 'formula',
      )
      expect(formulaBlocks.length).toBeGreaterThanOrEqual(5)
      for (const block of formulaBlocks) {
        expect(block.tex).not.toMatch(/[\t\f\r\b\v]/)
        const single = render(<MathFormula tex={block.tex} display="block" />)
        expect(single.container.querySelector('[data-math-error="true"]')).toBeNull()
      }
    })
  })
})
