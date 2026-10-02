import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  drawingScale,
  equilibriumResidual,
  equilibriumTensions,
  hypotenuse,
  resolveForce,
  resolveOnIncline,
  resultantBounds,
  resultantOfTwo,
  roundTo,
  toDegrees,
  toRadians,
} from '@/utils/forces'
import {
  accentHeadPath,
  arcPath,
  bisector,
  directionOf,
  distance,
  lineThroughRect,
  parallelogramCorners,
  pointAlong,
  polar,
  rightAnglePath,
  vectorLabelGeometry,
} from '@/utils/vectorGeometry'
import { KATEX_DIGIT_WIDTH, KATEX_MATH_ITALIC } from '@/utils/katexMetrics'
import { quantityText, textAnchorFor } from '@/scientific/SvgText'

/* ============================================================================
   Pure relations behind the three physics labs. These run without a DOM, so
   what the labs *display* (resultant, equilibrium tensions, components, the
   place of a label's arrow) is checked against the physics itself rather than
   against a screenshot.
   ========================================================================= */

describe('forces — resultant of two concurrent forces', () => {
  it('adds the intensities at 0° and subtracts them at 180°', () => {
    expect(resultantOfTwo(4, 3, 0).magnitude).toBeCloseTo(7, 10)
    expect(resultantOfTwo(4, 3, 180).magnitude).toBeCloseTo(1, 10)
  })

  it('uses Pythagoras at 90° — the book example: 60 N and 80 N give 100 N', () => {
    expect(resultantOfTwo(60, 80, 90).magnitude).toBeCloseTo(100, 8)
    expect(hypotenuse(60, 80)).toBe(100)
    // 3-4-5 on the drawing: 3 cm, 4 cm and a 5 cm diagonal at 20 N per cm
    expect(100 / drawingScale(100)).toBeCloseTo(5, 10)
  })

  it('reproduces the book example of page 58: 4 N and 3 N at 60° measure about 6 cm → 6 N', () => {
    const { magnitude } = resultantOfTwo(4, 3, 60)
    expect(magnitude).toBeCloseTo(Math.sqrt(37), 10)
    expect(Math.round(magnitude)).toBe(6)
    expect(drawingScale(magnitude)).toBe(1) // 1 cm ↔ 1 N
  })

  it('stays inside |F₁ − F₂| ≤ F ≤ F₁ + F₂ for every angle', () => {
    const { min, max } = resultantBounds(4, 3)
    for (let angle = 0; angle <= 180; angle += 5) {
      const { magnitude } = resultantOfTwo(4, 3, angle)
      expect(magnitude).toBeGreaterThanOrEqual(min - 1e-9)
      expect(magnitude).toBeLessThanOrEqual(max + 1e-9)
    }
  })

  it('decreases monotonically as the angle opens from 0° to 180°', () => {
    let previous = Infinity
    for (let angle = 0; angle <= 180; angle += 1) {
      const { magnitude } = resultantOfTwo(5, 2, angle)
      expect(magnitude).toBeLessThanOrEqual(previous + 1e-12)
      previous = magnitude
    }
  })

  it('points between the two forces and nearer to the larger one', () => {
    const r = resultantOfTwo(5, 2, 60)
    expect(r.fromF1).toBeGreaterThan(0)
    expect(r.fromF1).toBeLessThan(60)
    expect(r.fromF1).toBeLessThan(r.fromF2) // F₁ is the larger force
    expect(r.fromF1 + r.fromF2).toBeCloseTo(60, 10)
  })

  it('is zero for equal and opposite forces', () => {
    expect(resultantOfTwo(5, 5, 180).magnitude).toBeCloseTo(0, 10)
  })
})

