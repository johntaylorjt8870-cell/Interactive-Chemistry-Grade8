import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import ConcurrentForcesLab from '@/simulations/ConcurrentForcesLab'
import ForceComponentsLab from '@/simulations/ForceComponentsLab'
import ParallelogramLab from '@/simulations/ParallelogramLab'
import { readProjectFile } from './utils/projectFiles'

/**
 * Vector-force label regression tests (Physics Lesson 1 labs).
 *
 * The labs are SVG drawn inside an Arabic RTL document. A Latin label such as
 * `F₁` must therefore be isolated locally — never by turning the page or the
 * SVG to LTR — and must be *positioned* so it cannot depend on the resolved
 * bidi base direction:
 *
 * 1. `text-anchor` must be explicit and symmetric (`middle`). With the SVG
 *    default (`start`) the anchor side is resolved from the base direction, so
 *    the same coordinate renders on opposite sides of the vector in LTR and
 *    RTL — which is how a label ends up beside/around the shaft instead of
 *    above its arrowhead.
 * 2. The label must sit clear of its arrowhead: above the tip for a vector
 *    pointing up, below it for a vector pointing down. Never on the shaft.
 * 3. The label typography must come from a *defined* token. `--font-science`
 *    was referenced but never declared, so the `font` shorthand was invalid at
 *    computed-value time and every font longhand fell back to inheritance —
 *    the labels silently rendered in the Arabic body font.
 *
 * jsdom has no layout engine, so these tests assert the geometry and the
 * stylesheet contract, exactly like the neighbouring design-system tests.
 */

type Point2D = { x: number; y: number }

const LABS = [
  ['ConcurrentForcesLab', ConcurrentForcesLab],
  ['ParallelogramLab', ParallelogramLab],
  ['ForceComponentsLab', ForceComponentsLab],
] as const

const components = readProjectFile('src/styles/components.css')
const tokens = readProjectFile('src/styles/tokens.css')
const indexHtml = readProjectFile('index.html')

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

/** The scientific label rule that paints every vector label in the labs. */
const labelRule = declarations(components, '.vec-lab__label')

function renderLab(Component: (typeof LABS)[number][1]) {
  return render(<Component interactiveId="lab" reducedMotion />)
}

describe('vector label isolation', () => {
  it('keeps the scientific label font on a token that is actually declared', () => {
    // `--font-science` was referenced by the label rules and never defined
    // anywhere, which made `font: … var(--font-science)` invalid at
    // computed-value time and dropped the whole font shorthand.
    const everyCustomProperty = [
      readProjectFile('src/styles/tokens.css'),
      readProjectFile('src/styles/base.css'),
      components,
      readProjectFile('src/styles/scientific.css'),
      readProjectFile('src/styles/scientific-components.css'),
    ].join('\n')

    const labelSurface = [
      declarations(components, '.vec-lab__label'),
      declarations(components, '.lab__measurements span'),
      declarations(components, '.lab__measurements strong'),
    ]

    for (const rule of labelSurface) {
      for (const value of Object.values(rule)) {
        for (const match of value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
          expect(everyCustomProperty, `${match[1]} must be declared`).toContain(`${match[1]}:`)
        }
      }
    }
    expect(JSON.stringify(labelSurface)).not.toContain('--font-science')
    expect(labelRule['font-family']).toBe('var(--font-latin)')
  })

  it('isolates the label locally without touching document direction', () => {
    expect(labelRule['direction']).toBe('ltr')
    expect(labelRule['unicode-bidi']).toBe('isolate')

    // The document stays Arabic RTL; nothing global may be flipped to LTR.
    expect(indexHtml).toContain('dir="rtl"')
    expect(indexHtml).not.toContain('dir="ltr"')
    expect(components).not.toMatch(/\.vec-lab\s*\{[^}]*direction:\s*ltr/s)
    expect(components).not.toMatch(/\.lab\s*\{[^}]*direction:\s*ltr/s)
  })

  it('never uses a font shorthand that a single missing token can invalidate', () => {
    // A shorthand with var() is all-or-nothing: one undefined custom property
    // silently drops family, size, weight and style together.
    expect(labelRule['font']).toBeUndefined()
    expect(labelRule['font-size']).toBeDefined()
    expect(labelRule['font-style']).toBeDefined()
    expect(labelRule['font-weight']).toBeDefined()
  })

  it('keeps the label tokens declared in the token layer', () => {
    expect(tokens).toContain('--font-latin:')
  })
})

