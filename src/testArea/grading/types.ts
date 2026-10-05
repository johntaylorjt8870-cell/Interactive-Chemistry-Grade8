/**
 * Grading primitives shared by every question type.
 *
 * The grader is a pure function of (question, response) — no React, no DOM, no
 * storage — so every rule below is unit-testable on its own and the UI can
 * never alter a mark.
 */

export type GradeOutcome =
  /** The answer is fully right. */
  | 'correct'
  /** Partially right (ordering / matching when the blueprint allows it). */
  | 'partial'
  /** Answered, and wrong. */
  | 'incorrect'
  /** Answered in a form that cannot be read as an answer of this type. */
  | 'invalid'
  /** Nothing was supplied. */
  | 'unanswered'

export type Grade = {
  outcome: GradeOutcome
  /** Credit fraction in [0, 1]; 1 for correct, 0 for wrong or unanswered. */
  ratio: number
  /** Machine-readable notes, e.g. `unit-mismatch`, `not-integer`. */
  notes: string[]
}

export const OUTCOME_LABELS: Record<GradeOutcome, string> = {
  correct: 'إجابة صحيحة',
  partial: 'إجابة جزئية',
  incorrect: 'إجابة غير صحيحة',
  invalid: 'إجابة غير مقروءة',
  unanswered: 'لم يُجب',
}

export const NOTE_LABELS: Record<string, string> = {
  'invalid-input': 'المدخل ليس عدداً صالحاً',
  'not-integer': 'المطلوب عدد صحيح',
  'too-many-decimals': 'عدد المنازل العشرية أكبر من المطلوب',
  'unit-required': 'الوحدة مطلوبة مع الإجابة',
  'unit-mismatch': 'الوحدة غير مطابقة',
  'malformed-order': 'الترتيب غير مكتمل',
  'malformed-matching': 'المطابقة غير مكتملة',
}

export const GRADE_UNANSWERED: Grade = { outcome: 'unanswered', ratio: 0, notes: [] }

export function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
