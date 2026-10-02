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
    expect(components).toMatch(/\.lesson-shell__aside\s*\{\s*display:\s*none;/)
    expect(components).toMatch(/\.lesson-shell__mobile-trigger\s*\{\s*display:\s*block;/)
  })

  it('collapses the desktop navigation into the menu button on small screens', () => {
    expect(components).toMatch(/@media \(max-width: 860px\)[\s\S]*?\.site-nav\s*\{\s*display:\s*none;/)
  })
})

describe('lesson outline width contract — content first, navigation second', () => {
  it('keeps the outline column a small sidebar: 12–17% of the viewport', () => {
    // `clamp(min, preferred, max)` on --outline-width; the preferred value is
    // expressed in viewport units and must sit in the target band.
    const clamp = tokens.match(/--outline-width:\s*clamp\(([^)]+)\)/)?.[1] ?? ''
    const parts = clamp.split(',').map((part) => part.trim())
    expect(parts).toHaveLength(3)
    const preferred = parts[1] ?? ''
    const match = preferred.match(/^(\d+(?:\.\d+)?)vw$/)
    expect(match, `preferred width should be viewport-relative, got ${preferred}`).not.toBeNull()
    const vw = Number(match?.[1] ?? '0')
    // Tightened from 18–24vw: the outline must read as a small sidebar, not a fifth of the screen.
    expect(vw).toBeGreaterThanOrEqual(12)
    expect(vw).toBeLessThanOrEqual(17)
  })

  it('gives the lesson content column the dominant flexible width', () => {
    expect(components).toMatch(
      /\.lesson-shell__body\s*\{[^}]*grid-template-columns:\s*var\(--outline-width\)\s*minmax\(0,\s*1fr\)/s,
    )
  })
})

describe('physics vector rendering contract', () => {
  it('defines the science type token the diagram labels depend on', () => {
    // The `font` shorthand in diagram labels becomes invalid at computed-value
    // time if --font-science is missing — this was a real rendering bug.
    expect(tokens).toMatch(/--font-science:/)
  })

  it('every type token referenced by components.css is actually defined', () => {
    // Regression: `font: 700 15px var(--font-science)` and friends silently
    // dropped whole declarations when the variable did not exist in the token
    // layer. Any --font-* or --fs-* used in components must exist in tokens.
    const used = new Set(
      [...components.matchAll(/var\((--(?:font|fs)-[a-z0-9-]+)\)/g)].map((match) => match[1]!),
    )
    for (const token of used) {
      expect(tokens, `${token} is used but never defined`).toContain(`${token}:`)
    }
    expect(used.size).toBeGreaterThan(5)
  })

  it('defines semantic force-colour tokens for both themes', () => {
    for (const token of [
      '--vec-force1',
      '--vec-force2',
      '--vec-resultant',
      '--vec-weight',
      '--vec-component1',
      '--vec-component2',
      '--vec-construction',
    ]) {
      expect(tokens, `missing light token ${token}`).toContain(`${token}:`)
    }
    const dark = tokens.slice(tokens.indexOf("[data-theme='dark']"))
    for (const token of ['--vec-force1', '--vec-force2', '--vec-resultant', '--vec-weight']) {
      expect(dark, `missing dark override ${token}`).toContain(`${token}:`)
    }
  })

  it('paints vector shafts and arrowheads from tokens — never context-stroke', () => {
    // context-stroke is unsupported in WebKit: arrowheads silently turned black.
    const scientific = readProjectFile('src/scientific/ScientificDiagram.tsx')
    expect(scientific).not.toMatch(/fill="context-stroke"/)
    expect(scientific).not.toMatch(/stroke="context-fill"/)
    expect(scientificComponents).toMatch(/\.diagram-vector \.diagram-vector__shaft\s*\{[^}]*stroke:\s*currentColor/)
    expect(scientificComponents).toMatch(/\.diagram-vector \.diagram-vector__head\s*\{[^}]*fill:\s*currentColor/)
    for (const role of ['force1', 'force2', 'resultant', 'weight']) {
      expect(scientificComponents, `missing role colour ${role}`).toContain(`.diagram-vector--${role}`)
    }
  })
})
