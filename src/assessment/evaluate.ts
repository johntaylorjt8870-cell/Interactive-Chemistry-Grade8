import type { AttemptSummary, Question, QuestionResponse, ResponseValue } from './types'

/**
 * Answer evaluation, kept separate from rendering so the marking rules can be
 * unit tested on their own and reused by the final test, the book solutions
 * view and any future practice mode.
 */

export type EvaluationOutcome = AttemptSummary['results'][number]['outcome']

export type Evaluation = {
  questionId: string
  outcome: EvaluationOutcome
  /** Non-empty when the answer is wrong in a specific, teachable way. */
  notes: string[]
}

function normaliseText(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const left = [...a].sort()
  const right = [...b].sort()
  return left.every((value, index) => value === right[index])
}

export function evaluateQuestion(question: Question, response: QuestionResponse | undefined): Evaluation {
  const value = response?.value ?? null

  if (value === null) {
    return { questionId: question.id, outcome: 'unanswered', notes: [] }
  }

  switch (question.type) {
    case 'multiple-choice': {
      if (value.type !== 'choice') return mismatch(question.id)
      return {
        questionId: question.id,
        outcome: sameSet(value.optionIds, question.correctOptionIds) ? 'correct' : 'incorrect',
        notes: [],
      }
    }

    case 'true-false': {
      if (value.type !== 'boolean') return mismatch(question.id)
      if (value.value === null) return { questionId: question.id, outcome: 'unanswered', notes: [] }
      return {
        questionId: question.id,
        outcome: value.value === question.correctAnswer ? 'correct' : 'incorrect',
        notes: [],
      }
    }

    case 'fill-blank': {
      if (value.type !== 'blanks') return mismatch(question.id)
      const notes: string[] = []
      let allCorrect = true

      for (const blank of question.blanks) {
        const given = value.values[blank.id] ?? ''
        const normalised = blank.caseSensitive ? normaliseText(given) : normaliseText(given).toLowerCase()
        const accepted = blank.acceptedAnswers.map((answer) =>
          blank.caseSensitive ? normaliseText(answer) : normaliseText(answer).toLowerCase(),
        )
        if (!accepted.includes(normalised)) {
          allCorrect = false
          notes.push(blank.id)
        }
      }

      return { questionId: question.id, outcome: allCorrect ? 'correct' : 'incorrect', notes }
    }

    case 'ordering': {
      if (value.type !== 'order') return mismatch(question.id)
      const correct =
        value.itemIds.length === question.correctOrder.length &&
        value.itemIds.every((id, index) => id === question.correctOrder[index])
      return { questionId: question.id, outcome: correct ? 'correct' : 'incorrect', notes: [] }
    }

    case 'matching': {
      if (value.type !== 'matching') return mismatch(question.id)
      const correctCount = question.pairs.filter((pair) =>
        value.pairs.some((answer) => answer.leftId === pair.leftId && answer.rightId === pair.rightId),
      ).length
      const outcome: EvaluationOutcome =
        correctCount === question.pairs.length ? 'correct' : correctCount === 0 ? 'incorrect' : 'partial'
      return { questionId: question.id, outcome, notes: [] }
    }

    case 'numerical': {
      if (value.type !== 'number') return mismatch(question.id)
      const numeric = Number(normaliseText(value.value).replace(',', '.'))
      if (!Number.isFinite(numeric)) {
        return { questionId: question.id, outcome: 'incorrect', notes: ['non-numeric-entry'] }
      }

      const tolerance = question.tolerance ?? 0
      const withinRange = question.acceptedAnswers.some(
        (answer) => Math.abs(answer - numeric) <= Math.abs(tolerance),
      )

      const notes: string[] = []
      let unitCorrect = true
      if (question.unit && value.unit !== undefined) {
        const acceptedUnits = [question.unit, ...(question.acceptedUnits ?? [])]
        unitCorrect = acceptedUnits.some((unit) => normaliseText(unit) === normaliseText(value.unit ?? ''))
        if (!unitCorrect) notes.push('unit-mismatch')
      }

      return {
        questionId: question.id,
        outcome: withinRange && unitCorrect ? 'correct' : 'incorrect',
        notes,
      }
    }

    case 'short-answer': {
      if (value.type !== 'text') return mismatch(question.id)
      const text = normaliseText(value.value)
      if (text === '') return { questionId: question.id, outcome: 'unanswered', notes: [] }
      const wordCount = text.split(' ').filter(Boolean).length
      const tooShort = question.minWords !== undefined && wordCount < question.minWords
      return {
        questionId: question.id,
        // Free text is never auto-marked wrong: it is flagged for review, which
        // is what the teacher area and the solutions view are for.
        outcome: tooShort ? 'partial' : 'needs-review',
        notes: tooShort ? ['below-min-words'] : [],
      }
    }

    case 'table-interpretation':
    case 'diagram-interpretation': {
      if (value.type !== 'composite') return mismatch(question.id)
      const childResults = question.questions.map((child) =>
        evaluateQuestion(child, { questionId: child.id, value: value.children[child.id] ?? null }),
      )
      const allCorrect = childResults.every((result) => result.outcome === 'correct')
      const anyAnswered = childResults.some((result) => result.outcome !== 'unanswered')
      return {
        questionId: question.id,
        outcome: allCorrect ? 'correct' : anyAnswered ? 'partial' : 'unanswered',
        notes: [],
      }
    }
  }
}

function mismatch(questionId: string): Evaluation {
  return { questionId, outcome: 'incorrect', notes: ['response-shape-mismatch'] }
}

/** Aggregates a full attempt, preserving per-question outcomes for review. */
export function summariseAttempt(
  questions: Question[],
  responses: Record<string, QuestionResponse | undefined>,
): AttemptSummary {
  const results = questions.map((question, index) => {
    const evaluation = evaluateQuestion(question, responses[question.id])
    return {
      questionId: question.id,
      outcome: evaluation.outcome,
      points: question.points ?? index + 1,
    }
  })

  return {
    total: questions.length,
    answered: results.filter((result) => result.outcome !== 'unanswered').length,
    results,
  }
}

/** True when every question has a response of the right shape. */
export function isAttemptComplete(
  questions: Question[],
  responses: Record<string, QuestionResponse | undefined>,
): boolean {
  return questions.every((question) => {
    const value: ResponseValue | null = responses[question.id]?.value ?? null
    if (value === null) return false
    if (value.type === 'text') return normaliseText(value.value) !== ''
    return true
  })
}
