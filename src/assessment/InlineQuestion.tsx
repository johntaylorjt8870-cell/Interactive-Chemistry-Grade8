import { useState } from 'react'
import { QuestionView } from './QuestionView'
import type { Question, ResponseValue } from './types'

export type InlineQuestionProps = {
  question: Question
  index?: number
}

/**
 * A single question rendered inside a lesson step.
 *
 * It keeps its own answer state and shows no correct/incorrect marking: in
 * learning steps the point is reasoning, and the comprehensive final test is
 * what gets marked (see FinalTestRunner).
 */
export function InlineQuestion({ question, index = 1 }: InlineQuestionProps) {
  const [value, setValue] = useState<ResponseValue | null>(null)

  return (
    <QuestionView
      question={question}
      index={index}
      value={value}
      mode="attempt"
      onChange={(next) => setValue(next)}
    />
  )
}