describe.each(LABS)('%s vector labels', (_name, Component) => {
  it('anchors every label explicitly so position never depends on bidi resolution', () => {
    const { container } = renderLab(Component)
    const labels = [...container.querySelectorAll('text.vec-lab__label')]

    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      expect(label.getAttribute('text-anchor'), `${label.textContent} needs an explicit anchor`).toBe('middle')
    }
  })

  it('draws every vector label clear of its shaft, on the reading side of it', () => {
    const { container } = renderLab(Component)

    const labelledLabels = [...container.querySelectorAll('text[data-label-for]')]
    expect(labelledLabels.length).toBeGreaterThan(0)

    /** Distance from a point to the vector segment it labels. */
    function distanceToShaft(point: Point2D, from: Point2D, to: Point2D): number {
      const vx = to.x - from.x
      const vy = to.y - from.y
      const lengthSq = vx * vx + vy * vy || 1
      const t = Math.min(Math.max(((point.x - from.x) * vx + (point.y - from.y) * vy) / lengthSq, 0), 1)
      return Math.hypot(point.x - (from.x + t * vx), point.y - (from.y + t * vy))
    }

    for (const label of labelledLabels) {
      const vectorId = label.getAttribute('data-label-for')!
      const vector = container.querySelector(`[data-vector="${vectorId}"]`)
      if (!vector) continue

      const origin = { x: Number(vector.getAttribute('x1')), y: Number(vector.getAttribute('y1')) }
      const tip = { x: Number(vector.getAttribute('x2')), y: Number(vector.getAttribute('y2')) }
      const point = { x: Number(label.getAttribute('x')), y: Number(label.getAttribute('y')) }

      // Never sitting on the shaft or inside the arrowhead.
      expect(
        distanceToShaft(point, origin, tip),
        `${vectorId} label must stay clear of its shaft`,
      ).toBeGreaterThanOrEqual(8)

      // Explicitly placed labels (the on-axis component of the components lab)
      // opt out of the automatic side; everything else must sit on the
      // counter-clockwise normal of its shaft. That side is derived from the
      // drawing coordinates alone, so it cannot flip with the page direction.
      if (!label.getAttribute('data-label-placement')) {
        const cross =
          (tip.x - origin.x) * (point.y - origin.y) - (tip.y - origin.y) * (point.x - origin.x)
        expect(cross, `${vectorId} label must sit on the reading side of its shaft`).toBeLessThan(0)
      }

      // A vector pointing up and to the right gets its label above the tip
      // (the midpoint-anchored resultant is checked against its midpoint instead).
      const anchorsAtMidpoint = label.getAttribute('data-label-anchor') === 'midpoint'
      if (tip.y < origin.y && tip.x > origin.x && !label.getAttribute('data-label-placement') && !anchorsAtMidpoint) {
        expect(point.y, `${vectorId} label must sit above its tip`).toBeLessThan(tip.y)
      }

      // The parallelogram resultant annotates the midpoint of its shaft.
      if (anchorsAtMidpoint) {
        const mid = { x: (origin.x + tip.x) / 2, y: (origin.y + tip.y) / 2 }
        expect(point.y, `${vectorId} label must sit above the midpoint it annotates`).toBeLessThan(mid.y)
      }
    }
  })

  it('keeps neighbouring vector labels apart in the state the lab opens on', () => {
    const { container } = renderLab(Component)

    const points = [...container.querySelectorAll('text[data-label-for]')].map((label) => ({
      id: label.getAttribute('data-label-for')!,
      x: Number(label.getAttribute('x')),
      y: Number(label.getAttribute('y')),
    }))

    expect(points.length).toBeGreaterThan(1)
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const distance = Math.hypot(points[i]!.x - points[j]!.x, points[i]!.y - points[j]!.y)
        expect(
          distance,
          `${points[i]!.id} and ${points[j]!.id} labels must not overlap`,
        ).toBeGreaterThanOrEqual(14)
      }
    }
  })

  it('keeps every label inside the drawing surface at every slider extreme', () => {
    const { container } = renderLab(Component)
    const svg = container.querySelector('svg')!
    const [, , width, height] = (svg.getAttribute('viewBox') ?? '0 0 480 300').split(/\s+/).map(Number)

    const assertInside = (state: string) => {
      for (const label of container.querySelectorAll('text')) {
        const x = Number(label.getAttribute('x'))
        const y = Number(label.getAttribute('y'))
        expect(x, `${label.textContent} x in ${state}`).toBeGreaterThanOrEqual(0)
        expect(y, `${label.textContent} y in ${state}`).toBeGreaterThanOrEqual(0)
        expect(x, `${label.textContent} x in ${state}`).toBeLessThan(width!)
        expect(y, `${label.textContent} y in ${state}`).toBeLessThan(height!)
      }
    }

    const sliders = [...container.querySelectorAll('input[type="range"]')] as HTMLInputElement[]
    assertInside('the opening state')
    for (const edge of ['min', 'max'] as const) {
      for (const slider of sliders) {
        fireEvent.change(slider, { target: { value: slider[edge] } })
      }
      assertInside(`the ${edge} state`)
    }
  })

  it('leaves the surrounding Arabic content RTL', () => {
    const { container } = renderLab(Component)
    const section = container.querySelector('section')!

    // Only the scientific label leaves the Arabic flow; the lab itself does not.
    expect(section.getAttribute('dir')).toBeNull()
    expect(section.textContent).toMatch(/[\u0600-\u06FF]/)
    const isolated = container.querySelectorAll('[dir="ltr"]')
    for (const node of isolated) {
      // Anything forced LTR must be a scientific value, never Arabic prose.
      expect(node.textContent ?? '').not.toMatch(/[\u0600-\u06FF]{3,}/)
    }
  })
})

describe('vector label motion contract', () => {
  it('keeps the Fix 11 animation roles on the relocated labels', () => {
    for (const [, Component] of LABS) {
      const { container, unmount } = renderLab(Component)
      const animated = container.querySelectorAll('text[data-anim-role]')
      expect(animated.length).toBeGreaterThan(0)
      for (const label of animated) {
        expect(['vector-label', 'resultant-label']).toContain(label.getAttribute('data-anim-role'))
      }
      unmount()
    }
  })

  it('keeps labels still when reduced motion is requested', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="lab" reducedMotion />)
    const label = container.querySelector('text[data-label-for="F1"]')!
    const style = label.getAttribute('style') ?? ''
    expect(style).toContain('--point-dx: 0px')
    expect(style).toContain('--point-dy: 0px')
  })
})
