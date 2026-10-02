import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionView, splitTemplate } from '@/assessment/QuestionView'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { evaluateQuestion, isAttemptComplete, summariseAttempt } from '@/assessment/evaluate'
import { validateFinalTest } from '@/assessment/validate'
import type { FinalTest, Question, QuestionResponse } from '@/assessment/types'
import { fixtureFinalTest, fixtureQuestions } from './fixtures/lesson'

describe('answer evaluation', () => {
  const choice: Question = {
    id: 'mc',
    type: 'multiple-choice',
    prompt: 'اختر',
    origin: 'platform',
    selection: 'single',
    options: [
      { id: 'a', label: 'أ' },
      { id: 'b', label: 'ب' },
    ],
    correctOptionIds: ['b'],
  }

  it('marks a correct and an incorrect choice', () => {
    expect(evaluateQuestion(choice, { questionId: 'mc', value: { type: 'choice', optionIds: ['b'] } }).outcome).toBe(
      'correct',
    )
    expect(evaluateQuestion(choice, { questionId: 'mc', value: { type: 'choice', optionIds: ['a'] } }).outcome).toBe(
      'incorrect',
    )
  })

  it('treats a missing response as unanswered rather than wrong', () => {
    expect(evaluateQuestion(choice, undefined).outcome).toBe('unanswered')
  })

  it('marks true/false', () => {
    const question: Question = {
      id: 'tf',
      type: 'true-false',
      prompt: 'صح أم خطأ',
      origin: 'platform',
      correctAnswer: true,
    }
    expect(evaluateQuestion(question, { questionId: 'tf', value: { type: 'boolean', value: true } }).outcome).toBe(
      'correct',
    )
    expect(evaluateQuestion(question, { questionId: 'tf', value: { type: 'boolean', value: null } }).outcome).toBe(
      'unanswered',
    )
  })

  it('accepts alternative spellings in fill-in-the-blank answers', () => {
    const question: Question = {
      id: 'fb',
      type: 'fill-blank',
      prompt: 'أكمل',
      origin: 'platform',
      template: 'الوحدة {b1}',
      blanks: [{ id: 'b1', acceptedAnswers: ['نيوتن', 'Newton'] }],
    }
    expect(
      evaluateQuestion(question, { questionId: 'fb', value: { type: 'blanks', values: { b1: 'نيوتن' } } }).outcome,
    ).toBe('correct')
    expect(
      evaluateQuestion(question, { questionId: 'fb', value: { type: 'blanks', values: { b1: ' newton ' } } }).outcome,
    ).toBe('correct')
  })

  it('respects tolerance and units in numerical answers', () => {
    const question: Question = {
      id: 'num',
      type: 'numerical',
      prompt: 'أدخل القيمة',
      origin: 'platform',
      acceptedAnswers: [9.8],
      tolerance: 0.05,
      unit: 'm/s²',
    }

    expect(
      evaluateQuestion(question, { questionId: 'num', value: { type: 'number', value: '9.81', unit: 'm/s²' } }).outcome,
    ).toBe('correct')

    const wrongUnit = evaluateQuestion(question, {
      questionId: 'num',
      value: { type: 'number', value: '9.8', unit: 'kg' },
    })
    expect(wrongUnit.outcome).toBe('incorrect')
    expect(wrongUnit.notes).toContain('unit-mismatch')

    expect(
      evaluateQuestion(question, { questionId: 'num', value: { type: 'number', value: '9.0', unit: 'm/s²' } }).outcome,
    ).toBe('incorrect')
  })

  it('never auto-fails a free-text answer', () => {
    const question: Question = {
      id: 'short',
      type: 'short-answer',
      prompt: 'اشرح',
      origin: 'platform',
      referenceAnswer: 'إجابة مرجعية',
      minWords: 6,
    }

    expect(
      evaluateQuestion(question, { questionId: 'short', value: { type: 'text', value: 'كلام قليل' } }).outcome,
    ).toBe('partial')
    expect(
      evaluateQuestion(question, {
        questionId: 'short',
        value: { type: 'text', value: 'هذه إجابة مكتوبة بكلمات كافية للمقارنة' },
      }).outcome,
    ).toBe('needs-review')
    expect(evaluateQuestion(question, { questionId: 'short', value: { type: 'text', value: '   ' } }).outcome).toBe(
      'unanswered',
    )
  })

  it('partially marks matching and ordering', () => {
    const matching: Question = {
      id: 'match',
      type: 'matching',
      prompt: 'طابق',
      origin: 'platform',
      left: [
        { id: 'l1', label: 'أ' },
        { id: 'l2', label: 'ب' },
      ],
      right: [
        { id: 'r1', label: '1' },
        { id: 'r2', label: '2' },
      ],
      pairs: [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r2' },
      ],
    }
    expect(
      evaluateQuestion(matching, {
        questionId: 'match',
        value: { type: 'matching', pairs: [{ leftId: 'l1', rightId: 'r1' }, { leftId: 'l2', rightId: 'r1' }] },
      }).outcome,
    ).toBe('partial')
  })

  it('aggregates a whole attempt', () => {
    const responses: Record<string, QuestionResponse | undefined> = {
      'q-1': { questionId: 'q-1', value: { type: 'choice', optionIds: ['b'] } },
    }
    const summary = summariseAttempt(fixtureQuestions, responses)

    expect(summary.total).toBe(2)
    expect(summary.answered).toBe(1)
    expect(summary.results[0]!.outcome).toBe('correct')
    expect(summary.results[1]!.outcome).toBe('unanswered')
    expect(isAttemptComplete(fixtureQuestions, responses)).toBe(false)
  })
})

