import { describe, expect, it } from 'vitest'
import {
  axesLayout,
  concurrentLayout,
  inclineLayout,
  parallelogramLayout,
  PX_PER_CM,
} from '../src/simulations/diagramLayouts'
import type { PlacedTextLabel, PlacedVectorLabel, Segment } from '../src/simulations/diagramLayouts'
import {
  arcPath,
  boxesOverlap,
  inflateBox,
  placeBox,
  rayExit,
  segmentHitsBox,
} from '../src/utils/labelPlacement'
import type { Pt } from '../src/utils/labelPlacement'
import { estimateTextWidth, vectorLabelBox, vectorLabelLayout } from '../src/utils/vectorLabelMetrics'
import type { Box } from '../src/utils/vectorLabelMetrics'

/* ----------------------------------------------------------------------------
   These tests protect what jsdom cannot see in a browser: labels sitting on
   arrows, accents drifting off their letters, springs not following their
   forces, arcs bulging the wrong way, drawings leaving the viewBox. Everything
   is checked on the same pure geometry the components render.
   ------------------------------------------------------------------------- */

const labelsOf = (labels: Record<string, PlacedVectorLabel | PlacedTextLabel>) => Object.entries(labels)

function expectNoCollisions(
  name: string,
  labels: Record<string, PlacedVectorLabel | PlacedTextLabel>,
  arrows: Segment[],
  bounds: Box,
) {
  const entries = labelsOf(labels)
  for (const [key, label] of entries) {
    // `clear` is the solver's own verdict that nothing (arrow, spring, carrier, arc, label) touches it
    expect(label.clear, `${name}: ${key} had to be squeezed`).toBe(true)
    expect(label.box.left, `${name}: ${key} left edge`).toBeGreaterThanOrEqual(bounds.left - 0.01)
    expect(label.box.right, `${name}: ${key} right edge`).toBeLessThanOrEqual(bounds.right + 0.01)
    expect(label.box.top, `${name}: ${key} top edge`).toBeGreaterThanOrEqual(bounds.top - 0.01)
    expect(label.box.bottom, `${name}: ${key} bottom edge`).toBeLessThanOrEqual(bounds.bottom + 0.01)
    for (const arrow of arrows) {
      expect(segmentHitsBox(arrow.a, arrow.b, label.box, 2), `${name}: ${key} sits on an arrow`).toBe(false)
    }
  }
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      const [ka, a] = entries[i]!
      const [kb, b] = entries[j]!
      expect(boxesOverlap(a.box, b.box), `${name}: labels ${ka} and ${kb} overlap`).toBe(false)
    }
  }
}

