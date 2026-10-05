import { useId } from 'react'

import {
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  type ResponseValue,
  type TestQuestion,
} from '@/data/testArea/types'
import { ScientificNotationText } from '@/scientific'
import { OUTCOME_LABELS, type GradeOutcome } from '@/testArea/grading'

/* ============================================================================
   TestQuestionCard — one question and its input
   ----------------------------------------------------------------------------
   The card renders the question and collects a response; it never knows the
   answer. Nothing in this file imports a solution, and the grading key stays
   inside the bank where the grader can find it — so a card physically cannot
   leak correctness before submit.

   Every piece of scientific text goes through `ScientificNotationText`, the
   platform's existing bidi boundary, so `²³₁₁Na` and `Ca²⁺` keep their shape
   inside Arabic prose.
   ========================================================================= */

export type TestQuestionCardProps = {
  question: TestQuestion
  /** One-based question number as the student sees it. */
  number: number
  response: ResponseValue | undefined
  onChange: (value: ResponseValue) => void
  /** Locked after submit: the attempt is over and the mark is shown. */
  readOnly?: boolean
  /** Present only after submit. */
  outcome?: GradeOutcome
}

type InputProps = {
  question: TestQuestion
  response: ResponseValue | undefined
  onChange: (value: ResponseValue) => void
  readOnly: boolean
}

function ChoiceInput({ question, response, onChange, readOnly }: InputProps) {
  if (question.type !== 'single-choice' && question.type !== 'multi-select' && question.type !== 'error-analysis') {
    return null
  }
  const multiple = question.type === 'multi-select'
  const selected = response?.type === 'choice' ? response.optionIds : []
  const name = `q-${question.id}`

  return (
    <div className="ta-options" role={multiple ? 'group' : 'radiogroup'} aria-label="الخيارات">
      {question.options.map((option) => {
        const checked = selected.includes(option.id)
        return (
          <label key={option.id} className={`ta-option${checked ? ' is-selected' : ''}`}>
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={option.id}
              checked={checked}
              disabled={readOnly}
              onChange={() => {
                if (!multiple) {
                  onChange({ type: 'choice', optionIds: [option.id] })
                  return
                }
                const next = checked
                  ? selected.filter((id) => id !== option.id)
                  : [...selected, option.id]
                onChange({ type: 'choice', optionIds: next })
              }}
            />
            <span className="ta-option__label">
              <ScientificNotationText>{option.label}</ScientificNotationText>
            </span>
          </label>
        )
      })}
    </div>
  )
}

function BooleanInput({ question, response, onChange, readOnly }: InputProps) {
  if (question.type !== 'true-false') return null
  const value = response?.type === 'boolean' ? response.value : null
  return (
    <div className="ta-options ta-options--boolean" role="radiogroup" aria-label="صح أم خطأ">
      {[
        { label: 'صح', value: true },
        { label: 'خطأ', value: false },
      ].map((option) => (
        <label
          key={option.label}
          className={`ta-option${value === option.value ? ' is-selected' : ''}`}
        >
          <input
            type="radio"
            name={`q-${question.id}`}
            checked={value === option.value}
            disabled={readOnly}
            onChange={() => onChange({ type: 'boolean', value: option.value })}
          />
          <span className="ta-option__label">{option.label}</span>
        </label>
      ))}
    </div>
  )
}

