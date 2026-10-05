import { clampRatio, GRADE_UNANSWERED, type Grade } from './types'

/* ============================================================================
   Choice grading — single choice, multi-select and true/false
   ----------------------------------------------------------------------------
   Multi-select is all-or-nothing by default: a missing option or an extra one
   is wrong, not "half right". Partial credit is only ever applied when the
   owning blueprint declares it, and it is computed transparently:

       (correctly selected − wrongly selected) / number of correct options

   clamped to [0, 1]. That formula is asserted by the unit tests, so the rule
   the student is marked by is the rule the code implements.
   ========================================================================= */

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  const a = [...left].sort()
  const b = [...right].sort()
  return a.every((value, index) => value === b[index])
}

export type ChoiceResponse = { optionIds: string[] } | null | undefined

export type ChoiceOptions = {
  mode: 'single' | 'multi'
  allowPartial?: boolean
}

export function gradeChoice(
  correctOptionIds: readonly string[],
  response: ChoiceResponse,
  options: ChoiceOptions,
): Grade {
  if (!response || response.optionIds.length === 0) return GRADE_UNANSWERED

  const selected = [...new Set(response.optionIds)]
  if (sameSet(selected, correctOptionIds)) {
    return { outcome: 'correct', ratio: 1, notes: [] }
  }

  const allowPartial = options.allowPartial ?? false
  if (allowPartial && correctOptionIds.length > 0) {
    const right = selected.filter((id) => correctOptionIds.includes(id)).length
    const wrong = selected.filter((id) => !correctOptionIds.includes(id)).length
    const ratio = clampRatio((right - wrong) / correctOptionIds.length)
    if (ratio > 0) return { outcome: 'partial', ratio, notes: [] }
  }

  return { outcome: 'incorrect', ratio: 0, notes: [] }
}

export type BooleanResponse = { value: boolean | null } | null | undefined

export function gradeBoolean(correctAnswer: boolean, response: BooleanResponse): Grade {
  if (!response || response.value === null) return GRADE_UNANSWERED
  return response.value === correctAnswer
    ? { outcome: 'correct', ratio: 1, notes: [] }
    : { outcome: 'incorrect', ratio: 0, notes: [] }
}
