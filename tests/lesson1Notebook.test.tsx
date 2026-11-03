import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { progressStore } from '@/data/progress'
import { renderApp } from './utils/renderApp'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'
import { curriculumStats, listSubjects } from '@/data/curriculum/registry'
import { STEP_KINDS } from '@/data/curriculum/schema'
import { validateLesson } from '@/data/sourceFidelity'

/**
 * «📒 دفتر الطالب» — Lesson 1 only.
 *
 * These checks are deliberately behavioural: they open the real lesson in the
 * real route tree, find the notebook tab in the rendered outline, click it, and
 * assert what the student sees. Content checks below walk the authored notebook
 * and the lesson it was extracted from, so a sentence that is not in the lesson
 * cannot silently enter the notebook.
 */

const LESSON_PATH = '/chemistry/structural-chemistry/atom-and-element'

/**
 * jsdom shares one `window` for the whole file, and the lesson mirrors the open
 * step/tab into `location.hash` (that is what makes `#student-notebook` a real
 * deep link). Each test therefore starts from a clean URL and clean progress,
 * exactly as a fresh page load would.
 */
beforeEach(() => {
  window.history.replaceState(null, '', '/')
  progressStore.resetAll()
})

describe('student notebook — placement in the lesson', () => {
  it('is the last tab of the lesson navigation, after the last teaching step', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')

    // Every teaching step, then exactly one notebook tab — nothing after it.
    expect(buttons).toHaveLength(chemistryLesson1.steps.length + 1)
    const last = buttons.at(-1)!
    expect(last).toHaveAttribute('data-tab', 'notebook')
    expect(last).toHaveAccessibleName(/دفتر الطالب/)
    const teaching = buttons.slice(0, -1)
    expect(teaching.every((button) => !button.hasAttribute('data-tab'))).toBe(true)
    expect(teaching.at(-1)).toHaveAccessibleName(
      new RegExp(chemistryLesson1.steps.at(-1)!.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    )

    await user.click(last)
    // The content column now shows the notebook, and the lesson is still open.
    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    expect(within(content).getByRole('article', { name: /مادة الدفتر المدرسي/ })).toBeInTheDocument()
    expect(
      within(content).getByRole('heading', { level: 3, name: /الذرّة والعنصر — مادة الدفتر المدرسي/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /الذرّة والعنصر/ })).toBeInTheDocument()
  })

  it('opens inside the lesson without navigating away or resetting the step counter', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const bar = screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })
    const before = bar.getAttribute('aria-valuenow')
    const counter = screen.getByText(`الخطوة 1 من ${chemistryLesson1.steps.length}`)

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))

    // Same page, same rail, same counter: the notebook is a tab, not a step.
    expect(screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })).toHaveAttribute('aria-valuenow', before)
    expect(counter).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
    expect(screen.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeInTheDocument()
  })

  it('does not mark the notebook as a visited step', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    const notebookTab = within(nav).getByRole('button', { name: /دفتر الطالب/ })
    expect(notebookTab).toHaveAttribute('aria-current', 'page')
    // The notebook tab reports its own state, never "visited step".
    expect(within(notebookTab).getByText('مفتوح')).toBeInTheDocument()
    expect(within(notebookTab).queryByText('تمت زيارتها')).toBeNull()
    // Only the first teaching step has been seen, and the count has not moved.
    expect(within(rail).getByText(`زُرت 1 من ${chemistryLesson1.steps.length}`)).toBeInTheDocument()
  })

  it('returns to the teaching step the student left, with the same counter', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    await user.click(screen.getByRole('button', { name: /^التالي/ }))
    await user.click(screen.getByRole('button', { name: /^التالي/ }))
    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const currentStepTitle = within(rail)
      .getByRole('button', { current: 'step' })
      .querySelector('.lesson-outline__title')!.textContent!
    expect(within(rail).getByText(`الخطوة 3 من ${chemistryLesson1.steps.length}`)).toBeInTheDocument()

    await user.click(within(screen.getByRole('navigation', { name: 'خطوات الدرس' })).getByRole('button', { name: /دفتر الطالب/ }))
    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))

    expect(within(rail).getByRole('button', { current: 'step' })).toHaveAccessibleName(
      new RegExp(currentStepTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    )
    expect(within(rail).getByText(`الخطوة 3 من ${chemistryLesson1.steps.length}`)).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: /مادة الدفتر المدرسي/ })).not.toBeInTheDocument()
  })

  it('is never reached by «التالي», which still ends the lesson on the last step', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    // Open the last teaching step from the outline (the entry before the tab).
    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    await user.click(buttons[buttons.length - 2]!)

    expect(within(rail).getByText(`الخطوة ${chemistryLesson1.steps.length} من ${chemistryLesson1.steps.length}`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /إنهاء الدرس/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^التالي/ })).not.toBeInTheDocument()
    // The notebook is offered as an extra tab beside the finish action.
    expect(screen.getAllByRole('button', { name: /دفتر الطالب/ }).length).toBeGreaterThan(0)
  })

  it('is reachable from the mobile drawer, still as the last tab', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    await user.click(screen.getByRole('button', { name: /خطوات الدرس/ }))
    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    const nav = within(dialog).getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(buttons.at(-1)!)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    expect(within(content).getByRole('article', { name: /مادة الدفتر المدرسي/ })).toBeInTheDocument()
  })

  it('actually hides the step while the notebook is open, instead of stacking both', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const stepBefore = document.querySelector('.step')
    expect(stepBefore).not.toBeNull()
    expect(stepBefore!.hasAttribute('hidden')).toBe(false)

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))

    // The same element, kept in the DOM for its state, but hidden — and the
    // sheet rule makes it actually leave the layout (`display: none`).
    const stepWhileNotebookOpen = document.querySelector('.step')
    expect(stepWhileNotebookOpen).toBe(stepBefore)
    expect(stepWhileNotebookOpen!.hasAttribute('hidden')).toBe(true)
    expect(document.querySelector('[data-step]')).toBe(stepBefore)

    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(document.querySelector('.step')).toBe(stepBefore)
    expect(stepBefore!.hasAttribute('hidden')).toBe(false)
  })

  it('keeps the lesson content mounted (and its answers) while the notebook is open', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    // Go to the step that carries an inline question, and answer it.
    await user.click(screen.getByRole('button', { name: /^التالي/ }))
    await user.click(screen.getByRole('button', { name: /^التالي/ }))
    const options = screen.getAllByRole('radio')
    expect(options.length).toBeGreaterThan(0)
    const chosen = options[0]!
    const optionId = chosen.getAttribute('value') ?? ''
    await user.click(chosen)
    expect(chosen).toBeChecked()

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))
    expect(screen.getByRole('article', { name: /مادة الدفتر المدرسي/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    const restored = screen.getAllByRole('radio').find((radio) => radio.getAttribute('value') === optionId)
    expect(restored).toBeChecked()
  })
})

