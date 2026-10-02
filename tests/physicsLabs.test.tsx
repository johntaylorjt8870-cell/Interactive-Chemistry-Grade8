import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConcurrentForcesLab from '@/simulations/ConcurrentForcesLab'
import ParallelogramLab from '@/simulations/ParallelogramLab'
import ForceComponentsLab from '@/simulations/ForceComponentsLab'
import { InteractiveHost } from '@/components/InteractiveHost'
import { LabCanvas } from '@/simulations/physicsLabKit'
import { equilibriumResidual } from '@/utils/forces'

/* ============================================================================
   DOM-structure regression suite for the three physics laboratories.
   ----------------------------------------------------------------------------
   jsdom has no layout engine, so these tests assert what it *can* see — the
   structure the browser will paint: which stage draws what, that every arrow is
   a real shaft + head whose length follows the physics, that labels are
   direction-safe, that the maths is valid KaTeX, and that nothing depends on a
   font glyph. The visual result of the same structures was verified separately
   in a real Chromium (see docs/PHYSICS_LABS.md).
   ========================================================================= */

type Pt = { x: number; y: number }

const all = (root: ParentNode, selector: string) => [...root.querySelectorAll(selector)]
const one = (root: ParentNode, selector: string) => {
  const found = root.querySelector(selector)
  if (!found) throw new Error(`missing ${selector}`)
  return found
}

/** Origin and head tip (viewBox units) of the ORIGINAL arrow of a role (copies carry no `plab-arrow` class). */
function arrow(root: ParentNode, role: string, index = 0): { from: Pt; tip: Pt; length: number } {
  const group = all(root, `.plab-arrow[data-vector-arrow="${role}"]`)[index]
  if (!group) throw new Error(`no ${role} arrow #${index}`)
  const shaft = one(group, '.diagram-vector__shaft')
  const head = one(group, '.diagram-vector__head').getAttribute('d') ?? ''
  const match = head.match(/^M ([\d.-]+) ([\d.-]+)/)
  if (!match) throw new Error(`bad head path ${head}`)
  const from = { x: Number(shaft.getAttribute('x1')), y: Number(shaft.getAttribute('y1')) }
  const tip = { x: Number(match[1]), y: Number(match[2]) }
  return { from, tip, length: Math.hypot(tip.x - from.x, tip.y - from.y) }
}

/** Text as a reader sees it: KaTeX keeps the TeX source inside a MathML <annotation>, which is not visible. */
function readable(root: ParentNode): string {
  const clone = (root as Element).cloneNode(true) as Element
  clone.querySelectorAll('.katex-mathml').forEach((el) => el.remove())
  return clone.textContent ?? ''
}

const stageButtons = (root: ParentNode) => all(root, '.plab__stage') as HTMLButtonElement[]
const goToStage = (root: ParentNode, index: number) => fireEvent.click(stageButtons(root)[index]!)
const next = (root: ParentNode) => fireEvent.click(one(root, '.lab__actions .button--secondary'))
const setRange = (root: ParentNode, index: number, value: number) =>
  fireEvent.change(all(root, 'input[type="range"]')[index]!, { target: { value: String(value) } })
const section = (root: ParentNode) => one(root, 'section')
const numAttr = (el: Element, name: string) => Number(el.getAttribute(name))

const LABS = [
  { name: 'concurrent forces', Lab: ConcurrentForcesLab },
  { name: 'parallelogram', Lab: ParallelogramLab },
  { name: 'force components', Lab: ForceComponentsLab },
] as const

/* ---------------------------------------------------------------------------
   Lab 1 — the two-spring experiment of the book (pages 56–57)
   ------------------------------------------------------------------------ */

