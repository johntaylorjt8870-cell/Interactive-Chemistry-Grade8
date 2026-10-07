import { Link } from 'react-router-dom'

import { routes } from '@/app/navigation'
import type { ResponseMap, TestBank, TestQuestion } from '@/data/testArea/types'
import type { TestResult } from '@/testArea/gradeAttempt'
import { OUTCOME_LABELS } from '@/testArea/grading'
import { canonicalAnswerOf } from '@/testArea/answers'
import { responseText } from '@/testArea/responseText'
import { ScientificNotationText } from '@/scientific'
import { RtlRun } from '@/components/BidiText'

/* ============================================================================
   TestResultView — what submit produces
   ----------------------------------------------------------------------------
   Shown only after submit, because only then does a result exist. It reports
   the score, the percentage, and the correct / incorrect / unanswered split,
   then walks the test question by question: what you entered, how it was
   marked, and — for anything not fully right — the answer the key accepts.
   The *explanation* lives in the solutions area, linked from every question.
   ========================================================================= */

export type TestResultViewProps = {
  bank: TestBank
  result: TestResult
  responses: ResponseMap
  onRestart: () => void
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className={`ta-stat${tone ? ` ta-stat--${tone}` : ''}`}>
      <span className="ta-stat__value">{value}</span>
      <span className="ta-stat__label">{label}</span>
    </div>
  )
}

function ReviewRow({
  question,
  number,
  response,
  outcome,
  testId,
}: {
  question: TestQuestion
  number: number
  response: ResponseMap[string]
  outcome: string
  testId: string
}) {
  const entered = responseText(question, response)
  const showKey = outcome !== 'correct'

  return (
    <li className={`ta-review ta-review--${outcome}`}>
      <div className="ta-review__head">
        <span className="ta-chip ta-chip--number">{number}</span>
        <span className={`ta-chip ta-chip--${outcome}`}>
          {OUTCOME_LABELS[outcome as keyof typeof OUTCOME_LABELS] ?? outcome}
        </span>
        <Link className="ta-link-button" to={`${routes.testAreaSolutions(testId)}#solution-${question.id}`}>
          الحل الكامل
        </Link>
      </div>
      <p className="ta-review__prompt">
        <ScientificNotationText>{question.prompt}</ScientificNotationText>
      </p>
      <dl className="ta-review__answers">
        <div>
          <dt>إجابتك</dt>
          <dd>
            {entered ? (
              <ScientificNotationText>{entered}</ScientificNotationText>
            ) : (
              <span className="ta-review__empty">لم تُجب</span>
            )}
          </dd>
        </div>
        {showKey ? (
          <div>
            <dt>الإجابة الصحيحة</dt>
            <dd dir="auto">
              <ScientificNotationText>{canonicalAnswerOf(question)}</ScientificNotationText>
            </dd>
          </div>
        ) : null}
      </dl>
    </li>
  )
}

export function TestResultView({ bank, result, responses, onRestart }: TestResultViewProps) {
  const byId = new Map(bank.questions.map((question) => [question.id, question]))
  const outcomeOf = new Map(result.perQuestion.map((entry) => [entry.questionId, entry.outcome]))

  return (
    <section className="ta-result" aria-labelledby="ta-result-title">
      <header className="ta-result__head">
        <h2 id="ta-result-title" className="ta-result__title">
          نتيجة الاختبار
        </h2>
        <p className="ta-result__subtitle">{bank.title}</p>
      </header>

      <div className="ta-result__score">
        <div className="ta-result__percent">
          <span className="ta-result__percent-value">{result.percentage}%</span>
          <RtlRun className="ta-result__percent-label">
            {result.score} من {result.maxScore}
          </RtlRun>
        </div>
        <div className="ta-result__stats">
          <Stat label="إجابات صحيحة" value={result.correct} tone="correct" />
          {result.partial > 0 ? <Stat label="إجابات جزئية" value={result.partial} tone="partial" /> : null}
          <Stat label="إجابات غير صحيحة" value={result.incorrect} tone="incorrect" />
          <Stat label="أسئلة لم تُجب" value={result.unanswered} tone="unanswered" />
        </div>
      </div>

      <div className="ta-result__actions">
        <button type="button" className="ta-button ta-button--primary" onClick={onRestart}>
          إعادة الاختبار من جديد
        </button>
        <Link className="ta-button" to={routes.testAreaSolutions(bank.id)}>
          حلول الاختبار كاملة
        </Link>
        <Link className="ta-button ta-button--quiet" to={routes.testArea}>
          منطقة الاختبارات
        </Link>
      </div>

      <ol className="ta-review__list">
        {bank.questions.map((question, index) => (
          <ReviewRow
            key={question.id}
            question={question}
            number={index + 1}
            response={responses[question.id]}
            outcome={outcomeOf.get(question.id) ?? (byId.has(question.id) ? 'unanswered' : 'unanswered')}
            testId={bank.id}
          />
        ))}
      </ol>
    </section>
  )
}
