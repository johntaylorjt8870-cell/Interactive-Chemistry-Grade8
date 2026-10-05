import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { routes } from '@/app/navigation'
import { EmptyState } from '@/components/EmptyState'
import { getTestDefinition, hasTest } from '@/data/testArea/registry'
import type { TestBank } from '@/data/testArea/types'
import { BlueprintView } from '@/testArea/components/BlueprintView'
import { TestNavigator, UnansweredList } from '@/testArea/components/TestNavigator'
import { TestProgress } from '@/testArea/components/TestProgress'
import { TestQuestionCard } from '@/testArea/components/TestQuestionCard'
import { TestResultView } from '@/testArea/components/TestResultView'
import { useTestAttempt } from '@/testArea/useTestAttempt'

/* ============================================================================
   Test runner
   ----------------------------------------------------------------------------
   One screen, three states, and a hard rule between them: while the attempt is
   `in-progress` there is no result object anywhere in the component tree, so
   no child can render a mark even by mistake. Submit produces the result;
   restart destroys it.
   ========================================================================= */

function Runner({ bank }: { bank: TestBank }) {
  const attempt = useTestAttempt(bank)
  const { state, currentQuestion, currentIndex } = attempt

  if (state.status === 'submitted' && state.result) {
    return (
      <TestResultView
        bank={bank}
        result={state.result}
        responses={state.responses}
        onRestart={attempt.restart}
      />
    )
  }

  const outcomes = undefined // no outcomes exist before submit, by design

  return (
    <div className="ta-runner">
      <header className="ta-runner__head">
        <div className="ta-runner__title-block">
          <h1 className="ta-page__title ta-page__title--small">{bank.title}</h1>
          <p className="ta-runner__summary">{bank.summary}</p>
        </div>
        <div className="ta-runner__controls">
          <button type="button" className="ta-button ta-button--ghost" onClick={attempt.restart}>
            إعادة الاختبار
          </button>
          <button type="button" className="ta-button ta-button--primary" onClick={attempt.submit}>
            إرسال الإجابات
          </button>
        </div>
      </header>

      <TestProgress
        answered={attempt.answeredCount}
        total={attempt.total}
        ratio={attempt.progressRatio}
      />

      {state.unansweredWarning ? (
        <div className="ta-banner ta-banner--warning" role="alert">
          <p className="ta-banner__text">
            لم تُجب عن {attempt.unansweredIndices.length} من {attempt.total} سؤالاً.
          </p>
          <div className="ta-banner__actions">
            <button type="button" className="ta-button ta-button--danger" onClick={attempt.submitAnyway}>
              أرسل على أي حال
            </button>
            <button type="button" className="ta-button ta-button--quiet" onClick={attempt.dismissWarning}>
              راجع أسئلتي أولاً
            </button>
          </div>
          <UnansweredList
            questions={attempt.questions}
            indices={attempt.unansweredIndices}
            onGoTo={attempt.goTo}
          />
        </div>
      ) : null}

      <div className="ta-runner__body">
        <div className="ta-runner__main">
          {currentQuestion ? (
            <TestQuestionCard
              question={currentQuestion}
              number={currentIndex + 1}
              response={state.responses[currentQuestion.id]}
              onChange={(value) => attempt.answer(currentQuestion.id, value)}
            />
          ) : null}

          <div className="ta-runner__nav">
            <button
              type="button"
              className="ta-button"
              onClick={attempt.previous}
              disabled={currentIndex === 0}
            >
              السابق
            </button>
            <span className="ta-runner__position">
              السؤال {currentIndex + 1} من {attempt.total}
            </span>
            <button
              type="button"
              className="ta-button"
              onClick={attempt.next}
              disabled={currentIndex >= attempt.total - 1}
            >
              التالي
            </button>
          </div>
        </div>

        <aside className="ta-runner__aside">
          <TestNavigator
            questions={attempt.questions}
            responses={state.responses}
            currentIndex={currentIndex}
            onGoTo={attempt.goTo}
            outcomes={outcomes}
          />
          <details className="ta-disclosure">
            <summary>مخطط الاختبار</summary>
            <BlueprintView blueprint={bank.blueprint} />
          </details>
          <p className="ta-runner__note">
            الحلول الكاملة في{' '}
            <Link to={routes.testAreaSolutions(bank.id)}>قسم حلول الاختبارات</Link>، وليست في مساحة
            المعلم.
          </p>
        </aside>
      </div>
    </div>
  )
}

export function TestRunnerPage() {
  const { testId = '' } = useParams<{ testId: string }>()
  const [bank, setBank] = useState<TestBank | null>(null)

  useEffect(() => {
    let active = true
    setBank(null)
    const definition = getTestDefinition(testId)
    if (!definition) return
    void definition.load().then((module) => {
      if (active) setBank(module.default)
    })
    return () => {
      active = false
    }
  }, [testId])

  if (!hasTest(testId)) {
    return (
      <div className="container ta-page">
        <EmptyState title="هذا الاختبار غير منشور" headingLevel={1} tone="not-found">
          <p>الرابط يشير إلى اختبار غير مسجّل في منطقة الاختبارات.</p>
          <p>
            <Link to={routes.testArea}>العودة إلى منطقة الاختبارات</Link>
          </p>
        </EmptyState>
      </div>
    )
  }

  if (!bank) {
    return (
      <div className="container ta-page">
        <p className="ta-loading" role="status">
          جارٍ تحميل الاختبار…
        </p>
      </div>
    )
  }

  return (
    <div className="container ta-page">
      <Runner key={`${bank.id}-${bank.version}`} bank={bank} />
    </div>
  )
}