describe('concurrent forces lab — the book experiment, built in stages', () => {
  it('offers five stages that follow the book and opens at the carriers stage', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    expect(stageButtons(container)).toHaveLength(5)
    expect(section(container)).toHaveAttribute('data-stage', '2')
    expect(stageButtons(container)[2]).toHaveAttribute('aria-current', 'step')
    expect(stageButtons(container)[0]).toHaveAttribute('data-state', 'done')
    expect(stageButtons(container)[4]).toHaveAttribute('data-state', 'todo')
  })

  it('stage 1 hangs the body from ONE spring: tension and weight share a single vertical carrier', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    goToStage(container, 0)
    expect(all(container, '[data-spring]')).toHaveLength(1)
    expect(all(container, '[data-carrier]')).toHaveLength(1)
    const symbols = all(container, '[data-vector-label]').map((el) => el.getAttribute('data-vector-label'))
    expect(symbols).toEqual(['T', 'w'])
    const magnitudes = all(container, '.vec-svg-label__magnitude').map((el) => el.textContent)
    expect(magnitudes).toEqual(['4 N', '4 N']) // the body is at rest: tension = weight
    const tension = arrow(container, 'force1')
    const weight = arrow(container, 'weight')
    expect(tension.length).toBeCloseTo(weight.length, 1)
    // opposite directions on the same vertical line
    expect(tension.tip.x).toBeCloseTo(weight.tip.x, 6)
    expect(Math.sign(tension.tip.y - tension.from.y)).toBe(-Math.sign(weight.tip.y - weight.from.y))
  })

  it('stage 2 adds the second spring and the thread, but no carriers yet', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    goToStage(container, 1)
    expect(all(container, '[data-spring]')).toHaveLength(2)
    expect(container.querySelector('[data-carrier]')).toBeNull()
    expect(all(container, '.plab-arrow').map((el) => el.getAttribute('data-vector-arrow')).sort()).toEqual(['force1', 'force2', 'weight'])
  })

  it('stage 3 draws three carriers, one per force, through the same point O', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    const carriers = all(container, '[data-carrier]')
    expect(carriers.map((el) => el.getAttribute('data-carrier')).sort()).toEqual(['force1', 'force2', 'weight'])
    // every carrier line passes through O (the tail of the weight arrow)
    const o = arrow(container, 'weight').from
    for (const line of carriers) {
      const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((name) => numAttr(line, name)) as [number, number, number, number]
      const cross = (x2 - x1) * (o.y - y1) - (y2 - y1) * (o.x - x1)
      expect(Math.abs(cross) / Math.hypot(x2 - x1, y2 - y1)).toBeLessThan(0.05)
    }
  })

  it('stage 4 lifts the apparatus away and leaves only the lines, meeting at O', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    goToStage(container, 3)
    expect(container.querySelector('.plab-apparatus--lifted')).not.toBeNull()
    expect(container.querySelector('[data-vector-arrow]')).toBeNull()
    expect(all(container, '[data-carrier]')).toHaveLength(3)
    expect(container.querySelector('[data-meet="O"] .plab-meet__ring')).not.toBeNull()
  })

  it('stage 5 shows that the diagonal of the parallelogram on F₁, F₂ equals the force opposite to the weight', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    setRange(container, 0, 25)
    setRange(container, 1, 50)
    setRange(container, 2, 7)
    goToStage(container, 4)
    expect(container.querySelector('[data-stage-parallelogram]')).not.toBeNull()
    const f1 = arrow(container, 'force1')
    const f2 = arrow(container, 'force2')
    const w = arrow(container, 'weight')
    const diagonal = arrow(container, 'resultant')
    // M = O + F₁ + F₂ (screen coordinates)
    expect(diagonal.tip.x).toBeCloseTo(f1.tip.x + f2.tip.x - w.from.x, 0)
    expect(diagonal.tip.y).toBeCloseTo(f1.tip.y + f2.tip.y - w.from.y, 0)
    // same length as the weight, opposite direction
    expect(diagonal.length).toBeCloseTo(w.length, 0)
    expect(diagonal.tip.y - diagonal.from.y).toBeCloseTo(-(w.tip.y - w.from.y), 0)
  })

  it('draws arrows exactly proportional to the newtons (one scale for every force)', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    for (const [a1, a2, w] of [[35, 35, 4], [20, 60, 7], [60, 45, 10]] as const) {
      setRange(container, 0, a1)
      setRange(container, 1, a2)
      setRange(container, 2, w)
      const root = section(container)
      const t1 = numAttr(root, 'data-t1')
      const t2 = numAttr(root, 'data-t2')
      const px = arrow(container, 'weight').length / w
      expect(arrow(container, 'force1').length / px).toBeCloseTo(t1, 1)
      expect(arrow(container, 'force2').length / px).toBeCloseTo(t2, 1)
    }
  })

  it('keeps the three forces in equilibrium at every slider position', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    for (const [a1, a2, w] of [[20, 60, 7], [65, 15, 10], [45, 45, 1], [35, 35, 4]] as const) {
      setRange(container, 0, a1)
      setRange(container, 1, a2)
      setRange(container, 2, w)
      const root = section(container)
      const residual = equilibriumResidual(w, a1, a2, numAttr(root, 'data-t1'), numAttr(root, 'data-t2'))
      expect(Math.abs(residual.horizontal)).toBeLessThan(0.02)
      expect(Math.abs(residual.vertical)).toBeLessThan(0.02)
    }
  })

  it('moves between stages with next, previous and restart', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="x" reducedMotion={false} />)
    next(container)
    expect(section(container)).toHaveAttribute('data-stage', '3')
    fireEvent.click(within(container as HTMLElement).getByRole('button', { name: 'السابق' }))
    expect(section(container)).toHaveAttribute('data-stage', '2')
    fireEvent.click(within(container as HTMLElement).getByRole('button', { name: 'ابدأ من الخطوة الأولى' }))
    expect(section(container)).toHaveAttribute('data-stage', '0')
  })
})