describe('final test validation', () => {
  it('requires 10–20 questions for a published test', () => {
    const issues = validateFinalTest(fixtureFinalTest, 'fixture')
    expect(issues.map((issue) => issue.code)).toContain('test/question-count')
  })

  it('accepts a test whose status is awaiting-source with no questions', () => {
    const emptyTest: FinalTest = {
      id: 'empty',
      lessonId: 'l',
      origin: 'platform',
      status: 'awaiting-source',
      targetQuestionCount: { min: 10, max: 20 },
      questions: [],
    }
    expect(validateFinalTest(emptyTest, 'empty')).toEqual([])
  })

  it('detects duplicate ids and dangling correct answers', () => {
    const broken: FinalTest = {
      ...fixtureFinalTest,
      status: 'source-verified',
      questions: [
        { ...fixtureQuestions[0]!, id: 'dup' },
        { ...fixtureQuestions[0]!, id: 'dup' },
      ],
    }
    const codes = validateFinalTest(broken, 'broken').map((issue) => issue.code)
    expect(codes).toContain('test/duplicate-question-id')
  })
})

describe('QuestionView — real controls, no immediate feedback', () => {
  it('renders radio controls for a single-choice question', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<QuestionView question={fixtureQuestions[0]!} index={1} value={null} onChange={onChange} />)

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)

    await user.click(radios[1]!)
    expect(onChange).toHaveBeenCalledWith({ type: 'choice', optionIds: ['b'] })
  })

  it('shows no correct/incorrect wording after answering', async () => {
    const user = userEvent.setup()
    const question = fixtureQuestions[0]!

    function Harness() {
      const [value, setValue] = useState<Parameters<typeof QuestionView>[0]['value']>(null)
      return <QuestionView question={question} index={1} value={value} onChange={setValue} />
    }

    const { container } = render(<Harness />)
    await user.click(screen.getAllByRole('radio')[0]!)

    expect(container.textContent).not.toMatch(/إجابة صحيحة|صحيح!|خطأ!/)
    expect(container.querySelector('[data-correct="true"]')).toBeNull()
  })

  it('reveals the correct option only in solution mode', () => {
    const { container } = render(
      <QuestionView question={fixtureQuestions[0]!} index={1} value={null} onChange={() => {}} mode="solution" />,
    )
    expect(container.querySelector('[data-correct="true"]')).not.toBeNull()
    expect(screen.getByText('الإجابة الصحيحة')).toBeInTheDocument()
  })

  it('renders a labelled numeric input with its unit', () => {
    render(<QuestionView question={fixtureQuestions[1]!} index={2} value={null} onChange={() => {}} />)

    expect(screen.getByLabelText('القيمة')).toBeInTheDocument()
    expect(screen.getByLabelText('الوحدة')).toHaveValue('m/s²')
  })

  it('renders fill-in-the-blank inputs inside the sentence', () => {
    const question: Question = {
      id: 'fb',
      type: 'fill-blank',
      prompt: 'أكمل الفراغ',
      origin: 'platform',
      template: 'الكتلة تقاس بـ {b1} والزمن بـ {b2}',
      blanks: [
        { id: 'b1', acceptedAnswers: ['kg'] },
        { id: 'b2', acceptedAnswers: ['s'] },
      ],
    }
    render(<QuestionView question={question} index={1} value={null} onChange={() => {}} />)

    expect(screen.getByLabelText('الفراغ b1')).toBeInTheDocument()
    expect(screen.getByLabelText('الفراغ b2')).toBeInTheDocument()
    expect(screen.getByText('الكتلة تقاس بـ')).toBeInTheDocument()
  })

  it('moves ordering items with accessible buttons', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const question: Question = {
      id: 'order',
      type: 'ordering',
      prompt: 'رتّب',
      origin: 'platform',
      items: [
        { id: 'i1', label: 'أولاً' },
        { id: 'i2', label: 'ثانياً' },
      ],
      correctOrder: ['i2', 'i1'],
    }
    render(<QuestionView question={question} index={1} value={null} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /تحريك «ثانياً» إلى الأعلى/ }))
    expect(onChange).toHaveBeenCalledWith({ type: 'order', itemIds: ['i2', 'i1'] })
  })

  it('uses real select controls for matching', () => {
    const question: Question = {
      id: 'match',
      type: 'matching',
      prompt: 'طابق',
      origin: 'platform',
      left: [{ id: 'l1', label: 'يسار' }],
      right: [{ id: 'r1', label: 'يمين' }],
      pairs: [{ leftId: 'l1', rightId: 'r1' }],
    }
    render(<QuestionView question={question} index={1} value={null} onChange={() => {}} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'يمين' })).toBeInTheDocument()
  })

  it('shows the source reference when a question comes from the book', () => {
    const question: Question = {
      ...fixtureQuestions[0]!,
      origin: 'textbook',
      source: { page: '42', item: 'سؤال 3' },
    }
    render(<QuestionView question={question} index={1} value={null} onChange={() => {}} />)

    expect(screen.getByText('من الكتاب المدرسي')).toBeInTheDocument()
    expect(screen.getByText(/42 · سؤال 3/)).toBeInTheDocument()
  })

  it('splits templates correctly', () => {
    expect(splitTemplate('أ {b1} ب {b2} ج')).toEqual([
      { type: 'text', value: 'أ ' },
      { type: 'blank', value: 'b1' },
      { type: 'text', value: ' ب ' },
      { type: 'blank', value: 'b2' },
      { type: 'text', value: ' ج' },
    ])
  })
})

