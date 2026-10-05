import { hasResponse, type ResponseMap, type TestQuestion } from '@/data/testArea/types'
import { ScientificNotationText } from '@/scientific'

/* ============================================================================
   TestNavigator — the map of the attempt
   ----------------------------------------------------------------------------
   Before submit it only says *whether* a question was answered, never whether
   it was answered well: the two states are `answered` and `unanswered`. After
   submit the same grid reports the outcome, because by then the mark exists.
   ========================================================================= */

export type TestNavigatorProps = {
  questions: TestQuestion[]
  responses: ResponseMap
  currentIndex: number
  onGoTo: (index: number) => void
  /** Per-question outcomes; when absent the grid stays answer-only. */
  outcomes?: Record<string, string>
}

export function TestNavigator({
  questions,
  responses,
  currentIndex,
  onGoTo,
  outcomes,
}: TestNavigatorProps) {
  return (
    <nav className="ta-navigator" aria-label="أسئلة الاختبار">
      <ol className="ta-navigator__grid">
        {questions.map((question, index) => {
          const answered = hasResponse(responses[question.id])
          const outcome = outcomes?.[question.id]
          const state = outcome ?? (answered ? 'answered' : 'unanswered')
          const current = index === currentIndex
          return (
            <li key={question.id}>
              <button
                type="button"
                className={`ta-navigator__cell is-${state}${current ? ' is-current' : ''}`}
                onClick={() => onGoTo(index)}
                aria-current={current ? 'step' : undefined}
                aria-label={`السؤال ${index + 1} — ${
                  outcome
                    ? state
                    : answered
                      ? 'تمت الإجابة'
                      : 'لم تتم الإجابة'
                }`}
              >
                <span aria-hidden="true">{index + 1}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="ta-navigator__legend">
        <span className="ta-legend__item">
          <span className="ta-dot is-answered" aria-hidden="true" /> تمت الإجابة
        </span>
        <span className="ta-legend__item">
          <span className="ta-dot is-unanswered" aria-hidden="true" /> لم تتم الإجابة
        </span>
        {outcomes ? (
          <>
            <span className="ta-legend__item">
              <span className="ta-dot is-correct" aria-hidden="true" /> صحيحة
            </span>
            <span className="ta-legend__item">
              <span className="ta-dot is-incorrect" aria-hidden="true" /> غير صحيحة
            </span>
          </>
        ) : null}
      </p>
    </nav>
  )
}

/** Compact list of the questions the student has not answered yet. */
export function UnansweredList({
  questions,
  indices,
  onGoTo,
}: {
  questions: TestQuestion[]
  indices: number[]
  onGoTo: (index: number) => void
}) {
  if (indices.length === 0) return null
  return (
    <div className="ta-unanswered">
      <p className="ta-unanswered__title">أسئلة لم تُجب عنها بعد:</p>
      <ul className="ta-unanswered__list">
        {indices.map((index) => (
          <li key={questions[index]!.id}>
            <button type="button" className="ta-link-button" onClick={() => onGoTo(index)}>
              <span className="ta-unanswered__number">{index + 1}</span>
              <ScientificNotationText>
                {questions[index]!.prompt.slice(0, 60)}
              </ScientificNotationText>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
