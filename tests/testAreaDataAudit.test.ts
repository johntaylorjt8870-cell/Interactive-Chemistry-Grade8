import { describe, expect, it } from 'vitest'
import {
  auditOriginality,
  auditSolutionSet,
  auditTestBank,
  auditTestMeta,
  hasErrors,
} from '@/data/testArea/audit'
import { listTestDefinitions, __resetTestRegistry } from '@/data/testArea/registry'
import type { SolutionSet, TestBank, TestMeta } from '@/data/testArea/types'
import { fixtureBank, fixtureQuestion, fixtureSolutionSet, syncBlueprint } from './fixtures/testArea'

/* ============================================================================
   Test Area data audit
   ----------------------------------------------------------------------------
   The audit is what turns the quality rules from prose into build failures.
   These tests prove two things: a healthy bank passes, and every rule that
   matters actually fires when it is broken.
   ========================================================================= */

function clone<T>(value: T): T {
  return structuredClone(value)
}

function codes(issues: ReturnType<typeof auditTestBank>): string[] {
  return issues.map((issue) => issue.code)
}

describe('a well-formed bank', () => {
  it('passes every audit rule', () => {
    const bank = fixtureBank()
    const issues = auditTestBank(bank)
    expect(issues).toEqual([])
  })

  it('passes together with its solution set', () => {
    const bank = fixtureBank()
    const issues = auditSolutionSet(bank, fixtureSolutionSet(bank))
    expect(issues).toEqual([])
  })

  it('keeps its metadata and blueprint in agreement', () => {
    const bank = fixtureBank()
    const meta: TestMeta = {
      id: bank.id,
      scope: bank.scope,
      title: bank.title,
      summary: bank.summary,
      unitId: bank.unitId,
      lessonIds: bank.lessonIds,
      questionCount: bank.questions.length,
      difficulty: { ...bank.blueprint.difficulty },
      types: { ...bank.blueprint.types },
      solutionChunkSize: bank.blueprint.solutionChunkSize,
      pageRange: '3–12',
    }
    expect(auditTestMeta(meta, bank)).toEqual([])
  })
})

describe('question integrity', () => {
  it('fails on duplicated question ids', () => {
    const bank = clone(fixtureBank())
    bank.questions[3] = { ...bank.questions[3]!, id: bank.questions[0]!.id }
    expect(codes(auditTestBank(bank))).toContain('bank/duplicate-question-id')
  })

  it('fails on near-duplicate questions', () => {
    const bank = clone(fixtureBank())
    bank.questions[1]!.prompt = bank.questions[0]!.prompt
    expect(codes(auditTestBank(bank))).toContain('bank/near-duplicate')
  })

  it('fails on a question copied from existing content', () => {
    const bank = fixtureBank()
    const issues = auditOriginality(bank, [bank.questions[0]!.prompt])
    expect(issues.map((issue) => issue.code)).toContain('bank/copies-existing-question')
  })

  it('fails on a single-choice question without exactly one correct option', () => {
    const bank = clone(fixtureBank())
    const question = bank.questions.find((entry) => entry.type === 'single-choice')!
    if (question.type === 'single-choice') question.correctOptionIds = ['a', 'b']
    expect(codes(auditTestBank(bank))).toContain('question/single-choice-arity')
  })

  it('fails on a multi-select question with a single correct option', () => {
    const bank = clone(fixtureBank())
    const question = bank.questions.find((entry) => entry.type === 'multi-select')!
    if (question.type === 'multi-select') question.correctOptionIds = ['a']
    expect(codes(auditTestBank(bank))).toContain('question/multi-select-arity')
  })

  it('fails on an ordering question whose correct order is not a permutation', () => {
    const bank = clone(fixtureBank())
    const question = bank.questions.find((entry) => entry.type === 'ordering')!
    if (question.type === 'ordering') question.correctOrder = ['s1', 's1', 's2']
    expect(codes(auditTestBank(bank))).toContain('question/ordering-not-permutation')
  })

  it('fails on an incomplete matching question', () => {
    const bank = clone(fixtureBank())
    const question = bank.questions.find((entry) => entry.type === 'matching')!
    if (question.type === 'matching') question.pairs = question.pairs.slice(0, 2)
    expect(codes(auditTestBank(bank))).toContain('question/matching-incomplete')
  })

  it('fails when a question has no source page', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.sourceRefs = []
    expect(codes(auditTestBank(bank))).toContain('question/no-source')
  })

  it('fails when a question references a page outside its lessons', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.sourceRefs = [{ page: '99' }]
    expect(codes(auditTestBank(bank))).toContain('question/page-out-of-scope')
  })

  it('fails on a symbol that the published curriculum never contains', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.prompt = 'ما توزيع ذرّة الزينون Xe؟'
    expect(codes(auditTestBank(bank))).toContain('question/out-of-curriculum-symbol')
  })

  it('fails on placeholder wording', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.prompt = 'سؤال تجريبي TODO'
    expect(codes(auditTestBank(bank))).toContain('question/placeholder')
  })

  it('fails on a question with no cognitive tag', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.tags = []
    expect(codes(auditTestBank(bank))).toContain('question/no-tags')
  })

  it('fails on a concept the blueprint does not declare', () => {
    const bank = clone(fixtureBank())
    bank.questions[0]!.conceptId = 'concept-unknown'
    expect(codes(auditTestBank(bank))).toContain('question/unknown-concept')
  })
})

