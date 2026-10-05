import { describe, expect, it } from 'vitest'

import '@/data/testArea/register'

import { auditRegisteredTests, formatIssues, hasErrors } from '@/data/testArea/audit'
import { corpusSize } from '@/data/testArea/originality'
import { getTestDefinition, listTestDefinitions } from '@/data/testArea/registry'
import type { ResponseValue, TestBank, TestQuestion } from '@/data/testArea/types'
import { chunkCount, chunkIndexOf, chunksOf } from '@/testArea/utils/chunk'
import { gradeAttempt } from '@/testArea/gradeAttempt'
import { gradeQuestion } from '@/testArea/grading'
import { canonicalAnswerOf, keyResponseOf } from '@/testArea/answers'

/* ============================================================================
   Real-content tests
   ----------------------------------------------------------------------------
   These tests run against the shipped banks, not a fixture. They answer the
   four questions that matter for a real test area:

   1. does the content pass every quality rule the audit encodes?
   2. is the published distribution the distribution the questions have?
   3. does the grader agree with the key it was given — for every question,
      in both directions (correct entry → correct, wrong entry → not correct)?
   4. is every question answered by a solution, and are the solutions chunked
      the way the blueprint says?
   ========================================================================= */

const LESSON_1_ID = 'chem-u1-l1'
const LESSON_2_ID = 'chem-u1-l2'
const UNIT_1_ID = 'chem-u1'

async function loadBank(id: string): Promise<TestBank> {
  const definition = getTestDefinition(id)
  expect(definition, `test "${id}" is not registered`).toBeDefined()
  const module = await definition!.load()
  return module.default
}

/** A response that must not be accepted, built from the key itself. */
function wrongResponseOf(question: TestQuestion): ResponseValue {
  switch (question.type) {
    case 'single-choice':
    case 'error-analysis': {
      const wrong = question.options.find((option) => !question.correctOptionIds.includes(option.id))
      return { type: 'choice', optionIds: [wrong!.id] }
    }
    case 'multi-select': {
      const correct = new Set(question.correctOptionIds)
      const distractors = question.options.filter((option) => !correct.has(option.id))
      // A distractor on its own: at best a partial, never a full credit.
      return { type: 'choice', optionIds: [distractors[0]!.id] }
    }
    case 'true-false':
      return { type: 'boolean', value: !question.correctAnswer }
    case 'numeric':
      return { type: 'number', value: String(question.answer.correctValue + 1) }
    case 'exact':
      return { type: 'text', value: 'إجابة خاطئة' }
    case 'ordering': {
      // A rotation: every item moves, so nothing stays in its correct place.
      const [first, ...rest] = question.correctOrder
      return { type: 'order', itemIds: [...rest, first!] }
    }
    case 'matching': {
      const pairs = question.pairs.map((pair, index) => ({
        leftId: pair.leftId,
        rightId: question.pairs[(index + 1) % question.pairs.length]!.rightId,
      }))
      return { type: 'matching', pairs }
    }
    case 'error-correction':
      return question.correction.kind === 'numeric'
        ? { type: 'number', value: String(question.correction.spec.correctValue + 1) }
        : { type: 'text', value: 'إجابة خاطئة' }
  }
}

describe('Test Area content audit', () => {
  it('registers at least one test', () => {
    expect(listTestDefinitions().length).toBeGreaterThan(0)
  })

  it('compares against a non-empty originality corpus', () => {
    expect(corpusSize()).toBeGreaterThan(0)
  })

  it('passes every content rule: coverage, scope, blueprint, solutions', async () => {
    const report = await auditRegisteredTests()
    expect(formatIssues(report.issues)).toBe('')
    expect(hasErrors(report.issues)).toBe(false)
    expect(report.duplicateIds).toEqual([])
  })
})