describe('vector label metrics (SVG labels, RTL-safe)', () => {
  it('centres the accent over the symbol and lifts it above the glyph', () => {
    for (const symbol of ['F', 'w', 'M', 'OM']) {
      const layout = vectorLabelLayout({ symbol, anchor: 'middle' })
      const accentCentre = (layout.accent.x1 + layout.accent.x2) / 2
      // italic letters lean right, so the arrow is nudged by a small skew only
      expect(Math.abs(accentCentre - layout.cx), `${symbol}: accent drifted off the letter`).toBeLessThan(layout.size * 0.12)
      expect(layout.accent.x2 - layout.accent.x1).toBeGreaterThanOrEqual(layout.symbolWidth * 0.95)
      expect(layout.accent.y, `${symbol}: accent must sit above the baseline`).toBeLessThan(-layout.size * 0.4)
    }
    // capitals are taller than lowercase, so the arrow rides higher over F than over w
    expect(Math.abs(vectorLabelLayout({ symbol: 'F' }).accent.y)).toBeGreaterThan(Math.abs(vectorLabelLayout({ symbol: 'w' }).accent.y))
  })

  it('spans both letters of a two-letter vector such as OM', () => {
    const one = vectorLabelLayout({ symbol: 'O' })
    const two = vectorLabelLayout({ symbol: 'OM' })
    expect(two.symbolWidth).toBeGreaterThan(one.symbolWidth * 1.8)
    expect(two.accent.x2 - two.accent.x1).toBeGreaterThan((one.accent.x2 - one.accent.x1) * 1.8)
  })

  it('reads physical left/right: start grows rightwards, end grows leftwards', () => {
    const start = vectorLabelLayout({ symbol: 'F', subscript: '1', magnitude: '4 N', anchor: 'start' })
    const end = vectorLabelLayout({ symbol: 'F', subscript: '1', magnitude: '4 N', anchor: 'end' })
    const middle = vectorLabelLayout({ symbol: 'F', subscript: '1', magnitude: '4 N', anchor: 'middle' })
    expect(start.box.left).toBeLessThan(0.5)
    expect(start.box.right).toBeGreaterThan(10)
    expect(end.box.right).toBeGreaterThan(-0.5)
    expect(end.box.left).toBeLessThan(-10)
    expect(Math.abs(middle.box.left + middle.box.right)).toBeLessThan(1)
    // the symbol keeps its accent whichever way the block is aligned
    for (const layout of [start, end, middle]) {
      expect(Math.abs((layout.accent.x1 + layout.accent.x2) / 2 - layout.cx)).toBeLessThan(layout.size * 0.12)
    }
  })

  it('puts the subscript right of the symbol and the magnitude on its own line below', () => {
    const layout = vectorLabelLayout({ symbol: 'F', subscript: '1', magnitude: '2.4 N', anchor: 'middle' })
    expect(layout.sub!.x).toBeGreaterThan(layout.cx)
    expect(layout.sub!.y).toBeGreaterThan(0)
    expect(layout.magnitude!.y).toBeGreaterThan(layout.sub!.y)
    expect(layout.magnitude!.x).toBe(0)
    expect(layout.box.bottom).toBeGreaterThan(layout.magnitude!.y)
  })

  it('scales linearly with the font size', () => {
    const small = vectorLabelLayout({ symbol: 'F', subscript: '2', magnitude: '9 N', size: 16, anchor: 'middle' })
    const big = vectorLabelLayout({ symbol: 'F', subscript: '2', magnitude: '9 N', size: 32, anchor: 'middle' })
    expect(big.symbolWidth).toBeCloseTo(small.symbolWidth * 2, 5)
    expect(big.accent.y).toBeCloseTo(small.accent.y * 2, 5)
    expect(big.box.right - big.box.left).toBeCloseTo((small.box.right - small.box.left) * 2, 3)
  })

  it('reserves room for an Arabic caption on the right (reads first in RTL)', () => {
    const plain = vectorLabelLayout({ symbol: 'F', subscript: '1', size: 13, anchor: 'middle' })
    const captioned = vectorLabelLayout({ symbol: 'F', subscript: '1', prefix: 'نسخة', size: 13, anchor: 'middle' })
    expect(captioned.prefix!.x).toBeGreaterThan(captioned.cx)
    expect(captioned.box.right - captioned.box.left).toBeGreaterThan(plain.box.right - plain.box.left + 15)
    expect(estimateTextWidth('2.4 N', 12)).toBeGreaterThan(estimateTextWidth('4 N', 12))
  })
})

