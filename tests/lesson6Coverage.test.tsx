import { describe, expect, it } from 'vitest'
import katex from 'katex'
import { render } from '@testing-library/react'
import {
  chemistryLesson6,
  bookActivitySolutions,
  bookQuestions,
  lesson6BookQuestionCount,
  lesson6PracticeQuestions,
  finalTest,
  lesson6TeacherGuide,
} from '@/data/curriculum/chemistryLesson6'
import {
  LESSON6_LEDGER,
  LESSON6_OBJECTIVES,
  computeLedgerCoverage,
} from '@/data/curriculum/lesson6SourceLedger'
import {
  BALANCER_REACTIONS,
  LESSON6_ERROR_CASES,
  WORD_TO_SYMBOL_SCENARIOS,
  formatReactionTeX,
} from '@/simulations/lesson6Models'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { evaluateQuestion } from '@/assessment/evaluate'
import type { Question, ResponseValue } from '@/assessment/types'
import type { ContentBlock } from '@/data/curriculum/schema'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { getInteractive } from '@/simulations/registry'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { readProjectFile } from './utils/projectFiles'

const LESSON6_FILES = [
  'src/data/curriculum/lesson6SourceLedger.ts',
  'src/data/curriculum/chemistryLesson6Book.ts',
  'src/data/curriculum/chemistryLesson6Practice.ts',
  'src/data/curriculum/chemistryLesson6Test.ts',
  'src/data/curriculum/chemistryLesson6TeacherGuide.ts',
  'src/data/curriculum/chemistryLesson6.ts',
  'src/simulations/lesson6Models.ts',
  'src/simulations/Lesson6ZincHclDiagram.tsx',
  'src/simulations/Lesson6EquationAnatomyDiagram.tsx',
  'src/simulations/Lesson6StateSymbolsDiagram.tsx',
  'src/simulations/Lesson6CoeffVsSubscriptDiagram.tsx',
  'src/simulations/ZincHclExperimentLab.tsx',
  'src/simulations/EquationBalancerLab.tsx',
  'src/simulations/WordToSymbolBuilderLab.tsx',
  'src/simulations/Lesson6ErrorSpotterLab.tsx',
  'src/styles/lesson6.css',
] as const

function correctResponseFor(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice':
      return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false':
      return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank':
      return {
        type: 'blanks',
        values: Object.fromEntries(
          question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!]),
        ),
      }
    case 'matching':
      return { type: 'matching', pairs: question.pairs }
    case 'ordering':
      return { type: 'order', itemIds: question.correctOrder }
    case 'numerical':
      return { type: 'number', value: String(question.acceptedAnswers[0]), unit: question.unit }
    case 'table-interpretation':
      return {
        type: 'composite',
        children: Object.fromEntries(
          question.questions.map((sub) => [sub.id, correctResponseFor(sub)]),
        ),
      }
    default:
      throw new Error(`Unexpected question type in deterministic grading check: ${question.type}`)
  }
}

function collectFormulaBlocks(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((block): block is Extract<ContentBlock, { kind: 'formula' }> => block.kind === 'formula')
    .map((block) => block.tex)
}

function insideRtlRun(source: string, fragment: string): boolean {
  const index = source.indexOf(fragment)
  if (index === -1) return false
  const open = source.lastIndexOf('<RtlRun', index)
  if (open === -1) return false
  const close = source.indexOf('</RtlRun>', open)
  return close > index
}