/* ---------------------------------------------------------------------------
   Lab 2 — the parallelogram of the book (pages 57–59)
   ------------------------------------------------------------------------ */

describe('parallelogram lab — the three drawing stages of the book', () => {
  it('has exactly three stages, in the order the book draws them', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    const titles = stageButtons(container).map((button) => button.textContent ?? '')
    expect(titles).toHaveLength(3)
    expect(titles[0]).toContain('نمثّل القوّتين')
    expect(titles[1]).toContain('متوازي الأضلاع')
    expect(titles[2]).toContain('القطر')
  })

  it('slides each translated copy by exactly the other force vector', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    next(container)
    const f1 = arrow(container, 'force1')
    const f2 = arrow(container, 'force2')
    const slides = all(container, '[data-stage-copies] .plab-slide') as HTMLElement[]
    expect(slides).toHaveLength(2)
    const translation = (el: HTMLElement) => ({
      x: parseFloat(el.style.getPropertyValue('--tx')),
      y: parseFloat(el.style.getPropertyValue('--ty')),
    })
    // the copy of F₂ travels along F₁ and the copy of F₁ travels along F₂
    expect(translation(slides[0]!).x).toBeCloseTo(f1.tip.x - f1.from.x, 1)
    expect(translation(slides[0]!).y).toBeCloseTo(f1.tip.y - f1.from.y, 1)
    expect(translation(slides[1]!).x).toBeCloseTo(f2.tip.x - f2.from.x, 1)
    expect(translation(slides[1]!).y).toBeCloseTo(f2.tip.y - f2.from.y, 1)
  })

  it('completes the parallelogram: the diagonal ends at M = O + F₁ + F₂', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={true} />)
    const f1 = arrow(container, 'force1')
    const f2 = arrow(container, 'force2')
    const diagonal = arrow(container, 'resultant')
    expect(diagonal.tip.x).toBeCloseTo(f1.tip.x + f2.tip.x - f1.from.x, 0)
    expect(diagonal.tip.y).toBeCloseTo(f1.tip.y + f2.tip.y - f1.from.y, 0)
  })

  it('draws a ruler of exactly one grid cell (1 cm of the drawing)', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    const verticals = all(container, '.parallelogram-lab__grid line').filter((line) => line.getAttribute('x1') === line.getAttribute('x2'))
    const cell = numAttr(verticals[1]!, 'x1') - numAttr(verticals[0]!, 'x1')
    const ruler = one(container, '.parallelogram-lab__scale-ruler') as HTMLElement
    const percent = parseFloat(ruler.style.inlineSize || ruler.style.width || ruler.getAttribute('style')?.match(/([\d.]+)%/)?.[1] || 'NaN')
    // the figure is 760 user units wide, so the ruler's share of it must equal one cell
    expect((percent / 100) * 760).toBeCloseTo(cell, 1)
  })

  it('isolates every number+unit run of the scale caption as LTR', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    const runs = all(one(container, '.parallelogram-lab__scale'), 'bdi[dir="ltr"]').map((el) => el.textContent)
    // the equation of the caption, then the note that every grid cell is 1 cm
    expect(runs).toEqual(['1 cm', '1 N', '1 cm'])
  })

  it('offers both worked examples of the book as one-click presets', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={true} />)
    const examples = all(container, '.plab__example') as HTMLButtonElement[]
    expect(examples).toHaveLength(2)

    fireEvent.click(examples[0]!) // page 58: 4 N and 3 N at 60°
    expect(section(container)).toHaveAttribute('data-f1', '4')
    expect(section(container)).toHaveAttribute('data-f2', '3')
    expect(section(container)).toHaveAttribute('data-angle', '60')
    expect(section(container)).toHaveAttribute('data-resultant', '6.1')
    expect(section(container)).toHaveAttribute('data-scale', '1')

    fireEvent.click(examples[1]!) // pages 58–59: 60 N and 80 N, perpendicular
    expect(section(container)).toHaveAttribute('data-resultant', '100.0')
    expect(section(container)).toHaveAttribute('data-scale', '20')
    // the drawing of the book: 3 cm, 4 cm and a 5 cm diagonal
    const lengths = all(container, '.plab__readout dd').map((el) => el.textContent ?? '')
    expect(lengths.join('|')).toContain('3cm')
    expect(lengths.join('|')).toContain('4cm')
    expect(lengths.join('|')).toContain('5cm')
    expect(one(container, '.plab-dimension').textContent).toContain('OM = 5 cm')
  })

  it('marks the four right angles of the rectangle at 90°', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={true} />)
    setRange(container, 2, 90)
    expect(all(container, '[data-right-angle]')).toHaveLength(4)
  })

  it('verifies Pythagoras with real KaTeX (a root) at 90° and only then', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={true} />)
    expect(container.querySelector('[data-pythagoras]')).toBeNull()
    setRange(container, 2, 90)
    const box = one(container, '[data-pythagoras]')
    expect(box.querySelector('.katex .sqrt')).not.toBeNull()
    expect(readable(box)).not.toMatch(/\\sqrt|\\frac/)
  })

  it('plots a resultant that never increases with the angle, with the marker on the curve', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    const points = (one(container, '.plab-plot__curve').getAttribute('points') ?? '').split(' ').map((p) => p.split(',').map(Number) as [number, number])
    for (let i = 1; i < points.length; i += 1) expect(points[i]![1]).toBeGreaterThanOrEqual(points[i - 1]![1] - 1e-6) // screen y grows as F falls
    const marker = one(container, '.plab-plot__marker')
    const cx = numAttr(marker, 'cx')
    const cy = numAttr(marker, 'cy')
    const nearest = points.reduce((best, p) => (Math.abs(p[0] - cx) < Math.abs(best[0] - cx) ? p : best))
    expect(Math.abs(nearest[1] - cy)).toBeLessThan(2)
  })

  it('replaces F₁ + F₂ and |F₁ − F₂| by the right words at the two extreme angles', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={true} />)
    setRange(container, 2, 0)
    expect(one(container, '.parallelogram-lab__angle-case').textContent).toContain('الاتجاه نفسه')
    setRange(container, 2, 180)
    expect(one(container, '.parallelogram-lab__angle-case').textContent).toContain('اتجاهين متعاكسين')
  })
})

