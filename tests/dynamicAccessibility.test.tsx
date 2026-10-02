import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import ParallelogramLab from '@/simulations/ParallelogramLab'
import ConcurrentForcesLab from '@/simulations/ConcurrentForcesLab'
import ForceComponentsLab from '@/simulations/ForceComponentsLab'
import { physicsLesson1 } from '@/data/curriculum/physicsLesson1'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/**
 * Fix 13 contracts: dynamic simulation values must reach assistive technology
 * as meaningful state changes (never animation-frame churn), and the lesson
 * navigation must stay understandable for keyboard and screen-reader users in
 * Arabic RTL — without changing the simulation mathematics.
 *
 * The live regions are debounced, so the value tests drive fake timers; the
 * navigation tests use real timers and the real route tree.
 */

const LESSON_PATH = '/physics/motion-and-forces/concurrent-forces'
const DEBOUNCE_MS = 400

function labStatus(container: HTMLElement): HTMLElement {
  const section = container.querySelector('section')!
  return within(section).getByRole('status')
}

function sliders(container: HTMLElement): HTMLInputElement[] {
  return [...container.querySelectorAll<HTMLInputElement>('input[type="range"]')]
}

/**
 * The lesson engine starts from the URL hash when it mounts. jsdom keeps one
 * location per test file, so pin the hash instead of inheriting whatever step
 * the previous test happened to stop on.
 */
