import { useState } from 'react'
import type { ReactNode } from 'react'
import { QuestionView } from './QuestionView'
import { isAttemptComplete, summariseAttempt } from './evaluate'
import type { AttemptSummary, FinalTest, QuestionResponse, ResponseValue } from './types'

export type FinalTestRunnerProps = {
  test: FinalTest
  /** Renders a registered diagram for diagram-interpretation questions. */
  renderDiagram?: (diagramId: string, description: string) => ReactNode
  /** Called once, after the student submits. */
  onSubmitted?: (summary: AttemptSummary) => void
}

const OUTCOME_LABELS: Record<AttemptSummary['results'][number]['outcome'], string> = {
  correct: 'صحيح',
  incorrect: 'يحتاج مراجعة',
  partial: 'إجابة جزئية',
  'needs-review': 'يُراجع مع المعلم',
  unanswered: 'لم يُجب',
}

/**
 * Runs a lesson's comprehensive final test.
 *
 * Marking happens only after the whole test is submitted — never question by
 * question — so the test measures understanding rather than rewarding
 * guesswork. Questions and answer data come from the lesson's `tests`
 * definition; an empty test is handled explicitly without fabricated content.
 */
export function FinalTestRunner({ test, renderDiagram, onSubmitted }: FinalTestRunnerProps) {
  const [responses, setResponses] = useState<Record<string, QuestionResponse | undefined>>({})
  const [submitted, setSubmitted] = useState(false)
  const [summary, setSummary] = useState<AttemptSummary | null>(null)
  const [warnIncomplete, setWarnIncomplete] = useState(false)

  const questions = test.questions
  const answeredCount = questions.filter((question) => responses[question.id]?.value != null).length
  const unanswered = questions
    .map((question, index) => ({ question, index: index + 1 }))
    .filter(({ question }) => responses[question.id]?.value == null)

  if (questions.length === 0) {
    return (
      <div className="empty-state empty-state--inline" data-test-state="no-questions">
        <p className="empty-state__title">لم يُصمَّم الاختبار النهائي بعد</p>
        <p className="empty-state__body">
          يُبنى الاختبار النهائي بعد اعتماد محتوى الدرس من صفحات الكتاب المدرسي، ويضم عادةً بين
          {' '}
          {test.targetQuestionCount.min}
          {' '}
          و
          {' '}
          {test.targetQuestionCount.max}
          {' '}
          سؤالاً جديداً.
        </p>
      </div>
    )
  }

  const submit = () => {
    const attempt = summariseAttempt(questions, responses)
    setSummary(attempt)
    setSubmitted(true)
    onSubmitted?.(attempt)
  }

  const handleSubmitClick = () => {
    if (isAttemptComplete(questions, responses)) {
      submit()
      return
    }
    setWarnIncomplete(true)
  }

  return (
    <div className="final-test" data-test-id={test.id} data-submitted={submitted ? 'true' : undefined}>
      <header className="final-test__header">
        <div>
          <h2 className="final-test__title">الاختبار النهائي الشامل</h2>
          <p className="final-test__meta">
            {questions.length} سؤالاً · تمت الإجابة عن {answeredCount}
          </p>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answeredCount}
          aria-valuetext={`أُجيب عن ${answeredCount} من ${questions.length} سؤالاً`}
          aria-label="التقدّم في الاختبار"
        >
          <div className="progress__track">
            <div
              className="progress__bar"
              style={{ inlineSize: `${questions.length === 0 ? 0 : (answeredCount / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <ol className="final-test__questions">
        {questions.map((question, index) => (
          <li key={question.id}>
            <QuestionView
              question={question}
              index={index + 1}
              value={responses[question.id]?.value ?? null}
              mode={submitted ? 'solution' : 'attempt'}
              renderDiagram={renderDiagram}
              onChange={(value: ResponseValue) =>
                setResponses((current) => ({ ...current, [question.id]: { questionId: question.id, value } }))
              }
            />
          </li>
        ))}
      </ol>

      {!submitted ? (
        <div className="final-test__actions">
          {warnIncomplete && unanswered.length > 0 ? (
            <div className="alert alert--warning" role="alert">
              <p className="alert__title">ما زالت هناك أسئلة دون إجابة</p>
              <p className="alert__body">
                الأسئلة:{' '}
                {unanswered
                  .map(({ index }) => index)
                  .join('، ')}
              </p>
            </div>
          ) : null}
          <div className="cluster">
            <button type="button" className="button button--primary" onClick={handleSubmitClick}>
              إنهاء الاختبار وعرض النتيجة
            </button>
            {warnIncomplete && unanswered.length > 0 ? (
              <button type="button" className="button button--quiet" onClick={submit}>
                إرسال على أي حال
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {summary ? (
        <section className="attempt-summary">
          <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            اكتمل الاختبار. أُجيب عن {summary.answered} من {summary.total} سؤالاً.
          </p>
          <h3 className="attempt-summary__title">نتيجة المحاولة</h3>
          <ul className="attempt-summary__list">
            {summary.results.map((result, index) => (
              <li key={result.questionId} data-outcome={result.outcome}>
                <span className="attempt-summary__index">{index + 1}</span>
                <span className="attempt-summary__outcome">{OUTCOME_LABELS[result.outcome]}</span>
              </li>
            ))}
          </ul>
          <p className="attempt-summary__note">
            تُعرض الحلول المفصّلة داخل الدرس وفي قسم حلول الاختبار النهائي في مساحة المعلم.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setResponses({})
              setSummary(null)
              setSubmitted(false)
              setWarnIncomplete(false)
            }}
          >
            إعادة المحاولة
          </button>
        </section>
      ) : null}
    </div>
  )
}