/* ---------------------------------------------------------------------------
   Lab 3 — resolving a force (pages 59–61)
   ------------------------------------------------------------------------ */

describe('force components lab — the six steps of page 60', () => {
  const rolesAt = (container: ParentNode) => all(container, '.plab-arrow').map((el) => el.getAttribute('data-vector-arrow'))

  it('reveals the construction in the order of the book', () => {
    const { container } = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    expect(stageButtons(container)).toHaveLength(6)

    goToStage(container, 0) // 1. a point O on the board
    expect(rolesAt(container)).toEqual([])
    expect(container.querySelector('[data-meet="O"]')).not.toBeNull()

    goToStage(container, 1) // 2. the ray OM that stands for F
    expect(rolesAt(container)).toEqual(['resultant'])

    goToStage(container, 2) // 3. the perpendicular axes OX and OY
    expect(container.querySelector('[data-stage-axes]')).not.toBeNull()
    expect(container.querySelector('[data-stage-projections]')).toBeNull()

    goToStage(container, 3) // 4. the two perpendiculars from M («مرسم النقطة»)
    expect(container.querySelector('[data-stage-projections]')).not.toBeNull()
    expect(all(container, '[data-right-angle]').length).toBeGreaterThanOrEqual(3)
    expect(container.querySelector('[data-rect]')).toBeNull()

    goToStage(container, 4) // 5. a rectangle whose diagonal is F
    expect(container.querySelector('[data-rect="true"]')).not.toBeNull()
    expect(rolesAt(container)).toEqual(['resultant'])

    goToStage(container, 5) // 6. the distances on the axes are the components
    expect(rolesAt(container).sort()).toEqual(['component1', 'component2', 'resultant'])
  })

  it('makes the components the projections of M on the two axes', () => {
    const { container } = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    setRange(container, 0, 8)
    setRange(container, 1, 55)
    const force = arrow(container, 'resultant')
    const f1 = arrow(container, 'component1')
    const f2 = arrow(container, 'component2')
    expect(f1.tip.x).toBeCloseTo(force.tip.x, 0)
    expect(f1.tip.y).toBeCloseTo(force.from.y, 0)
    expect(f2.tip.x).toBeCloseTo(force.from.x, 0)
    expect(f2.tip.y).toBeCloseTo(force.tip.y, 0)
    expect(Math.hypot(f1.length, f2.length)).toBeCloseTo(force.length, 0)
  })

  it('shows the same numbers in the readouts, the data attributes and the Pythagoras check', () => {
    const { container } = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    const root = section(container)
    const fx = numAttr(root, 'data-fx')
    const fy = numAttr(root, 'data-fy')
    expect(Math.hypot(fx, fy)).toBeCloseTo(6, 1) // the attributes carry two decimals
    const check = one(container, '[data-pythagoras-check]')
    expect(check.querySelector('.katex .sqrt')).not.toBeNull()
    expect(check.textContent).toContain(fx.toFixed(2))
    expect(check.textContent).toContain(fy.toFixed(2))
  })

  it('smooth incline: R balances F₂ and w is the diagonal of the rectangle on F₁, F₂', () => {
    const { container } = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: /المستوي المائل/ }))
    expect(rolesAt(container).sort()).toEqual(['component1', 'component2', 'reaction', 'weight'])
    const w = arrow(container, 'weight')
    const r = arrow(container, 'reaction')
    const f1 = arrow(container, 'component1')
    const f2 = arrow(container, 'component2')
    const c = w.from
    // R and F₂ have the same length and opposite directions
    expect(r.length).toBeCloseTo(f2.length, 0)
    expect(r.tip.x - c.x).toBeCloseTo(-(f2.tip.x - c.x), 0)
    expect(r.tip.y - c.y).toBeCloseTo(-(f2.tip.y - c.y), 0)
    // parallelogram law: w = F₁ + F₂
    expect(w.tip.x - c.x).toBeCloseTo(f1.tip.x - c.x + (f2.tip.x - c.x), 0)
    expect(w.tip.y - c.y).toBeCloseTo(f1.tip.y - c.y + (f2.tip.y - c.y), 0)
    // F₁ is along the plane, F₂ perpendicular to it
    const dot = (f1.tip.x - c.x) * (f2.tip.x - c.x) + (f1.tip.y - c.y) * (f2.tip.y - c.y)
    expect(Math.abs(dot) / (f1.length * f2.length)).toBeLessThan(1e-3)
  })

  it('labels the printed angle a at the foot of the plane and between w and F₂', () => {
    const { container } = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    fireEvent.click(screen.getByRole('button', { name: /المستوي المائل/ }))
    const labels = all(container, 'text.svg-text--angle').map((el) => el.textContent)
    expect(labels).toEqual(['a', 'a'])
    expect(all(container, '[data-angle-mark]')).toHaveLength(2)
    expect(all(container, '[data-right-angle]')).toHaveLength(1)
  })

  it('releases the body: steeper planes slide faster, and reduced motion shows the end state', () => {
    const animated = render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    fireEvent.click(within(animated.container as HTMLElement).getByRole('button', { name: /المستوي المائل/ }))
    expect(animated.container.querySelector('[data-released]')).toBeNull()
    const duration = () => parseFloat((one(animated.container, '[data-released]') as HTMLElement).style.getPropertyValue('--dur'))
    setRange(animated.container, 0, 15)
    fireEvent.click(one(animated.container, '.plab__release'))
    const slow = duration()
    expect(one(animated.container, '[data-released]')).toHaveClass('plab-ghost--slide')
    setRange(animated.container, 0, 60) // moving the plane resets the release…
    expect(animated.container.querySelector('[data-released]')).toBeNull()
    fireEvent.click(one(animated.container, '.plab__release')) // …release again on the steep plane
    expect(duration()).toBeLessThan(slow)
    animated.unmount()

    const still = render(<ForceComponentsLab interactiveId="x" reducedMotion={true} />)
    fireEvent.click(within(still.container as HTMLElement).getByRole('button', { name: /المستوي المائل/ }))
    fireEvent.click(one(still.container, '.plab__release'))
    expect(one(still.container, '[data-released]')).toHaveClass('plab-ghost--end')
    expect(one(still.container, '[data-released]')).not.toHaveClass('plab-ghost--slide')
  })

  it('exposes the two modes as toggle buttons, and only one names the incline', () => {
    render(<ForceComponentsLab interactiveId="x" reducedMotion={false} />)
    expect(screen.getAllByRole('button', { name: /المستوي المائل/ })).toHaveLength(1)
    const [axes, incline] = within(screen.getByRole('group', { name: 'اختر وضع العرض' })).getAllByRole('button')
    expect(axes).toHaveAttribute('aria-pressed', 'true')
    expect(incline).toHaveAttribute('aria-pressed', 'false')
  })
})