function renderLesson() {
  window.history.replaceState(null, '', '#step-1')
  return renderApp(LESSON_PATH)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('dynamic simulation values are announced, not animated', () => {
  it('mounts a polite, atomic, visually hidden status region and stays silent at rest', () => {
    for (const Lab of [ParallelogramLab, ConcurrentForcesLab, ForceComponentsLab]) {
      const { container, unmount } = render(<Lab interactiveId="test-lab" reducedMotion={false} />)
      const status = labStatus(container)

      expect(status).toHaveAttribute('role', 'status')
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-atomic', 'true')
      expect(status).toHaveClass('visually-hidden')
      // The starting state is not shouted: only real changes are announced.
      expect(status.textContent).toBe('')

      unmount()
    }
  })

  it('announces the resultant and direction of the parallelogram lab once the student settles', () => {
    vi.useFakeTimers()
    const { container } = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />)
    const status = labStatus(container)
    const section = container.querySelector('section')!

    const [f1, f2, angle] = sliders(container)
    fireEvent.change(f1!, { target: { value: '6' } })
    fireEvent.change(f2!, { target: { value: '8' } })
    fireEvent.change(angle!, { target: { value: '90' } })

    // Nothing is announced while the student is still dragging.
    expect(status.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const message = status.textContent ?? ''
    expect(message).toContain('المحصّلة')
    expect(message).toContain(section.getAttribute('data-resultant')!)
    expect(message).toContain('نيوتن')
    expect(message).toContain('درجة')
    // The construction stage is part of the state, and it is described in words.
    expect(message).toContain('المرحلة 3 من 3')
  })

  it('announces the decomposition values of the force components lab in both modes', async () => {
    vi.useFakeTimers()
    const { container } = render(<ForceComponentsLab interactiveId="force-components-lab" reducedMotion={false} />)
    const status = labStatus(container)
    const section = container.querySelector('section')!

    const [force, theta] = sliders(container)
    fireEvent.change(force!, { target: { value: '10' } })
    fireEvent.change(theta!, { target: { value: '80' } })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const axesMessage = status.textContent ?? ''
    expect(axesMessage).toContain('المركّبة الأفقية')
    expect(axesMessage).toContain(section.getAttribute('data-fx')!)
    expect(axesMessage).toContain('المركّبة الشاقولية')
    expect(axesMessage).toContain(section.getAttribute('data-fy')!)

    // Switching mode is a state change of its own and must be announced.
    fireEvent.click(screen.getByRole('button', { name: /المستوي المائل/ }))
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const inclineMessage = status.textContent ?? ''
    expect(inclineMessage).toContain('المستوي المائل')
    expect(inclineMessage).toContain('المركّبة الموازية للمستوي')
    expect(inclineMessage).not.toBe(axesMessage)
  })

  it('announces the two spring tensions of the concurrent forces lab', () => {
    vi.useFakeTimers()
    const { container } = render(<ConcurrentForcesLab interactiveId="concurrent-forces-lab" reducedMotion={false} />)
    const status = labStatus(container)

    const weight = sliders(container)[2]!
    fireEvent.change(weight, { target: { value: '8' } })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const message = status.textContent ?? ''
    const section = container.querySelector('section')!
    expect(message).toContain('شدّة الشدّ')
    expect(message).toContain(section.getAttribute('data-t1')!)
    expect(message).toContain(section.getAttribute('data-t2')!)
    expect(message).toContain('8 نيوتن')
  })

  it('collapses a burst of changes into a single announcement of the final value', async () => {
    vi.useFakeTimers()
    const { container } = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />)
    const status = labStatus(container)
    const section = container.querySelector('section')!
    const f1 = sliders(container)[0]!

    const mutations: MutationRecord[] = []
    const observer = new MutationObserver((records) => mutations.push(...records))
    observer.observe(status, { childList: true, characterData: true, subtree: true })

    // A drag: 40 value updates in one burst, exactly what a live region must not
    // turn into 40 interruptions.
    for (let value = 10; value <= 49; value += 1) {
      fireEvent.change(f1, { target: { value: String(value) } })
    }

    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })
    await Promise.resolve()
    observer.disconnect()

    expect(mutations).toHaveLength(1)
    expect(status.textContent).toContain(section.getAttribute('data-resultant')!)
  })

  it('keeps the static conclusion out of the live regions', () => {
    for (const Lab of [ParallelogramLab, ConcurrentForcesLab, ForceComponentsLab]) {
      const { container, unmount } = render(<Lab interactiveId="test-lab" reducedMotion={false} />)

      expect(container.querySelector('.lab__conclusion')).not.toHaveAttribute('aria-live')
      // Exactly one live region per lab: the concise status, never a whole paragraph.
      expect(container.querySelectorAll('[aria-live]')).toHaveLength(1)
      expect(container.querySelector('[aria-live]')).toBe(labStatus(container))

      unmount()
    }
  })

  it('never leaks implementation details into an announcement', () => {
    vi.useFakeTimers()
    const { container } = render(<ConcurrentForcesLab interactiveId="concurrent-forces-lab" reducedMotion={false} />)
    const status = labStatus(container)

    fireEvent.change(sliders(container)[0]!, { target: { value: '60' } })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const message = status.textContent ?? ''
    expect(message).not.toMatch(/data-|class=|NaN|undefined|\[object/)
  })

  it('gives every simulation slider a name and a value text with its unit', () => {
    const cases = [
      { Lab: ParallelogramLab, expected: ['4 نيوتن', '3 نيوتن', '60 درجة'] },
      { Lab: ConcurrentForcesLab, expected: ['35 درجة', '35 درجة', '4 نيوتن'] },
      { Lab: ForceComponentsLab, expected: ['6 نيوتن', '40 درجة'] },
    ]

    for (const { Lab, expected } of cases) {
      const { container, unmount } = render(<Lab interactiveId="test-lab" reducedMotion={false} />)
      const ranges = sliders(container)

      expect(ranges.map((range) => range.getAttribute('aria-valuetext'))).toEqual(expected)
      for (const range of ranges) {
        expect((range.getAttribute('aria-label') ?? '').length).toBeGreaterThan(0)
      }

      unmount()
    }
  })

  it('keeps announcing values, and the still representation, under prefers-reduced-motion', () => {
    vi.useFakeTimers()
    const { container } = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion />)
    const section = container.querySelector('section')!
    const status = labStatus(container)

    // Reduced motion shows the finished construction immediately …
    expect(section).toHaveClass('lab--still')
    expect(section).toHaveAttribute('data-stage', '2')
    expect(status.textContent).toBe('')

    // … and the accessible representation still reports every change.
    fireEvent.change(sliders(container)[0]!, { target: { value: '5' } })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    expect(status.textContent).toContain(section.getAttribute('data-resultant')!)
  })

  it('has no serious or critical axe violations with the three labs in an RTL lesson flow', async () => {
    for (const Lab of [ParallelogramLab, ConcurrentForcesLab, ForceComponentsLab]) {
      const { container, unmount } = render(
        <div dir="rtl" lang="ar">
          <main>
            <Lab interactiveId="test-lab" reducedMotion={false} />
          </main>
        </div>,
      )

      const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
      const serious = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      )
      expect(serious.map((violation) => violation.id)).toEqual([])

      unmount()
    }
  })
})

