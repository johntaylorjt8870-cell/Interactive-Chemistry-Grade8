import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LessonShell } from '@/layouts/LessonShell'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { progressStore } from '@/data/progress'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/**
 * Fix 15 regression contract — the lesson page owns no header band.
 *
 * The lesson page is a rail plus a content column:
 *
 *   1. there is no standalone lesson header above the step content — the old
 *      band is gone from the DOM, not merely hidden while still reserving
 *      vertical space;
 *   2. lesson identity (breadcrumb, title, description), progress and visited
 *      steps live in the rail beside the content on desktop;
 *   3. the compact trigger on narrow screens still opens a drawer that carries
 *      the same lesson information and the full outline, with focus management
 *      and `aria-expanded` reporting intact;
 *   4. no offset is reserved above the content, and the rail is the only
 *      sticky element in the lesson layout (it never overlays the content).
 *
 * jsdom has no layout engine, so the geometry contract is asserted against the
 * stylesheet: the removed selectors, the small gap token above the content, and
 * the sticky rail that collapses to a static compact bar.
 */

const LESSON_PATH = '/chemistry/structural-chemistry/atom-and-element'
const components = readProjectFile('src/styles/components.css')

/** First declaration block for an exact selector. */
function rule(selector: string): string {
  const escaped = selector.replace(/[[\]"'=]/g, (char) => `\\${char}`)
  return components.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
}

/** Everything from a media query up to the next one. */
function mediaBlock(query: string): string {
  const start = components.indexOf(query)
  if (start < 0) return ''
  const rest = components.slice(start + query.length)
  const next = rest.search(/@media/)
  return next < 0 ? rest : rest.slice(0, next)
}

const COMPACT_QUERY = '@media (max-width: 1080px)'

beforeEach(() => {
  window.history.replaceState(null, '', '#step-1')
  progressStore.resetLesson(chemistryLesson1.id)
})

describe('lesson layout — no header band above the step', () => {
  it('renders no lesson header element above the step content', async () => {
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    // The old band must not exist in the document at all — hiding it in CSS
    // while its box still reserves space is exactly what this fix removes.
    expect(container.querySelector('.lesson-shell__header')).toBeNull()
    expect(container.querySelector('[class*="lesson-shell__header"]')).toBeNull()
    expect(container.querySelector('.lesson-shell__header-inner')).toBeNull()
  })

  it('starts the content region with the step itself, not with lesson chrome', async () => {
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const content = screen.getByRole('region', { name: 'محتوى الدرس' })

    // The announcer is first and visually hidden; the first visible child is
    // the step article, so nothing occupies space above the step.
    expect(content.querySelector(':scope > [role="status"]')).not.toBeNull()
    const firstVisible = [...content.children].find(
      (child) => !child.classList.contains('visually-hidden'),
    )
    expect(firstVisible?.hasAttribute('data-step')).toBe(true)
    expect(firstVisible?.getAttribute('data-step')).toBe(chemistryLesson1.steps[0]!.id)
    expect(container.querySelector('[data-step]')).toBe(firstVisible)
  })

  it('keeps exactly one h1 and never repeats it inside the content column', async () => {
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    expect(within(content).queryByRole('heading', { level: 1 })).toBeNull()
  })
})

describe('lesson layout — identity and progress in the rail', () => {
  it('moves the lesson identity, progress and outline into the rail', async () => {
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })

    // Lesson name and breadcrumb identity.
    expect(within(rail).getByRole('heading', { level: 1, name: /الذرّة والعنصر/ })).toBeInTheDocument()
    expect(within(rail).getByRole('link', { name: 'الكيمياء' })).toBeInTheDocument()
    expect(within(rail).getByRole('link', { name: /الوحدة الأولى/ })).toBeInTheDocument()
    // Lesson description taken from the lesson definition itself.
    expect(within(rail).getByText(chemistryLesson1.summary!)).toBeInTheDocument()
    // Progress: a real progressbar, plus the step and visited counters.
    const bar = within(rail).getByRole('progressbar', { name: 'التقدّم في الدرس' })
    expect(bar).toHaveAttribute('aria-valuemax', String(chemistryLesson1.steps.length))
    expect(bar).toHaveAttribute('aria-valuenow', '1')
    expect(within(rail).getByText(`الخطوة 1 من ${chemistryLesson1.steps.length}`)).toBeInTheDocument()
    // The step outline with every step is in the rail.
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).getAllByRole('button')).toHaveLength(chemistryLesson1.steps.length)

    // The content column carries the step only: no title, progress or outline.
    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    expect(within(content).queryByRole('progressbar')).toBeNull()
    expect(within(content).queryByRole('navigation', { name: 'خطوات الدرس' })).toBeNull()

    // One rail renders both presentations: the identity is never duplicated
    // for the desktop and the compact variant.
    expect(document.querySelectorAll('.lesson-shell__rail')).toHaveLength(1)
    expect(document.querySelectorAll('.lesson-shell__mobile-trigger')).toHaveLength(1)
    expect(document.querySelectorAll('.lesson-rail__title')).toHaveLength(1)
    expect(document.querySelectorAll('[role="progressbar"]')).toHaveLength(1)
  })

  it('keeps the current step of the long outline in view inside the rail', async () => {
    // jsdom does not implement scrolling, so the geometry behaviour is pinned
    // by observing the call the outline makes on the rail's own scrollport.
    const scrollIntoView = vi.fn()
    const prototype = HTMLElement.prototype as { scrollIntoView?: unknown }
    const original = prototype.scrollIntoView
    prototype.scrollIntoView = scrollIntoView

    try {
      const user = userEvent.setup()
      renderApp(LESSON_PATH)
      await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })
      scrollIntoView.mockClear()

      await user.click(screen.getByRole('button', { name: /^التالي/ }))

      const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
      const current = within(rail).getByRole('button', { current: 'step' })
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' })
      expect(scrollIntoView.mock.instances).toContain(current)
    } finally {
      if (original === undefined) delete prototype.scrollIntoView
      else prototype.scrollIntoView = original
    }
  })

  it('updates rail progress and visited state as steps are opened', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    expect(within(rail).getByRole('button', { current: 'step' })).toHaveAccessibleName(
      new RegExp(chemistryLesson1.steps[0]!.title),
    )

    await user.click(screen.getByRole('button', { name: /^التالي/ }))

    const bar = within(rail).getByRole('progressbar', { name: 'التقدّم في الدرس' })
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(within(rail).getByRole('button', { current: 'step' })).toHaveAccessibleName(
      new RegExp(chemistryLesson1.steps[1]!.title),
    )
    expect(within(rail).getAllByText('تمت زيارتها').length).toBeGreaterThan(0)
    expect(within(rail).getByText(/زُرت 2 من/)).toBeInTheDocument()
  })
})

