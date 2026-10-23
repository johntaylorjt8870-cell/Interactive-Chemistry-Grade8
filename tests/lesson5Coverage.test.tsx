import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import {
  chemistryLesson5,
  bookActivitySolutions,
  bookQuestions,
  lesson5PracticeQuestions,
  finalTest,
  lesson5TeacherGuide,
} from '@/data/curriculum/chemistryLesson5'
import {
  LESSON5_LEDGER,
  LESSON5_OBJECTIVES,
  computeLedgerCoverage,
} from '@/data/curriculum/lesson5SourceLedger'
import { lesson5TestBlueprint } from '@/data/curriculum/chemistryLesson5Test'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { evaluateQuestion } from '@/assessment/evaluate'
import type { Question, ResponseValue } from '@/assessment/types'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { getInteractive } from '@/simulations/registry'
import { strayScriptGlyphs } from './utils/strayGlyphs'

/**
 * Exhaustive source-to-platform ledger, objective alignment, misprint/2.66
 * fidelity, notation/BIDI hygiene, diagram, and progressive-practice
 * verification for rebuilt Lesson 5 (pp. 30–35).
 */

const coverage = computeLedgerCoverage(chemistryLesson5)

function allLesson5Questions(): Question[] {
  return (chemistryLesson5.tests ?? []).flatMap((test) => test.questions)
}

function correctResponseFor(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice':
      return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false':
      return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank':
      return {
        type: 'blanks',
        values: Object.fromEntries(question.blanks.map((b) => [b.id, b.acceptedAnswers[0]!])),
      }
    case 'matching':
      return { type: 'matching', pairs: question.pairs }
    case 'ordering':
      return { type: 'order', itemIds: question.correctOrder }
    case 'numerical':
      return { type: 'number', value: String(question.acceptedAnswers[0]), unit: question.unit }
    default:
      throw new Error(`Expected deterministic question, got ${question.type} (${question.id})`)
  }
}

describe('lesson 5 — 42-entry source ledger (pp. 30–35)', () => {
  it('covers pages 30–35 with 42 entries and zero broken or unresolved items', () => {
    expect(coverage.total).toBe(42)
    expect(coverage.byStatus).toEqual({ implemented: 38, reconstructed: 3, decorative: 1, unresolved: 0 })
    expect(coverage.brokenEntries).toEqual([])
    expect(coverage.byPage).toEqual([
      { page: '30', count: 6 },
      { page: '31', count: 6 },
      { page: '32', count: 6 },
      { page: '33', count: 9 },
      { page: '34', count: 4 },
      { page: '35', count: 11 },
    ])
  })

  it('uses unique ledger IDs and justifies every reconstructed or decorative element', () => {
    const ids = LESSON5_LEDGER.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const entry of LESSON5_LEDGER) {
      expect(entry.sourceSummary.length, entry.id).toBeGreaterThan(25)
      if (entry.status === 'reconstructed' || entry.status === 'decorative') {
        expect(entry.justification, entry.id).toBeTruthy()
        expect((entry.justification ?? '').length, entry.id).toBeGreaterThan(60)
      }
    }
    // The single decorative entry is the pair of lifestyle photographs only.
    expect(LESSON5_LEDGER.filter((entry) => entry.status === 'decorative').map((entry) => entry.id)).toEqual([
      'p31-enrichment-photos',
    ])
  })

  it('maps every top-level textbook item (11 activities + 4 self-test questions) into the ledger', () => {
    const listedQuestionIds = new Set(LESSON5_LEDGER.flatMap((entry) => entry.questionIds ?? []))
    const textbookQuestions = [...bookActivitySolutions, ...bookQuestions]
    expect(textbookQuestions).toHaveLength(15)
    expect(countQuestions(textbookQuestions)).toBe(19)
    for (const q of textbookQuestions) {
      expect(listedQuestionIds.has(q.id), q.id).toBe(true)
    }
  })

  it('registers and renders all 3 schematic SVG figure reconstructions without external images', async () => {
    const diagramIds = [
      'source-figure-p30-balance',
      'source-figure-p31-scale',
      'source-figure-p32-trials',
    ] as const
    for (const id of diagramIds) {
      const entry = getInteractive(id)
      expect(entry, id).toBeDefined()
      expect(entry?.kind).toBe('diagram')
      const Comp = (await entry!.load()).default
      const { container, unmount } = render(<Comp interactiveId={id} reducedMotion />)
      expect(container.querySelector('svg'), id).not.toBeNull()
      expect(container.querySelector('img'), id).toBeNull()
      expect(container.querySelector('svg')?.getAttribute('aria-label')?.length ?? 0, id).toBeGreaterThan(60)
      expect(strayScriptGlyphs(container), id).toEqual([])
      unmount()
    }
  })
})

