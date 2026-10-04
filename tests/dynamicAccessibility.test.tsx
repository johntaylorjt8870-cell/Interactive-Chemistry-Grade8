import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/**
 * Lesson navigation remains accessible to keyboard and screen-reader users in
 * Arabic RTL. Dynamic scientific values are covered by the Chemistry-specific
 * interactive tests and the shared scientific rendering contracts.
 */

const LESSON_PATH = '/chemistry/structural-chemistry/atom-and-element'

function renderLesson() {
  window.history.replaceState(null, '', '#step-1')
  return renderApp(LESSON_PATH)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('lesson navigation announces steps and keeps focus in RTL', () => {
  it('announces the step the student moved to', async () => {
    const user = userEvent.setup()
    const { container } = renderLesson()
    const status = container.querySelector('#lesson-content > [role="status"]')!

    expect(status).toHaveClass('visually-hidden')
    expect(status.textContent).toBe('')

    await user.click(screen.getByRole('button', { name: /^التالي/ }))

    const secondStep = chemistryLesson1.steps[1]!
    expect(status.textContent).toBe(`الخطوة 2 من ${chemistryLesson1.steps.length}: ${secondStep.title}`)
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
    expect(within(dialog).getByRole('navigation', { name: 'خطوات الدرس' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'إغلاق القائمة' })).toBeInTheDocument()
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
    const secondStep = chemistryLesson1.steps[1]!
    await user.click(within(dialog).getByRole('button', { name: new RegExp(`^${secondStep.title}`) }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.getElementById('lesson-content')).toHaveFocus()
    expect(trigger).not.toHaveFocus()
  })

  it('keeps the lesson controls operable from the keyboard with meaningful names', async () => {
    const user = userEvent.setup()
    renderLesson()

    for (const name of [/^السابق/, /^التالي/, /خطوات الدرس/]) {
      expect((screen.getByRole('button', { name }).textContent ?? '').trim().length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: /^السابق/ })).toBeDisabled()

    const next = screen.getByRole('button', { name: /^التالي/ })
    next.focus()
    expect(next).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
    expect(screen.getByRole('button', { name: /^السابق/ })).toBeEnabled()
  })

  it('anchors the drawer logically and disables its entrance motion for reduced motion', () => {
    const css = readProjectFile('src/styles/components.css')

    expect(css).toMatch(/\.drawer--start\s*\{[^}]*inset-inline-start:\s*0/s)
    expect(css).toMatch(/\.drawer--end\s*\{[^}]*inset-inline-end:\s*0/s)
    expect(css).toMatch(/\[dir='rtl'\]\s*\.drawer--start\s*\{[^}]*--drawer-enter-shift:\s*12%/s)
    expect(css).toMatch(/\[dir='rtl'\]\s*\.drawer--end\s*\{[^}]*--drawer-enter-shift:\s*-12%/s)

    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*\.drawer[^}]*\}/s)?.[0] ?? ''
    expect(reduced).toContain('.drawer')
    expect(reduced).toContain('.drawer-backdrop')
    expect(reduced).toContain('animation: none')
  })
})