describe('student notebook — the rest of the platform is untouched', () => {
  it('only Lesson 1 carries a notebook', () => {
    const lessons = listSubjects().flatMap((subject) => subject.units.flatMap((unit) => unit.lessons))
    const withNotebook = lessons.filter((lesson) => lesson.studentNotebook)
    expect(withNotebook.map((lesson) => lesson.id)).toEqual(['chem-u1-l1'])
  })

  it('does not change the lesson step count, the step kinds or the curriculum totals', () => {
    expect(chemistryLesson1.steps).toHaveLength(30)
    expect(chemistryLesson1.steps.at(-1)!.kind).toBe('final-test')
    expect(chemistryLesson1.steps.some((step) => step.id === 'student-notebook')).toBe(false)
    expect(STEP_KINDS).not.toContain('student-notebook')
    expect(curriculumStats()).toEqual({ units: 1, lessons: 7, steps: 230 })
  })

  it('adds no source-fidelity issue to the lesson', () => {
    expect(validateLesson(chemistryLesson1, 'chemistry.chem-u1-l1')).toEqual([])
  })

  it('keeps the notebook out of the tests and the teacher area', () => {
    const testIds = (chemistryLesson1.tests ?? []).map((test) => test.id)
    expect(testIds).toEqual(['chem-u1-l1-book', 'chem-u1-l1-practice', 'chem-u1-l1-final'])
    const notebookQuestionIds = JSON.stringify(lesson1StudentNotebook).match(/questionId/g) ?? []
    expect(notebookQuestionIds).toHaveLength(0)
  })
})