describe('lesson layout — compact trigger and drawer on narrow screens', () => {
  it('keeps lesson information and the outline inside the drawer', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const trigger = screen.getByRole('button', { name: /خطوات الدرس/ })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    const dialog = screen.getByRole('dialog', { name: 'خطوات الدرس' })
    const nav = within(dialog).getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).getAllByRole('button')).toHaveLength(chemistryLesson1.steps.length)
    expect(within(dialog).getByRole('button', { current: 'step' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'إغلاق القائمة' })).toBeInTheDocument()
    // Lesson information travels with the drawer on mobile.
    expect(within(dialog).getByText(chemistryLesson1.summary!)).toBeInTheDocument()
    expect(within(dialog).getByText(new RegExp(`الخطوة 1 من ${chemistryLesson1.steps.length}`))).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: 'الكيمياء' })).toBeInTheDocument()

    // The outlined controls are the outline plus the close button, nothing else.
    expect(within(dialog).getAllByRole('button')).toHaveLength(chemistryLesson1.steps.length + 1)
  })

  it('closes with Escape and returns focus to the compact trigger', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const trigger = screen.getByRole('button', { name: /خطوات الدرس/ })
    await user.click(trigger)
    expect(screen.getByRole('dialog', { name: 'خطوات الدرس' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
  })
})

