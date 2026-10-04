import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import axe from 'axe-core'
import { renderApp } from './utils/renderApp'

/**
 * Accessibility checks that run against the real rendered pages.
 *
 * Colour contrast is excluded because jsdom has no layout engine and would
 * report false results; contrast is covered instead by the design-token
 * contract test in designSystem.test.ts.
 */
async function audit(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })
  return results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
}

const PUBLIC_ROUTES = ['/', '/chemistry', '/chemistry/structural-chemistry', '/teacher', '/does-not-exist']

describe('page accessibility', () => {
  it.each(PUBLIC_ROUTES)('has no serious or critical axe violations on %s', async (path) => {
    const { container } = renderApp(path)
    const violations = await audit(container)

    expect(
      violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`),
    ).toEqual([])
  })
})

describe('semantic structure', () => {
  it('uses landmarks for header, navigation, main and footer', () => {
    renderApp('/')

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'التنقل الرئيسي' })).toBeInTheDocument()
  })

  it('keeps the lesson within one named main landmark and names its content regions', () => {
    renderApp('/chemistry/structural-chemistry/atom-and-element')

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'محتوى الدرس' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'مخطط الدرس' })).toBeInTheDocument()
  })

  it('exposes the navigation drawer expanded state', () => {
    renderApp('/')
    const trigger = screen.getByRole('button', { name: 'فتح قائمة التنقل' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'التنقل' })).toBeInTheDocument()
  })

  it('gives every button an accessible name', () => {
    for (const path of ['/', '/chemistry', '/chemistry/structural-chemistry/atom-and-element']) {
      const { container, unmount } = renderApp(path)
      const buttons = [...container.querySelectorAll('button')]

      for (const button of buttons) {
        const name = button.getAttribute('aria-label') ?? button.textContent?.trim() ?? ''
        expect(name.length, `unnamed button on ${path}`).toBeGreaterThan(0)
      }
      unmount()
    }
  })

  it('associates every form control with a label', () => {
    const { container, unmount } = renderApp('/teacher')
    const controls = [...container.querySelectorAll('input, select, textarea')]

    expect(controls.length).toBeGreaterThan(0)
    for (const control of controls) {
      const id = control.getAttribute('id')
      const hasLabel = id ? container.querySelector(`label[for="${id}"]`) !== null : false
      const wrapped = control.closest('label') !== null
      expect(hasLabel || wrapped, 'control without a label').toBe(true)
    }
    unmount()
  })

  it('keeps a logical heading order on the course home', () => {
    const { container } = renderApp('/')
    const levels = [...container.querySelectorAll('h1, h2, h3, h4')].map((heading) =>
      Number(heading.tagName.slice(1)),
    )

    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index]! - levels[index - 1]!).toBeLessThanOrEqual(1)
    }
  })

  it('marks decorative icons as hidden from assistive technology', () => {
    const { container } = renderApp('/')
    const svgs = [...container.querySelectorAll('svg')]

    for (const svg of svgs) {
      // An ancestor may hide the whole subtree (KaTeX hides its HTML layer,
      // which contains the radical glyph SVG), so check the chain too.
      const hiddenInChain = svg.closest('[aria-hidden="true"]') !== null
      const labelled = svg.hasAttribute('aria-label') || svg.hasAttribute('aria-labelledby')
      const role = svg.getAttribute('role')
      expect(hiddenInChain || labelled || role === 'presentation', 'svg without name or aria-hidden').toBe(true)
    }
  })

  it('exposes the teacher gate as a real form with a submit button', () => {
    renderApp('/teacher')

    expect(screen.getByRole('form', { name: 'بوابة دخول مساحة المعلم' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'دخول مساحة المعلم' })).toHaveAttribute('type', 'submit')
  })
})