describe('label placement primitives', () => {
  it('detects a segment crossing a padded box (Liang–Barsky)', () => {
    const box: Box = { left: 10, top: 10, right: 20, bottom: 20 }
    expect(segmentHitsBox({ x: 0, y: 15 }, { x: 30, y: 15 }, box)).toBe(true)
    expect(segmentHitsBox({ x: 0, y: 0 }, { x: 30, y: 0 }, box)).toBe(false)
    expect(segmentHitsBox({ x: 0, y: 5 }, { x: 30, y: 5 }, box, 6)).toBe(true) // within the pad
    expect(segmentHitsBox({ x: 25, y: 0 }, { x: 25, y: 30 }, box)).toBe(false)
    expect(segmentHitsBox({ x: 15, y: 15 }, { x: 16, y: 16 }, box)).toBe(true) // fully inside
  })

  it('finds the exit distance of a ray from a rectangle', () => {
    const rect: Box = { left: 0, top: 0, right: 100, bottom: 100 }
    expect(rayExit({ x: 50, y: 50 }, { x: 0, y: -1 }, rect)).toBeCloseTo(50)
    expect(rayExit({ x: 50, y: 50 }, { x: 1, y: 0 }, rect)).toBeCloseTo(50)
    expect(rayExit({ x: 50, y: 50 }, { x: Math.SQRT1_2, y: Math.SQRT1_2 }, rect)).toBeCloseTo(50 * Math.SQRT2)
  })

  it('draws the arc AROUND its centre, whichever way the angle opens', () => {
    // Regression: the concurrent lab drew both angle arcs with the wrong SVG sweep
    // flag, so they bulged away from O (a "~" instead of a wedge).
    const centre: Pt = { x: 200, y: 150 }
    const radius = 40
    const cases: Array<[Pt, Pt]> = [
      [{ x: Math.sin(0.6), y: -Math.cos(0.6) }, { x: 0, y: -1 }], // right spring → vertical
      [{ x: -Math.sin(0.6), y: -Math.cos(0.6) }, { x: 0, y: -1 }], // left spring → vertical
      [{ x: 1, y: 0 }, { x: Math.cos(1), y: -Math.sin(1) }], // x axis → force
      [{ x: 0, y: 1 }, { x: Math.sin(0.5), y: Math.cos(0.5) }], // down → into the surface
    ]
    for (const [from, to] of cases) {
      const match = /M ([\d.-]+) ([\d.-]+) A ([\d.]+) ([\d.]+) 0 0 ([01]) ([\d.-]+) ([\d.-]+)/.exec(arcPath(centre, radius, from, to))
      expect(match).not.toBeNull()
      const [, sx, sy, , , sweep, ex, ey] = match!.map(Number) as number[]
      const p = { x: sx!, y: sy! }
      const q = { x: ex!, y: ey! }
      // the two circle centres consistent with the chord and radius
      const chord = Math.hypot(q.x - p.x, q.y - p.y)
      const h = Math.sqrt(Math.max(radius * radius - (chord / 2) ** 2, 0))
      const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
      const n = { x: -(q.y - p.y) / chord, y: (q.x - p.x) / chord }
      const candidates = [
        { x: m.x + n.x * h, y: m.y + n.y * h },
        { x: m.x - n.x * h, y: m.y - n.y * h },
      ]
      // SVG: sweep=1 draws the arc clockwise on screen, so the centre lies on the
      // right-hand side of the direction of travel p→q (candidate 0); sweep=0 is the mirror.
      const centreForSweep = sweep === 1 ? candidates[0]! : candidates[1]!
      expect(Math.hypot(centreForSweep.x - centre.x, centreForSweep.y - centre.y)).toBeLessThan(0.1)
    }
  })

  it('moves a label off the obstacle and is deterministic', () => {
    const rel: Box = { left: -10, top: -10, right: 10, bottom: 10 }
    const obstacle = { kind: 'segment' as const, a: { x: 0, y: 100 }, b: { x: 200, y: 100 }, pad: 6 }
    const options = { obstacles: [obstacle], bounds: { left: 0, top: 0, right: 200, bottom: 200 } }
    const first = placeBox(rel, { x: 100, y: 100 }, { x: 0, y: -1 }, options)
    const second = placeBox(rel, { x: 100, y: 100 }, { x: 0, y: -1 }, options)
    expect(first.clear).toBe(true)
    expect(segmentHitsBox(obstacle.a, obstacle.b, first.box, 6)).toBe(false)
    expect(second).toEqual(first)
    // nowhere to go: reports `clear: false` instead of pretending
    const boxedIn = placeBox(rel, { x: 5, y: 5 }, { x: 0, y: -1 }, { obstacles: [], bounds: { left: 0, top: 0, right: 12, bottom: 12 } })
    expect(boxedIn.clear).toBe(false)
  })
})

