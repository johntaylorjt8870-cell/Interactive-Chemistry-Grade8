/**
 * Platform-wide notation, mathematics and BIDI regressions.
 *
 * These rules are not Lesson-3 patches: they are contracts the shared renderer
 * and utility layer must keep for every current and future lesson. The suite
 * therefore tests the underlying helpers (`splitScientificRuns`,
 * `parseCompactCharge`) AND the surfaces that actually consume them.
 *
 * Background: the generic splitter lifts Latin/numeric fragments out of Arabic
 * prose one at a time. That is correct for a measurement (`5 g`) but wrong for a
 * value spread over several fragments — an equation, a range or a charge. Each
 * fragment becomes its own LTR isolate and an RTL paragraph lays sibling
 * isolates out right-to-left, so `2 + 3 = 5` reaches the eye as `5 = 3 + 2` and
 * a charge sign can be placed away from the symbol it belongs to.
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ChargeNotation, ScientificText } from '@/scientific'
import { parseCompactCharge, splitScientificRuns } from '@/utils/scientificText'
import { RtlRun } from '@/components/BidiText'
import { TestProgress } from '@/testArea/components/TestProgress'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { readProjectFile } from './utils/projectFiles'
import { chemistryLesson1, bookQuestions as lesson1BookQuestions } from '@/data/curriculum/chemistryLesson1'
import { chemistryLesson2, bookQuestions as lesson2BookQuestions } from '@/data/curriculum/chemistryLesson2'
import { chemistryLesson3 } from '@/data/curriculum/chemistryLesson3'
import { getTeacherLesson } from '@/teacher/teacherContent'
import { chemUnit1Bank } from '@/data/testArea/banks/chem-u1'
import lesson1Bank from '@/data/testArea/banks/chem-u1-l1'
import lesson2Bank from '@/data/testArea/banks/chem-u1-l2'
import lesson3Bank from '@/data/testArea/banks/chem-u1-l3'

const scientificCss = readProjectFile('src/styles/scientific.css')
const componentsCss = readProjectFile('src/styles/components.css')

/** Every charge spelling that must become a real superscript. */
const CHARGE_CASES: Array<{ source: string; sup: string; coefficient?: string }> = [
  { source: 'e⁻', sup: '\u2212' },
  { source: '2e⁻', sup: '\u2212', coefficient: '2' },
  { source: 'Cl⁻', sup: '\u2212' },
  { source: 'Na⁺', sup: '+' },
  { source: 'Ca²⁺', sup: '2+' },
  { source: 'O²⁻', sup: '2\u2212' },
  { source: 'Al³⁺', sup: '3+' },
]