/* ---------------------------------------------------------------------------
   All labs — notation, direction, glyphs, attribution
   ------------------------------------------------------------------------ */

function visibleLabText(root: ParentNode): string {
  const clone = (root as Element).cloneNode(true) as Element
  clone.querySelectorAll('.katex, [data-vector], .math-formula').forEach((el) => el.remove())
  return clone.textContent ?? ''
}

function walkEveryState(Lab: (typeof LABS)[number]['Lab'], visit: (container: HTMLElement, label: string) => void) {
  const { container } = render(<Lab interactiveId="x" reducedMotion={false} />)
  const count = stageButtons(container).length
  for (let stage = 0; stage < count; stage += 1) {
    goToStage(container, stage)
    visit(container, `stage ${stage + 1}`)
  }
  if (Lab === ForceComponentsLab) {
    fireEvent.click(screen.getByRole('button', { name: /المستوي المائل/ }))
    const incline = stageButtons(container).length
    for (let stage = 0; stage < incline; stage += 1) {
      goToStage(container, stage)
      visit(container, `incline stage ${stage + 1}`)
    }
  }
}

describe.each(LABS)('$name lab — notation and direction safety', ({ Lab }) => {
  it('is marked as a platform addition', () => {
    const { container } = render(<Lab interactiveId="x" reducedMotion={false} />)
    const badge = one(container, '[data-origin="platform"]')
    expect(badge.textContent).toContain('إضافة من المنصة')
  })

  it('renders only valid KaTeX at every stage and never shows raw TeX', () => {
    walkEveryState(Lab, (container, label) => {
      expect(container.querySelector('.math-formula--invalid'), label).toBeNull()
      expect(container.querySelector('.katex-error'), label).toBeNull()
      expect(readable(container), label).not.toMatch(/\\[a-zA-Z]|\$\$|\\\\/)
    })
  })

  it('depends on no symbol font: no check marks, arrows or combining arrows outside KaTeX', () => {
    walkEveryState(Lab, (container, label) => {
      expect(visibleLabText(container), label).not.toMatch(/[✓✔←→⇒▯\u20D7]/u)
    })
  })

  it('uses direction-explicit SVG text everywhere', () => {
    walkEveryState(Lab, (container, label) => {
      for (const text of all(container, 'svg text')) {
        expect(text.getAttribute('direction'), `${label}: <text> without direction`).toMatch(/^(ltr|rtl)$/)
      }
      for (const text of all(container, 'svg text.svg-text--latin, svg [data-vector-label] text')) {
        expect(text.getAttribute('direction'), label).toBe('ltr')
      }
      for (const text of all(container, 'svg text.svg-text--ar')) {
        expect(text.getAttribute('direction'), label).toBe('rtl')
      }
    })
  })

  it('anchors the symbol of every vector label at its left edge, with the arrow drawn above it', () => {
    walkEveryState(Lab, (container, label) => {
      for (const group of all(container, '[data-vector-label]')) {
        const symbol = one(group, '.vec-svg-label__symbol')
        expect(symbol.getAttribute('text-anchor'), label).toBe('start')
        const accent = one(group, '.vec-svg-label__accent line')
        // y grows downwards: the accent must sit above the baseline (y = 0 of the label)
        expect(numAttr(accent, 'y1'), label).toBeLessThan(0)
        expect(numAttr(accent, 'y1'), label).toBe(numAttr(accent, 'y2'))
        expect(one(group, '.vec-svg-label__accent path').getAttribute('d'), label).toMatch(/^M /)
        expect(group.getAttribute('data-has-arrow')).toBe('true')
      }
    })
  })

  it('gives every force arrow a real shaft, a filled head and a role colour class', () => {
    walkEveryState(Lab, (container, label) => {
      for (const group of all(container, '[data-vector-arrow]')) {
        const role = group.getAttribute('data-vector-arrow')
        expect(group.getAttribute('class'), label).toContain(`diagram-vector--${role}`)
        expect(group.querySelector('.diagram-vector__shaft'), label).not.toBeNull()
        expect(group.querySelector('.diagram-vector__head')?.getAttribute('d'), label).toMatch(/^M /)
        expect(group.querySelector('marker, [marker-end], [marker-start]'), 'arrowheads must not depend on SVG markers').toBeNull()
      }
    })
  })

  it('uses unique, role-specific colours for F₁ and F₂ (never colour alone: each has a label)', () => {
    const { container } = render(<Lab interactiveId="x" reducedMotion={false} />)
    const roles = new Set(all(container, '[data-vector-arrow]').map((el) => el.getAttribute('data-vector-arrow')))
    expect(roles.size).toBeGreaterThanOrEqual(2)
    expect(all(container, '.plab__legend li').length).toBeGreaterThanOrEqual(3)
    for (const item of all(container, '.plab__legend li')) {
      expect(item.querySelector('svg .plab__legend-head')).not.toBeNull()
      expect(item.querySelector('[data-vector]')).not.toBeNull()
    }
  })
})