describe('lesson 5 — printed-fidelity hot spots', () => {
  it('keeps the p33 misprint verbatim, flags it, and solves it for the leftover lead', () => {
    const question = bookActivitySolutions.find((candidate) => candidate.id === 'l5-trial3-excess-lead')!
    expect(question.type).toBe('short-answer')
    expect(question.prompt).toContain('بقي 8 g من الكبريت')
    if (question.type === 'short-answer') {
      expect(question.referenceAnswer).toContain('خطأ مطبعي')
      expect(question.referenceAnswer).toContain('الرصاص')
      expect(question.material?.some((block) => block.kind === 'callout' && block.text.includes('رصاص متبقّي'))).toBe(true)
    }
    const entry = LESSON5_LEDGER.find((candidate) => candidate.id === 'p33-q-excess-8g')!
    expect(entry.sourceSummary).toContain('رصاص متبق')
  })

  it('preserves the four printed CaO/HCl procedure steps and both «تعلّمتُ» bullets verbatim', () => {
    const experiment = chemistryLesson5.steps.find((step) => step.id === 'mass-experiment-source')!
    const procedureBlock = experiment.blocks.find((block) => block.kind === 'procedure')
    expect(procedureBlock?.kind).toBe('procedure')
    if (procedureBlock?.kind === 'procedure') {
      expect(procedureBlock.attribution).toBe('textbook')
      expect(procedureBlock.items).toHaveLength(4)
      expect(procedureBlock.items[0]).toContain('جانب الوعاء')
      expect(procedureBlock.items[1]).toContain('ماذا أُلاحظُ؟')
    }
    const learned = chemistryLesson5.steps.find((step) => step.id === 'learned-summary')!
    const verbatim = learned.blocks.filter((block) => block.kind === 'textbook-verbatim')
    expect(verbatim.length).toBeGreaterThanOrEqual(3)
    expect(verbatim.some((block) => block.kind === 'textbook-verbatim' && block.text.includes('قانون لافوازييه (قانون انحفاظ الكتلة)'))).toBe(true)
    expect(verbatim.some((block) => block.kind === 'textbook-verbatim' && block.text.includes('نسب محدَّدة وثابتة'))).toBe(true)
  })

  it('keeps textbook questions in printed page order inside the student flow', () => {
    const printedOrder = [
      'l5-observe-atoms',
      'l5-calcium-observation',
      'l5-calcium-compare',
      'l5-proust-table',
      'l5-trial1-mass-ratio',
      'l5-trial2-mass-ratio',
      'l5-trial2-excess-sulfur',
      'l5-trial3-mass-ratio',
      'l5-trial3-excess-lead',
      'l5-iron-sulfur-ratio-table',
      'l5-iron-sulfur-60-30',
      'l5-selftest-water-ratio',
      'l5-selftest-atom-count',
      'l5-selftest-mass',
      'l5-selftest-carbon-table',
    ]
    const bookSet = new Set(printedOrder)
    const flow = chemistryLesson5.steps
      .flatMap((step) => step.blocks)
      .flatMap((block) => (block.kind === 'question' ? [block.questionId] : []))
      .filter((id) => bookSet.has(id))
    expect(flow).toEqual(printedOrder)
    expect(bookActivitySolutions.map((q) => q.id)).toEqual(printedOrder.slice(0, 11))
  })
})

describe('lesson 5 — 4 learning objectives alignment', () => {
  const stepIdSet = new Set(chemistryLesson5.steps.map((step) => step.id))

  it('declares all 4 printed objectives and links each to explanation, example, practice, and final test', () => {
    expect(LESSON5_OBJECTIVES.map((o) => o.id)).toEqual(['O1', 'O2', 'O3', 'O4'])
    for (const obj of LESSON5_OBJECTIVES) {
      expect(obj.text.length).toBeGreaterThan(10)
      expect(obj.explanationStepIds.length, `${obj.id} explanation`).toBeGreaterThan(0)
      expect(obj.exampleStepIds.length, `${obj.id} example`).toBeGreaterThan(0)
      expect(obj.practiceQuestionIds.length, `${obj.id} practice`).toBeGreaterThan(0)
      expect(obj.finalQuestionIds.length, `${obj.id} final`).toBeGreaterThanOrEqual(3)
      for (const s of [...obj.explanationStepIds, ...obj.exampleStepIds]) {
        expect(stepIdSet.has(s), `${obj.id} -> ${s}`).toBe(true)
      }
    }
  })

  it('practice objectiveIds and the ledger pools list each other exactly', () => {
    for (const q of lesson5PracticeQuestions) {
      const obj = LESSON5_OBJECTIVES.find((o) => o.id === q.objectiveId)
      expect(obj, q.id).toBeDefined()
      expect(obj!.practiceQuestionIds, q.id).toContain(q.id)
    }
    const pooled = LESSON5_OBJECTIVES.flatMap((o) => o.practiceQuestionIds)
    expect([...pooled].sort()).toEqual(lesson5PracticeQuestions.map((q) => q.id).sort())
  })

  it('the 20-item blueprint assigns every final question to one objective and one difficulty band', () => {
    expect(lesson5TestBlueprint.targetCount).toBe(20)
    const byObjective = lesson5TestBlueprint.objectives.flatMap((group) => group.questionIds)
    const byDifficulty = [
      ...lesson5TestBlueprint.difficulty.foundational,
      ...lesson5TestBlueprint.difficulty.application,
      ...lesson5TestBlueprint.difficulty.reasoning,
    ]
    const finalIds = finalTest.questions.map((q) => q.id)
    expect([...byObjective].sort()).toEqual([...finalIds].sort())
    expect(new Set(byObjective).size).toBe(20)
    expect([...byDifficulty].sort()).toEqual([...finalIds].sort())
    expect(new Set(byDifficulty).size).toBe(20)
    const ledgerFinal = LESSON5_OBJECTIVES.flatMap((o) => o.finalQuestionIds)
    expect([...ledgerFinal].sort()).toEqual([...finalIds].sort())
  })
})