describe('scientific notation — charges are real superscript', () => {
  it('recognises every charge spelling as ONE run, never a symbol plus a sign', () => {
    for (const { source } of CHARGE_CASES) {
      const runs = splitScientificRuns(source)

      expect(runs).toHaveLength(1)
      expect(runs[0]).toMatchObject({ kind: 'science', value: source, notation: 'charge' })
    }
  })

  it('parses the charge of an electron and of an ion without touching the source', () => {
    expect(parseCompactCharge('e⁻')).toMatchObject({
      source: 'e⁻',
      coefficient: '',
      body: 'e',
      formula: null,
      sign: '-',
    })
    expect(parseCompactCharge('2e⁻')).toMatchObject({ coefficient: '2', body: 'e', sign: '-' })
    expect(parseCompactCharge('Ca²⁺')).toMatchObject({
      body: 'Ca',
      formula: 'Ca',
      magnitude: '2',
      sign: '+',
    })
    expect(parseCompactCharge('SO₄²⁻')).toMatchObject({ body: 'SO₄', formula: 'SO4', magnitude: '2' })
    // A negative exponent is not a charge: its sign is not final, so a unit
    // such as `mol⁻¹` is never mistaken for an ion.
    expect(parseCompactCharge('mol⁻¹')).toBeNull()
    expect(splitScientificRuns('g·mol⁻¹')).toEqual([{ kind: 'science', value: 'g·mol⁻¹' }])
  })

  it('renders the charge inside <sup> and leaves no raw glyph in the RTL flow', () => {
    for (const { source, sup, coefficient } of CHARGE_CASES) {
      const { container } = render(
        <p dir="rtl">
          <ScientificText>{`المقدار ${source} هنا`}</ScientificText>
        </p>,
      )

      const species = container.querySelector('.charge-notation')
      expect(species, source).not.toBeNull()
      expect(species!.getAttribute('dir'), source).toBe('ltr')

      const supElement = species!.querySelector('sup')
      expect(supElement, `${source} must use <sup>`).not.toBeNull()
      expect(supElement!.textContent, source).toBe(sup)

      if (coefficient) {
        expect(species!.querySelector('.charge-notation__coefficient')!.textContent).toBe(coefficient)
      }

      // A stray script glyph would mean the charge escaped its structured DOM.
      expect(strayScriptGlyphs(container), source).toEqual([])
      expect(container.textContent).not.toContain('⁻')
      expect(container.textContent).not.toContain('⁺')
    }
  })

  it('keeps the magnitude before the sign, as the ionic convention requires', () => {
    const { container } = render(<ChargeNotation source="Ca²⁺" />)
    const run = container.querySelector('.charge-notation__charge-run')!

    expect(run.getAttribute('dir')).toBe('ltr')
    expect([...run.querySelectorAll('span')].map((el) => el.textContent)).toEqual(['2', '+'])
  })

  it('renders an electron as a species, not as a letter followed by a loose sign', () => {
    const { container } = render(
      <p dir="rtl">
        <ScientificText>ينتقل 2e⁻ من الذرّة</ScientificText>
      </p>,
    )

    const species = container.querySelector('.charge-notation')!
    expect(species.getAttribute('data-charge-notation')).toBe('2e⁻')
    expect(species.querySelector('.charge-notation__coefficient')!.textContent).toBe('2')
    expect(species.querySelector('.charge-notation__body')!.textContent).toBe('e')
    expect(species.querySelector('sup')!.textContent).toBe('\u2212')
  })

  it('documents the isolation contract for charges in CSS', () => {
    const block = scientificCss.match(/\.sci\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(block).toContain('direction: ltr')
    expect(block).toContain('unicode-bidi: isolate')

    const chargeBlock = readProjectFile('src/styles/scientific-components.css').match(/\.charge-notation\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(chargeBlock).toContain('direction: ltr')
    expect(chargeBlock).toContain('unicode-bidi: isolate')
  })
})

describe('mathematics — every relation is one LTR isolate', () => {
  const EQUATIONS = ['2 + 3 = 5', '2 × (+3) = +6', '(+3)(2) + (−2)(3) = 0']

  it('never splits an equation into reorderable fragments', () => {
    for (const equation of EQUATIONS) {
      const runs = splitScientificRuns(equation)

      expect(runs, equation).toHaveLength(1)
      expect(runs[0]).toMatchObject({ kind: 'science', value: equation, notation: 'expression' })
    }
  })

  it('renders the relation as a single LTR isolate whose only child is the whole text', () => {
    for (const equation of EQUATIONS) {
      const { container } = render(
        <p dir="rtl">
          <ScientificText>{`المجموع ${equation} دائماً`}</ScientificText>
        </p>,
      )

      const isolated = container.querySelector('[data-notation="expression"]')
      expect(isolated, equation).not.toBeNull()
      expect(isolated!.getAttribute('dir')).toBe('ltr')
      expect(isolated!.textContent).toBe(equation)
      // One text node: there is nothing inside for the bidi algorithm to reorder.
      expect(isolated!.childNodes).toHaveLength(1)

      const prose = [...container.querySelectorAll('span:not([dir])')].map((el) => el.textContent)
      expect(prose.join('')).not.toContain('5 = 3 + 2')
    }
  })

  it('keeps a measurement on the value-then-unit path', () => {
    const cases: Array<[string, string]> = [
      ['حرارة 25 °C هنا', '25 °C'],
      ['الكتلة المولية 6.02×10²³ mol⁻¹ هنا', '6.02×10²³ mol⁻¹'],
      ['كتلة 44 g/mol هنا', '44 g/mol'],
    ]

    for (const [input, expected] of cases) {
      const science = splitScientificRuns(input).find((run) => run.kind === 'science')
      expect(science?.value, input).toBe(expected)
      expect(splitScientificRuns(input).find((run) => run.kind === 'science')).not.toMatchObject({
        notation: 'expression',
      })
    }
  })
})

describe('scientific expressions — ranges and distributions stay whole', () => {
  it('keeps a page range as one value with the dash inside the isolate', () => {
    const runs = splitScientificRuns('الصفحات 18–23 من الكتاب')
    const range = runs.find((run) => run.kind === 'science')

    expect(range).toMatchObject({ value: '18–23', notation: 'range' })

    const { container } = render(
      <p dir="rtl">
        <ScientificText>الصفحات 18–23 من الكتاب</ScientificText>
      </p>,
    )

    const isolated = container.querySelectorAll('[data-notation="range"]')
    expect(isolated).toHaveLength(1)
    expect(isolated[0]!.getAttribute('dir')).toBe('ltr')
    // The separator must be INSIDE the isolate, otherwise the two numbers can be
    // reordered around it and `18–23` renders as `23–18`.
    expect(isolated[0]!.textContent).toBe('18–23')
    expect(container.textContent).toBe('الصفحات 18–23 من الكتاب')
  })

  it('keeps the electron configuration and the figure reference single and isolated', () => {
    expect(splitScientificRuns('2-8-8')).toEqual([
      { kind: 'science', value: '2-8-8', notation: 'electron-configuration' },
    ])
    expect(splitScientificRuns('4-2')).toEqual([{ kind: 'science', value: '4-2' }])
  })

  it('keeps mixed Arabic, Latin and numbers in source order', () => {
    const input = 'كتلة العينة 5 g وحرارتها 25 °C وعدد المولات 6.02×10²³ mol⁻¹ ثم 18–23.'
    const { container } = render(
      <p dir="rtl">
        <ScientificText>{input}</ScientificText>
      </p>,
    )

    expect(container.textContent).toBe(input)
    expect([...container.querySelectorAll('[dir="ltr"]')].map((el) => el.textContent)).toEqual([
      '5 g',
      '25 °C',
      '6.02×10²³ mol⁻¹',
      '18–23',
    ])
  })
})

describe('RTL and BIDI — mixed runs are isolated, never inherited', () => {
  it('renders the counter as an explicit RTL isolate', () => {
    const { container } = render(<TestProgress answered={2} total={2} ratio={1} />)
    const count = container.querySelector('.ta-progress__count')!

    expect(count.getAttribute('dir')).toBe('rtl')
    expect(count.getAttribute('data-bidi')).toBe('rtl-isolate')
    expect(count.className).toContain('rtl-run')
    expect(count.textContent).toBe('أجبت عن 2 من 2')
  })

  it('defines both directions with isolation in CSS', () => {
    const rtl = componentsCss.match(/\.rtl-run\s*\{[^}]*\}/s)?.[0] ?? ''
    const ltr = componentsCss.match(/\.ltr-run\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(rtl).toContain('direction: rtl')
    expect(rtl).toContain('unicode-bidi: isolate')
    expect(ltr).toContain('direction: ltr')
    expect(ltr).toContain('unicode-bidi: isolate')
  })

  it('exposes a reusable run instead of relying on inherited direction', () => {
    const { container } = render(<RtlRun className="counter">الخطوة 3 من 27</RtlRun>)
    const run = container.querySelector('.counter')!

    expect(run.getAttribute('dir')).toBe('rtl')
    expect(run.className).toContain('rtl-run')
  })

  /** True when `fragment` appears between an opening <RtlRun> and its close. */
  const insideRtlRun = (source: string, fragment: string): boolean => {
    const at = source.indexOf(fragment)
    if (at === -1) return false
    const open = source.lastIndexOf('<RtlRun', at)
    if (open === -1) return false
    if (source.slice(open, at).includes('</RtlRun>')) return false
    return source.indexOf('</RtlRun>', at) > open
  }

  const COUNTER_SITES: Array<[string, string[]]> = [
    ['src/layouts/LessonShell.tsx', ['الخطوة {progress.current} من {progress.total}', 'زُرت {progress.visited} من {progress.total}']],
    ['src/lessons/LessonFlow.tsx', ['الخطوة {currentIndex + 1} من {total}']],
    ['src/testArea/components/TestProgress.tsx', ['أجبت عن {answered} من {total}']],
    ['src/testArea/components/TestResultView.tsx', ['{result.score} من {result.maxScore}']],
    [
      'src/testArea/pages/TestRunnerPage.tsx',
      ['لم تُجب عن {attempt.unansweredIndices.length} من {attempt.total} سؤالاً.', 'السؤال {currentIndex + 1} من {attempt.total}'],
    ],
    ['src/testArea/components/SolutionChunkNav.tsx', ['الأسئلة {chunk.first}–{chunk.last} من {total}']],
    ['src/assessment/FinalTestRunner.tsx', ['أُجيب عن {summary.answered} من {summary.total} سؤالاً.']],
    [
      'src/simulations/IonEquationLab.tsx',
      ['تبقّى {remain} من {equation.transfer}', '{moved} من {equation.transfer}'],
    ],
    ['src/simulations/IonFormationLab.tsx', ['{moved} من {Math.abs(example.transfer)}']],
    ['src/simulations/ValenceModelLab.tsx', ['{formed} من {molecule.bonds}']],
  ]

  it.each(COUNTER_SITES)('isolates every counter in %s', (file, fragments) => {
    const source = readProjectFile(file)

    for (const fragment of fragments) {
      expect(source, `${file} must contain ${fragment}`).toContain(fragment)
      expect(insideRtlRun(source, fragment), `${file}: ${fragment} must sit inside <RtlRun>`).toBe(true)
    }
  })

  it('uses a content-derived direction for mixed Test Solutions text', () => {
    const solutionCard = readProjectFile('src/testArea/components/SolutionCard.tsx')
    const resultView = readProjectFile('src/testArea/components/TestResultView.tsx')

    // Forcing LTR on a mostly-Arabic answer reorders its Arabic segments.
    expect(solutionCard).not.toContain('dir="ltr" lang="en"')
    expect(resultView).not.toContain('dir="ltr" lang="en"')
    expect(solutionCard).toContain('dir="auto"')
    expect(resultView).toContain('dir="auto"')

    // Answer entry fields are Latin/numeric and stay LTR.
    expect(readProjectFile('src/testArea/components/TestQuestionCard.tsx')).toContain('dir="ltr"')
  })

  it('keeps the document Arabic-first RTL', () => {
    const indexHtml = readProjectFile('index.html')

    expect(indexHtml).toContain('dir="rtl"')
    expect(indexHtml).not.toContain('dir="ltr"')
  })
})

describe('source fidelity — the printed heading and the questions', () => {
  it('uses the printed book heading «أختبر نفسي» in every place that renders it', () => {
    const bookCheckSteps = chemistryLesson3.steps.filter((step) => step.id.startsWith('book-check'))

    expect(bookCheckSteps).toHaveLength(5)
    for (const step of bookCheckSteps) {
      expect(step.title).toContain('أختبر نفسي')
      expect(step.source?.pages[0]?.item ?? '').toContain('أختبر نفسي')
    }

    expect(getTeacherLesson('chem-u1-l3').bookNote).toContain('أختبر نفسي')
  })

  it('never reintroduces the wrong heading', () => {
    expect(JSON.stringify(chemistryLesson3)).not.toContain('أخبر نفسي')
    expect(readProjectFile('src/data/curriculum/chemistryLesson3.ts')).not.toContain('أخبر نفسي')
    expect(readProjectFile('src/teacher/teacherContent.ts')).not.toContain('أخبر نفسي')
  })

  it('leaves the questions, their wording and their order untouched', () => {
    const bookCheckSteps = chemistryLesson3.steps.filter((step) => step.id.startsWith('book-check'))

    expect(bookCheckSteps.map((step) => step.id)).toEqual([
      'book-check-q1',
      'book-check-q2',
      'book-check-q3',
      'book-check-q4',
      'book-check-q5',
    ])

    const questionIds = bookCheckSteps.flatMap((step) =>
      step.blocks.filter((block) => block.kind === 'question').map((block) => (block as { questionId: string }).questionId),
    )
    expect(questionIds).toEqual([
      'l3-book-tf-1',
      'l3-book-tf-2',
      'l3-book-tf-3',
      'l3-book-tf-4',
      'l3-book-mc-1',
      'l3-book-mc-2',
      'l3-book-q3-1',
      'l3-book-q3-2',
      'l3-book-q3-3',
      'l3-book-q3-4',
      'l3-book-q4-1',
      'l3-book-q4-2',
      'l3-book-q4-3',
      'l3-book-q4-4',
      'l3-book-q5',
    ])
  })

  it('did not touch Lessons 1 and 2', () => {
    expect(chemistryLesson1.steps).toHaveLength(17)
    expect(chemistryLesson2.steps).toHaveLength(18)
    expect(lesson1BookQuestions).toHaveLength(15)
    expect(lesson2BookQuestions).toHaveLength(7)

    for (const lesson of [chemistryLesson1, chemistryLesson2]) {
      expect(JSON.stringify(lesson)).toContain('أختبر نفسي')
      expect(JSON.stringify(lesson)).not.toContain('أخبر نفسي')
    }
  })

  it('did not touch the Test Area banks or the teacher area', () => {
    expect(chemUnit1Bank.questions).toHaveLength(60)
    expect(lesson1Bank.questions).toHaveLength(20)
    expect(lesson2Bank.questions).toHaveLength(20)
    expect(lesson3Bank.questions).toHaveLength(20)

    const teacherLesson = getTeacherLesson('chem-u1-l3')
    expect(teacherLesson.bookQuestions).toHaveLength(20)
    expect(teacherLesson.finalTest.questions).toHaveLength(14)
  })
})