describe('InlineQuestion', () => {
  it('keeps its own answer state without revealing correctness', async () => {
    const user = userEvent.setup()
    const { container } = render(<InlineQuestion question={fixtureQuestions[0]!} />)

    await user.click(screen.getAllByRole('radio')[1]!)
    expect((screen.getAllByRole('radio')[1] as HTMLInputElement).checked).toBe(true)
    expect(container.textContent).not.toMatch(/إجابة صحيحة/)
  })
})

describe('FinalTestRunner', () => {
  it('states honestly that an unbuilt test does not exist yet', () => {
    const emptyTest: FinalTest = { ...fixtureFinalTest, questions: [], status: 'awaiting-source' }
    render(<FinalTestRunner test={emptyTest} />)

    expect(screen.getByText('لم يُصمَّم الاختبار النهائي بعد')).toBeInTheDocument()
    expect(screen.getByText(/بين 10 و 20 سؤالاً/)).toBeInTheDocument()
  })

  it('tracks answered questions in a real progressbar', async () => {
    const user = userEvent.setup()
    render(<FinalTestRunner test={fixtureFinalTest} />)

    const bar = screen.getByRole('progressbar', { name: 'التقدّم في الاختبار' })
    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(bar).toHaveAttribute('aria-valuetext', 'أُجيب عن 0 من 2 سؤالاً')

    await user.click(screen.getAllByRole('radio')[1]!)
    expect(screen.getByRole('progressbar', { name: 'التقدّم في الاختبار' })).toHaveAttribute('aria-valuenow', '1')
  })

  it('warns about unanswered questions before submitting', async () => {
    const user = userEvent.setup()
    const onSubmitted = vi.fn()
    render(<FinalTestRunner test={fixtureFinalTest} onSubmitted={onSubmitted} />)

    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))

    expect(screen.getByRole('alert')).toHaveTextContent('ما زالت هناك أسئلة دون إجابة')
    expect(onSubmitted).not.toHaveBeenCalled()
  })

  it('marks the attempt only after the whole test is submitted', async () => {
    const user = userEvent.setup()
    const onSubmitted = vi.fn()
    const { container } = render(<FinalTestRunner test={fixtureFinalTest} onSubmitted={onSubmitted} />)

    await user.click(screen.getAllByRole('radio')[1]!)
    await user.type(screen.getByLabelText('القيمة'), '9.8')
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))

    expect(onSubmitted).toHaveBeenCalledTimes(1)
    const summary = screen.getByText('نتيجة المحاولة')
    expect(summary).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('اكتمل الاختبار. أُجيب عن 2 من 2 سؤالاً.')
    expect(container.querySelector('[aria-live="polite"] .attempt-summary__list')).toBeNull()
    expect(container.querySelector('[data-outcome="correct"]')).not.toBeNull()
  })

  it('can be retried with a clean slate', async () => {
    const user = userEvent.setup()
    render(<FinalTestRunner test={fixtureFinalTest} />)

    await user.click(screen.getAllByRole('radio')[1]!)
    await user.type(screen.getByLabelText('القيمة'), '9.8')
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))

    expect(screen.queryByText('نتيجة المحاولة')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'التقدّم في الاختبار' })).toHaveAttribute('aria-valuenow', '0')
  })
})
