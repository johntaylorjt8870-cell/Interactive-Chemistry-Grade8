import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonFlow } from '@/lessons/LessonFlow'
import { LessonOutline } from '@/lessons/LessonOutline'
import { LessonShell } from '@/layouts/LessonShell'
import { STEP_KIND_META } from '@/lessons/stepKinds'
import { STEP_RENDERERS, assertStepRenderersComplete, getStepRenderer } from '@/lessons/stepRenderers'
import { contentStatusLabel } from '@/data/source'
import { STEP_KINDS } from '@/data/curriculum/schema'
import { createProgressStore, computeLessonProgress, progressStore } from '@/data/progress'
import type { PageReference } from '@/data/source'
import { fixtureLesson, singleStepLesson } from './fixtures/lesson'
import { renderWithTheme } from './utils/renderApp'

describe('step kind architecture', () => {
  it('has a renderer for every declared step kind', () => {
    expect(() => assertStepRenderersComplete()).not.toThrow()
    for (const kind of STEP_KINDS) {
      expect(STEP_RENDERERS[kind]).toBeDefined()
      expect(getStepRenderer(kind)).toBeDefined()
    }
  })

  it('supports all required step types from the platform brief', () => {
    const required = [
      'source',
      'explanation',
      'example',
      'experiment',
      'simulation',
      'activity',
      'question',
      'apply',
      'note',
      'common-error',
      'summary',
      'final-test',
    ]
    for (const kind of required) {
      expect(STEP_KIND_META[kind as keyof typeof STEP_KIND_META]).toBeDefined()
    }
  })

  it('labels every kind in Arabic for the outline', () => {
    for (const kind of STEP_KINDS) {
      expect(STEP_KIND_META[kind].label.length).toBeGreaterThan(0)
      expect(STEP_KIND_META[kind].intention.length).toBeGreaterThan(0)
    }
  })
})

describe('LessonShell', () => {
  it('reports step position through a real progressbar', () => {
    renderWithTheme(
      <LessonShell
        title="عنوان الدرس"
        progress={{ current: 3, total: 9, ratio: 0.33 }}
        outline={<nav aria-label="خطوات الدرس" />}
        navigation={<div />}
      >
        <p>المحتوى</p>
      </LessonShell>,
    )

    const bar = screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '9')
    expect(bar).toHaveAttribute('aria-valuetext', 'زُرت 3 من 9 خطوة؛ الخطوة الحالية 3 من 9')
    expect(screen.getByText('الخطوة 3 من 9')).toBeInTheDocument()
  })

  it('reports visited progress separately from the currently opened step', () => {
    renderWithTheme(
      <LessonShell
        title="عنوان الدرس"
        progress={{ current: 5, total: 9, ratio: 1 / 9, visited: 1 }}
        outline={<nav aria-label="خطوات الدرس" />}
        navigation={<div />}
      >
        <p>المحتوى</p>
      </LessonShell>,
    )

    const bar = screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(bar).toHaveAttribute('aria-valuetext', 'زُرت 1 من 9 خطوة؛ الخطوة الحالية 5 من 9')
  })

  it('renders the outline area alongside the content', () => {
    renderWithTheme(
      <LessonShell
        title="عنوان"
        progress={{ current: 1, total: 2, ratio: 0.5 }}
        outline={<p>مخطط الدرس</p>}
        navigation={<div />}
      >
        <p>محتوى الخطوة</p>
      </LessonShell>,
    )

    expect(screen.getByText('مخطط الدرس')).toBeInTheDocument()
    expect(screen.getByText('محتوى الخطوة')).toBeInTheDocument()
  })
})

describe('LessonOutline', () => {
  it('lists every step and marks the current one with aria-current', () => {
    render(
      <LessonOutline lesson={fixtureLesson} currentIndex={1} onSelect={() => {}} seenStepIds={['step-source']} />,
    )

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')

    expect(buttons).toHaveLength(fixtureLesson.steps.length)
    expect(buttons[1]).toHaveAttribute('aria-current', 'step')
    expect(buttons[1]).toHaveAttribute('data-current', 'true')
    expect(buttons[0]).toHaveAttribute('data-seen', 'true')
  })

  it('reports visit status with text, not colour alone', () => {
    render(<LessonOutline lesson={fixtureLesson} currentIndex={2} onSelect={() => {}} seenStepIds={['step-source']} />)

    expect(screen.getByText('الحالية')).toBeInTheDocument()
    expect(screen.getByText('تمت زيارتها')).toBeInTheDocument()
    expect(screen.getAllByText('لم تُفتح بعد').length).toBe(fixtureLesson.steps.length - 2)
  })

  it('calls back with the selected index', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<LessonOutline lesson={fixtureLesson} currentIndex={0} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /ملاحظة/ }))
    expect(onSelect).toHaveBeenCalledWith(2)
  })
})