function NumberInput({ question, response, onChange, readOnly }: InputProps) {
  const spec =
    question.type === 'numeric'
      ? question.answer
      : question.type === 'error-correction' && question.correction.kind === 'numeric'
        ? question.correction.spec
        : null
  if (!spec) return null

  const draft = response?.type === 'number' ? response : undefined
  const unit = spec.unit

  return (
    <div className="ta-input-row">
      <label className="ta-field">
        <span className="ta-field__label">الإجابة</span>
        <input
          className="ta-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          dir="ltr"
          lang="en"
          value={draft?.value ?? ''}
          disabled={readOnly}
          placeholder={spec.integerOnly ? 'عدد صحيح' : 'أدخل القيمة'}
          onChange={(event) =>
            onChange({ type: 'number', value: event.target.value, unit: draft?.unit })
          }
        />
      </label>

      {unit ? (
        <label className="ta-field ta-field--unit">
          <span className="ta-field__label">{unit.label ?? 'الوحدة'}</span>
          <select
            className="ta-input"
            value={draft?.unit ?? ''}
            disabled={readOnly}
            onChange={(event) =>
              onChange({ type: 'number', value: draft?.value ?? '', unit: event.target.value })
            }
          >
            <option value="">—</option>
            {unit.accepted.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  )
}

function ExactInput({ question, response, onChange, readOnly }: InputProps) {
  const spec =
    question.type === 'exact'
      ? question.answer
      : question.type === 'error-correction' && question.correction.kind === 'exact'
        ? question.correction.spec
        : null
  if (!spec) return null
  const value = response?.type === 'text' ? response.value : ''

  return (
    <label className="ta-field">
      <span className="ta-field__label">
        الإجابة{spec.inputHint ? ` (مثال: ${spec.inputHint})` : ''}
      </span>
      <input
        className="ta-input"
        type="text"
        autoComplete="off"
        dir="ltr"
        lang="en"
        value={value}
        disabled={readOnly}
        onChange={(event) => onChange({ type: 'text', value: event.target.value })}
      />
    </label>
  )
}

function OrderingInput({ question, response, onChange, readOnly }: InputProps) {
  if (question.type !== 'ordering') return null
  const order = response?.type === 'order' ? response.itemIds : []
  const items = [...order]
  // Keep authored items that the student has not placed yet at the end.
  for (const item of question.items) {
    if (!items.includes(item.id)) items.push(item.id)
  }
  const byId = new Map(question.items.map((item) => [item.id, item]))

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved!)
    onChange({ type: 'order', itemIds: next })
  }

  return (
    <ol className="ta-order">
      {items.map((id, index) => (
        <li key={id} className="ta-order__item">
          <span className="ta-order__index">{index + 1}</span>
          <span className="ta-order__label">
            <ScientificNotationText>{byId.get(id)?.label ?? id}</ScientificNotationText>
          </span>
          <span className="ta-order__actions">
            <button
              type="button"
              className="ta-icon-button"
              disabled={readOnly || index === 0}
              onClick={() => move(index, -1)}
              aria-label={`تحريك "${byId.get(id)?.label ?? id}" خطوة إلى الأعلى`}
            >
              ▲
            </button>
            <button
              type="button"
              className="ta-icon-button"
              disabled={readOnly || index === items.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`تحريك "${byId.get(id)?.label ?? id}" خطوة إلى الأسفل`}
            >
              ▼
            </button>
          </span>
        </li>
      ))}
    </ol>
  )
}

function MatchingInput({ question, response, onChange, readOnly }: InputProps) {
  if (question.type !== 'matching') return null
  const pairs = response?.type === 'matching' ? response.pairs : []
  const rightOf = (leftId: string) => pairs.find((pair) => pair.leftId === leftId)?.rightId ?? ''
  const fieldId = useId()

  return (
    <div className="ta-matching">
      {question.left.map((left) => (
        <div key={left.id} className="ta-matching__row">
          <span className="ta-matching__left">
            <ScientificNotationText>{left.label}</ScientificNotationText>
          </span>
          <label className="ta-matching__select">
            <span className="ta-visually-hidden">مطابقة {left.label}</span>
            <select
              className="ta-input"
              id={`${fieldId}-${left.id}`}
              value={rightOf(left.id)}
              disabled={readOnly}
              onChange={(event) => {
                const next = [
                  ...pairs.filter((pair) => pair.leftId !== left.id),
                  { leftId: left.id, rightId: event.target.value || null },
                ]
                onChange({ type: 'matching', pairs: next })
              }}
            >
              <option value="">اختر…</option>
              {question.right.map((right) => (
                <option key={right.id} value={right.id}>
                  {right.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}
    </div>
  )
}

export function TestQuestionCard({
  question,
  number,
  response,
  onChange,
  readOnly = false,
  outcome,
}: TestQuestionCardProps) {
  const inputProps: InputProps = { question, response, onChange, readOnly }

  return (
    <article
      className={`ta-card ta-question${outcome ? ` ta-question--${outcome}` : ''}`}
      aria-labelledby={`ta-q-${question.id}`}
    >
      <header className="ta-question__head">
        <span className="ta-chip ta-chip--number">السؤال {number}</span>
        <span className="ta-chip">{QUESTION_TYPE_LABELS[question.type]}</span>
        <span className={`ta-chip ta-chip--${question.difficulty}`}>
          {DIFFICULTY_LABELS[question.difficulty]}
        </span>
        {outcome ? (
          <span className={`ta-chip ta-chip--${outcome}`}>{OUTCOME_LABELS[outcome]}</span>
        ) : null}
      </header>

      <h3 className="ta-question__prompt" id={`ta-q-${question.id}`}>
        <ScientificNotationText>{question.prompt}</ScientificNotationText>
      </h3>

      {question.type === 'error-analysis' || question.type === 'error-correction' ? (
        <div className="ta-flawed" dir="rtl">
          <p className="ta-flawed__label">الحل المعروض:</p>
          <blockquote className="ta-flawed__body">
            <ScientificNotationText>{question.flawedWork}</ScientificNotationText>
          </blockquote>
        </div>
      ) : null}

      <div className="ta-question__input">
        <ChoiceInput {...inputProps} />
        <BooleanInput {...inputProps} />
        <NumberInput {...inputProps} />
        <ExactInput {...inputProps} />
        <OrderingInput {...inputProps} />
        <MatchingInput {...inputProps} />
      </div>
    </article>
  )
}
