import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { progressStore } from '@/data/progress'
import { renderApp } from './utils/renderApp'
import { readProjectFile } from './utils/projectFiles'

/**
 * Lesson outline height contract.
 *
 * The rail is a navigation column, so the step list — not the lesson identity —
 * is the part that has to keep the viewport. The rail is capped by
 * `max-block-size: calc(100dvh - …)`, and inside it the list is the only
 * growing item (`flex: 1 1 auto`) while the identity block and the progress
 * line are unshrinkable: a flex item with visible overflow never shrinks below
 * its content. Every row the identity takes is therefore a row the list loses,
 * which is how the outline ended up showing one or two titles per screen.
 *
 * The fix keeps the same component and the same markup: the identity rows are
 * bounded (two-line summary, dropped entirely on short viewports) so the list
 * receives the rest of the viewport height and scrolls for the remainder.
 *
 * jsdom has no layout engine, so the geometry is asserted against the
 * stylesheet — exactly like the other lesson-layout contracts — and the
 * structure is asserted against the rendered page.
 */

const components = readProjectFile('src/styles/components.css')

/** First declaration block for an exact selector. */
function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[[\]" '=]/g, (char) => (char === ' ' ? '\\s+' : `\\${char}`))
  const raw = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
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

const SHORT_VIEWPORT = '@media (min-width: 1081px) and (max-height: 780px)'
const VERY_SHORT_VIEWPORT = '@media (min-width: 1081px) and (max-height: 640px)'

const rail = declarations(components, '.lesson-shell__rail')
const identity = declarations(components, '.lesson-rail__identity')
const description = declarations(components, '.lesson-rail__description')
const outline = declarations(components, '.lesson-rail__outline')

beforeEach(() => {
  window.history.replaceState(null, '', '#step-1')
  progressStore.resetLesson(chemistryLesson1.id)
})

describe('lesson outline height — the list owns the viewport', () => {
  it('bounds the rail by the viewport and lets only the list scroll inside it', () => {
    expect(rail['max-block-size']).toBe('calc(100dvh - var(--header-height) - var(--space-8))')
    expect(rail['overflow']).toBe('hidden')

    // The list is the rail's only growing, shrinking and scrolling item.
    expect(outline['flex']).toBe('1 1 auto')
    expect(outline['min-block-size']).toBe('0')
    expect(outline['overflow-y']).toBe('auto')
  })

  it('never lets the identity trade height with the list', () => {
    // Frozen footprint: without this the identity competes with the list for a
    // shrinking rail, and the list — the only scrollport — absorbs the loss.
    expect(identity['flex']).toBe('0 0 auto')
    expect(identity['min-block-size']).toBeUndefined()
  })

  it('keeps the lesson summary to two lines inside the rail', () => {
    expect(description['display']).toBe('-webkit-box')
    expect(description['-webkit-box-orient']).toBe('vertical')
    expect(description['-webkit-line-clamp']).toBe('2')
    expect(description['line-clamp']).toBe('2')
    expect(description['overflow']).toBe('hidden')
  })

  it('drops the repeated identity rows on short viewports so the list keeps its height', () => {
    const shortViewport = mediaBlock(SHORT_VIEWPORT)
    expect(shortViewport).toContain('.lesson-rail__description')
    expect(declarations(shortViewport, '.lesson-rail__description')['display']).toBe('none')

    const veryShortViewport = mediaBlock(VERY_SHORT_VIEWPORT)
    expect(veryShortViewport).toContain('.lesson-rail__subtitle')
    expect(declarations(veryShortViewport, '.lesson-rail__subtitle')['display']).toBe('none')
  })

  it('only shortens the rail, never the drawer that carries the same information', () => {
    // The full summary and the current-step chip stay readable in the mobile
    // drawer — the rail is the only surface that trades them for list height.
    const desktopOnly = /@media\s*\(min-width:\s*1081px\)/
    for (const query of [SHORT_VIEWPORT, VERY_SHORT_VIEWPORT]) {
      expect(query).toMatch(desktopOnly)
    }
    expect(components).not.toMatch(/\.drawer-lesson__summary\s*\{[^}]*display:\s*none/s)
    expect(components).not.toMatch(/\.drawer-lesson__step\s*\{[^}]*display:\s*none/s)
  })

  it('leaves the narrow-screen presentation untouched', () => {
    const compact = mediaBlock('@media (max-width: 1080px)')
    // Under 1081px the outline lives in the drawer and the rail is a compact bar.
    expect(compact).toMatch(/\.lesson-rail__outline\s*\{\s*display:\s*none;/)
    expect(compact).toMatch(/\.lesson-shell__rail\s*\{[^}]*position:\s*relative/s)
    expect(compact).not.toMatch(/\.lesson-rail__outline\s*\{[^}]*min-block-size/s)
  })

  it('renders the whole step list inside the rail so the list can scroll to it', async () => {
    renderApp('/chemistry/structural-chemistry/atom-and-element')
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const railElement = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(railElement).getByRole('navigation', { name: 'خطوات الدرس' })

    // Every step is in the scrollport: the rail shows more of them at once, and
    // the rest is reached by scrolling the list itself.
    expect(within(nav).getAllByRole('button')).toHaveLength(chemistryLesson1.steps.length)
    expect(nav.closest('.lesson-rail__outline')).not.toBeNull()

    // The list is the last block of the rail, so nothing below it steals height.
    const blocks = [...railElement.children]
    const outlineSlot = railElement.querySelector('.lesson-rail__outline')
    expect(blocks[blocks.length - 1]).toBe(outlineSlot)
  })
})