describe('forces — a weight held by two springs', () => {
  it('balances in both directions for any pair of angles', () => {
    for (const [a1, a2, w] of [[35, 35, 4], [20, 60, 7], [65, 15, 10], [45, 45, 1]] as const) {
      const { t1, t2 } = equilibriumTensions(w, a1, a2)
      const { horizontal, vertical } = equilibriumResidual(w, a1, a2, t1, t2)
      expect(horizontal).toBeCloseTo(0, 9)
      expect(vertical).toBeCloseTo(0, 9)
    }
  })

  it('shares the weight equally when the springs are vertical, and loads them more when they spread', () => {
    const straight = equilibriumTensions(4, 0.0001, 0.0001)
    expect(straight.t1).toBeCloseTo(2, 3)
    const spread = equilibriumTensions(4, 35, 35)
    expect(spread.t1).toBeGreaterThan(2)
    expect(spread.t1).toBeCloseTo(4 / (2 * Math.cos(toRadians(35))), 9)
  })

  it('scales linearly with the weight', () => {
    const light = equilibriumTensions(4, 35, 50)
    const heavy = equilibriumTensions(8, 35, 50)
    expect(heavy.t1).toBeCloseTo(light.t1 * 2, 9)
    expect(heavy.t2).toBeCloseTo(light.t2 * 2, 9)
  })

  it('makes the force opposite to the weight the diagonal of the parallelogram on F₁ and F₂', () => {
    const w = 4
    const { t1, t2 } = equilibriumTensions(w, 35, 50)
    // F₁ and F₂ make a₁ + a₂ with each other; their resultant must equal w
    const r = resultantOfTwo(t1, t2, 35 + 50)
    expect(r.magnitude).toBeCloseTo(w, 9)
  })
})

describe('forces — components', () => {
  it('rebuilds the force with Pythagoras (the check shown by the component lab)', () => {
    for (const [force, angle] of [[6, 40], [10, 60], [2, 80], [7, 10]] as const) {
      const { along, across } = resolveForce(force, angle)
      expect(Math.hypot(along, across)).toBeCloseTo(force, 10)
    }
  })

  it('gives the values the lab prints: 6 N at 40° → 4.6 N and 3.9 N', () => {
    const { along, across } = resolveForce(6, 40)
    expect(roundTo(along, 1)).toBe(4.6)
    expect(roundTo(across, 1)).toBe(3.9)
  })

  it('splits a weight on a smooth incline into F₁ along and F₂ across the plane', () => {
    const { parallel, perpendicular } = resolveOnIncline(5, 25)
    expect(parallel).toBeCloseTo(5 * Math.sin(toRadians(25)), 12)
    expect(perpendicular).toBeCloseTo(5 * Math.cos(toRadians(25)), 12)
    expect(Math.hypot(parallel, perpendicular)).toBeCloseTo(5, 12)
  })

  it('tends to the two limits: flat plane (no pull) and vertical wall (no pressure)', () => {
    expect(resolveOnIncline(5, 0).parallel).toBeCloseTo(0, 12)
    expect(resolveOnIncline(5, 0).perpendicular).toBeCloseTo(5, 12)
    expect(resolveOnIncline(5, 90).perpendicular).toBeCloseTo(0, 12)
    expect(resolveOnIncline(5, 90).parallel).toBeCloseTo(5, 12)
  })

  it('makes F₁ grow and F₂ shrink as the plane steepens', () => {
    let last = resolveOnIncline(5, 5)
    for (let angle = 10; angle <= 85; angle += 5) {
      const now = resolveOnIncline(5, angle)
      expect(now.parallel).toBeGreaterThan(last.parallel)
      expect(now.perpendicular).toBeLessThan(last.perpendicular)
      last = now
    }
  })
})

describe('forces — drawing scale and rounding', () => {
  it('uses the scales of the book: 1 cm ↔ 1 N for small forces, 20 N for large ones', () => {
    expect(drawingScale(4)).toBe(1)
    expect(drawingScale(8)).toBe(1)
    expect(drawingScale(9)).toBe(5)
    expect(drawingScale(30)).toBe(10)
    expect(drawingScale(80)).toBe(20)
    expect(drawingScale(140)).toBe(20)
  })

  it('never returns negative zero', () => {
    expect(Object.is(roundTo(-0.0001, 1), 0)).toBe(true)
    expect(roundTo(2.449, 1)).toBe(2.4)
    expect(toDegrees(Math.PI)).toBeCloseTo(180, 12)
  })
})