describe('LessonFlow — one meaningful step at a time', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    progressStore.resetLesson(fixtureLesson.id)
  })

  it('shows a single step and does not render the others', () => {
    render(
      <LessonFlow lesson={fixtureLesson} initialStepId="step-source" />,
    )

    expect(screen.getByText('نص تجريبي منقول حرفياً.')).toBeInTheDocument()
    expect(screen.queryByText('شرح تجريبي من إعداد المنصة.')).not.toBeInTheDocument()
    expect(screen.queryByText('نقطة أولى')).not.toBeInTheDocument()
  })

  it('renders the current step inside its kind frame', () => {
    const { container } = render(<LessonFlow lesson={fixtureLesson} initialStepId="step-explain" />)

    const step = container.querySelector('[data-step="step-explain"]')
    expect(step).not.toBeNull()
    expect(step!.getAttribute('data-step-kind')).toBe('explanation')
    expect(screen.getByRole('heading', { level: 2, name: 'شرح المنصة' })).toBeInTheDocument()
  })

  it('marks textbook material as such and platform material as an addition', () => {
    const { unmount } = render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    const source = document.querySelector('[data-origin="textbook"]')
    expect(source).not.toBeNull()
    expect(source!.textContent).toContain('من الكتاب المدرسي')
    unmount()

    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-explain" />)
    expect(document.querySelector('[data-origin="platform"]')).not.toBeNull()
    // The step frame and the platform-authored paragraph are both marked.
    expect(screen.getAllByText('إضافة من المنصة').length).toBeGreaterThan(0)
  })

  it('renders scientific notation from lesson data, not from markup hacks', () => {
    const { container } = render(<LessonFlow lesson={fixtureLesson} initialStepId="step-explain" />)

    expect(container.querySelector('.katex')).not.toBeNull()
    expect(container.querySelector('.chem-formula sub')).not.toBeNull()
    expect(container.querySelector('.ion-notation sup')).not.toBeNull()
    expect(container.querySelector('.nuclear-notation__mass')!.textContent).toBe('12')
    expect(container.querySelector('.sci-value__unit')!.textContent).toBe('g')
  })

  it('moves forward and backward through steps with real buttons', async () => {
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    expect(screen.getByRole('button', { name: 'السابق' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(screen.getByText('شرح تجريبي من إعداد المنصة.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByText('نص تجريبي منقول حرفياً.')).toBeInTheDocument()
  })

  it('announces the selected step after navigation but is silent on initial mount', async () => {
    const user = userEvent.setup()
    const { container } = render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)
    const status = container.querySelector('[role="status"]')!

    expect(status.textContent).toBe('')
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-atomic', 'true')
    expect(status.textContent).toContain('الخطوة 2 من 5')
    expect(status.textContent).toContain('شرح المنصة')
  })

  it('offers a finish action on the last step instead of a next button', () => {
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-test" />)

    expect(screen.getByRole('button', { name: /إنهاء الدرس/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^التالي/ })).not.toBeInTheDocument()
  })

  it('reports progress and updates it as steps are visited', async () => {
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    const bar = screen.getByRole('progressbar')
    const before = Number(bar.getAttribute('aria-valuenow'))
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    const after = Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))

    expect(after).toBeGreaterThan(before)
  })

  it('notifies when the lesson is completed', async () => {
    const onCompleted = vi.fn()
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-test" onCompleted={onCompleted} />)

    await user.click(screen.getByRole('button', { name: /إنهاء الدرس/ }))
    expect(onCompleted).toHaveBeenCalledTimes(1)
  })

  it('opens the mobile outline drawer, closes it with Escape and returns focus', async () => {
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    const trigger = screen.getByRole('button', { name: /خطوات الدرس/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const focusableButtons = within(dialog).getAllByRole('button')
    expect(focusableButtons[0]).toHaveFocus()
    for (let index = 0; index < focusableButtons.length - 1; index += 1) {
      await user.keyboard('{Tab}')
    }
    expect(focusableButtons[focusableButtons.length - 1]).toHaveFocus()
    await user.keyboard('{Tab}')
    expect(focusableButtons[0]).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('focuses the updated lesson content after a mobile-outline step is selected', async () => {
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    await user.click(screen.getByRole('button', { name: /خطوات الدرس/ }))
    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    await user.click(within(dialog).getByRole('button', { name: /شرح المنصة/ }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'محتوى الدرس' })).toHaveFocus()
    expect(screen.getByText('شرح تجريبي من إعداد المنصة.')).toBeInTheDocument()
  })

  it('jumps to a step selected from the outline', async () => {
    const user = userEvent.setup()
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    await user.click(screen.getByRole('button', { name: /خلاصة/ }))
    expect(screen.getByText('نقطة أولى')).toBeInTheDocument()
  })

  it('writes the current step to the URL hash without adding history entries', async () => {
    const user = userEvent.setup()
    const pushState = vi.spyOn(window.history, 'pushState')
    render(<LessonFlow lesson={fixtureLesson} initialStepId="step-source" />)

    expect(window.location.hash).toBe('#step-1')
    await user.click(screen.getByRole('button', { name: /التالي/ }))
    expect(window.location.hash).toBe('#step-2')
    expect(pushState).not.toHaveBeenCalled()
  })

  it('handles a lesson with no steps without crashing or faking content', () => {
    render(<LessonFlow lesson={{ ...fixtureLesson, steps: [] }} />)

    expect(screen.getByText('لا توجد خطوات في هذا الدرس')).toBeInTheDocument()
    expect(screen.getByText(/لن تُعرض خطوات مُصطنعة/)).toBeInTheDocument()
  })

  it('works with a single-step lesson', () => {
    render(<LessonFlow lesson={singleStepLesson} />)

    expect(screen.getByText('نص تجريبي منقول حرفياً.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /إنهاء الدرس/ })).toBeInTheDocument()
  })

  it('renders an honest state for an unregistered final test', () => {
    render(<LessonFlow lesson={{ ...fixtureLesson, tests: [] }} initialStepId="step-test" />)

    expect(screen.getByText('لم يُضَف الاختبار النهائي بعد')).toBeInTheDocument()
  })

  it('hosts a final test when one is attached to the step', async () => {
    const user = userEvent.setup()
    render(
      <LessonFlow
        lesson={fixtureLesson}
        initialStepId="step-test"
        renderTest={(testId) => <p>اختبار مُستضاف: {testId}</p>}
      />,
    )

    expect(screen.getByText('اختبار مُستضاف: fixture-lesson-test')).toBeInTheDocument()
    // The step itself is still one step of the flow.
    await user.click(screen.getByRole('button', { name: /السابق/ }))
    expect(screen.getByText('نقطة أولى')).toBeInTheDocument()
  })

  it('renders questions through the assessment host when provided', () => {
    render(
      <LessonFlow
        lesson={fixtureLesson}
        initialStepId="step-explain"
        renderQuestion={(questionId) => <p>سؤال: {questionId}</p>}
      />,
    )

    expect(screen.getByRole('heading', { level: 2, name: 'شرح المنصة' })).toBeInTheDocument()
  })
})

describe('lesson progress store', () => {
  const storage = () => {
    const map = new Map<string, string>()
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
      snapshot: () => map,
    }
  }

  it('records seen steps without duplicates', () => {
    const store = createProgressStore(storage())

    store.markStepSeen('lesson-a', 's1')
    store.markStepSeen('lesson-a', 's1')
    store.markStepSeen('lesson-a', 's2')

    expect(store.getLesson('lesson-a')?.seenStepIds).toEqual(['s1', 's2'])
  })

  it('persists to storage and reloads it', () => {
    const backing = storage()
    const first = createProgressStore(backing)
    first.markStepSeen('lesson-a', 's1')
    first.setCompleted('lesson-a')

    const second = createProgressStore(backing)
    expect(second.getLesson('lesson-a')?.completed).toBe(true)
    expect(second.getLesson('lesson-a')?.seenStepIds).toEqual(['s1'])
  })

  it('ignores corrupted stored data', () => {
    const backing = storage()
    backing.setItem('ipc:progress', '{not json')
    const store = createProgressStore(backing)

    expect(store.getLesson('lesson-a')).toBeUndefined()
  })

  it('resets a lesson and all progress', () => {
    const store = createProgressStore(storage())
    store.markStepSeen('lesson-a', 's1')
    store.resetLesson('lesson-a')
    expect(store.getLesson('lesson-a')).toBeUndefined()

    store.markStepSeen('lesson-b', 's1')
    store.resetAll()
    expect(store.getLesson('lesson-b')).toBeUndefined()
  })

  it('notifies subscribers on change', () => {
    const store = createProgressStore(null)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.markStepSeen('lesson-a', 's1')
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.markStepSeen('lesson-a', 's2')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('computes progress from real step ids only', () => {
    const progress = computeLessonProgress(fixtureLesson, {
      seenStepIds: ['step-source', 'does-not-exist'],
      completed: false,
      updatedAt: '',
    })

    expect(progress.seen).toBe(1)
    expect(progress.total).toBe(fixtureLesson.steps.length)
    expect(progress.ratio).toBeCloseTo(1 / fixtureLesson.steps.length)
  })

  it('never divides by zero', () => {
    const progress = computeLessonProgress({ id: 'x', steps: [] }, undefined)
    expect(progress.ratio).toBe(0)
  })
})

describe('content status labels', () => {
  it('describes the waiting state honestly', () => {
    expect(contentStatusLabel('awaiting-source')).toBe('بانتظار صفحات الكتاب')
    expect(contentStatusLabel('source-verified')).toBe('مُتحقَّق من الكتاب')
  })

  it('keeps a source reference shape that can carry readability reports', () => {
    const reference: PageReference = { page: '12', item: 'شكل 3-1', scanId: 'scan-012' }
    expect(reference.scanId).toBe('scan-012')
  })
})
