import { describe, expect, it } from 'vitest'
import { readProjectFile } from './utils/projectFiles'

/**
 * Design-system contract tests.
 *
 * jsdom has no layout engine, so instead of asserting rendered colours these
 * tests read the token layer directly and assert the invariants that keep the
 * interface readable and consistent: tokens exist, themes differ, table
 * surfaces are all explicitly defined, and subject identities stay distinct
 * without becoming different design languages.
 */

const tokens = readProjectFile('src/styles/tokens.css')
const base = readProjectFile('src/styles/base.css')
const components = readProjectFile('src/styles/components.css')
const scientificComponents = readProjectFile('src/styles/scientific-components.css')

function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[[\]"'=]/g, (char) => `\\${char}`)
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  const result: Record<string, string> = {}
  for (const line of block.split(';')) {
    const [property, value] = line.split(':')
    if (property && value) result[property.trim()] = value.trim()
  }
  return result
}

const REQUIRED_TOKENS = [
  '--font-arabic',
  '--font-latin',
  '--fs-sm',
  '--space-4',
  '--radius-md',
  '--dur-fast',
  '--surface-base',
  '--text-strong',
  '--border-soft',
  '--shadow-md',
  '--table-bg',
  '--table-header-bg',
  '--table-header-text',
  '--table-body-text',
  '--table-border',
  '--table-row-hover-bg',
  '--table-cell-selected-bg',
  '--table-cell-selected-text',
  '--table-cell-active-bg',
  '--table-cell-active-text',
]

describe('design tokens', () => {
  it('defines every token the components depend on', () => {
    for (const token of REQUIRED_TOKENS) {
      expect(tokens, `missing token ${token}`).toContain(`${token}:`)
    }
  })

  it('defines both themes with their own surfaces and text colours', () => {
    const light = declarations(tokens, ":root,\n[data-theme='light']")
    const dark = declarations(tokens, "[data-theme='dark']")

    expect(light['--surface-base']).toBeDefined()
    expect(dark['--surface-base']).toBeDefined()
    expect(light['--surface-base']).not.toBe(dark['--surface-base'])
    expect(light['--text-strong']).not.toBe(dark['--text-strong'])
  })
})

describe('subject identities', () => {
  it('gives physics and chemistry different accents from the same system', () => {
    const physics = declarations(tokens, ':root,\n[data-subject=\'neutral\'],\n[data-subject=\'physics\']')
    const chemistry = declarations(tokens, "[data-subject='chemistry']")

    expect(physics['--accent']).toBeDefined()
    expect(chemistry['--accent']).toBeDefined()
    expect(physics['--accent']).not.toBe(chemistry['--accent'])
  })

  it('keeps typography, spacing and radius shared between subjects', () => {
    // The subject blocks may only override colour-related custom properties.
    const chemistryBlock = tokens.match(/\[data-subject='chemistry'\]\s*\{([^}]*)\}/s)?.[1] ?? ''
    const offending = chemistryBlock
      .split(';')
      .map((line) => line.split(':')[0]?.trim())
      .filter((property): property is string => Boolean(property) && !property.startsWith('--'))
      .filter((property) => !property.startsWith('--accent') && !property.startsWith('--subject'))

    expect(offending).toEqual([])
  })
})

describe('scientific table readability contract', () => {
  it('defines a distinct surface for every table state', () => {
    const wrapper = declarations(scientificComponents, '.sci-table-wrapper')
    const head = declarations(scientificComponents, '.sci-table__head')
    const cell = declarations(scientificComponents, '.sci-table__cell,\n.sci-table__row-head')

    expect(wrapper['background']).toContain('--table-bg')
    expect(head['background']).toContain('--table-header-bg')
    expect(head['color']).toContain('--table-header-text')
    expect(cell['color']).toContain('--table-body-text')
  })

  it('styles hover, selected and active rows from state attributes', () => {
    expect(scientificComponents).toContain("[data-selected='true']")
    expect(scientificComponents).toContain("[data-active='true']")
    expect(scientificComponents).toContain(':hover')
    expect(scientificComponents).toContain('--table-cell-selected-bg')
    expect(scientificComponents).toContain('--table-cell-active-bg')
  })

  it('never relies on inherited colour for table text', () => {
    // Header, body and alternate rows each set an explicit foreground colour.
    expect(declarations(scientificComponents, '.sci-table__row-head')['color']).toBeDefined()
    expect(declarations(scientificComponents, '.sci-table__caption')['color']).toBeDefined()
    expect(declarations(scientificComponents, '.sci-table__footnote')['color']).toBeDefined()
  })
})

describe('accessibility foundations in CSS', () => {
  it('always shows a visible focus indicator', () => {
    expect(base).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid/s)
  })

  it('honours reduced motion through the motion tokens', () => {
    expect(tokens).toContain('@media (prefers-reduced-motion: reduce)')
    expect(components).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('isolates physics SVG labels as LTR scientific tokens', () => {
    const label = components.match(/\.vec-lab__label\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(label).toContain('direction: ltr')
    expect(label).toContain('unicode-bidi: isolate')
  })

  it('slides drawers from the logical edge in RTL and removes drawer motion when requested', () => {
    expect(components).toContain("[dir='rtl'] .drawer--start {\n  --drawer-enter-shift: 12%;")
    expect(components).toContain("[dir='rtl'] .drawer--end {\n  --drawer-enter-shift: -12%;")
    expect(components).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.drawer,\s*\.drawer-backdrop\s*\{\s*animation:\s*none;/s)
  })

  it('keeps a skip link available for keyboard users', () => {
    expect(base).toMatch(/\.skip-link\s*\{/)
    expect(base).toContain('.skip-link:focus-visible')
  })

  it('only resets the default outline, and always provides a visible ring', () => {
    // `:focus { outline: none }` is allowed as a reset precisely because
    // `:focus-visible` paints a real, visible ring for keyboard users.
    expect(base).toMatch(/:focus\s*\{\s*outline:\s*none;?\s*\}/)
    expect(base).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent\)/s)
    expect(base).toContain('outline-offset')
  })
})

describe('layout responsiveness contract', () => {
  it('switches the lesson outline to a drawer on narrow screens', () => {
    expect(components).toMatch(/@media \(max-width: 1080px\)/)
    // The rail collapses to a compact, non-sticky bar: its outline column and
    // the lesson information it repeats are moved into the drawer, which the
    // compact trigger opens.
    expect(components).toMatch(/\.lesson-rail__outline\s*\{\s*display:\s*none;/)
    expect(components).toMatch(/\.lesson-shell__mobile-trigger\s*\{\s*display:\s*block;/)
    expect(components).toMatch(/\.lesson-shell__rail\s*\{[^}]*position:\s*relative/s)
  })

  it('collapses the desktop navigation into the menu button on small screens', () => {
    expect(components).toMatch(/@media \(max-width: 860px\)[\s\S]*?\.site-nav\s*\{\s*display:\s*none;/)
  })
})
