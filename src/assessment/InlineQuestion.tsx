import { useState } from 'react'
import { QuestionView } from './QuestionView'
import { ScientificNotationText } from '@/scientific'
import type { Question, ResponseValue } from './types'

export type InlineQuestionProps = {
  question: Question
  index?: number
  /**
   * Opt-in self-check. When true, the answer is still never marked right or
   * wrong while the student works; instead the authored explanation is offered
   * in a collapsed panel *after* an answer exists, so the student can compare
   * their reasoning with the model answer at the right moment.
   */
  reveal?: boolean
}

/**
 * A single question rendered inside a lesson step.
 *
 * It keeps its own answer state and shows no correct/incorrect marking: in
 * learning steps the point is reasoning, and the comprehensive final test is
 * what gets marked (see FinalTestRunner). Lessons that want immediate feedback
 * pass `reveal`; the explanation appears only after the student commits an
 * answer, and never labels it as correct before they have thought it through.
 */
export function InlineQuestion({ question, index = 1, reveal = false }: InlineQuestionProps) {
  const [value, setValue] = useState<ResponseValue | null>(null)
  const [opened, setOpened] = useState(false)
  const canReveal = reveal && value !== null

  return (
    <>
      <QuestionView
        question={question}
        index={question.sourceIndex ?? index}
        value={value}
        mode="attempt"
        onChange={(next) => {
          setValue(next)
          setOpened(false)
        }}
      />
      {reveal ? (
        <div className="question__self-check" data-self-check={question.id}>
          {canReveal ? (
            <details
              className="question__reveal"
              open={opened}
              onToggle={(event) => setOpened((event.currentTarget as HTMLDetailsElement).open)}
            >
              <summary>راجع إجابتك مع الشرح</summary>
              <div className="question__reveal-body">
                {question.type === 'short-answer' ? (
                  <p>
                    <strong>الإجابة المرجعية:</strong>{' '}
                    <ScientificNotationText>{question.referenceAnswer}</ScientificNotationText>
                  </p>
                ) : null}
                {question.explanation ? (
                  <p>
                    <strong>لماذا؟</strong>{' '}
                    <ScientificNotationText>{question.explanation}</ScientificNotationText>
                  </p>
                ) : null}
                {question.type === 'short-answer' && question.rubric ? (
                  <div>
                    <p><strong>عناصر الإجابة المكتملة:</strong></p>
                    <ul>
                      {question.rubric.map((item) => (
                        <li key={item}><ScientificNotationText>{item}</ScientificNotationText></li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </details>
          ) : (
            <p className="question__self-check-hint">
              أجب عن السؤال أولاً، ثم يمكنك مقارنة إجابتك بالشرح. لا تُعرض الإجابة قبل المحاولة.
            </p>
          )}
        </div>
      ) : null}
    </>
  )
}
