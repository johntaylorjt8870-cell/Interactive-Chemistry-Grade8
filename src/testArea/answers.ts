import type { ResponseValue, TestQuestion } from '@/data/testArea/types'
import { normaliseExact } from './grading/exact'
import { extractNumericValue, toAsciiDigits } from './grading/numeric'

/* ============================================================================
   Canonical answers
   ----------------------------------------------------------------------------
   One function turns any question into its correct answer as text. The
   solutions area prints it, the review screen prints it after submit, and the
   audit compares it with the authored solution — so a solution that disagrees
   with the grading key is a build failure, not a silent contradiction.
   ========================================================================= */

export function canonicalAnswerOf(question: TestQuestion): string {
  switch (question.type) {
    case 'single-choice':
    case 'multi-select':
    case 'error-analysis': {
      const labels = question.options
        .filter((option) => question.correctOptionIds.includes(option.id))
        .map((option) => option.label)
      return labels.join('، ')
    }
    case 'true-false':
      return question.correctAnswer ? 'صح' : 'خطأ'
    case 'numeric': {
      const unit = question.answer.unit?.label
      const value = String(question.answer.correctValue)
      return unit ? `${value} ${unit}` : value
    }
    case 'exact':
      return question.answer.acceptedAnswers[0] ?? ''
    case 'ordering': {
      const byId = new Map(question.items.map((item) => [item.id, item.label]))
      return question.correctOrder.map((id) => byId.get(id) ?? id).join('  |  ')
    }
    case 'matching': {
      const left = new Map(question.left.map((item) => [item.id, item.label]))
      const right = new Map(question.right.map((item) => [item.id, item.label]))
      return question.pairs
        .map((pair) => `${left.get(pair.leftId) ?? pair.leftId} ↔ ${right.get(pair.rightId) ?? pair.rightId}`)
        .join('؛ ')
    }
    case 'error-correction':
      return question.correction.kind === 'numeric'
        ? String(question.correction.spec.correctValue)
        : (question.correction.spec.acceptedAnswers[0] ?? '')
  }
}

/** Strips punctuation, diacritics, spaces and digit alphabets for comparison. */
export function looseNormalise(value: string): string {
  return toAsciiDigits(value)
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[\s\u00a0]/g, '')
    .replace(/[.,؛;:،«»()\[\]{}"'!؟?\-–—_+*\/]/g, '')
    .toLowerCase()
}

/** Accepted numeric targets of a question, when it has numeric ones. */
export function numericTargetsOf(question: TestQuestion): number[] | null {
  if (question.type === 'numeric') {
    return [question.answer.correctValue, ...(question.answer.acceptedValues ?? [])]
  }
  if (question.type === 'error-correction' && question.correction.kind === 'numeric') {
    return [
      question.correction.spec.correctValue,
      ...(question.correction.spec.acceptedValues ?? []),
    ]
  }
  return null
}

/** The exact-answer spec of a question, when it has one. */
export function exactSpecOf(question: TestQuestion) {
  if (question.type === 'exact') return question.answer
  if (question.type === 'error-correction' && question.correction.kind === 'exact') {
    return question.correction.spec
  }
  return null
}

/**
 * True when an authored solution answer states the same answer the grader
 * marks as correct.
 *
 * Numeric answers are checked by value (so `32 إلكتروناً` matches `32`), exact
 * answers through the same normaliser the grader uses, and every other type by
 * containment after loose normalisation.
 */
export function solutionAnswerMatchesKey(solutionAnswer: string, question: TestQuestion): boolean {
  if (solutionAnswer.trim() === '') return false

  const targets = numericTargetsOf(question)
  if (targets) {
    // Authored prose: `32 إلكتروناً` states the same answer as `32`.
    const candidate = extractNumericValue(solutionAnswer, { allowFraction: true })
    if (candidate.status !== 'ok') return false
    const tolerance = question.type === 'numeric' ? (question.answer.tolerance ?? 0) : 0
    return targets.some((target) => Math.abs(candidate.value - target) <= tolerance + 1e-9)
  }

  const spec = exactSpecOf(question)
  if (spec) {
    const given = normaliseExact(spec.kind, solutionAnswer, spec.caseSensitive ?? false)
    return spec.acceptedAnswers
      .map((answer) => normaliseExact(spec.kind, answer, spec.caseSensitive ?? false))
      .some((accepted) => given === accepted || given.includes(accepted))
  }

  const canonical = looseNormalise(canonicalAnswerOf(question))
  if (canonical === '') return false
  return looseNormalise(solutionAnswer).includes(canonical)
}

/**
 * The response a student would have to give to be marked correct — derived
 * from the grading key, never from the authored solution.
 *
 * Two uses, both important: the test suite feeds it back into `gradeQuestion`
 * to prove that every key is reachable and that a correct entry is really
 * marked correct, and the review screen can highlight the gap between what was
 * entered and what the key accepts.
 */
export function keyResponseOf(question: TestQuestion): ResponseValue {
  switch (question.type) {
    case 'single-choice':
    case 'multi-select':
    case 'error-analysis':
      return { type: 'choice', optionIds: [...question.correctOptionIds] }
    case 'true-false':
      return { type: 'boolean', value: question.correctAnswer }
    case 'numeric':
      return { type: 'number', value: String(question.answer.correctValue) }
    case 'exact':
      return { type: 'text', value: question.answer.acceptedAnswers[0] ?? '' }
    case 'ordering':
      return { type: 'order', itemIds: [...question.correctOrder] }
    case 'matching':
      return {
        type: 'matching',
        pairs: question.pairs.map((pair) => ({ leftId: pair.leftId, rightId: pair.rightId })),
      }
    case 'error-correction':
      return question.correction.kind === 'numeric'
        ? { type: 'number', value: String(question.correction.spec.correctValue) }
        : { type: 'text', value: question.correction.spec.acceptedAnswers[0] ?? '' }
  }
}
