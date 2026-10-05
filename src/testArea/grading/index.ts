import type { ResponseValue, TestQuestion } from '@/data/testArea/types'
import { gradeBoolean, gradeChoice } from './choice'
import { gradeExact } from './exact'
import { gradeMatching, gradeOrdering } from './ordering'
import { gradeNumeric } from './numeric'
import type { Grade } from './types'

export type { Grade, GradeOutcome } from './types'
export { OUTCOME_LABELS, NOTE_LABELS } from './types'

export type QuestionGrade = {
  questionId: string
  outcome: Grade['outcome']
  ratio: number
  notes: string[]
}

export type GradeOptions = {
  /** Multi-select / ordering / matching partial credit, as declared by the blueprint. */
  allowPartial?: boolean
}

function mismatch(questionId: string): QuestionGrade {
  return { questionId, outcome: 'invalid', ratio: 0, notes: ['response-shape-mismatch'] }
}

function withId(questionId: string, grade: Grade): QuestionGrade {
  return { questionId, outcome: grade.outcome, ratio: grade.ratio, notes: grade.notes }
}

/**
 * Grades one question. Pure: the same (question, response) always produces the
 * same outcome, and the function never touches the DOM or storage.
 */
export function gradeQuestion(
  question: TestQuestion,
  response: ResponseValue | undefined,
  options: GradeOptions = {},
): QuestionGrade {
  const allowPartial = options.allowPartial ?? false

  switch (question.type) {
    case 'single-choice':
      if (response && response.type !== 'choice') return mismatch(question.id)
      return withId(
        question.id,
        gradeChoice(question.correctOptionIds, response, { mode: 'single' }),
      )

    case 'error-analysis':
      if (response && response.type !== 'choice') return mismatch(question.id)
      return withId(
        question.id,
        gradeChoice(question.correctOptionIds, response, { mode: 'single' }),
      )

    case 'multi-select':
      if (response && response.type !== 'choice') return mismatch(question.id)
      return withId(
        question.id,
        gradeChoice(question.correctOptionIds, response, {
          mode: 'multi',
          allowPartial,
        }),
      )

    case 'true-false':
      if (response && response.type !== 'boolean') return mismatch(question.id)
      return withId(question.id, gradeBoolean(question.correctAnswer, response))

    case 'numeric':
      if (response && response.type !== 'number') return mismatch(question.id)
      return withId(question.id, gradeNumeric(question.answer, response))

    case 'exact':
      if (response && response.type !== 'text') return mismatch(question.id)
      return withId(question.id, gradeExact(question.answer, response))

    case 'ordering':
      if (response && response.type !== 'order') return mismatch(question.id)
      return withId(question.id, gradeOrdering(question.correctOrder, response, allowPartial))

    case 'matching':
      if (response && response.type !== 'matching') return mismatch(question.id)
      return withId(question.id, gradeMatching(question.pairs, response, allowPartial))

    case 'error-correction':
      if (question.correction.kind === 'numeric') {
        if (response && response.type !== 'number') return mismatch(question.id)
        return withId(question.id, gradeNumeric(question.correction.spec, response))
      }
      if (response && response.type !== 'text') return mismatch(question.id)
      return withId(question.id, gradeExact(question.correction.spec, response))
  }
}