describe('Lesson 1 test — الذرة والعنصر', () => {
  it('holds exactly 20 questions', async () => {
    const bank = await loadBank(LESSON_1_ID)
    expect(bank.questions).toHaveLength(20)
  })

  it('never drops below the 20-question lesson floor', async () => {
    const bank = await loadBank(LESSON_1_ID)
    expect(bank.questions.length).toBeGreaterThanOrEqual(20)
  })

  it('spreads difficulty as 6 basic, 7 medium, 4 advanced, 3 thinking', async () => {
    const bank = await loadBank(LESSON_1_ID)
    expect(bank.blueprint.difficulty).toEqual({
      basic: 6,
      medium: 7,
      advanced: 4,
      thinking: 3,
    })
    const total = Object.values(bank.blueprint.difficulty).reduce((sum, n) => sum + n, 0)
    expect(total).toBe(bank.questions.length)
  })

  it('uses at least six question types without any type dominating', async () => {
    const bank = await loadBank(LESSON_1_ID)
    const used = Object.values(bank.blueprint.types).filter((count) => count > 0).length
    expect(used).toBeGreaterThanOrEqual(6)
    for (const count of Object.values(bank.blueprint.types)) {
      expect(count).toBeLessThanOrEqual(Math.floor(bank.questions.length / 2))
    }
  })

  it('derives every question from a page inside the lesson', async () => {
    const bank = await loadBank(LESSON_1_ID)
    for (const question of bank.questions) {
      expect(question.sourceRefs.length).toBeGreaterThan(0)
      for (const ref of question.sourceRefs) {
        expect(Number(ref.page)).toBeGreaterThanOrEqual(3)
        expect(Number(ref.page)).toBeLessThanOrEqual(12)
      }
    }
  })

  it('keys every question to a concept the blueprint declares', async () => {
    const bank = await loadBank(LESSON_1_ID)
    const conceptIds = new Set(bank.blueprint.concepts.map((concept) => concept.id))
    for (const question of bank.questions) {
      expect(conceptIds.has(question.conceptId)).toBe(true)
    }
    const referenced = new Set(
      bank.blueprint.concepts.flatMap((concept) => concept.questionIds),
    )
    for (const question of bank.questions) {
      expect(referenced.has(question.id)).toBe(true)
    }
  })
})

describe('Grading agrees with the published key', () => {
  it('marks the keyed answer correct for every question in all banks', async () => {
    for (const id of [LESSON_1_ID, LESSON_2_ID, UNIT_1_ID]) {
      const bank = await loadBank(id)
      for (const question of bank.questions) {
        const grade = gradeQuestion(question, keyResponseOf(question), {
          allowPartial: bank.blueprint.scoring.allowPartial,
        })
        expect(grade.outcome, `${id}/${question.id} keyed answer was not accepted`).toBe('correct')
        expect(grade.ratio).toBe(1)
      }
    }
  })

  it('refuses a wrong answer for every question in all banks', async () => {
    for (const id of [LESSON_1_ID, LESSON_2_ID, UNIT_1_ID]) {
      const bank = await loadBank(id)
      for (const question of bank.questions) {
        const grade = gradeQuestion(question, wrongResponseOf(question), {
          allowPartial: bank.blueprint.scoring.allowPartial,
        })
        expect(grade.outcome, `${id}/${question.id} accepted a wrong answer`).not.toBe('correct')
        expect(grade.ratio).toBeLessThan(1)
      }
    }
  })

  it('marks an empty attempt as fully unanswered for all banks', async () => {
    for (const id of [LESSON_1_ID, LESSON_2_ID, UNIT_1_ID]) {
      const bank = await loadBank(id)
      const result = gradeAttempt(bank, {})
      expect(result.score).toBe(0)
      expect(result.percentage).toBe(0)
      expect(result.correct).toBe(0)
      expect(result.incorrect).toBe(0)
      expect(result.unanswered).toBe(bank.questions.length)
    }
  })

  it('marks a perfect attempt as 100% for all banks', async () => {
    for (const id of [LESSON_1_ID, LESSON_2_ID, UNIT_1_ID]) {
      const bank = await loadBank(id)
      const responses = Object.fromEntries(
        bank.questions.map((question) => [question.id, keyResponseOf(question)]),
      )
      const result = gradeAttempt(bank, responses)
      expect(result.correct).toBe(bank.questions.length)
      expect(result.unanswered).toBe(0)
      expect(result.incorrect).toBe(0)
      expect(result.percentage).toBe(100)
    }
  })

  it('grades deterministically — the same attempt twice, the same result', async () => {
    const bank = await loadBank(UNIT_1_ID)
    const responses = Object.fromEntries(
      bank.questions.map((question, index) => [
        question.id,
        index % 3 === 0 ? keyResponseOf(question) : wrongResponseOf(question),
      ]),
    )
    const first = gradeAttempt(bank, responses)
    const second = gradeAttempt(bank, responses)
    expect(second).toEqual(first)
  })

  it('prints a canonical answer for every question in all banks', async () => {
    for (const id of [LESSON_1_ID, LESSON_2_ID, UNIT_1_ID]) {
      const bank = await loadBank(id)
      for (const question of bank.questions) {
        expect(canonicalAnswerOf(question).trim()).not.toBe('')
      }
    }
  })
})