/* ---------------------------------------------------------------------------
   The lab survives a re-render of whatever contains it
   ------------------------------------------------------------------------ */

describe('InteractiveHost — the experiment keeps its state when the page re-renders', () => {
  function Page() {
    const [count, setCount] = useState(0)
    return (
      <div>
        <button type="button" onClick={() => setCount(count + 1)}>
          أعد رسم الصفحة {count}
        </button>
        <InteractiveHost interactiveId="concurrent-forces-lab" />
      </div>
    )
  }

  it('does not remount the lazy module on a parent update (sliders and stage survive)', async () => {
    const user = userEvent.setup()
    const { container } = render(<Page />)
    await screen.findByRole('checkbox') // the lazy lab has loaded
    setRange(container, 0, 60)
    goToStage(container, 3)
    expect(section(container)).toHaveAttribute('data-a1', '60')

    await user.click(screen.getByRole('button', { name: /أعد رسم الصفحة/ }))
    await user.click(screen.getByRole('button', { name: /أعد رسم الصفحة/ }))

    expect(section(container)).toHaveAttribute('data-a1', '60')
    expect(section(container)).toHaveAttribute('data-stage', '3')
  })
})

/* ---------------------------------------------------------------------------
   The drawing keeps a readable size and stays reachable on a phone
   ------------------------------------------------------------------------ */