describe('vector geometry — screen coordinates and constructions', () => {
  it('flips y so that 90° is up on the screen', () => {
    const p = polar({ x: 100, y: 100 }, 50, 90)
    expect(p.x).toBeCloseTo(100, 10)
    expect(p.y).toBeCloseTo(50, 10)
    expect(directionOf({ x: 0, y: 0 }, { x: 0, y: -10 })).toBeCloseTo(90, 10)
  })

  it('completes the parallelogram: M = P₁ + P₂ − O', () => {
    const o = { x: 10, y: 200 }
    const p1 = polar(o, 120, 0)
    const p2 = polar(o, 90, 60)
    const { m } = parallelogramCorners(o, p1, p2)
    expect(m.x).toBeCloseTo(p1.x + p2.x - o.x, 10)
    expect(m.y).toBeCloseTo(p1.y + p2.y - o.y, 10)
    // opposite sides are equal and parallel
    expect(distance(o, p1)).toBeCloseTo(distance(p2, m), 10)
    expect(distance(o, p2)).toBeCloseTo(distance(p1, m), 10)
  })

  it('draws a right-angle mark as a square corner', () => {
    const d = rightAnglePath({ x: 50, y: 50 }, 0, 90, 10)
    expect(d).toBe('M 60 50 L 60 40 L 50 40')
  })

  it('draws the short way round for an angle under 180° and the long way over it', () => {
    expect(arcPath({ x: 0, y: 0 }, 10, 0, 60)).toMatch(/ 0 0 0 /) // large-arc 0, counter-clockwise on screen
    expect(arcPath({ x: 0, y: 0 }, 10, 0, 200)).toMatch(/ 0 1 0 /) // large-arc 1
    expect(bisector(0, 60)).toBe(30)
  })

  it('clips a carrier to the board and keeps it through the given point', () => {
    const board = { x: 10, y: 10, width: 700, height: 420 }
    const through = { x: 360, y: 250 }
    const { a, b } = lineThroughRect(through, 55, board)
    for (const end of [a, b]) {
      expect(end.x).toBeGreaterThanOrEqual(board.x - 0.01)
      expect(end.x).toBeLessThanOrEqual(board.x + board.width + 0.01)
      expect(end.y).toBeGreaterThanOrEqual(board.y - 0.01)
      expect(end.y).toBeLessThanOrEqual(board.y + board.height + 0.01)
    }
    // collinear with the point: cross product ≈ 0
    const cross = (a.x - through.x) * (b.y - through.y) - (a.y - through.y) * (b.x - through.x)
    expect(Math.abs(cross)).toBeLessThan(1e-6)
    // …and it really passes between the two ends
    expect(Math.min(a.x, b.x)).toBeLessThan(through.x)
    expect(Math.max(a.x, b.x)).toBeGreaterThan(through.x)
  })

  it('places a point along a segment without leaving it', () => {
    const a = { x: 0, y: 0 }
    const b = { x: 100, y: 0 }
    expect(pointAlong(a, b, 25).x).toBe(25)
    expect(pointAlong(a, b, 500).x).toBe(100)
    expect(pointAlong(a, b, -5).x).toBe(0)
  })
})

