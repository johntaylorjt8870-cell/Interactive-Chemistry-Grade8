import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import {
  chemistryLesson4,
  bookActivitySolutions,
  bookQuestions,
  lesson4PracticeQuestions,
  finalTest,
  lesson4TeacherGuide,
} from '@/data/curriculum/chemistryLesson4'
import {
  LESSON4_LEDGER,
  LESSON4_OBJECTIVES,
  computeLedgerCoverage,
} from '@/data/curriculum/lesson4SourceLedger'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { evaluateQuestion } from '@/assessment/evaluate'
import type { Question, ResponseValue } from '@/assessment/types'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { getInteractive } from '@/simulations/registry'
import { strayScriptGlyphs } from './utils/strayGlyphs'

/**
 * Exhaustive source-to-platform ledger, objective alignment, notation/BIDI,
 * schematic diagram, and progressive-practice verification for rebuilt Lesson 4.
 */

const coverage = computeLedgerCoverage(chemistryLesson4)

function allLesson4Questions(): Question[] {
  return (chemistryLesson4.tests ?? []).flatMap((test) => test.questions)
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
      return { type: 'number', value: String(question.acceptedAnswers[0]) }
    default:
      throw new Error(`Expected deterministic question, got ${question.type} (${question.id})`)
  }
}