describe('Lesson 2 and Unit 1 content', () => {
  it('holds exactly 20 Lesson 2 questions with the authored distribution', async () => {
    const bank = await loadBank(LESSON_2_ID)
    expect(bank.questions).toHaveLength(20)
    expect(bank.blueprint.difficulty).toEqual({ basic: 6, medium: 7, advanced: 4, thinking: 3 })
    expect(bank.blueprint.types).toEqual({
      'single-choice': 5,
      'true-false': 2,
      'multi-select': 2,
      numeric: 3,
      exact: 2,
      ordering: 1,
      matching: 1,
      'error-analysis': 2,
      'error-correction': 2,
    })
    expect(bank.blueprint.solutionChunkSize).toBe(5)
    expect(chunkCount(20, 5)).toBe(4)
  })

  it('holds exactly 60 independent Unit 1 questions with its own blueprint', async () => {
    const bank = await loadBank(UNIT_1_ID)
    expect(bank.questions).toHaveLength(60)
    expect(bank.lessonIds).toEqual([LESSON_1_ID, LESSON_2_ID])
    expect(bank.blueprint.difficulty).toEqual({ basic: 15, medium: 20, advanced: 15, thinking: 10 })
    expect(bank.blueprint.types).toEqual({
      'single-choice': 14,
      'true-false': 4,
      'multi-select': 8,
      numeric: 12,
      exact: 6,
      ordering: 4,
      matching: 4,
      'error-analysis': 4,
      'error-correction': 4,
    })
    expect(bank.blueprint.solutionChunkSize).toBe(10)
    expect(chunkCount(60, 10)).toBe(6)
    expect(bank.blueprint.crossTopicConnections?.length).toBeGreaterThanOrEqual(3)
    expect(bank.blueprint.cognitive.crossTopic).toBeGreaterThan(0)
  })

  it('keeps all Lesson 2 and Unit 1 solution sets complete and pedagogical', async () => {
    for (const id of [LESSON_2_ID, UNIT_1_ID]) {
      const definition = getTestDefinition(id)!
      const bank = await loadBank(id)
      const set = (await definition.loadSolutions()).default
      expect(set.solutions).toHaveLength(bank.questions.length)
      expect(set.solutions.map((solution) => solution.questionId)).toEqual(
        bank.questions.map((question) => question.id),
      )
      for (const solution of set.solutions) {
        expect(solution.whyCorrect.trim()).not.toBe('')
        expect(solution.concept.trim()).not.toBe('')
        expect(solution.thinking.length).toBeGreaterThan(0)
        expect(solution.commonMistakes.length).toBeGreaterThan(0)
        expect(solution.pageRefs.length).toBeGreaterThan(0)
      }
    }
  })

  it('maps Unit 1 questions to six fixed solution chunks of ten', async () => {
    const bank = await loadBank(UNIT_1_ID)
    const chunks = chunksOf(bank.questions.length, bank.blueprint.solutionChunkSize)
    expect(chunks.map((chunk) => [chunk.first, chunk.last])).toEqual([
      [1, 10],
      [11, 20],
      [21, 30],
      [31, 40],
      [41, 50],
      [51, 60],
    ])
    expect(chunkIndexOf(0, 10)).toBe(0)
    expect(chunkIndexOf(59, 10)).toBe(5)
  })
})