describe('blueprint integrity', () => {
  it('fails when the question count disagrees with the questions', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.questionCount = 19
    expect(codes(auditTestBank(bank))).toContain('blueprint/question-count')
  })

  it('fails when the difficulty tally drifts from the questions', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.difficulty.basic += 1
    expect(codes(auditTestBank(bank))).toContain('blueprint/difficulty-total')
    expect(codes(auditTestBank(bank))).toContain('blueprint/difficulty-mismatch')
  })

  it('fails when a test is mostly basic questions', () => {
    const bank = clone(fixtureBank())
    for (const question of bank.questions) question.difficulty = 'basic'
    syncBlueprint(bank)
    const blueprintIssues = codes(auditTestBank(bank))
    expect(blueprintIssues).toContain('blueprint/too-many-basic')
    expect(blueprintIssues).toContain('blueprint/too-few-higher-order')
    expect(blueprintIssues).toContain('blueprint/missing-difficulty-level')
  })

  it('fails when the type tally drifts from the questions', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.types['single-choice'] += 1
    expect(codes(auditTestBank(bank))).toContain('blueprint/type-total')
  })

  it('fails when one question type dominates the test', () => {
    const bank = clone(fixtureBank())
    bank.questions = bank.questions.map((question, index) =>
      question.type === 'single-choice' ? question : fixtureQuestion('single-choice', index),
    )
    syncBlueprint(bank)
    const issues = codes(auditTestBank(bank))
    expect(issues).toContain('blueprint/type-dominates')
    expect(issues).toContain('blueprint/too-few-types')
  })

  it('fails when the cognitive coverage disagrees with the tags', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.cognitive.conceptual += 1
    expect(codes(auditTestBank(bank))).toContain('blueprint/cognitive-mismatch')
  })

  it('fails when no common error is targeted', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.commonErrors = []
    expect(codes(auditTestBank(bank))).toContain('blueprint/no-common-errors')
  })

  it('fails when no question measures error analysis', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.cognitive.errorAnalysis = 0
    expect(codes(auditTestBank(bank))).toContain('blueprint/no-error-coverage')
  })

  it('fails when a declared concept has no questions', () => {
    const bank = clone(fixtureBank())
    bank.blueprint.concepts[0]!.questionIds = []
    expect(codes(auditTestBank(bank))).toContain('blueprint/empty-concept')
  })

  it('fails when a lesson test does not hold 20 questions', () => {
    const bank = fixtureBank({ questionCount: 19 })
    expect(codes(auditTestBank(bank))).toContain('bank/lesson-question-count')
  })

  it('fails when a lesson test covers more than one lesson', () => {
    const bank = fixtureBank({ lessonIds: ['chem-u1-l1', 'chem-u1-l2'] })
    expect(codes(auditTestBank(bank))).toContain('blueprint/lesson-scope')
  })
})

describe('solution coverage', () => {
  it('fails when a question has no solution', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions = set.solutions.filter((solution) => solution.questionId !== 'fx-q01')
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/missing')
  })

  it('fails when a solution references a question that does not exist', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions.push({
      questionId: 'does-not-exist',
      answer: 'إجابة',
      whyCorrect: 'لأنها كذلك',
      concept: 'شرح',
      thinking: ['خطوة'],
      commonMistakes: ['خطأ'],
      pageRefs: [{ page: '5' }],
    })
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/unknown-question')
  })

  it('fails when a solution answer contradicts the grading key', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions[0]!.answer = 'إجابة تخالف مفتاح التصحيح'
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/answer-mismatch')
  })

  it('fails when a solution is a bare answer key with no explanation', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions[0]!.whyCorrect = ''
    set.solutions[0]!.concept = ''
    set.solutions[0]!.thinking = []
    set.solutions[0]!.commonMistakes = []
    const codes = auditSolutionSet(bank, set).map((issue) => issue.code)
    expect(codes).toContain('solutions/no-reason')
    expect(codes).toContain('solutions/no-concept')
    expect(codes).toContain('solutions/no-thinking')
    expect(codes).toContain('solutions/no-common-mistakes')
  })

  it('fails when a solution references a page outside the test', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions[0]!.pageRefs = [{ page: '42' }]
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/page-out-of-scope')
  })

  it('fails when a solution contains placeholder wording', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions[0]!.concept = 'يُضاف لاحقًا'
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/placeholder')
  })

  it('fails when a distractor rationale points at an unknown option', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    const first = set.solutions[0]!
    first.whyOthersWrong = [{ optionId: 'zz', reason: 'سبب' }]
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/unknown-option')
  })

  it('fails when a duplicate solution exists', () => {
    const bank = fixtureBank()
    const set = clone(fixtureSolutionSet(bank))
    set.solutions.push(clone(set.solutions[0]!))
    expect(auditSolutionSet(bank, set).map((issue) => issue.code)).toContain('solutions/duplicate')
  })
})

describe('registry', () => {
  it('reports no issues while no test is registered — never a placeholder test', () => {
    __resetTestRegistry()
    expect(listTestDefinitions()).toEqual([])
    expect(hasErrors([])).toBe(false)
  })
})

describe('solution sets are independent modules', () => {
  it('keeps the solutions out of the bank object', () => {
    const bank: TestBank = fixtureBank()
    const set: SolutionSet = fixtureSolutionSet(bank)
    expect(JSON.stringify(bank)).not.toContain('whyCorrect')
    expect(set.solutions).toHaveLength(bank.questions.length)
  })
})
