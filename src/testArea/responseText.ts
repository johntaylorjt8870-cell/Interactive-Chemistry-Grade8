import type { ResponseValue, TestQuestion } from '@/data/testArea/types'

/* ============================================================================
   Response → readable text
   ----------------------------------------------------------------------------
   Used by the review screen after submit (what did I enter?) and nowhere else.
   It renders exactly what the student supplied — including an empty answer —
   and never marks it right or wrong: the outcome comes from the grader.
   ========================================================================= */

function labelOf(question: TestQuestion, pool: Array<{ id: string; label: string }>, id: string) {
  void question
  return pool.find((item) => item.id === id)?.label ?? id
}

export function responseText(
  question: TestQuestion,
  response: ResponseValue | undefined,
): string | null {
  if (!response) return null

  switch (response.type) {
    case 'choice': {
      if (response.optionIds.length === 0) return null
      const pool = 'options' in question ? question.options : []
      return response.optionIds.map((id) => labelOf(question, pool, id)).join('، ')
    }
    case 'boolean':
      return response.value === null ? null : response.value ? 'صح' : 'خطأ'
    case 'number': {
      if (response.value.trim() === '') return null
      return response.unit ? `${response.value} ${response.unit}` : response.value
    }
    case 'text':
      return response.value.trim() === '' ? null : response.value
    case 'order': {
      if (response.itemIds.length === 0) return null
      const pool = question.type === 'ordering' ? question.items : []
      return response.itemIds
        .map((id, index) => `${index + 1}. ${labelOf(question, pool, id)}`)
        .join('  |  ')
    }
    case 'matching': {
      if (response.pairs.every((pair) => !pair.rightId)) return null
      if (question.type !== 'matching') return null
      return response.pairs
        .map((pair) => {
          const left = labelOf(question, question.left, pair.leftId)
          const right = pair.rightId ? labelOf(question, question.right, pair.rightId) : '—'
          return `${left} ↔ ${right}`
        })
        .join('؛ ')
    }
    default:
      return null
  }
}
