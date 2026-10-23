import { describe, expect, it } from 'vitest'
import { chemistryLesson3 } from '@/data/curriculum/chemistryLesson3'
import {
  LESSON3_LEDGER,
  LESSON3_OBJECTIVES,
  computeLedgerCoverage,
} from '@/data/curriculum/lesson3SourceLedger'
import { countQuestions } from '@/assessment/validate'
import type { Question } from '@/assessment/types'

/**
 * Source-to-implementation ledger guards for Lesson 3.
 *
 * These checks are structural, not textual: they prove that every printed element
 * the ledger claims is actually wired into a real step or question, that no
 * textbook question was dropped, and that no objective is orphaned.
 */

const coverage = computeLedgerCoverage(chemistryLesson3)

function allQuestions(): Question[] {
  const out: Question[] = []
  const walk = (list: Question[]) => {
    for (const question of list) {
      out.push(question)
      if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
        walk(question.questions)
      }
    }
  }
  for (const test of chemistryLesson3.tests ?? []) walk(test.questions)
  return out
}

describe('lesson 3 — source ledger', () => {
  it('covers pages 18–23 with zero unresolved instructional elements', () => {
    expect(coverage.unresolved).toBe(0)
    expect(coverage.pagesWithoutEntries).toEqual([])
    expect(Object.keys(coverage.byPage).sort()).toEqual(['18', '19', '20', '21', '22', '23'])
  })

  it('points every ledger item at an existing step and question', () => {
    expect(coverage.danglingSteps).toEqual([])
    expect(coverage.danglingQuestions).toEqual([])
    expect(coverage.unlistedTextbookQuestions).toEqual([])
  })

  it('lists every printed question and activity exactly once', () => {
    const listed = LESSON3_LEDGER.flatMap((item) => item.questionIds ?? [])
    const textbook = allQuestions().filter((question) => question.origin === 'textbook')
    expect(textbook).toHaveLength(22)
    // Ledger entries may also point at platform questions that reuse a printed
    // table or rule, but each reference is recorded exactly once.
    expect(new Set(listed).size).toBe(listed.length)
    const listedSet = new Set(listed)
    for (const question of textbook) expect(listedSet.has(question.id), question.id).toBe(true)
    expect(listedSet.size).toBeGreaterThanOrEqual(textbook.length)
  })

  it('keeps the declared totals in step with the ledger', () => {
    expect(coverage.total).toBe(LESSON3_LEDGER.length)
    expect(coverage.implemented + coverage.reconstructed + coverage.decorative).toBe(coverage.total)
    expect(coverage.implemented).toBeGreaterThan(coverage.total * 0.8)
  })

  it('justifies every reconstructed or decorative item', () => {
    for (const item of LESSON3_LEDGER) {
      if (item.status === 'reconstructed' || item.status === 'decorative') {
        expect(item.note, item.id).toBeTruthy()
        expect((item.note ?? '').length).toBeGreaterThan(40)
      }
    }
  })

  it('uses unique ids and keeps each printed page non-empty', () => {
    const ids = LESSON3_LEDGER.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const [page, count] of Object.entries(coverage.byPage)) {
      expect(count, `page ${page}`).toBeGreaterThan(0)
    }
  })
})

describe('lesson 3 — objectives', () => {
  const questions = allQuestions()
  const byObjective = new Map<string, string[]>()
  for (const question of questions) {
    if (!question.objectiveId) continue
    const list = byObjective.get(question.objectiveId) ?? []
    list.push(question.id)
    byObjective.set(question.objectiveId, list)
  }

  it('declares the five printed objectives', () => {
    expect(LESSON3_OBJECTIVES.map((objective) => objective.id)).toEqual(['O1', 'O2', 'O3', 'O4', 'O5'])
    for (const objective of LESSON3_OBJECTIVES) {
      expect(objective.printed.length).toBeGreaterThan(10)
      expect(objective.stepIds.length).toBeGreaterThan(0)
    }
  })

  it('ties every objective to real teaching steps', () => {
    const stepIds = new Set(chemistryLesson3.steps.map((step) => step.id))
    for (const objective of LESSON3_OBJECTIVES) {
      for (const stepId of objective.stepIds) expect(stepIds.has(stepId), `${objective.id}:${stepId}`).toBe(true)
    }
  })

  it('measures every objective in the practice set and the final test', () => {
    for (const objective of LESSON3_OBJECTIVES) {
      const ids = objective.questionIds
      expect(ids.some((id) => id.includes('practice')), `${objective.id} practice`).toBe(true)
      expect(ids.some((id) => id.includes('final')), `${objective.id} final`).toBe(true)
    }
  })

  it('assigns each question to exactly one objective, and that objective lists it', () => {
    for (const question of questions) {
      const objective = LESSON3_OBJECTIVES.find((candidate) => candidate.id === question.objectiveId)
      expect(objective, question.id).toBeDefined()
      expect(objective!.questionIds, question.id).toContain(question.id)
    }
    for (const [objectiveId, ids] of byObjective) {
      const objective = LESSON3_OBJECTIVES.find((candidate) => candidate.id === objectiveId)!
      expect(objective.questionIds, objectiveId).toEqual(expect.arrayContaining(ids))
    }
  })
})

describe('lesson 3 — assessment inventory', () => {
  it('holds 24 platform practice questions inside the lesson steps', () => {
    const practice = chemistryLesson3.tests!.find((test) => test.id === 'chem-u1-l3-practice')!
    expect(countQuestions(practice.questions)).toBe(24)
    expect(practice.questions.every((question) => question.origin === 'platform')).toBe(true)
    expect(practice.questions.every((question) => !!question.hint)).toBe(true)
    expect(practice.questions.every((question) => (question.explanation ?? '').length > 20)).toBe(true)
  })

  it('holds the 18-question final test inside platform policy', () => {
    const final = chemistryLesson3.tests!.find((test) => test.id === 'chem-u1-l3-final')!
    expect(countQuestions(final.questions)).toBe(18)
    expect(final.targetQuestionCount).toEqual({ min: 10, max: 20 })
  })

  it('renders every question block once, and resolves to a real question', () => {
    const ids = chemistryLesson3.steps.flatMap((step) =>
      step.blocks.filter((block) => block.kind === 'question').map((block) => (block as { questionId: string }).questionId),
    )
    expect(new Set(ids).size).toBe(ids.length)
    const known = new Set(allQuestions().map((question) => question.id))
    for (const id of ids) expect(known.has(id), id).toBe(true)
    for (const id of allQuestions().map((question) => question.id)) {
      if (id.startsWith('l3-final-')) continue
      expect(ids, id).toContain(id)
    }
  })
})
