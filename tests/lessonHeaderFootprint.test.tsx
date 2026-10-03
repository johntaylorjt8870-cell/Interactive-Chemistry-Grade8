import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LessonShell } from '@/layouts/LessonShell'
import { readProjectFile } from './utils/projectFiles'

/**
 * Lesson chrome footprint contract.
 *
 * The lesson page used to stack two sticky bands at the top of the viewport:
 * the site header (68px) and a full-width lesson header. Every pixel of the
 * second one was permanently taken away from the step content — experiments,
 * figures and tables.
 *
 * Fix 15 removed that band entirely: the lesson page now carries exactly one
 * element of its own chrome, the lesson rail. On desktop the rail is a column
 * beside the content (never above it); under 1080px it collapses into a
 * compact bar inside the content flow. So the footprint budget these tests pin
 * is: nothing reserved above the step, one sticky element that is not the
 * lesson chrome, and a rail whose vertical size is bounded by the viewport.
 *
 * jsdom has no layout engine, so the footprint is asserted against the
 * stylesheet contract (token-based paddings and sizes, selectors that must not
 * exist) and the content is asserted against the rendered DOM.
 */

const components = readProjectFile('src/styles/components.css')

function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[[\]"'=]/g, (char) => `\\${char}`)
  const raw = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  // Comments inside a rule may contain `:` and `;`, which would corrupt a naive
  // declaration split — strip them before parsing.
  const block = raw.replace(/\/\*[\s\S]*?\*\//g, '')
  const result: Record<string, string> = {}
  for (const line of block.split(';')) {
    const [property, value] = line.split(':')
    if (property && value) result[property.trim()] = value.trim()
  }
  return result
}

/** Everything from a media query up to the next one. */
function mediaBlock(query: string): string {
  const start = components.indexOf(query)
  if (start < 0) return ''
  const rest = components.slice(start + query.length)
  const next = rest.search(/@media/)
  return next < 0 ? rest : rest.slice(0, next)
}

/** Ranks the spacing scale so the tests can assert "at most". */
const SPACE_SCALE = [
  '--space-0',
  '--space-1',
  '--space-2',
  '--space-3',
  '--space-4',
  '--space-5',
  '--space-6',
]

function rank(value: string | undefined): number {
  const token = value?.match(/--space-\d+/)?.[0]
  return token ? SPACE_SCALE.indexOf(token) : 99
}

const COMPACT_QUERY = '@media (max-width: 1080px)'
const compact = mediaBlock(COMPACT_QUERY)

const shellBody = declarations(components, '.lesson-shell__body')
const rail = declarations(components, '.lesson-shell__rail')
const railTitle = declarations(components, '.lesson-rail__title')
const railOutline = declarations(components, '.lesson-rail__outline')
const railProgressLabel = declarations(components, '.lesson-rail__progress-label')
const railCompact = declarations(compact, '.lesson-shell__rail')
const railTitleCompact = declarations(compact, '.lesson-rail__title')
const compactBarPadding = railCompact['padding']

/** The single lesson rail element of a rendered shell. */
function railElement(container: HTMLElement): HTMLElement {
  return container.querySelector('.lesson-shell__rail') as HTMLElement
}

describe('lesson chrome vertical footprint', () => {
  it('deletes the old header band: its selectors no longer exist', () => {
    // Not "hidden", not "zero height" — gone. A rule that does not exist
    // cannot reserve space, cannot repaint, and cannot come back through a
    // later breakpoint.
    for (const selector of [
      '.lesson-shell__header',
      '.lesson-shell__header-inner',
      '.lesson-shell__breadcrumb',
      '.lesson-shell__title',
      '.lesson-shell__title-row',
      '.lesson-shell__subtitle',
      '.lesson-shell__progress',
      '.lesson-shell__progress-label',
      '.lesson-shell__progress-visited',
      '.lesson-shell__aside',
    ]) {
      expect(components, `stale lesson header rule ${selector}`).not.toContain(`${selector} {`)
      expect(declarations(components, selector)).toEqual({})
    }
  })

  it('reserves no space above the step content', () => {
    // The only vertical gap is a plain space token — no `calc()` holding the
    // height of a band that is supposed to be gone.
    expect(shellBody['padding-block-start']).toBe('var(--space-6)')
    expect(shellBody['padding-block-start']).not.toContain('--header-height')
    expect(shellBody['padding-block-start']).not.toContain('calc(')

    // The content column itself is neither sticky nor offset downwards.
    const main = declarations(components, '.lesson-shell__main')
    expect(main['position']).toBeUndefined()
    expect(main['top']).toBeUndefined()
    expect(JSON.stringify(main)).not.toContain('--header-height')
    expect(JSON.stringify(main)).not.toContain('calc(')
  })

  it('keeps the site header as the only band pinned to the top of the viewport', () => {
    const siteHeader = declarations(components, '.site-header')
    expect(siteHeader['position']).toBe('sticky')
    expect(siteHeader['top']).toBe('0')

    // The rail is sticky too, but it clears the site header and stays a column
    // beside the content — it never overlaps it, and it carries no z-index, so
    // it cannot paint over the site header either.
    expect(rail['position']).toBe('sticky')
    expect(rail['top']).toBe('calc(var(--header-height) + var(--space-4))')
    expect(rail['z-index']).toBeUndefined()
    expect(rail['inset-block-start']).toBeUndefined()
  })

  it('bounds the rail by the viewport so lesson chrome never grows the page', () => {
    expect(rail['max-block-size']).toContain('100dvh')
    expect(rail['max-block-size']).toContain('var(--header-height)')
    expect(rail['overflow']).toBe('hidden')
    // Only the outline scrolls inside the rail.
    expect(railOutline['overflow-y']).toBe('auto')
    expect(railOutline['min-block-size']).toBe('0')
  })

  it('keeps the lesson identity on the slimmed type step instead of the old display size', () => {
    // `--fs-3xl` (up to 30px) was the single largest contributor to the old
    // band. The identity now lives in a 300px rail and stays on `--fs-2xl`.
    expect(railTitle['font-size']).toBe('var(--fs-2xl)')
    expect(railTitle['line-height']).toBe('var(--lh-snug)')
    expect(railProgressLabel['font-size']).toBe('var(--fs-2xs)')
    // The counters never wrap or overflow the rail column.
    expect(railProgressLabel['white-space']).toBe('nowrap')
  })

  it('collapses the rail into a compact in-flow bar on narrow screens', () => {
    // No fixed band on mobile: the bar scrolls away with the lesson.
    expect(railCompact['position']).toBe('relative')
    expect(railCompact['max-block-size']).toBe('none')
    expect(compact).not.toMatch(/\.lesson-shell__rail\s*\{[^}]*position:\s*sticky/s)

    // Footprint budget: the compact bar is padded with the smallest tokens.
    expect(rank(compactBarPadding)).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-1'))
    expect(rank(compactBarPadding.split(/\s+/)[2])).toBeLessThanOrEqual(
      SPACE_SCALE.indexOf('--space-2'),
    )
    expect(railTitleCompact['font-size']).toBe('var(--fs-md)')
  })

  it('keeps the single-line progress caption on the compact bar', () => {
    // On desktop the rail is a narrow column and stacks the two counters; the
    // compact bar has the width for one line, which is where the caption was
    // always meant to read as a single row.
    const compactLabel = declarations(compact, '.lesson-rail__progress-label')
    expect(compactLabel['flex-direction']).toBe('row')
    expect(railProgressLabel['display']).toBe('flex')
    expect(railProgressLabel['flex-direction']).toBe('column')
    // `nowrap` is declared once on the base rule and inherited everywhere, so
    // the caption can never wrap into a taller footprint.
    expect(railProgressLabel['white-space']).toBe('nowrap')
    expect(compactLabel['white-space']).toBeUndefined()
  })
})

describe('lesson chrome content is preserved', () => {
  function renderShell() {
    return render(
      <LessonShell
        breadcrumb={<span>المنصة</span>}
        title="القوى المتلاقية"
        description="وصف الدرس من بيانات الدرس."
        subtitle="مدخل الدرس: الأهداف"
        progress={{ current: 3, total: 9, ratio: 2 / 9, visited: 3 }}
        outline={<nav aria-label="مخطط الدرس">مخطط</nav>}
        navigation={<button type="button">التالي</button>}
        mobileOutlineTrigger={<button type="button">خطوات الدرس</button>}
      >
        <p>محتوى الخطوة</p>
      </LessonShell>,
    )
  }

  it('renders no lesson header element anywhere in the shell', () => {
    const { container } = renderShell()

    expect(container.querySelector('.lesson-shell__header')).toBeNull()
    expect(container.querySelector('[class*="lesson-shell__header"]')).toBeNull()
    expect(container.querySelector('.lesson-shell__aside')).toBeNull()
    // The old band is not re-created under a new name either: the shell has
    // exactly one element of its own chrome, the rail.
    expect(container.querySelectorAll('.lesson-shell__rail')).toHaveLength(1)
  })

  it('carries breadcrumb, title, lesson description and step summary in the rail', () => {
    const { container } = renderShell()
    const railEl = railElement(container)

    expect(railEl.querySelector('.lesson-rail__breadcrumb')?.textContent).toBe('المنصة')
    expect(railEl.querySelector('.lesson-rail__title')?.textContent).toBe('القوى المتلاقية')
    expect(railEl.querySelector('.lesson-rail__description')?.textContent).toContain('وصف الدرس')
    expect(railEl.querySelector('.lesson-rail__subtitle')?.textContent).toContain('مدخل الدرس')
  })

  it('carries the step outline and the accessible progress bar in the rail', () => {
    const { container } = renderShell()
    const railEl = railElement(container)

    expect(railEl.querySelector('nav[aria-label="مخطط الدرس"]')?.textContent).toBe('مخطط')

    const bar = railEl.querySelector('[role="progressbar"]')!
    expect(bar).toHaveAttribute('aria-label', 'التقدّم في الدرس')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '9')
    expect(bar.getAttribute('aria-valuetext')).toContain('الخطوة الحالية 3 من 9')

    const label = railEl.querySelector('.lesson-rail__progress-label')!
    expect(label.textContent).toContain('الخطوة 3 من 9')
    expect(label.querySelector('.lesson-rail__visited')?.textContent).toContain('زُرت 3 من 9')
  })

  it('keeps the step region, its focus target, the step navigation and the trigger', () => {
    const { container } = renderShell()
    const content = container.querySelector('#lesson-content')!

    expect(content).toHaveAttribute('role', 'region')
    expect(content).toHaveAttribute('aria-label', 'محتوى الدرس')
    expect(content).toHaveAttribute('tabindex', '-1')
    expect(content.textContent).toContain('محتوى الخطوة')
    expect(content.querySelector('.lesson-shell__nav')?.textContent).toContain('التالي')
    // The content column carries the step, not the lesson chrome.
    expect(content.querySelector('[role="progressbar"]')).toBeNull()
    expect(content.querySelector('nav[aria-label="مخطط الدرس"]')).toBeNull()

    expect(
      container.querySelector('.lesson-shell__mobile-trigger')?.textContent,
    ).toContain('خطوات الدرس')
    // The outline slot is rendered inside the rail (the stubbed nav above
    // stands in for the real `LessonOutline`, which the page-level tests
    // cover with its full step list).
    expect(railElement(container).querySelector('nav[aria-label="مخطط الدرس"]')).not.toBeNull()
  })
})
