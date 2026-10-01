import { useId, useMemo } from 'react'
import type { ReactNode } from 'react'
import { ScientificTable } from '@/scientific'
import type {
  Choice,
  MatchingQuestion,
  Question,
  ResponseValue,
  TableInterpretationQuestion,
} from './types'

export type QuestionViewProps = {
  question: Question
  /** 1-based position, used for labels and the question navigator. */
  index: number
  value: ResponseValue | null
  onChange: (value: ResponseValue) => void
  /**
   * `attempt` never reveals correctness (learning is about reasoning).
   * `solution` is only used by the teacher area and lesson review.
   */
  mode?: 'attempt' | 'solution'
  /** Resolves a registered diagram/interactive id for diagram questions. */
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}

/**
 * Renders any supported question type with real, accessible controls.
 *
 * Deliberate design rule: an attempt produces **no** immediate “correct” /
 * “wrong” feedback. The student works through the question, the answer is
 * stored, and marking happens at the end of the comprehensive test (or in the
 * review/solutions view).
 */
export function QuestionView({
  question,
  index,
  value,
  onChange,
  mode = 'attempt',
  renderDiagram,
}: QuestionViewProps) {
  const groupId = useId()

  return (
    <section
      className="question"
      data-question={question.id}
      data-question-type={question.type}
      data-origin={question.origin}
      aria-labelledby={`${groupId}-prompt`}
    >
      <header className="question__header">
        <span className="question__index" aria-hidden="true">
          {index}
        </span>
        <div className="question__heading">
          <p className="question__prompt" id={`${groupId}-prompt`}>
            {question.prompt}
          </p>
          <p className="question__meta">
            <span className="badge badge--ghost">
              {question.origin === 'textbook' ? 'من الكتاب المدرسي' : 'إضافة من المنصة'}
            </span>
            {question.source ? (
              <span className="question__source">
                {question.source.page}
                {question.source.item ? ` · ${question.source.item}` : ''}
              </span>
            ) : null}
            {question.points ? <span className="question__points">{question.points} نقطة</span> : null}
          </p>
        </div>
      </header>

      <div className="question__body">{renderControl()}</div>

      {question.hint ? <p className="question__hint">تلميح: {question.hint}</p> : null}

      {mode === 'solution' && question.explanation ? (
        <p className="question__explanation">{question.explanation}</p>
      ) : null}
    </section>
  )

  function renderControl(): ReactNode {
    switch (question.type) {
      case 'multiple-choice': {
        const selected = value?.type === 'choice' ? value.optionIds : []
        const inputType = question.selection === 'multiple' ? 'checkbox' : 'radio'
        return (
          <fieldset className="choice-set">
            <legend className="visually-hidden">اختر الإجابة</legend>
            {question.options.map((option) => {
              const checked = selected.includes(option.id)
              const isCorrect =
                mode === 'solution' && question.correctOptionIds.includes(option.id)
              return (
                <label
                  key={option.id}
                  className="choice"
                  data-checked={checked ? 'true' : undefined}
                  data-correct={isCorrect ? 'true' : undefined}
                >
                  <input
                    type={inputType}
                    name={groupId}
                    value={option.id}
                    checked={checked}
                    onChange={(event) => {
                      if (question.selection === 'multiple') {
                        const next = event.target.checked
                          ? [...selected, option.id]
                          : selected.filter((id) => id !== option.id)
                        onChange({ type: 'choice', optionIds: next })
                      } else {
                        onChange({ type: 'choice', optionIds: [option.id] })
                      }
                    }}
                  />
                  <span className="choice__label">{option.label}</span>
                  {isCorrect ? <span className="badge badge--success">الإجابة الصحيحة</span> : null}
                </label>
              )
            })}
          </fieldset>
        )
      }

      case 'true-false': {
        const current = value?.type === 'boolean' ? value.value : null
        return (
          <fieldset className="choice-set choice-set--inline">
            <legend className="visually-hidden">اختر صح أو خطأ</legend>
            {question.statement ? <p className="question__statement">{question.statement}</p> : null}
            {[
              { label: 'صح', bool: true },
              { label: 'خطأ', bool: false },
            ].map((option) => (
              <label key={String(option.bool)} className="choice" data-checked={current === option.bool ? 'true' : undefined}>
                <input
                  type="radio"
                  name={groupId}
                  checked={current === option.bool}
                  onChange={() => onChange({ type: 'boolean', value: option.bool })}
                />
                <span className="choice__label">{option.label}</span>
                {mode === 'solution' && question.correctAnswer === option.bool ? (
                  <span className="badge badge--success">الإجابة الصحيحة</span>
                ) : null}
              </label>
            ))}
          </fieldset>
        )
      }

      case 'fill-blank': {
        const values = value?.type === 'blanks' ? value.values : {}
        const segments = splitTemplate(question.template)
        return (
          <div className="fill-blank">
            {segments.map((segment, segmentIndex) =>
              segment.type === 'text' ? (
                <span key={segmentIndex} className="fill-blank__text">
                  {segment.value}
                </span>
              ) : (
                <FillBlankInput
                  key={segment.value}
                  blankId={segment.value}
                  blank={question.blanks.find((blank) => blank.id === segment.value)}
                  value={values[segment.value] ?? ''}
                  index={index}
                  onChange={(next) => onChange({ type: 'blanks', values: { ...values, [segment.value]: next } })}
                  solution={
                    mode === 'solution'
                      ? question.blanks.find((blank) => blank.id === segment.value)?.acceptedAnswers[0]
                      : undefined
                  }
                />
              ),
            )}
          </div>
        )
      }

      case 'ordering':
        return <OrderingControl question={question} value={value} onChange={onChange} mode={mode} />

      case 'matching':
        return <MatchingControl question={question} value={value} onChange={onChange} mode={mode} groupId={groupId} />

      case 'numerical': {
        const current = value?.type === 'number' ? value : { value: '', unit: undefined }
        return (
          <div className="numerical">
            <label className="field field--inline">
              <span className="field__label">القيمة</span>
              <input
                type="text"
                inputMode="decimal"
                className="field__input field__input--numeric"
                dir="ltr"
                value={current.value}
                onChange={(event) =>
                  onChange({ type: 'number', value: event.target.value, unit: current.unit })
                }
              />
            </label>
            {question.unit ? (
              <label className="field field--inline">
                <span className="field__label">الوحدة</span>
                <input
                  type="text"
                  className="field__input"
                  dir="ltr"
                  value={current.unit ?? question.unit}
                  onChange={(event) =>
                    onChange({ type: 'number', value: current.value, unit: event.target.value })
                  }
                />
              </label>
            ) : null}
            {mode === 'solution' ? (
              <p className="question__solution">
                الإجابة المرجعية: <span dir="ltr">{question.acceptedAnswers.join(' / ')}</span>
                {question.unit ? ` ${question.unit}` : ''}
              </p>
            ) : null}
          </div>
        )
      }

      case 'short-answer': {
        const text = value?.type === 'text' ? value.value : ''
        return (
          <div className="short-answer">
            <label className="field">
              <span className="field__label">إجابتك</span>
              <textarea
                className="field__input field__input--area"
                rows={4}
                value={text}
                onChange={(event) => onChange({ type: 'text', value: event.target.value })}
              />
            </label>
            {mode === 'solution' ? (
              <div className="question__solution">
                <p>الإجابة المرجعية: {question.referenceAnswer}</p>
                {question.rubric ? (
                  <ul className="rubric">
                    {question.rubric.map((item, rubricIndex) => (
                      <li key={rubricIndex}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      }

      case 'table-interpretation':
        return <CompositeControl question={question} value={value} onChange={onChange} mode={mode} renderDiagram={renderDiagram} />

      case 'diagram-interpretation':
        return <CompositeControl question={question} value={value} onChange={onChange} mode={mode} renderDiagram={renderDiagram} />
    }
  }
}

/* ---------------------------------------------------------------------------
 * Sub-controls
 * ------------------------------------------------------------------------ */

function FillBlankInput({
  blankId,
  blank,
  value,
  index,
  onChange,
  solution,
}: {
  blankId: string
  blank: { kind?: 'text' | 'number' | 'unit' } | undefined
  value: string
  index: number
  onChange: (value: string) => void
  solution?: string
}) {
  return (
    <span className="fill-blank__field">
      <label className="visually-hidden" htmlFor={`blank-${index}-${blankId}`}>
        الفراغ {blankId}
      </label>
      <input
        id={`blank-${index}-${blankId}`}
        className="field__input field__input--blank"
        dir={blank?.kind === 'text' ? undefined : 'ltr'}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {solution ? <span className="fill-blank__solution">{solution}</span> : null}
    </span>
  )
}

function OrderingControl({
  question,
  value,
  onChange,
  mode,
}: {
  question: Extract<Question, { type: 'ordering' }>
  value: ResponseValue | null
  onChange: (value: ResponseValue) => void
  mode: 'attempt' | 'solution'
}) {
  const initialOrder = useMemo(() => question.items.map((item) => item.id), [question.items])
  const order = value?.type === 'order' ? value.itemIds : initialOrder
  const byId = new Map(question.items.map((item) => [item.id, item]))

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return
    const next = [...order]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    onChange({ type: 'order', itemIds: next })
  }

  return (
    <ol className="ordering">
      {order.map((itemId, position) => {
        const item = byId.get(itemId)
        if (!item) return null
        return (
          <li key={itemId} className="ordering__item">
            <span className="ordering__position" aria-hidden="true">
              {position + 1}
            </span>
            <span className="ordering__label">{item.label}</span>
            {mode === 'attempt' ? (
              <span className="ordering__actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => move(position, position - 1)}
                  disabled={position === 0}
                  aria-label={`تحريك «${item.label}» إلى الأعلى`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => move(position, position + 1)}
                  disabled={position === order.length - 1}
                  aria-label={`تحريك «${item.label}» إلى الأسفل`}
                >
                  ↓
                </button>
              </span>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function MatchingControl({
  question,
  value,
  onChange,
  mode,
  groupId,
}: {
  question: MatchingQuestion
  value: ResponseValue | null
  onChange: (value: ResponseValue) => void
  mode: 'attempt' | 'solution'
  groupId: string
}) {
  const pairs = value?.type === 'matching' ? value.pairs : question.left.map((item) => ({ leftId: item.id, rightId: null }))

  const update = (leftId: string, rightId: string | null) => {
    onChange({
      type: 'matching',
      pairs: question.left.map((left) => {
        const existing = pairs.find((pair) => pair.leftId === left.id)
        if (left.id === leftId) return { leftId, rightId }
        return existing ? { leftId: left.id, rightId: existing.rightId } : { leftId: left.id, rightId: null }
      }),
    })
  }

  return (
    <div className="matching">
      {question.left.map((left) => {
        const current = pairs.find((pair) => pair.leftId === left.id)?.rightId ?? ''
        const correctRightId = question.pairs.find((pair) => pair.leftId === left.id)?.rightId
        return (
          <div className="matching__row" key={left.id}>
            <span className="matching__left">{left.label}</span>
            <label className="field field--inline">
              <span className="visually-hidden">مطابقة {left.label}</span>
              <select
                className="field__select"
                name={`${groupId}-${left.id}`}
                value={current}
                onChange={(event) => update(left.id, event.target.value || null)}
                disabled={mode === 'solution'}
              >
                <option value="">— اختر —</option>
                {question.right.map((right) => (
                  <option key={right.id} value={right.id}>
                    {right.label}
                  </option>
                ))}
              </select>
            </label>
            {mode === 'solution' && correctRightId ? (
              <span className="matching__solution">
                {question.right.find((right) => right.id === correctRightId)?.label}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function CompositeControl({
  question,
  value,
  onChange,
  mode,
  renderDiagram,
}: {
  question: TableInterpretationQuestion | Extract<Question, { type: 'diagram-interpretation' }>
  value: ResponseValue | null
  onChange: (value: ResponseValue) => void
  mode: 'attempt' | 'solution'
  renderDiagram?: (diagramId: string, description: string) => ReactNode
}) {
  const children = value?.type === 'composite' ? value.children : {}

  const updateChild = (childId: string, childValue: ResponseValue) => {
    onChange({ type: 'composite', children: { ...children, [childId]: childValue } })
  }

  return (
    <div className="composite-question">
      {question.type === 'table-interpretation' ? (
        <ScientificTable
          caption={question.table.caption}
          columns={question.table.columns}
          rows={question.table.rows.map((row) => ({
            id: row.id,
            cells: Object.fromEntries(Object.entries(row.cells)),
            selected: row.selected,
            active: row.active,
          }))}
          footnote={question.table.footnote}
          density="compact"
        />
      ) : (
        <div className="composite-question__diagram">
          {renderDiagram ? (
            renderDiagram(question.diagramId, question.diagramDescription)
          ) : (
            <p className="composite-question__description">{question.diagramDescription}</p>
          )}
        </div>
      )}

      <div className="composite-question__children">
        {question.questions.map((child, childIndex) => (
          <QuestionView
            key={child.id}
            question={child}
            index={childIndex + 1}
            value={children[child.id] ?? null}
            onChange={(next) => updateChild(child.id, next)}
            mode={mode}
            renderDiagram={renderDiagram}
          />
        ))}
      </div>
    </div>
  )
}

/** Splits `نص {b1} نص {b2}` into ordered text/blank segments. */
export function splitTemplate(template: string): Array<{ type: 'text' | 'blank'; value: string }> {
  const segments: Array<{ type: 'text' | 'blank'; value: string }> = []
  const pattern = /\{([a-zA-Z0-9_-]+)\}/g
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(template)) !== null) {
    if (match.index > cursor) segments.push({ type: 'text', value: template.slice(cursor, match.index) })
    segments.push({ type: 'blank', value: match[1]! })
    cursor = match.index + match[0].length
  }
  if (cursor < template.length) segments.push({ type: 'text', value: template.slice(cursor) })
  return segments
}

/** Utility used by the solutions view to describe a choice question answer. */
export function correctChoiceLabels(question: Question): string[] {
  if (question.type === 'multiple-choice') {
    return question.options.filter((option: Choice) => question.correctOptionIds.includes(option.id)).map((option) => option.label)
  }
  return []
}