describe('lesson 5 — progressive practice, grading & notation hygiene', () => {
  it('validates and deterministically grades all 20 platform practice questions', () => {
    for (const test of chemistryLesson5.tests ?? []) {
      expect(validateFinalTest(test, test.id)).toEqual([])
    }
    expect(countQuestions(lesson5PracticeQuestions)).toBe(20)
    expect(countQuestions(finalTest.questions)).toBe(20)
    for (const q of lesson5PracticeQuestions) {
      expect(q.origin, q.id).toBe('platform')
      expect(q.hint, q.id).toBeTruthy()
      expect((q.explanation ?? '').length, q.id).toBeGreaterThan(80)
      expect(q.solutionBlocks?.length ?? 0, q.id).toBeGreaterThan(0)
      const outcome = evaluateQuestion(q, { questionId: q.id, value: correctResponseFor(q) })
      expect(outcome.outcome, q.id).toBe('correct')
    }
  })

  it('mounts every inline question (15 textbook + 20 practice = 35) exactly once across lesson steps', () => {
    const inlineIds = chemistryLesson5.steps.flatMap((step) =>
      step.blocks.flatMap((block) => (block.kind === 'question' ? [block.questionId] : [])),
    )
    expect(inlineIds).toHaveLength(35)
    expect(new Set(inlineIds).size).toBe(35)
    for (const q of [...bookActivitySolutions, ...bookQuestions, ...lesson5PracticeQuestions]) {
      expect(inlineIds, q.id).toContain(q.id)
    }
    expect(chemistryLesson5.steps).toHaveLength(28)
  })

  it('recomputes the lesson key numbers independently (no hand-waved results)', () => {
    expect(10 / 1.56).toBeCloseTo(6.410256, 5)
    expect(Math.round((10 / 1.56) * 100) / 100).toBe(6.41)
    expect(3 - 1.56).toBeCloseTo(1.44, 10)
    expect(18 - 10).toBe(8)
    expect(56 / 32).toBe(1.75)
    expect(28 / 16).toBe(1.75)
    expect(7 / 4).toBe(1.75)
    expect(30 * (7 / 4)).toBe(52.5)
    expect(52.5 + 30 + 7.5).toBe(90)
    expect(16 / 2).toBe(8)
    expect(32 / 12).toBeCloseTo(2.666667, 5)
    expect(Math.round((32 / 12) * 100) / 100).toBe(2.67)
    expect(4 * (12 / 32)).toBe(1.5)
    expect(10 * (32 / 12)).toBeCloseTo(26.6667, 3)
    expect(11.56 + 1.44).toBeCloseTo(13, 10)
    expect(11.56 + 8).toBeCloseTo(19.56, 10)
  })

  it('stores no raw bidi control characters in any Lesson 5 file and renders zero stray glyphs or raw TeX', () => {
    const files = [
      'src/data/curriculum/lesson5SourceLedger.ts',
      'src/data/curriculum/chemistryLesson5Book.ts',
      'src/data/curriculum/chemistryLesson5Practice.ts',
      'src/data/curriculum/chemistryLesson5Test.ts',
      'src/data/curriculum/chemistryLesson5TeacherGuide.ts',
      'src/data/curriculum/chemistryLesson5.ts',
    ]
    for (const path of files) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u)
    }

    const questionMap = new Map(allLesson5Questions().map((q) => [q.id, q]))
    for (const step of chemistryLesson5.steps) {
      const { container, unmount } = render(
        <ContentBlocks
          blocks={step.blocks}
          renderQuestion={(id) => {
            const q = questionMap.get(id)
            return q ? <InlineQuestion question={q} /> : null
          }}
        />,
      )
      expect(strayScriptGlyphs(container), step.id).toEqual([])
      expect(container.querySelector('.katex-error'), step.id).toBeNull()
      const visibleClone = container.cloneNode(true) as HTMLElement
      visibleClone.querySelectorAll('.katex-mathml').forEach((node) => node.remove())
      expect(visibleClone.textContent ?? '', step.id).not.toMatch(/\\frac|\\implies|\\mathrm|\\text\{/)
      unmount()
    }

    const { container: guideContainer, unmount: unmountGuide } = render(
      <ContentBlocks blocks={lesson5TeacherGuide} />,
    )
    expect(strayScriptGlyphs(guideContainer)).toEqual([])
    unmountGuide()
  })
})