describe('concurrent forces layout', () => {
  const cases: Array<[number, number, number]> = []
  for (const a1 of [10, 20, 35, 50, 65, 80]) for (const a2 of [10, 20, 35, 50, 65, 80]) for (const w of [1, 4, 10]) cases.push([a1, a2, w])

  it('keeps every spring ALONG its force and every peg on the board', () => {
    for (const [a1, a2, w] of cases) {
      const sum = a1 + a2
      const t1 = (w * Math.sin((a2 * Math.PI) / 180)) / Math.sin((sum * Math.PI) / 180)
      const t2 = (w * Math.sin((a1 * Math.PI) / 180)) / Math.sin((sum * Math.PI) / 180)
      const layout = concurrentLayout({ a1, a2, w, t1, t2 })
      for (const [anchor, u] of [[layout.anchor1, layout.u1], [layout.anchor2, layout.u2]] as const) {
        const dx = anchor.x - layout.O.x
        const dy = anchor.y - layout.O.y
        expect(Math.abs(dx * u.y - dy * u.x), `spring off its force at a1=${a1} a2=${a2}`).toBeLessThan(1e-6) // collinear
        expect(dx * u.x + dy * u.y).toBeGreaterThan(100) // anchored far from O, on the force's side
        expect(anchor.x).toBeGreaterThanOrEqual(36 - 1e-6)
        expect(anchor.x).toBeLessThanOrEqual(484 + 1e-6)
        expect(anchor.y).toBeGreaterThanOrEqual(30 - 1e-6)
      }
      // the arrow tips stay on their springs, inside the board
      for (const [tip, anchor] of [[layout.F1, layout.anchor1], [layout.F2, layout.anchor2]] as const) {
        expect(Math.hypot(tip.x - layout.O.x, tip.y - layout.O.y)).toBeLessThan(Math.hypot(anchor.x - layout.O.x, anchor.y - layout.O.y) - 20)
      }
      expect(layout.W.y).toBeLessThanOrEqual(328)
    }
  })

  it('never puts a label on an arrow, a spring, another label or outside the board', () => {
    let tight = 0
    for (const [a1, a2, w] of cases) {
      const sum = a1 + a2
      const t1 = (w * Math.sin((a2 * Math.PI) / 180)) / Math.sin((sum * Math.PI) / 180)
      const t2 = (w * Math.sin((a1 * Math.PI) / 180)) / Math.sin((sum * Math.PI) / 180)
      const layout = concurrentLayout({ a1, a2, w, t1, t2 })
      const springs: Segment[] = [
        { a: layout.anchor1, b: layout.O },
        { a: layout.anchor2, b: layout.O },
      ]
      expectNoCollisions(`concurrent a1=${a1} a2=${a2} w=${w}`, layout.labels, [...layout.arrows, ...springs], layout.bounds)
      for (const label of labelsOf(layout.labels)) if (!label[1].clear) tight += 1
      expect(boxesOverlap(layout.labels.w.box, layout.bodyBox), 'w label on the body').toBe(false)
    }
    expect(tight, 'labels that had to be squeezed').toBe(0)
  })
})

