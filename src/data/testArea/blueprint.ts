import {
  COGNITIVE_KEYS,
  COGNITIVE_TAG,
  DIFFICULTIES,
  QUESTION_TYPES,
  type CognitiveKey,
  type Difficulty,
  type QuestionType,
  type TestBlueprint,
  type TestQuestion,
} from './types'

/* ============================================================================
   Blueprint builder
   ----------------------------------------------------------------------------
   The authored parts of a blueprint are the concepts, the targeted common
   errors, the scoring policy and the solution chunk size. The totals — how
   many basic questions, how many of each type, how much of each cognitive
   demand — are derived from the questions themselves, so they can never drift
   out of step with the bank.

   Deriving the tallies does not weaken the audit: the audit still asserts the
   quality rules (no level missing, basic ≤ 40%, advanced + thinking ≥ 25%,
   no type above half the test), so a lopsided bank still fails.
   ========================================================================= */

export type BlueprintConceptInput = {
  id: string
  label: string
  pageRefs: TestBlueprint['concepts'][number]['pageRefs']
  questionIds: string[]
}

export type BlueprintErrorInput = {
  id: string
  label: string
  questionIds: string[]
}

export type BlueprintInput = {
  testId: string
  scope: TestBlueprint['scope']
  unitId: string
  lessonIds: string[]
  questions: TestQuestion[]
  concepts: BlueprintConceptInput[]
  commonErrors: BlueprintErrorInput[]
  crossTopicConnections?: TestBlueprint['crossTopicConnections']
  scoring: TestBlueprint['scoring']
  solutionChunkSize: number
}

function countBy<K extends string>(values: readonly K[], keys: readonly K[]): Record<K, number> {
  const record = Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>
  for (const value of values) record[value] += 1
  return record
}

export function buildBlueprint(input: BlueprintInput): TestBlueprint {
  const { questions } = input

  const cognitive = Object.fromEntries(COGNITIVE_KEYS.map((key) => [key, 0])) as Record<
    CognitiveKey,
    number
  >
  for (const question of questions) {
    for (const key of COGNITIVE_KEYS) {
      if (question.tags.includes(COGNITIVE_TAG[key])) cognitive[key] += 1
    }
  }

  return {
    testId: input.testId,
    scope: input.scope,
    questionCount: questions.length,
    lessonIds: input.lessonIds,
    unitId: input.unitId,
    concepts: input.concepts,
    difficulty: countBy<Difficulty>(
      questions.map((question) => question.difficulty),
      DIFFICULTIES,
    ),
    types: countBy<QuestionType>(
      questions.map((question) => question.type),
      QUESTION_TYPES,
    ),
    cognitive,
    commonErrors: input.commonErrors,
    crossTopicConnections: input.crossTopicConnections,
    scoring: input.scoring,
    solutionChunkSize: input.solutionChunkSize,
  }
}
