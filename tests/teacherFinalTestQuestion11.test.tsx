import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import type { DiagramInterpretationQuestion, MultipleChoiceQuestion, Question } from '@/assessment/types'
import { finalTest } from '@/data/curriculum/physicsLesson1'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { renderApp } from './utils/renderApp'

/**
 * Fix 9 regression — the Teacher Area must render the complete teacher-facing
 * solution for the diagram-interpretation final-test question `p1-final-11`,
 * whose sub-question lives in the question's nested `questions` array:
 * the question prompt, its nested prompt, every option, the explicit correct
 * choice, both explanations, and the registered diagram the question is about.
 *
 * The same renderer must keep every other final-test question intact.
 */

const TEACHER_FINAL_TEST_SOLUTIONS = '/teacher/final-test-solutions?lesson=phys-u2-l1'
const TEACHER_BOOK_SOLUTIONS = '/teacher/book-solutions?lesson=phys-u2-l1'
const PHYSICS_LESSON_TITLE = 'الدرس الأول — فيزياء: القوى المتلاقية'

const SUBSCRIPT_DIGITS = '₀₁₂₃₄₅₆₇₈₉'
const SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹'

/** Rendered scientific notation may split digits into sub/sup elements; compare on plain digits. */
function plainText(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/gu, (digit) => String(SUBSCRIPT_DIGITS.indexOf(digit)))
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/gu, (digit) => String(SUPERSCRIPT_DIGITS.indexOf(digit)))
    .replace(/\s+/gu, ' ')
    .trim()
}

function directChild(element: HTMLElement, className: string): HTMLElement | null {
  return (Array.from(element.children).find((child) => child.classList.contains(className)) as HTMLElement | undefined) ?? null
}

function teacherAnswerCards(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.teacher-answer'))
}

function directPrompt(card: HTMLElement): string {
  return plainText(directChild(card, 'teacher-answer__prompt')?.textContent)
}

/** The teacher answer card whose own prompt is exactly `prompt` (never a parent card). */
function cardFor(prompt: string): HTMLElement {
  const card = teacherAnswerCards().find((candidate) => directPrompt(candidate) === plainText(prompt))
  expect(card, `no teacher answer card renders the prompt «${prompt}»`).toBeDefined()
  return card!
}

function resultOf(card: HTMLElement): string {
  return plainText(directChild(card, 'teacher-answer__result')?.textContent)
}

const question11 = finalTest.questions.find(
  (question): question is DiagramInterpretationQuestion => question.id === 'p1-final-11',
)!
const nested = question11.questions.find(
  (question): question is MultipleChoiceQuestion => question.id === 'p1-final-11-a',
)!
const correctChoice = nested.options.find((option) => nested.correctOptionIds.includes(option.id))!
const otherQuestions = finalTest.questions.filter((question) => question.id !== question11.id)

describe('teacher area — physics final-test diagram question 11', () => {
  beforeEach(() => {
    teacherAccess.lock()
    teacherAccess.unlock(TEACHER_PASSWORD)
  })

  it('renders the question, its registered diagram and its nested prompt', async () => {
    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })

    const questionCard = cardFor(question11.prompt)
    // The figure the question asks about, mounted through the same registry the student page uses.
    expect(questionCard.querySelector('[data-interactive="parallelogram-lab"]')).not.toBeNull()
    expect(plainText(questionCard.textContent)).toContain(plainText(question11.diagramDescription))
    // …and the registered diagram itself mounts, not only its loading frame.
    expect(await screen.findByRole('heading', { level: 3, name: 'قوّتان متلاقيتان: كيف نبني المحصّلة؟' })).toBeInTheDocument()
    expect(cardFor(question11.prompt).querySelector('.parallelogram-lab')).not.toBeNull()

    // The nested prompt/instruction is rendered inside the question's own card.
    const nestedCard = cardFor(nested.prompt)
    expect(questionCard.contains(nestedCard)).toBe(true)
    expect(plainText(questionCard.textContent)).toContain(plainText(nested.prompt))
  })

  it('renders every option of the nested choice question', async () => {
    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })

    const nestedCard = cardFor(nested.prompt)
    const options = nestedCard.querySelector('ol')
    expect(options, 'the nested options list is not rendered').not.toBeNull()
    expect(options!.querySelectorAll('li')).toHaveLength(nested.options.length)
    for (const option of nested.options) {
      expect(plainText(options!.textContent), `missing option «${option.label}»`).toContain(plainText(option.label))
    }
  })

  it('exposes the explicit correct choice for the nested question', async () => {
    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })

    const nestedCard = cardFor(nested.prompt)
    expect(resultOf(nestedCard)).toContain(plainText(correctChoice.label))

    // The parent answer summarises the sub-question answer, so the correct choice
    // is explicit even at the level of the composite question.
    expect(resultOf(cardFor(question11.prompt))).toContain(plainText(correctChoice.label))
  })

  it('renders both the question and the nested question explanations', async () => {
    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })

    const nestedCard = cardFor(nested.prompt)
    expect(nestedCard.textContent).toContain('التفسير وخطوات الحل')
    expect(plainText(nestedCard.textContent)).toContain(plainText(nested.explanation))

    const questionCard = cardFor(question11.prompt)
    expect(plainText(questionCard.textContent)).toContain(plainText(question11.explanation))
  })

  it('keeps the page reference line driven by the question metadata', async () => {
    // The diagram question is a platform addition: no textbook page is claimed.
    expect(question11.source).toBeUndefined()

    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })
    expect(plainText(cardFor(question11.prompt).querySelector('.teacher-answer__meta')?.textContent)).toContain('إضافة من المنصة')
    expect(plainText(cardFor(question11.prompt).querySelector('.teacher-answer__meta')?.textContent)).not.toContain('مرجع الكتاب')
  })

  it('still renders page references for questions that carry them', async () => {
    renderApp(TEACHER_BOOK_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة 56/).length).toBeGreaterThan(0)
  })

  it('keeps every other final-test question rendering intact', async () => {
    renderApp(TEACHER_FINAL_TEST_SOLUTIONS)
    await screen.findByRole('heading', { level: 2, name: PHYSICS_LESSON_TITLE })

    // One card per top-level question plus the one nested sub-question of question 11.
    expect(teacherAnswerCards()).toHaveLength(finalTest.questions.length + question11.questions.length)

    for (const question of otherQuestions) {
      const card = cardFor(question.prompt)
      expect(plainText(card.textContent), `question ${question.id} lost its meta line`).toContain(plainText(question.prompt))
      expect(resultOf(card), `question ${question.id} lost its answer`).not.toBe('')
      if (question.explanation) {
        expect(plainText(card.textContent), `question ${question.id} lost its explanation`).toContain(plainText(question.explanation))
      }
      for (const label of materialLabels(question)) {
        expect(plainText(card.textContent), `question ${question.id} lost «${label}»`).toContain(plainText(label))
      }
    }
  })
})

/** Every authored label a question's material must show (options, items, pairs, blanks). */
function materialLabels(question: Question): string[] {
  switch (question.type) {
    case 'multiple-choice':
      return question.options.map((option) => option.label)
    case 'ordering':
      return question.items.map((item) => item.label)
    case 'matching':
      return [...question.left, ...question.right].map((item) => item.label)
    case 'fill-blank':
      return question.blanks.map((blank) => blank.acceptedAnswers[0]!)
    case 'table-interpretation':
      return [question.table.caption]
    case 'diagram-interpretation':
      return [question.diagramDescription]
    case 'numerical':
    case 'short-answer':
    case 'true-false':
      return []
  }
}
