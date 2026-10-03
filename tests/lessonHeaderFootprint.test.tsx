import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { LessonShell } from '@/layouts/LessonShell'
import { readProjectFile } from './utils/projectFiles'

/**
 * Lesson-header footprint contract.
 *
 * On desktop the site header (68px) and the lesson header are *both* sticky, so
 * every pixel the lesson header adds is permanently taken away from the step
 * content. The header must stay slim without losing anything: breadcrumb,
 * lesson identity, step summary, progress bar, accessible progress text, and
 * the mobile outline trigger all remain.
 *
 * jsdom has no layout engine, so the footprint is asserted against the
 * stylesheet contract (token-based paddings and sizes), and the content is
 * asserted against the rendered DOM.
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

const headerInner = declarations(components, '.lesson-shell__header-inner')
const breadcrumb = declarations(components, '.lesson-shell__breadcrumb')
const title = declarations(components, '.lesson-shell__title')
const subtitle = declarations(components, '.lesson-shell__subtitle')
const progress = declarations(components, '.lesson-shell__progress')
const progressLabel = declarations(components, '.lesson-shell__progress-label')
const header = declarations(components, '.lesson-shell__header')
const aside = declarations(components, '.lesson-shell__aside')

/** Ranks the spacing scale so the tests can assert "smaller than". */
const SPACE_SCALE = ['--space-0', '--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6']

function rank(value: string | undefined): number {
  const token = value?.match(/--space-\d+/)?.[0]
  return token ? SPACE_SCALE.indexOf(token) : 99
}

describe('lesson header vertical footprint', () => {
  it('uses compact vertical padding inside the sticky header', () => {
    expect(headerInner['padding-block']).toBeDefined()
    const [, end] = (headerInner['padding-block'] ?? '').split(/\s+/)
    // Was `--space-4` top / `--space-5` bottom before the fix.
    expect(rank(headerInner['padding-block'])).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-2'))
    expect(rank(end)).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-3'))
  })

  it('tightens the vertical rhythm between breadcrumb, title, summary and progress', () => {
    expect(rank(breadcrumb['margin-block-end'])).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-2'))
    expect(rank(subtitle['margin-block-start'])).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-1'))
    expect(rank(progress['margin-block-start'])).toBeLessThanOrEqual(SPACE_SCALE.indexOf('--space-2'))
  })

  it('keeps the lesson title one step down the type scale', () => {
    // `--fs-3xl` (up to 30px) was the single largest contributor to the header.
    expect(title['font-size']).toBe('var(--fs-2xl)')
  })

  it('lays the progress label on a single line on desktop', () => {
    expect(progressLabel['display']).toBe('flex')
    expect(progressLabel['flex-direction']).toBe('row')
    expect(progressLabel['white-space']).toBe('nowrap')
  })

  it('keeps the sticky outline column aligned with the slimmer header', () => {
    expect(header['position']).toBe('sticky')
    expect(header['top']).toBe('var(--header-height)')
    // The outline must still clear the site header plus the lesson header.
    expect(aside['top']).toContain('var(--header-height)')
    expect(aside['max-block-size']).toContain('100dvh')
  })

  it('still releases the header from sticky positioning on small screens', () => {
    const narrow = components.slice(components.indexOf('@media (max-width: 860px)'))
    expect(narrow).toMatch(/\.lesson-shell__header\s*\{\s*position:\s*static;/)
  })
})

describe('lesson header content is preserved', () => {
  function renderShell() {
    return render(
      <LessonShell
        breadcrumb={<span>المنصة</span>}
        title="القوى المتلاقية"
        subtitle={<span className="lesson-shell__step-summary">مدخل الدرس: الأهداف</span>}
        progress={{ current: 3, total: 9, ratio: 2 / 9, visited: 3 }}
        outline={<nav aria-label="مخطط الدرس">مخطط</nav>}
        navigation={<button type="button">التالي</button>}
        mobileOutlineTrigger={<button type="button">خطوات الدرس</button>}
      >
        <p>محتوى الخطوة</p>
      </LessonShell>,
    )
  }

  it('keeps breadcrumb, title and step summary', () => {
    const { container } = renderShell()
    expect(container.querySelector('.lesson-shell__breadcrumb')?.textContent).toBe('المنصة')
    expect(container.querySelector('.lesson-shell__title')?.textContent).toBe('القوى المتلاقية')
    expect(container.querySelector('.lesson-shell__subtitle')?.textContent).toContain('مدخل الدرس')
  })

  it('keeps the accessible progress bar and its readable text', () => {
    const { container } = renderShell()
    const bar = container.querySelector('[role="progressbar"]')!
    expect(bar).toHaveAttribute('aria-label', 'التقدّم في الدرس')
    expect(bar).toHaveAttribute('aria-valuenow', '3')
    expect(bar).toHaveAttribute('aria-valuemax', '9')
    expect(bar.getAttribute('aria-valuetext')).toContain('الخطوة الحالية 3 من 9')

    const label = container.querySelector('.lesson-shell__progress-label')!
    expect(label.textContent).toContain('الخطوة 3 من 9')
    expect(label.querySelector('.lesson-shell__progress-visited')?.textContent).toContain('زُرت 3 من 9')
  })

  it('keeps the outline region, the step region and the mobile trigger', () => {
    const { container } = renderShell()
    expect(container.querySelector('.lesson-shell__aside')).not.toBeNull()
    expect(container.querySelector('#lesson-content')).toHaveAttribute('role', 'region')
    expect(container.querySelector('#lesson-content')).toHaveAttribute('tabindex', '-1')
    expect(container.querySelector('.lesson-shell__mobile-trigger')?.textContent).toContain('خطوات الدرس')
    expect(container.querySelector('.lesson-shell__nav')?.textContent).toContain('التالي')
  })
})
