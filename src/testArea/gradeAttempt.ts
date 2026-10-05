import type { ResponseMap, TestBank, TestQuestion } from '@/data/testArea/types'
import { gradeQuestion, type QuestionGrade } from './grading'

/* ============================================================================
   Attempt scoring
   ----------------------------------------------------------------------------
   The only place a score is produced. It is called by the reducer on submit —
   never during the attempt — so the UI literally cannot obtain a mark before
   the student submits.
   ========================================================================= */

export type ScoredQuestion = QuestionGrade & {
  points: number
  earned: number
}

export type TestResult = {
  testId: string
  total: number
  maxScore: number
  score: number
  /** Whole percentage, rounded to the nearest integer. */
  percentage: number
  correct: number
  partial: number
  incorrect: number
  unanswered: number
  answered: number
  perQuestion: ScoredQuestion[]
}

export function pointsOf(question: TestQuestion, fallback: number): number {
  return question.points ?? fallback
}

export function gradeAttempt(bank: TestBank, responses: ResponseMap): TestResult {
  const fallbackPoints = bank.blueprint.scoring.pointsPerQuestion
  const allowPartial = bank.blueprint.scoring.allowPartial

  const perQuestion: ScoredQuestion[] = bank.questions.map((question) => {
    const grade = gradeQuestion(question, responses[question.id], { allowPartial })
    const points = pointsOf(question, fallbackPoints)
    return { ...grade, points, earned: points * grade.ratio }
  })

  const maxScore = perQuestion.reduce((total, entry) => total + entry.points, 0)
  const rawScore = perQuestion.reduce((total, entry) => total + entry.earned, 0)
  const score = Math.round(rawScore * 100) / 100

  const count = (outcome: ScoredQuestion['outcome']) =>
    perQuestion.filter((entry) => entry.outcome === outcome).length

  const correct = count('correct')
  const partial = count('partial')
  // An unreadable entry is answered, and it is not right: it counts as wrong.
  const incorrect = count('incorrect') + count('invalid')
  const unanswered = count('unanswered')

  return {
    testId: bank.id,
    total: bank.questions.length,
    maxScore,
    score,
    percentage: maxScore === 0 ? 0 : Math.round((score / maxScore) * 100),
    correct,
    partial,
    incorrect,
    unanswered,
    answered: perQuestion.length - unanswered,
    perQuestion,
  }
}

/** Question ids the student has not answered yet, in test order. */
export function unansweredIds(bank: TestBank, responses: ResponseMap): string[] {
  const allowPartial = bank.blueprint.scoring.allowPartial
  return bank.questions
    .filter(
      (question) => gradeQuestion(question, responses[question.id], { allowPartial }).outcome === 'unanswered',
    )
    .map((question) => question.id)
}