describe('Lesson 6 — 29-entry source ledger & objective alignment (pp. 36–39)', () => {
  it('covers pages 36–39 completely with zero dangling steps, dangling questions, or unlisted book items', () => {
    const coverage = computeLedgerCoverage(chemistryLesson6)

    expect(coverage.total).toBe(34)
    expect(coverage.implemented).toBe(32)
    expect(coverage.reconstructed).toBe(1)
    expect(coverage.decorative).toBe(1)
    expect(coverage.byPage).toEqual({
      '36': 6,
      '37': 10,
      '38': 5,
      '39': 13,
    })
    expect(coverage.danglingSteps).toEqual([])
    expect(coverage.danglingQuestions).toEqual([])
    expect(coverage.unlistedTextbookQuestions).toEqual([])
    expect(coverage.pagesWithoutEntries).toEqual([])
  })

  it('uses unique ledger IDs, documents every reconstructed/decorative item, and maps all 20 textbook units', () => {
    const ids = LESSON6_LEDGER.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const entry of LESSON6_LEDGER) {
      if (entry.status === 'reconstructed' || entry.status === 'decorative') {
        expect(entry.note, entry.id).toBeTruthy()
        expect((entry.note ?? '').length, entry.id).toBeGreaterThan(50)
      }
      for (const interactiveId of entry.interactiveIds ?? []) {
        expect(getInteractive(interactiveId), interactiveId).toBeDefined()
      }
    }

    expect(bookActivitySolutions).toHaveLength(13)
    expect(bookQuestions).toHaveLength(7)
    expect(lesson6BookQuestionCount).toBe(20)
    expect(countQuestions([...bookActivitySolutions, ...bookQuestions])).toBe(20)
  })

  it('separates the 4 textbook objectives (O1–O4) from the declared platform evaluative objective (O5)', () => {
    expect(LESSON6_OBJECTIVES.map((obj) => [obj.id, obj.origin])).toEqual([
      ['O1', 'textbook'],
      ['O2', 'textbook'],
      ['O3', 'textbook'],
      ['O4', 'textbook'],
      ['O5', 'platform'],
    ])

    const stepIds = new Set(chemistryLesson6.steps.map((step) => step.id))
    for (const objective of LESSON6_OBJECTIVES) {
      expect(objective.stepIds.length).toBeGreaterThanOrEqual(4)
      for (const stepId of objective.stepIds) {
        expect(stepIds.has(stepId), `${objective.id} -> ${stepId}`).toBe(true)
      }
    }

    const assessedObjectives = new Set(finalTest.questions.map((q) => q.objectiveId))
    expect([...assessedObjectives].sort()).toEqual(['O1', 'O2', 'O3', 'O4', 'O5'])
  })

  it('enforces scientific/source fidelity notes on p37 step 3 and p39 activity 2', () => {
    const p37Step3 = bookActivitySolutions.find((q) => q.id === 'l6-p37-exp-step3')!
    expect(p37Step3.type).toBe('short-answer')
    if (p37Step3.type === 'short-answer') {
      expect(p37Step3.referenceAnswer).toContain('قابل للاشتعال')
    }
    const p37Extra = JSON.stringify(p37Step3.solutionBlocks)
    expect(p37Extra).toContain('الفرقعة الخفيفة')
    expect(p37Extra).toContain('توضيح مخبري مكمّل من المنصة')

    const p39Act2 = bookActivitySolutions.find((q) => q.id === 'l6-p39-act-2')!
    const p39Extra = JSON.stringify(p39Act2.solutionBlocks)
    expect(p39Extra).toContain('تفاعل شديد وعنيف للصوديوم')
    expect(p39Extra).toContain('ماء المحلول')
  })
})

function visibleNonMathmlText(root: Element): string {
  const clone = root.cloneNode(true) as HTMLElement
  clone.querySelectorAll('.katex-mathml').forEach((el) => el.remove())
  return clone.textContent ?? ''
}