describe('LabCanvas — scrolls instead of shrinking the labels, and is reachable', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    // remove the layout stubs installed by withOverflow()
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollWidth
    delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientWidth
  })

  /** jsdom has no layout: stub the two measurements the component reads. */
  function withOverflow(scrollWidth: number, clientWidth: number) {
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => scrollWidth })
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => clientWidth })
  }

  it.each(LABS)('puts the $name drawing inside scroller > canvas', ({ Lab }) => {
    const { container } = render(<Lab interactiveId="x" reducedMotion={false} />)
    const svg = one(container, '.plab__canvas > svg')
    expect(svg.closest('.plab__scroller')).not.toBeNull()
    expect(one(container, '.plab__scroll-hint').textContent).toContain('مرّر الرسم')
  })

  it('keeps the 1 cm ruler inside the canvas (it follows the drawing) and the caption outside the scroller (always readable)', () => {
    const { container } = render(<ParallelogramLab interactiveId="x" reducedMotion={false} />)
    const canvas = one(container, '.plab__canvas')
    expect(canvas.contains(one(container, '.parallelogram-lab__scale-ruler'))).toBe(true)
    const caption = one(container, '.parallelogram-lab__scale-caption')
    expect(canvas.contains(caption)).toBe(false)
    expect(caption.closest('.plab__scroller')).toBeNull()
    // the legend is one box: ruler and caption share the wrapper the stylesheet and the tests call "scale"
    expect(one(container, '.parallelogram-lab__scale').contains(caption)).toBe(true)
  })

  it('adds no tab stop when nothing overflows (desktop)', () => {
    withOverflow(816, 816)
    const { container } = render(<LabCanvas><svg /></LabCanvas>)
    const scroller = one(container, '.plab__scroller')
    expect(scroller).not.toHaveAttribute('tabindex')
    expect(scroller).not.toHaveAttribute('role')
    expect(scroller).not.toHaveAttribute('data-scrollable')
  })

  it('becomes a focusable, named region and centres on its focus when it overflows (LTR)', () => {
    withOverflow(560, 290)
    const { container } = render(<LabCanvas focus={0.3}><svg /></LabCanvas>)
    const scroller = one(container, '.plab__scroller') as HTMLElement
    expect(scroller).toHaveAttribute('data-scrollable', 'true')
    expect(scroller).toHaveAttribute('tabindex', '0')
    expect(scroller).toHaveAttribute('role', 'group')
    expect(scroller.getAttribute('aria-label')).toContain('أفقياً')
    // window of 290 centred on 30% of 560 = 168 → left edge 23
    expect(scroller.scrollLeft).toBe(23)
  })

  it('never scrolls past either end', () => {
    withOverflow(560, 290)
    const left = render(<LabCanvas focus={0}><svg /></LabCanvas>)
    expect((one(left.container, '.plab__scroller') as HTMLElement).scrollLeft).toBe(0)
    left.unmount()
    const right = render(<LabCanvas focus={1}><svg /></LabCanvas>)
    expect((one(right.container, '.plab__scroller') as HTMLElement).scrollLeft).toBe(270)
  })

  it('counts scrollLeft from the right edge in an RTL page (0 down to a negative number)', () => {
    withOverflow(560, 290)
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ direction: 'rtl' }) as unknown as CSSStyleDeclaration)
    const { container } = render(<LabCanvas focus={0.3}><svg /></LabCanvas>)
    // the same window as in LTR (left edge 23 of 270), expressed the RTL way
    expect((one(container, '.plab__scroller') as HTMLElement).scrollLeft).toBe(23 - 270)
  })
})