describe('vector label geometry — the arrow sits over its symbol, as KaTeX places it', () => {
  it('centres the accent over a single letter (F, w, R) with the glyph skew', () => {
    for (const letter of ['F', 'w', 'R']) {
      const g = vectorLabelGeometry(letter, { fontSize: 20 })
      const glyph = KATEX_MATH_ITALIC[letter]!
      const centre = (g.accent.x1 + g.accent.x2) / 2
      expect(centre).toBeCloseTo((glyph.width / 2 + glyph.skew) * 20, 6)
      // the arrow is about as wide as the letter, never a detached stub
      expect(g.accent.x2 - g.accent.x1).toBeGreaterThanOrEqual(glyph.width * 20 * 0.9)
    }
  })

  it('lays the accent above the letter, clear of its top', () => {
    const upper = vectorLabelGeometry('F', { fontSize: 20 })
    const lower = vectorLabelGeometry('w', { fontSize: 20 })
    expect(upper.accent.y).toBeLessThan(-KATEX_MATH_ITALIC.F!.height * 20)
    expect(lower.accent.y).toBeLessThan(-KATEX_MATH_ITALIC.w!.height * 20)
    // lowercase letters are shorter, so their arrow sits lower than the arrow over a capital
    expect(lower.accent.y).toBeGreaterThan(upper.accent.y)
  })

  it('spans both letters of OM⃗ with one arrow (like \\overrightarrow)', () => {
    const g = vectorLabelGeometry('OM', { fontSize: 20 })
    expect(g.symbolWidth).toBeCloseTo((KATEX_MATH_ITALIC.O!.width + KATEX_MATH_ITALIC.M!.width) * 20, 8)
    expect(g.accent.x1).toBeLessThan(g.symbolWidth * 0.1)
    expect(g.accent.x2).toBeGreaterThanOrEqual(g.symbolWidth)
  })

  it('puts a subscript to the right of the letter, smaller and lower', () => {
    const g = vectorLabelGeometry('F', { subscript: '1', fontSize: 20 })
    expect(g.sub).not.toBeNull()
    expect(g.sub!.x).toBeGreaterThanOrEqual(g.symbolWidth)
    expect(g.sub!.fontSize).toBeLessThan(20)
    expect(g.sub!.y).toBeGreaterThan(0)
    expect(g.sub!.width).toBeCloseTo(KATEX_DIGIT_WIDTH * g.sub!.fontSize, 10)
    expect(g.width).toBeGreaterThan(g.symbolWidth)
  })

  it('keeps a prime after the subscript', () => {
    const g = vectorLabelGeometry('F', { subscript: '1', prime: true, fontSize: 20 })
    expect(g.prime!.x).toBeGreaterThan(g.sub!.x + g.sub!.width)
  })

  it('scales with the font size', () => {
    const small = vectorLabelGeometry('F', { subscript: '1', fontSize: 10 })
    const big = vectorLabelGeometry('F', { subscript: '1', fontSize: 30 })
    expect(big.width / small.width).toBeCloseTo(3, 6)
    expect(big.accent.y / small.accent.y).toBeCloseTo(3, 6)
  })

  it('builds a filled triangular head whose tip is the end of the accent', () => {
    const g = vectorLabelGeometry('F', { fontSize: 20 })
    const d = accentHeadPath(g.accent)
    expect(d).toMatch(/^M [\d.-]+ [\d.-]+ L [\d.-]+ [\d.-]+ L [\d.-]+ [\d.-]+ Z$/)
    expect(d.startsWith(`M ${Number(g.accent.x2.toFixed(2))} ${Number(g.accent.y.toFixed(2))}`)).toBe(true)
  })
})

describe('KaTeX metrics table', () => {
  it('was generated from the installed KaTeX version', () => {
    const installed = JSON.parse(readFileSync('node_modules/katex/package.json', 'utf8')).version as string
    const table = readFileSync('src/utils/katexMetrics.ts', 'utf8')
    expect(table).toContain(`katex@${installed}`)
  })

  it('has every Latin letter with sane numbers', () => {
    const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']
    for (const letter of letters) {
      const glyph = KATEX_MATH_ITALIC[letter]
      expect(glyph, letter).toBeDefined()
      expect(glyph!.width).toBeGreaterThan(0.25)
      expect(glyph!.width).toBeLessThan(1.1)
      expect(glyph!.height).toBeGreaterThan(0.4)
    }
  })
})

describe('SvgText — direction-safe SVG text', () => {
  it('maps a visual alignment to the right text-anchor for each writing direction', () => {
    expect(textAnchorFor('left', false)).toBe('start')
    expect(textAnchorFor('right', false)).toBe('end')
    expect(textAnchorFor('left', true)).toBe('end')
    expect(textAnchorFor('right', true)).toBe('start')
    expect(textAnchorFor('center', true)).toBe('middle')
    expect(textAnchorFor('center', false)).toBe('middle')
  })

  it('keeps a number and its unit in printed order, and an angle sign glued to its number', () => {
    expect(quantityText(2.449, 'N')).toBe('2.4 N')
    expect(quantityText(4, 'N')).toBe('4 N')
    expect(quantityText(6.083, 'cm')).toBe('6.1 cm')
    expect(quantityText(60, '°', 0)).toBe('60°')
    expect(quantityText('20', 'N')).toBe('20 N')
    expect(quantityText(5)).toBe('5')
  })
})