describe('Solutions', () =>
  // Lesson 1 is retained as a regression contract; Lesson 2 and Unit 1 are
  // covered above with the same order and pedagogical-field guarantees.
  {
    it('answers every Lesson 1 question, in bank order', async () => {
      const definition = getTestDefinition(LESSON_1_ID)!
      const bank = await loadBank(LESSON_1_ID)
      const set = (await definition.loadSolutions()).default
      expect(set.testId).toBe(bank.id)
      expect(set.solutions.map((solution) => solution.questionId)).toEqual(
        bank.questions.map((question) => question.id),
      )
    })

    it('is chunked into parts of five', async () => {
      const bank = await loadBank(LESSON_1_ID)
      expect(bank.blueprint.solutionChunkSize).toBe(5)
      expect(chunkCount(bank.questions.length, bank.blueprint.solutionChunkSize)).toBe(4)
      const chunks = chunksOf(bank.questions.length, bank.blueprint.solutionChunkSize)
      expect(chunks.map((chunk) => [chunk.first, chunk.last])).toEqual([
        [1, 5],
        [6, 10],
        [11, 15],
        [16, 20],
      ])
      expect(chunks[0]!.label).toBe('الجزء الأول (1–5)')
      expect(chunks[3]!.label).toBe('الجزء الرابع (16–20)')
    })

    it('maps every Lesson 1 question to its part', async () => {
      const bank = await loadBank(LESSON_1_ID)
      const size = bank.blueprint.solutionChunkSize
      expect(chunkIndexOf(0, size)).toBe(0)
      expect(chunkIndexOf(4, size)).toBe(0)
      expect(chunkIndexOf(5, size)).toBe(1)
      expect(chunkIndexOf(19, size)).toBe(3)
    })

    it('teaches, not just answers: Lesson 1 solutions carry pedagogical fields', async () => {
      const definition = getTestDefinition(LESSON_1_ID)!
      const set = (await definition.loadSolutions()).default
      for (const solution of set.solutions) {
        expect(solution.whyCorrect.trim()).not.toBe('')
        expect(solution.concept.trim()).not.toBe('')
        expect(solution.thinking.length).toBeGreaterThan(0)
        expect(solution.commonMistakes.length).toBeGreaterThan(0)
        expect(solution.pageRefs.length).toBeGreaterThan(0)
      }
    })

    it('explains why each Lesson 1 distractor is wrong wherever options exist', async () => {
      const definition = getTestDefinition(LESSON_1_ID)!
      const bank = await loadBank(LESSON_1_ID)
      const set = (await definition.loadSolutions()).default
      const byId = new Map(bank.questions.map((question) => [question.id, question]))
      for (const solution of set.solutions) {
        const question = byId.get(solution.questionId)!
        const choiceQuestion =
          question.type === 'single-choice' ||
          question.type === 'multi-select' ||
          question.type === 'error-analysis'
            ? question
            : null
        if (!choiceQuestion) continue

        expect(solution.whyOthersWrong, `${question.id} has no distractor analysis`).toBeDefined()
        const covered = new Set(solution.whyOthersWrong!.map((entry) => entry.optionId))
        for (const option of choiceQuestion.options) {
          if (choiceQuestion.correctOptionIds.includes(option.id)) continue
          expect(
            covered.has(option.id),
            `${question.id} never explains option ${option.id}`,
          ).toBe(true)
        }
      }
    })
  })