describe('lesson navigation announces steps and keeps focus in RTL', () => {
  it('announces the step the student moved to', async () => {
    const user = userEvent.setup()
    const { container } = renderLesson()
    const status = container.querySelector('#lesson-content > [role="status"]')!

    expect(status).toHaveClass('visually-hidden')
    expect(status.textContent).toBe('')

    await user.click(screen.getByRole('button', { name: /^التالي/ }))

    const secondStep = physicsLesson1.steps[1]!
    expect(status.textContent).toBe(`الخطوة 2 من ${physicsLesson1.steps.length}: ${secondStep.title}`)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })

  it('opens the mobile outline as a dialog, reports its state and restores focus on Escape', async () => {
    const user = userEvent.setup()
    renderLesson()
    const trigger = screen.getByRole('button', { name: /خطوات الدرس/ })

    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    // The outline is one navigation landmark with a real name in both variants.
    expect(within(dialog).getByRole('navigation', { name: 'خطوات الدرس' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'إغلاق القائمة' })).toBeInTheDocument()
    // Current step is exposed, not only coloured.
    expect(within(dialog).getByRole('button', { current: 'step' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })

  it('moves focus to the displayed step after choosing it from the drawer', async () => {
    const user = userEvent.setup()
    renderLesson()
    const trigger = screen.getByRole('button', { name: /خطوات الدرس/ })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    const secondStep = physicsLesson1.steps[1]!
    await user.click(within(dialog).getByRole('button', { name: new RegExp(secondStep.title) }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Focus lands on the step that is now displayed, not back on the trigger.
    expect(document.getElementById('lesson-content')).toHaveFocus()
    expect(trigger).not.toHaveFocus()
  })

  it('keeps the lesson controls operable from the keyboard with meaningful names', async () => {
    const user = userEvent.setup()
    renderLesson()

    for (const name of [/^السابق/, /^التالي/, /خطوات الدرس/]) {
      // Every navigation control is a real, named button — never an icon alone.
      expect((screen.getByRole('button', { name }).textContent ?? '').trim().length).toBeGreaterThan(0)
    }
    // On the first step «السابق» is honestly disabled, not silently inert.
    expect(screen.getByRole('button', { name: /^السابق/ })).toBeDisabled()

    const next = screen.getByRole('button', { name: /^التالي/ })
    next.focus()
    expect(next).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByRole('button', { name: /^السابق/ })).toBeEnabled()
  })

  it('keeps scientific values isolated LTR while announcements stay Arabic prose', () => {
    vi.useFakeTimers()
    const { container } = render(
      <div dir="rtl">
        <ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />
      </div>,
    )

    const values = [...container.querySelectorAll('.lab__measurements .sci-value')]
    expect(values.length).toBeGreaterThan(0)
    for (const value of values) {
      expect(value).toHaveAttribute('dir', 'ltr')
      expect(value).toHaveAttribute('data-sci', 'isolated')
      // Number then unit in source order: `5.0 N`, never `N 5.0`.
      expect(value.firstElementChild?.className).toContain('sci-value__number')
    }

    fireEvent.change(sliders(container)[0]!, { target: { value: '6' } })
    act(() => {
      vi.advanceTimersByTime(DEBOUNCE_MS + 20)
    })

    const status = labStatus(container)
    // The announcement is written in Arabic with the units spelled out, so it
    // is one uninterrupted RTL string with nothing for bidi to reorder.
    expect(status.textContent).toMatch(/[\u0600-\u06FF]/)
    expect(status).not.toHaveAttribute('dir', 'ltr')
    expect(status.querySelector('[dir="ltr"]')).toBeNull()
  })

  it('anchors the drawer logically and disables its entrance motion for reduced motion', () => {
    const css = readProjectFile('src/styles/components.css')

    expect(css).toMatch(/\.drawer--start\s*\{[^}]*inset-inline-start:\s*0/s)
    expect(css).toMatch(/\.drawer--end\s*\{[^}]*inset-inline-end:\s*0/s)
    // The entrance shift follows the logical side instead of assuming LTR.
    expect(css).toMatch(/\[dir='rtl'\]\s*\.drawer--start\s*\{[^}]*--drawer-enter-shift:\s*12%/s)
    expect(css).toMatch(/\[dir='rtl'\]\s*\.drawer--end\s*\{[^}]*--drawer-enter-shift:\s*-12%/s)

    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.drawer[^}]*\}/s)?.[0] ?? ''
    expect(reduced).toContain('.drawer')
    expect(reduced).toContain('.drawer-backdrop')
    expect(reduced).toContain('animation: none')
  })
})
