import { GRADE_UNANSWERED, type Grade } from './types'

/* ============================================================================
   Ordering and matching grading
   ----------------------------------------------------------------------------
   Both are scored by "how much of the correct structure did the student
   reproduce", and both report `partial` only when the blueprint allows partial
   credit. Without it the outcome is binary, which keeps grade 8 marking
   predictable and auditable.

   Responses are also checked against the authored ids, so malformed or forged
   pairs cannot become a full-credit match.

   Ordering metric: number of items sitting in their correct position.
   Matching metric: number of correctly paired left items.
   ========================================================================= */

export type OrderResponse = { itemIds: string[] } | null | undefined

export function gradeOrdering(
  correctOrder: readonly string[],
  response: OrderResponse,
  allowPartial = false,
): Grade {
  if (!response || response.itemIds.length === 0) return GRADE_UNANSWERED

  const given = response.itemIds
  const isPermutation =
    given.length === correctOrder.length &&
    [...new Set(given)].length === given.length &&
    correctOrder.every((id) => given.includes(id))

  if (!isPermutation) {
    return { outcome: 'incorrect', ratio: 0, notes: ['malformed-order'] }
  }

  const correctPositions = given.filter((id, index) => id === correctOrder[index]).length
  if (correctPositions === correctOrder.length) {
    return { outcome: 'correct', ratio: 1, notes: [] }
  }
  if (correctPositions === 0) {
    return { outcome: 'incorrect', ratio: 0, notes: [] }
  }
  if (allowPartial) {
    return { outcome: 'partial', ratio: correctPositions / correctOrder.length, notes: [] }
  }
  return { outcome: 'incorrect', ratio: 0, notes: [] }
}

export type MatchingResponse =
  | { pairs: Array<{ leftId: string; rightId: string | null }> }
  | null
  | undefined

export function gradeMatching(
  pairs: ReadonlyArray<{ leftId: string; rightId: string }>,
  response: MatchingResponse,
  allowPartial = false,
): Grade {
  if (!response) return GRADE_UNANSWERED

  const answered = response.pairs.filter((pair) => pair.rightId !== null && pair.rightId !== '')
  if (answered.length === 0) return GRADE_UNANSWERED

  const expectedLeft = new Set(pairs.map((pair) => pair.leftId))
  const expectedRight = new Set(pairs.map((pair) => pair.rightId))
  const seenLeft = new Set<string>()
  for (const pair of response.pairs) {
    // A response must be a subset of the authored matching surface. Without
    // this guard, a forged extra pair could sit beside all correct pairs and
    // still receive full credit because only expected pairs were counted.
    if (!expectedLeft.has(pair.leftId)) {
      return { outcome: 'invalid', ratio: 0, notes: ['malformed-matching'] }
    }
    if (pair.rightId !== null && pair.rightId !== '' && !expectedRight.has(pair.rightId)) {
      return { outcome: 'invalid', ratio: 0, notes: ['malformed-matching'] }
    }
    if (seenLeft.has(pair.leftId)) {
      return { outcome: 'incorrect', ratio: 0, notes: ['malformed-matching'] }
    }
    seenLeft.add(pair.leftId)
  }

  const correctPairs = pairs.filter((pair) =>
    response.pairs.some((answer) => answer.leftId === pair.leftId && answer.rightId === pair.rightId),
  ).length

  if (correctPairs === pairs.length) return { outcome: 'correct', ratio: 1, notes: [] }
  if (correctPairs === 0) return { outcome: 'incorrect', ratio: 0, notes: [] }
  if (allowPartial) return { outcome: 'partial', ratio: correctPairs / pairs.length, notes: [] }
  return { outcome: 'incorrect', ratio: 0, notes: [] }
}