describe('lesson 4 — 44-entry source ledger (pp. 24–29)', () => {
  it('covers pages 24–29 with 44 entries and zero broken or unresolved items', () => {
    expect(coverage.total).toBe(44)
    expect(coverage.byStatus.unresolved).toBe(0)
    expect(coverage.brokenEntries).toEqual([])
    expect(coverage.byPage.map((p) => p.page)).toEqual(['24', '25', '26', '27', '28', '29'])
    for (const p of coverage.byPage) {
      expect(p.count, `page ${p.page}`).toBeGreaterThan(0)
    }
  })

  it('uses unique ledger IDs and justifies every reconstructed or decorative element', () => {
    const ids = LESSON4_LEDGER.map((entry) => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(
      coverage.byStatus.implemented + coverage.byStatus.reconstructed + coverage.byStatus.decorative,
    ).toBe(coverage.total)

    for (const entry of LESSON4_LEDGER) {
      if (entry.status === 'reconstructed' || entry.status === 'decorative') {
        expect(entry.justification, entry.id).toBeTruthy()
        expect((entry.justification ?? '').length, entry.id).toBeGreaterThan(40)
      }
    }
  })

  it('maps every one of the 33 textbook items (20 activities + 13 self-test questions) into the ledger', () => {
    const listedQuestionIds = new Set(LESSON4_LEDGER.flatMap((entry) => entry.questionIds ?? []))
    const textbookQuestions = [...bookActivitySolutions, ...bookQuestions]
    expect(textbookQuestions).toHaveLength(33)
    for (const q of textbookQuestions) {
      expect(listedQuestionIds.has(q.id), q.id).toBe(true)
    }
  })

  it('registers and renders all 4 schematic SVG figure reconstructions without external images', async () => {
    const diagramIds = [
      'source-figure-p24-observations',
      'source-figure-p25-magnesium',
      'source-figure-p26-burner',
      'source-figure-p29-q6',
    ] as const
    for (const id of diagramIds) {
      const entry = getInteractive(id)
      expect(entry, id).toBeDefined()
      expect(entry?.kind).toBe('diagram')
      const Comp = (await entry!.load()).default
      const { container, unmount } = render(<Comp interactiveId={id} reducedMotion />)
      expect(container.querySelector('svg'), id).not.toBeNull()
      expect(container.querySelector('img'), id).toBeNull()
      expect(strayScriptGlyphs(container), id).toEqual([])
      unmount()
    }
  })
})

describe('lesson 4 — 6 learning objectives alignment', () => {
  const stepIdSet = new Set(chemistryLesson4.steps.map((step) => step.id))
  const questions = allLesson4Questions()

  it('declares all 6 printed objectives and links each to explanation, example, practice, and final test', () => {
    expect(LESSON4_OBJECTIVES.map((o) => o.id)).toEqual(['O1', 'O2', 'O3', 'O4', 'O5', 'O6'])
    for (const obj of LESSON4_OBJECTIVES) {
      expect(obj.text.length).toBeGreaterThan(10)
      expect(obj.explanationStepIds.length, `${obj.id} explanation`).toBeGreaterThan(0)
      expect(obj.exampleStepIds.length, `${obj.id} example`).toBeGreaterThan(0)
      expect(obj.practiceQuestionIds.some((id) => id.startsWith('l4-practice-')), `${obj.id} practice`).toBe(true)
      expect(obj.finalQuestionIds.length, `${obj.id} final`).toBeGreaterThanOrEqual(2)

      for (const s of [...obj.explanationStepIds, ...obj.exampleStepIds]) {
        expect(stepIdSet.has(s), `${obj.id} -> ${s}`).toBe(true)
      }
    }
  })

  it('assigns every question (33 book + 24 practice + 20 final = 77) to a valid objective that lists it back', () => {
    expect(questions).toHaveLength(77)
    for (const q of questions) {
      expect(q.objectiveId, q.id).toBeTruthy()
      const obj = LESSON4_OBJECTIVES.find((o) => o.id === q.objectiveId)
      expect(obj, q.id).toBeDefined()
      const pool = q.id.startsWith('l4-final-') ? obj!.finalQuestionIds : obj!.practiceQuestionIds
      expect(pool, q.id).toContain(q.id)
    }
  })
})

describe('lesson 4 — progressive practice, textbook word-equation grading & notation hygiene', () => {
  it('validates and deterministically grades all 24 platform practice questions and all 9 fill-blank book equations', () => {
    for (const test of chemistryLesson4.tests ?? []) {
      expect(validateFinalTest(test, test.id)).toEqual([])
    }
    expect(countQuestions(lesson4PracticeQuestions)).toBe(24)
    expect(countQuestions(finalTest.questions)).toBe(20)

    const fillBlankBookItems = [...bookActivitySolutions, ...bookQuestions].filter((q) => q.type === 'fill-blank')
    expect(fillBlankBookItems).toHaveLength(9)

    for (const q of [...lesson4PracticeQuestions, ...fillBlankBookItems]) {
      expect(q.hint, q.id).toBeTruthy()
      expect((q.explanation ?? '').length, q.id).toBeGreaterThan(80)
      expect(q.solutionBlocks?.length ?? 0, q.id).toBeGreaterThan(0)
      const outcome = evaluateQuestion(q, { questionId: q.id, value: correctResponseFor(q) })
      expect(outcome.outcome, q.id).toBe('correct')
    }
  })

  it('mounts every inline question (33 textbook + 24 practice = 57) exactly once across lesson steps', () => {
    const inlineIds = chemistryLesson4.steps.flatMap((step) =>
      step.blocks.flatMap((block) => (block.kind === 'question' ? [block.questionId] : [])),
    )
    expect(inlineIds).toHaveLength(57)
    expect(new Set(inlineIds).size).toBe(57)
    for (const q of [...bookActivitySolutions, ...bookQuestions, ...lesson4PracticeQuestions]) {
      expect(inlineIds, q.id).toContain(q.id)
    }
  })

  it('stores no raw bidi control characters in any Lesson 4 curriculum file and renders zero stray glyphs or raw TeX', () => {
    const files = [
      'src/data/curriculum/lesson4SourceLedger.ts',
      'src/data/curriculum/chemistryLesson4Book.ts',
      'src/data/curriculum/chemistryLesson4Practice.ts',
      'src/data/curriculum/chemistryLesson4Test.ts',
      'src/data/curriculum/chemistryLesson4TeacherGuide.ts',
      'src/data/curriculum/chemistryLesson4.ts',
    ]
    for (const path of files) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u)
    }

    const questionMap = new Map(allLesson4Questions().map((q) => [q.id, q]))
    for (const step of chemistryLesson4.steps) {
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
      expect(visibleClone.textContent ?? '', step.id).not.toMatch(/\\frac|\\implies|\\mathrm/)
      unmount()
    }

    const { container: guideContainer, unmount: unmountGuide } = render(
      <ContentBlocks blocks={lesson4TeacherGuide} />,
    )
    expect(strayScriptGlyphs(guideContainer)).toEqual([])
    unmountGuide()
  })
})