describe('Lesson 6 — KaTeX strict compilation, BIDI isolation, and stray-glyph hygiene', () => {
  it('compiles every TeX expression across steps, questions, teacher guide, and lab datasets under KaTeX strict: "error"', () => {
    const allTex: string[] = []
    for (const step of chemistryLesson6.steps) {
      allTex.push(...collectFormulaBlocks(step.blocks))
    }
    allTex.push(...collectFormulaBlocks(lesson6TeacherGuide))

    for (const test of chemistryLesson6.tests ?? []) {
      for (const question of test.questions) {
        if (question.material) allTex.push(...collectFormulaBlocks(question.material))
        if (question.solutionBlocks) allTex.push(...collectFormulaBlocks(question.solutionBlocks))
      }
    }

    for (const reaction of BALANCER_REACTIONS) {
      allTex.push(
        formatReactionTeX(
          reaction,
          reaction.reactants.map(() => 1),
          reaction.products.map(() => 1),
        ),
      )
      allTex.push(
        formatReactionTeX(
          reaction,
          reaction.targetCoefficients.reactants,
          reaction.targetCoefficients.products,
        ),
      )
    }
    for (const scenario of WORD_TO_SYMBOL_SCENARIOS) {
      for (const opt of scenario.balancedChoices) {
        allTex.push(opt.tex)
      }
    }
    for (const item of LESSON6_ERROR_CASES) {
      allTex.push(item.texEquation)
    }

    expect(allTex.length).toBeGreaterThan(45)
    for (const expr of allTex) {
      expect(expr, `Arabic characters must never enter TeX: ${expr}`).not.toMatch(/[\u0600-\u06FF]/u)
      expect(() => katex.renderToString(expr, { throwOnError: true, strict: 'error' }), expr).not.toThrow()
    }
  })

  it('stores zero raw Unicode bidi control characters in any Lesson 6 source file and isolates lab counters in <RtlRun>', () => {
    const rawBidiControl = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u
    for (const file of LESSON6_FILES) {
      const content = readProjectFile(file)
      expect(content, file).not.toMatch(rawBidiControl)
    }

    const counterSites: Array<[string, string]> = [
      ['src/simulations/ZincHclExperimentLab.tsx', 'المرحلة ${stage + 1} من 4'],
      ['src/simulations/EquationBalancerLab.tsx', 'تبسيط المعاملات بالقسمة على ${evaluation.coefficientsGcd}'],
      ['src/simulations/WordToSymbolBuilderLab.tsx', 'أنجزت ${completedStages} من 3 مراحل'],
      ['src/simulations/Lesson6ErrorSpotterLab.tsx', 'أجبت عن ${answeredCount} من ${LESSON6_ERROR_CASES.length}'],
    ]

    for (const [file, fragment] of counterSites) {
      const source = readProjectFile(file)
      expect(source).toContain(fragment)
      expect(insideRtlRun(source, fragment), `${file}: ${fragment}`).toBe(true)
    }
  })

  it('renders all 35 Lesson 6 steps, all questions, and the teacher guide with zero stray script glyphs or raw TeX', () => {
    const questionMap = new Map<string, Question>()
    for (const test of chemistryLesson6.tests ?? []) {
      for (const q of test.questions) questionMap.set(q.id, q)
    }

    for (const step of chemistryLesson6.steps) {
      const { container, unmount } = render(
        <div dir="rtl">
          <ContentBlocks
            blocks={step.blocks}
            renderQuestion={(questionId, opts) => {
              const q = questionMap.get(questionId)
              return q ? <InlineQuestion question={q} reveal={opts?.reveal} /> : null
            }}
          />
        </div>,
      )
      expect(strayScriptGlyphs(container), `step ${step.id}`).toEqual([])
      expect(container.querySelectorAll('.katex-error').length, `katex-error in ${step.id}`).toBe(0)
      expect(visibleNonMathmlText(container), `raw TeX in step ${step.id}`).not.toMatch(/\\mathrm|\\longrightarrow|\\xrightarrow/)
      unmount()
    }

    const { container: guideContainer, unmount: unmountGuide } = render(
      <div dir="rtl">
        <ContentBlocks blocks={lesson6TeacherGuide} />
      </div>,
    )
    expect(strayScriptGlyphs(guideContainer), 'teacher guide').toEqual([])
    unmountGuide()

    for (const test of chemistryLesson6.tests ?? []) {
      for (const q of test.questions) {
        const { container: qContainer, unmount: unmountQ } = render(
          <div dir="rtl">
            <InlineQuestion question={q} reveal />
            {q.solutionBlocks ? <ContentBlocks blocks={q.solutionBlocks} /> : null}
          </div>,
        )
        expect(strayScriptGlyphs(qContainer), `question ${q.id}`).toEqual([])
        unmountQ()
      }
    }
  })

  it('grades every deterministic book, practice, and final-test question to outcome="correct" on its canonical answer', () => {
    for (const test of chemistryLesson6.tests ?? []) {
      expect(validateFinalTest(test, test.id)).toEqual([])
    }

    const deterministicBook = [...bookActivitySolutions, ...bookQuestions].filter(
      (q) => q.type !== 'short-answer',
    )
    expect(deterministicBook.length).toBe(10)

    for (const q of [...deterministicBook, ...lesson6PracticeQuestions, ...finalTest.questions]) {
      const evaluation = evaluateQuestion(q, { questionId: q.id, value: correctResponseFor(q) })
      expect(evaluation.outcome, q.id).toBe('correct')
    }
  })
})