describe('parallelogram layout', () => {
  const forces = [1, 4, 10, 50, 100]
  const angles = [0, 30, 60, 90, 120, 150, 180]
  const grid: Array<[number, number, number]> = []
  for (const f1 of forces) for (const f2 of forces) for (const angle of angles) grid.push([f1, f2, angle])

  it('keeps every vertex inside the viewBox, even for opposite forces (180°)', () => {
    for (const [f1, f2, angle] of grid) {
      const layout = parallelogramLayout({ f1, f2, angle })
      for (const point of [layout.O, layout.P1, layout.P2, layout.M]) {
        expect(point.x, `x out of frame at ${f1}/${f2}/${angle}°`).toBeGreaterThanOrEqual(8)
        expect(point.x).toBeLessThanOrEqual(512)
        expect(point.y).toBeGreaterThanOrEqual(8)
        expect(point.y).toBeLessThanOrEqual(332)
      }
    }
  })

  it('keeps the centimetre grid anchored on O and keeps the real scale', () => {
    for (const [f1, f2, angle] of grid) {
      const layout = parallelogramLayout({ f1, f2, angle })
      expect(layout.gridX.some((x) => x === layout.O.x), 'a vertical grid line passes through O').toBe(true)
      for (const x of layout.gridX) expect(Math.abs(((x - layout.O.x) / PX_PER_CM) % 1)).toBeLessThan(1e-9)
      // length of F₁ on the paper = F₁ / (N per cm) cm
      const length = Math.hypot(layout.P1.x - layout.O.x, layout.P1.y - layout.O.y)
      expect(length / PX_PER_CM).toBeCloseTo(f1 / layout.perCm, 6)
    }
  })

  it('never puts a label on an arrow, another label or outside the figure', () => {
    for (const [f1, f2, angle] of grid) {
      const layout = parallelogramLayout({ f1, f2, angle })
      // 0° and 180° collapse the parallelogram onto one line: labels must still be clear of it
      expectNoCollisions(`parallelogram ${f1}/${f2}/${angle}°`, layout.labels, [...layout.arrows, ...layout.carriers], layout.bounds)
    }
  })

  it('stacks the translated copies below the axis when the forces are collinear (0° / 180°)', () => {
    // Regression: at 180° F₂'s dashed blue copy lay exactly on top of F₁'s green arrow
    // (and vice versa), so each half of the figure showed the wrong colour.
    for (const angle of [0, 180]) {
      const layout = parallelogramLayout({ f1: 4, f2: 3, angle })
      expect(layout.copy1.a.y).toBeGreaterThan(layout.O.y + 5)
      expect(layout.copy2.a.y).toBeGreaterThan(layout.copy1.a.y + 5) // separate rows too
    }
    // an ordinary angle keeps the true parallelogram: the copies end exactly at M
    const generic = parallelogramLayout({ f1: 4, f2: 3, angle: 60 })
    expect(generic.copy1.b).toEqual(generic.M)
    expect(generic.copy2.b).toEqual(generic.M)
    expect(generic.copy1.a).toEqual(generic.P2)
    expect(generic.copy2.a).toEqual(generic.P1)
  })
})

describe('force components layout', () => {
  it('axes view: no label on an arrow, another label or off the frame', () => {
    for (let force = 2; force <= 10; force += 1) {
      for (let theta = 10; theta <= 80; theta += 10) {
        const a = (theta * Math.PI) / 180
        const layout = axesLayout({ force, theta, along: force * Math.cos(a), perp: force * Math.sin(a) })
        expectNoCollisions(`axes F=${force} θ=${theta}`, layout.labels, layout.arrows, layout.bounds)
      }
    }
  })

  it('incline view: no label on an arrow, another label or off the frame; wedge stays in frame', () => {
    for (let angle = 5; angle <= 60; angle += 5) {
      for (let weight = 2; weight <= 10; weight += 2) {
        const a = (angle * Math.PI) / 180
        const layout = inclineLayout({ angle, weight, along: weight * Math.sin(a), perp: weight * Math.cos(a) })
        expectNoCollisions(`incline a=${angle} w=${weight}`, layout.labels, layout.arrows, layout.bounds)
        expect(layout.slopeEnd.y, `wedge leaves the frame at ${angle}°`).toBeGreaterThanOrEqual(20)
      }
    }
  })

  it('vectorLabelBox translates the relative box without distortion', () => {
    const spec = { symbol: 'F', subscript: '1', magnitude: '4 N', anchor: 'middle' as const }
    const relative = vectorLabelLayout(spec).box
    const moved = vectorLabelBox(spec, 100, 50)
    expect(moved.left).toBeCloseTo(relative.left + 100)
    expect(moved.bottom).toBeCloseTo(relative.bottom + 50)
    expect(inflateBox(moved, 2).left).toBeCloseTo(moved.left - 2)
  })
})