describe('lesson layout — shell structure and CSS geometry contract', () => {
  it('renders the identity in the rail and nothing above the content', () => {
    renderWithTheme(
      <LessonShell
        title="عنوان الدرس"
        description="وصف الدرس"
        breadcrumb={<a href="/chemistry">الكيمياء</a>}
        progress={{ current: 2, total: 4, ratio: 0.5, visited: 1 }}
        outline={<nav aria-label="خطوات الدرس">قائمة الخطوات</nav>}
        navigation={<div>تنقل</div>}
      >
        <p>محتوى الخطوة</p>
      </LessonShell>,
    )

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    expect(within(rail).getByRole('heading', { level: 1, name: 'عنوان الدرس' })).toBeInTheDocument()
    expect(within(rail).getByText('وصف الدرس')).toBeInTheDocument()
    expect(within(rail).getByRole('progressbar')).toBeInTheDocument()
    expect(within(rail).getByRole('navigation', { name: 'خطوات الدرس' })).toBeInTheDocument()
    // Step navigation stays with the step, not in the rail.
    expect(within(rail).queryByText('تنقل')).toBeNull()

    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    expect(content.firstElementChild).toHaveTextContent('محتوى الخطوة')
    expect(within(content).getByText('تنقل')).toBeInTheDocument()
    expect(within(content).queryByRole('heading', { level: 1 })).toBeNull()
    expect(within(content).queryByRole('progressbar')).toBeNull()
  })

  it('deletes the old lesson header styles instead of hiding them', () => {
    expect(components).not.toMatch(/lesson-shell__header/)
    expect(components).not.toMatch(/lesson-shell__title-row/)
    expect(components).not.toMatch(/lesson-shell__subtitle/)
    expect(components).not.toMatch(/lesson-shell__aside/)
  })

  it('reserves no header offset above the lesson content', () => {
    const body = rule('.lesson-shell__body')
    expect(body).toContain('padding-block-start: var(--space-6)')
    expect(body).not.toContain('--header-height')
    expect(body).not.toContain('calc(')

    // The content column is never sticky and never offset by the site header.
    const main = rule('.lesson-shell__main')
    expect(main).not.toContain('sticky')
    expect(main).not.toContain('--header-height')
    expect(main).not.toContain('calc(')
  })

  it('sticks the rail below the site header and collapses it on narrow screens', () => {
    const rail = rule('.lesson-shell__rail')
    expect(rail).toContain('position: sticky')
    expect(rail).toMatch(/top:\s*calc\(var\(--header-height\)/)
    expect(rail).not.toContain('position: fixed')

    const compact = mediaBlock(COMPACT_QUERY)
    expect(compact).toMatch(/\.lesson-shell__rail\s*\{[^}]*position:\s*(?:static|relative)/s)
    expect(compact).not.toMatch(/\.lesson-shell__rail\s*\{[^}]*position:\s*sticky/s)
    expect(compact).toMatch(/\.lesson-rail__outline\s*\{\s*display:\s*none;/)
    expect(compact).toMatch(/\.lesson-shell__mobile-trigger\s*\{\s*display:\s*block;/)
    // The compact bar sits at the top of the content flow with a small gap.
    expect(compact).toMatch(/\.lesson-shell__body\s*\{[^}]*padding-block-start:\s*var\(--space-3\)/)
  })

  it('keeps the rail scrollable so a long outline never grows the page column', () => {
    const rail = rule('.lesson-shell__rail')
    expect(rail).toContain('max-block-size: calc(100dvh')
    expect(rail).toContain('overflow: hidden')

    const outline = rule('.lesson-rail__outline')
    expect(outline).toContain('overflow-y: auto')
    expect(outline).toContain('min-block-size: 0')
  })
})
