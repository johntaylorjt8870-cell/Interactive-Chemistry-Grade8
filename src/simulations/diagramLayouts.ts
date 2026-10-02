/**
 * Geometry + label layout for the three Physics Unit 2 / Lesson 1 diagrams.
 *
 * The labs used to compute label positions with fixed offsets next to each
 * arrow tip. Arrows rotate and change length with the sliders, so those labels
 * eventually landed on springs, arrowheads, arcs and each other. Here every
 * label is placed by the shared solver (`@/utils/labelPlacement`) against the
 * arrows, springs, bodies and already-placed labels, so the layout is correct
 * for EVERY slider state, not just the default one.
 *
 * Pure functions with no DOM: the components render exactly what is computed
 * here, and `tests/diagramLayouts.test.ts` sweeps whole parameter grids.
 */

import {
  arcPath,
  arrowObstacle,
  boxObstacle,
  fixedTextBox,
  inflateBox,
  placeTextLabel,
  placeVectorLabel,
  rayExit,
  unitVector,
} from '@/utils/labelPlacement'
import type { Obstacle, PlaceOptions, Placement, Pt } from '@/utils/labelPlacement'
import { estimateTextWidth } from '@/utils/vectorLabelMetrics'
import type { Box, TextFace, VectorLabelSpec } from '@/utils/vectorLabelMetrics'

const rad = (deg: number) => (deg * Math.PI) / 180
const add = (p: Pt, v: Pt, k = 1): Pt => ({ x: p.x + v.x * k, y: p.y + v.y * k })
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
const fmt = (value: number) => value.toFixed(1)
const UP: Pt = { x: 0, y: -1 }
/** Plain italic letters (O, M, x, a …) are set in the KaTeX math face: exact advances. */
const MATH = { face: 'math' } as const
/** Rotations (degrees, one direction only) tried for an angle label, then mirrored by `preferSide`. */
const ONE_SIDED_FAN = [0, 25, 50, 80, 110, 150] as const
const ANGLE_DISTANCES = [4, 10, 18, 28, 40, 54, 70] as const

export type VectorLabelSpecNoAnchor = Omit<VectorLabelSpec, 'anchor'>
export type PlacedVectorLabel = Placement & { spec: VectorLabelSpecNoAnchor }
export type PlacedTextLabel = Placement & { text: string; size: number }
export type Segment = { a: Pt; b: Pt }

/** Collects placed boxes so each label avoids the ones placed before it. */
class Layout {
  private readonly placed: Box[] = []

  constructor(
    private readonly fixed: readonly Obstacle[],
    private readonly bounds: Box,
  ) {}

  private options(extra: readonly Obstacle[], side: 1 | -1): PlaceOptions {
    return {
      obstacles: [...this.fixed, ...extra, ...this.placed.map(boxObstacle)],
      bounds: this.bounds,
      preferSide: side,
    }
  }

  vector(spec: VectorLabelSpecNoAnchor, target: Pt, dir: Pt, extra: readonly Obstacle[], side: 1 | -1): PlacedVectorLabel {
    const placement = placeVectorLabel(spec, target, dir, this.options(extra, side))
    this.placed.push(placement.box)
    return { ...placement, spec }
  }

  text(
    text: string,
    size: number,
    target: Pt,
    dir: Pt,
    extra: readonly Obstacle[],
    side: 1 | -1,
    tweak: Pick<PlaceOptions, 'angles' | 'distances'> & { face?: TextFace } = {},
  ): PlacedTextLabel {
    const { face, ...search } = tweak
    const placement = placeTextLabel(text, size, target, dir, { ...this.options(extra, side), ...search }, face)
    this.placed.push(placement.box)
    return { ...placement, text, size }
  }

  /** Reserve a box that is drawn at a fixed place (it is not moved, only avoided). */
  reserve(box: Box): void {
    this.placed.push(box)
  }
}

/* ============================================================================
   1) Concurrent forces — spring board, hanging body, three arrows meeting at O
   ========================================================================= */

export type ConcurrentInput = { a1: number; a2: number; w: number; t1: number; t2: number }

export const CONCURRENT_VIEWBOX = { width: 520, height: 360 } as const
export const CONCURRENT_BOARD: Box = { left: 20, top: 14, right: 500, bottom: 344 }
export const CONCURRENT_TITLE = 'لوح الزنابض'
export const CONCURRENT_BODY_TEXT = 'جسم'
const CONCURRENT_INNER: Box = inflateBox(CONCURRENT_BOARD, -16)
const CONCURRENT_LABEL_BOUNDS: Box = inflateBox(CONCURRENT_BOARD, -5)

export function concurrentLayout({ a1, a2, w, t1, t2 }: ConcurrentInput) {
  const O: Pt = { x: 260, y: 178 }
  const u1: Pt = { x: Math.sin(rad(a1)), y: -Math.cos(rad(a1)) }
  const u2: Pt = { x: -Math.sin(rad(a2)), y: -Math.cos(rad(a2)) }

  // Each spring lies ALONG its force: the peg is where the line of action leaves
  // the board. (A beam with pegs at 120·sin a made the springs ~11–40° off the
  // arrows, contradicting "the tension acts along the spring".)
  const springLength1 = rayExit(O, u1, CONCURRENT_INNER)
  const springLength2 = rayExit(O, u2, CONCURRENT_INNER)
  const anchor1 = add(O, u1, springLength1)
  const anchor2 = add(O, u2, springLength2)
  // Dotted extension of each line of action beyond O (it still passes through O).
  const tail1 = add(O, u1, -rayExit(O, { x: -u1.x, y: -u1.y }, CONCURRENT_INNER))
  const tail2 = add(O, u2, -rayExit(O, { x: -u2.x, y: -u2.y }, CONCURRENT_INNER))

  // Arrow length encodes magnitude (1 N ≙ 11 px, plus a visible minimum), capped so
  // the tip stays on its spring inside the board.
  const f1Len = Math.min(34 + t1 * 11, springLength1 - 26)
  const f2Len = Math.min(34 + t2 * 11, springLength2 - 26)
  const wLen = Math.min(34 + w * 11, CONCURRENT_INNER.bottom - O.y - 4)
  const F1 = add(O, u1, f1Len)
  const F2 = add(O, u2, f2Len)
  const W: Pt = { x: O.x, y: O.y + wLen }
  const bodyY = O.y + wLen * 0.62
  const bodyBox: Box = { left: O.x - 20, right: O.x + 20, top: bodyY - 20, bottom: bodyY + 18 }

  const titleWidth = estimateTextWidth(CONCURRENT_TITLE, 12, 'arabic')
  const titleBox: Box = { left: 32, right: 36 + titleWidth, top: 22, bottom: 40 }
  const arcBox: Box = { left: O.x - 25, right: O.x + 25, top: O.y - 25, bottom: O.y + 7 }

  // The three full lines of action through O: spring + arrow, their dotted tails beyond
  // O, and the vertical carrier. Labels keep clear of all of them, so none sits on a
  // dotted line or a coil.
  const lines = (pad: number): Obstacle[] => [
    arrowObstacle(anchor1, O, pad), // spring + arrow: coils are ±7 px wide
    arrowObstacle(anchor2, O, pad),
    arrowObstacle(O, tail1, Math.min(pad, 5)), // dotted tails need less clearance
    arrowObstacle(O, tail2, Math.min(pad, 5)),
    arrowObstacle({ x: O.x, y: 30 }, { x: O.x, y: 328 }, Math.max(3.5, pad - 3)),
  ]

  // «جسم» sits BESIDE the body, not inside it: the weight arrow passes through the
  // body, and text under an arrow (brown on amber, 2.2:1) was neither legible nor accessible.
  const bodyTextWidth = estimateTextWidth(CONCURRENT_BODY_TEXT, 12, 'arabic')
  const bodyLabel: Pt = { x: O.x - 20 - 7 - bodyTextWidth / 2, y: bodyY + 4 }

  const bisector1 = unitVector({ x: Math.sin(rad(a1 / 2)), y: -Math.cos(rad(a1 / 2)) })
  const bisector2 = unitVector({ x: -Math.sin(rad(a2 / 2)), y: -Math.cos(rad(a2 / 2)) })
  const layout = new Layout([boxObstacle(bodyBox), boxObstacle(titleBox), boxObstacle(arcBox)], CONCURRENT_LABEL_BOUNDS)
  layout.reserve(fixedTextBox(CONCURRENT_BODY_TEXT, 12, bodyLabel.x, bodyLabel.y, 'arabic'))
  // Placement order = priority. The small, tightly constrained labels (angles, O) claim
  // their spots first; the force labels have far more freedom around their tips.
  const labels = {
    // Each angle label stays on ITS side of the vertical (one-sided fan, widening
    // distances): between the vertical and its spring when the wedge is wide enough,
    // otherwise just outside the spring — never in the other angle's wedge.
    a1: layout.text('a₁', 13, add(O, bisector1, 22), bisector1, lines(6), 1, { angles: ONE_SIDED_FAN, distances: ANGLE_DISTANCES, face: 'math' }),
    a2: layout.text('a₂', 13, add(O, bisector2, 22), bisector2, lines(6), -1, { angles: ONE_SIDED_FAN, distances: ANGLE_DISTANCES, face: 'math' }),
    o: layout.text('O', 15, O, { x: -0.7, y: 0.7 }, lines(8), 1, MATH),
    f1: layout.vector({ symbol: 'F', subscript: '1', magnitude: `${fmt(t1)} N` }, F1, u1, lines(12), 1),
    f2: layout.vector({ symbol: 'F', subscript: '2', magnitude: `${fmt(t2)} N` }, F2, u2, lines(12), -1),
    w: layout.vector({ symbol: 'w', magnitude: `${w} N` }, W, { x: 0, y: 1 }, lines(10), -1),
  }

  return {
    O,
    u1,
    u2,
    anchor1,
    anchor2,
    tail1,
    tail2,
    F1,
    F2,
    W,
    bodyY,
    bodyBox,
    bodyLabel,
    titleBox,
    arc1: arcPath(O, 20, u1, UP),
    arc2: arcPath(O, 20, u2, UP),
    labels,
    arrows: [
      { a: O, b: F1 },
      { a: O, b: F2 },
      { a: O, b: W },
    ] as Segment[],
    bounds: CONCURRENT_LABEL_BOUNDS,
  }
}

/* ============================================================================
   2) Parallelogram of forces — grid with an honest scale
   ========================================================================= */

export const PARALLELOGRAM_VIEWBOX = { width: 520, height: 340 } as const
export const PX_PER_CM = 30
const PARALLELOGRAM_BOUNDS: Box = { left: 6, top: 6, right: 514, bottom: 334 }

/** Picks a drawing scale the way the book does: «كل 1 cm يمثل X N». */
export function scaleFor(maxNewton: number): number {
  if (maxNewton > 40) return 20
  if (maxNewton > 20) return 10
  if (maxNewton > 8) return 5
  return 1
}

export type ParallelogramInput = { f1: number; f2: number; angle: number }

/** Unit normal of the edge a→b that points away from `inside` (down when degenerate). */
function outward(a: Pt, b: Pt, inside: Pt): Pt {
  const edge = unitVector({ x: b.x - a.x, y: b.y - a.y })
  let normal: Pt = { x: -edge.y, y: edge.x }
  const away = (mid(a, b).x - inside.x) * normal.x + (mid(a, b).y - inside.y) * normal.y
  if (Math.abs(away) < 1e-6) return normal.y >= 0 ? normal : { x: -normal.x, y: -normal.y }
  if (away < 0) normal = { x: -normal.x, y: -normal.y }
  return normal
}

export function parallelogramLayout({ f1, f2, angle }: ParallelogramInput) {
  const theta = rad(angle)
  const resultant = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(theta))
  const direction = (Math.atan2(f1 * Math.sin(theta), f2 + f1 * Math.cos(theta)) * 180) / Math.PI
  const perCm = scaleFor(Math.max(f1, f2, resultant))
  const s = PX_PER_CM / perCm
  const u1: Pt = { x: Math.cos(theta), y: -Math.sin(theta) }
  const u2: Pt = { x: 1, y: 0 }

  // Centre the drawing horizontally: with a fixed origin an opposite-direction
  // force (180°) left the viewBox for anything above ~3 N.
  const rel1: Pt = { x: f1 * s * u1.x, y: f1 * s * u1.y }
  const rel2: Pt = { x: f2 * s, y: 0 }
  const relM: Pt = { x: rel1.x + rel2.x, y: rel1.y }
  const xs = [0, rel1.x, rel2.x, relM.x]
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const wanted = 260 - (minX + maxX) / 2
  const O: Pt = { x: Math.round(Math.min(Math.max(wanted, 12 - minX), 508 - maxX)), y: 272 }
  const P1 = add(O, rel1)
  const P2 = add(O, rel2)
  const M = add(O, relM)

  const gridX: number[] = []
  for (let x = O.x - PX_PER_CM * Math.floor((O.x - 10) / PX_PER_CM); x <= 510; x += PX_PER_CM) gridX.push(x)
  const gridY: number[] = []
  for (let i = -1; i <= 8; i += 1) gridY.push(O.y - i * PX_PER_CM)

  // Collinear cases (0° and 180°) put every copy exactly on top of a force, hiding it
  // (at 180° the left half showed F₂'s blue copy over F₁'s green arrow). Like a
  // textbook, stack the copies just below the axis so all four arrows stay visible.
  const collinear = angle === 0 || angle === 180
  const shiftCopy1: Pt = { x: 0, y: collinear ? 11 : 0 }
  const shiftCopy2: Pt = { x: 0, y: collinear ? 22 : 0 }
  const copy1: Segment = { a: add(P2, shiftCopy1), b: add(M, shiftCopy1) } // F₁ moved to the tip of F₂
  const copy2: Segment = { a: add(P1, shiftCopy2), b: add(M, shiftCopy2) } // F₂ moved to the tip of F₁

  // Everything that may ever be drawn is an obstacle, so labels do not jump when
  // the learner advances from forces → copies → diagonal.
  const edges: Segment[] = [{ a: O, b: P1 }, { a: O, b: P2 }, copy1, copy2, { a: O, b: M }]
  // Dotted lines of action (drawn by the lab) run past the tips: keep labels off them too.
  const carriers: Segment[] = [
    { a: add(O, u1, -70), b: add(P1, u1, 46) },
    { a: add(O, u2, -70), b: add(P2, u2, 52) },
  ]
  const lines = (pad: number): Obstacle[] => [
    ...edges.map((edge) => arrowObstacle(edge.a, edge.b, pad)),
    ...carriers.map((edge) => arrowObstacle(edge.a, edge.b, Math.min(pad, 4))),
  ]

  const rightAngle = angle === 90
  const arcRadius = rightAngle ? 20 : 32
  const bisector = unitVector({ x: Math.cos(theta / 2), y: -Math.sin(theta / 2) })
  const arcBox: Box = rightAngle
    ? { left: O.x - 2, right: O.x + 22, top: O.y - 22, bottom: O.y + 2 }
    : {
        left: O.x + Math.min(0, arcRadius * Math.cos(theta)) - 2,
        right: O.x + arcRadius + 2,
        top: O.y - arcRadius * (angle >= 90 ? 1 : Math.sin(theta)) - 2,
        bottom: O.y + 2,
      }

  const centroid: Pt = { x: (O.x + P1.x + P2.x + M.x) / 4, y: (O.y + P1.y + P2.y + M.y) / 4 }
  const diag: Pt = { x: M.x - O.x, y: M.y - O.y }
  const beyondM: Pt = diag.x === 0 && diag.y === 0 ? { x: 1, y: -1 } : unitVector(diag)

  const layout = new Layout([boxObstacle(arcBox)], PARALLELOGRAM_BOUNDS)
  // Placement order = priority. Point labels (M, O) and the angle hug their anchors, so
  // they claim their spots first; the force labels and the loosely attached copy captions
  // have far more freedom (otherwise M drifted ~35 units away from its own point).
  const labels = {
    m: layout.text('M', 15, M, beyondM, lines(7), 1, MATH),
    o: layout.text('O', 15, O, { x: -0.7, y: 0.7 }, lines(7), 1, MATH),
    angle: layout.text(`${angle}°`, 13, add(O, bisector, arcRadius + 6), bisector, lines(5), 1),
    // Beside the tip, like F₁ and F₂: inside a small or flat parallelogram there is no room.
    resultant: layout.vector({ symbol: 'F', magnitude: `${fmt(resultant)} N` }, M, beyondM, lines(8), -1),
    f1: layout.vector({ symbol: 'F', subscript: '1', magnitude: `${f1} N` }, P1, u1, lines(8), -1),
    f2: layout.vector({ symbol: 'F', subscript: '2', magnitude: `${f2} N` }, P2, u2, lines(8), 1),
    copy1: layout.vector({ symbol: 'F', subscript: '1', prefix: 'نسخة', size: 13 }, mid(copy1.a, copy1.b), outward(copy1.a, copy1.b, centroid), lines(7), 1),
    copy2: layout.vector({ symbol: 'F', subscript: '2', prefix: 'نسخة', size: 13 }, mid(copy2.a, copy2.b), outward(copy2.a, copy2.b, centroid), lines(7), -1),
  }

  return {
    resultant,
    direction,
    perCm,
    s,
    O,
    P1,
    P2,
    M,
    u1,
    u2,
    gridX,
    gridY,
    rightAngle,
    arc: rightAngle
      ? `M ${O.x + 20} ${O.y} L ${O.x + 20} ${O.y - 20} L ${O.x} ${O.y - 20}`
      : arcPath(O, 32, { x: 1, y: 0 }, u1),
    copy1,
    copy2,
    carriers,
    labels,
    arrows: edges,
    bounds: PARALLELOGRAM_BOUNDS,
  }
}

/* ============================================================================
   3) Force components — axes view and inclined plane
   ========================================================================= */

export const COMPONENTS_VIEWBOX = { width: 520, height: 320 } as const
const COMPONENTS_BOUNDS: Box = { left: 6, top: 6, right: 514, bottom: 314 }

export type AxesInput = { force: number; theta: number; along: number; perp: number }

export function axesLayout({ force, theta, along, perp }: AxesInput) {
  const O: Pt = { x: 100, y: 250 }
  const s = 22
  const a = rad(theta)
  const u: Pt = { x: Math.cos(a), y: -Math.sin(a) }
  const tip = add(O, u, force * s)
  const onX: Pt = { x: O.x + along * s, y: O.y }
  const onY: Pt = { x: O.x, y: O.y - perp * s }
  const xEnd: Pt = { x: 470, y: O.y }
  const yEnd: Pt = { x: O.x, y: 36 }
  const xLabel: Pt = { x: 486, y: O.y + 5 }
  const yLabel: Pt = { x: O.x, y: 24 }

  const bisector = unitVector({ x: Math.cos(a / 2), y: -Math.sin(a / 2) })
  const arcBox: Box = { left: O.x - 2, right: O.x + 38, top: O.y - 38, bottom: O.y + 2 }
  const squareX: Box = { left: onX.x - 13, right: onX.x + 1, top: O.y - 13, bottom: O.y + 1 }
  const squareY: Box = { left: O.x - 1, right: O.x + 13, top: onY.y - 1, bottom: onY.y + 13 }

  const fixed: Obstacle[] = [
    boxObstacle(arcBox),
    boxObstacle(squareX),
    boxObstacle(squareY),
    boxObstacle(fixedTextBox('x', 15, xLabel.x, xLabel.y, 'math')),
    boxObstacle(fixedTextBox('y', 15, yLabel.x, yLabel.y, 'math')),
    arrowObstacle(O, xEnd, 5),
    arrowObstacle(O, yEnd, 5),
    arrowObstacle(tip, onX, 5),
    arrowObstacle(tip, onY, 5),
  ]
  const lines = (pad: number): Obstacle[] => [arrowObstacle(O, tip, pad), arrowObstacle(O, onX, pad - 2), arrowObstacle(O, onY, pad - 2)]

  const layout = new Layout(fixed, COMPONENTS_BOUNDS)
  const labels = {
    f: layout.vector({ symbol: 'F', magnitude: `${force} N` }, tip, u, lines(8), -1),
    f1: layout.vector({ symbol: 'F', subscript: '1', magnitude: `${fmt(along)} N` }, onX, { x: 0, y: 1 }, lines(8), 1),
    f2: layout.vector({ symbol: 'F', subscript: '2', magnitude: `${fmt(perp)} N` }, onY, { x: -1, y: 0 }, lines(8), -1),
    m: layout.text('M', 15, tip, { x: 1, y: 0.3 }, lines(7), 1, MATH),
    o: layout.text('O', 15, O, { x: -0.7, y: 0.7 }, lines(7), 1, MATH),
    angle: layout.text(`${theta}°`, 13, add(O, bisector, 44), bisector, lines(5), 1),
  }

  return {
    O,
    s,
    u,
    tip,
    onX,
    onY,
    xEnd,
    yEnd,
    xLabel,
    yLabel,
    arc: arcPath(O, 36, { x: 1, y: 0 }, u),
    labels,
    arrows: [
      { a: O, b: tip },
      { a: O, b: onX },
      { a: O, b: onY },
    ] as Segment[],
    bounds: COMPONENTS_BOUNDS,
  }
}

export type InclineInput = { angle: number; weight: number; along: number; perp: number }

export function inclineLayout({ angle, weight, along, perp }: InclineInput) {
  const a = rad(angle)
  // 10 px per newton: a 10 N weight is 100 px long. With 22 px/N and the horizon at
  // y = 292 the weight arrow left the 320 px frame for every weight above ~1 N at
  // small angles (a 4 N weight at 5° ended at y = 363).
  const s = 10
  const base: Pt = { x: 56, y: 224 }
  const upSlope: Pt = { x: Math.cos(a), y: -Math.sin(a) }
  // Keep the whole wedge inside the frame: at 60° a 400 px slope used to leave the top.
  const slopeLength = Math.min(400, (base.y - 20) / Math.sin(a))
  const slopeEnd = add(base, upSlope, slopeLength)
  const body = add(base, upSlope, 170)
  const downSlope: Pt = { x: -upSlope.x, y: -upSlope.y }
  const intoSurface: Pt = { x: Math.sin(a), y: Math.cos(a) }
  const wTip: Pt = { x: body.x, y: body.y + weight * s }
  const alongTip = add(body, downSlope, along * s)
  const perpTip = add(body, intoSurface, perp * s)
  const horizonEnd: Pt = { x: 480, y: base.y }
  const horizonLabel: Pt = { x: 476, y: base.y - 8 }
  const horizonText = 'الأفق'

  const bodyBox: Box = { left: body.x - 22, right: body.x + 22, top: body.y - 26, bottom: body.y + 6 }
  const baseBisector = unitVector({ x: Math.cos(a / 2), y: -Math.sin(a / 2) })
  const bodyBisector = unitVector({ x: Math.sin(a / 2), y: Math.cos(a / 2) })
  const baseArcBox: Box = { left: base.x - 2, right: base.x + 54, top: base.y - 54 * Math.max(Math.sin(a), 0.2), bottom: base.y + 2 }
  const bodyArcBox: Box = { left: body.x - 2, right: body.x + 36, top: body.y + 2, bottom: body.y + 36 }
  const horizonWidth = estimateTextWidth(horizonText, 12, 'arabic')

  const fixed: Obstacle[] = [
    boxObstacle(bodyBox),
    boxObstacle(baseArcBox),
    boxObstacle(bodyArcBox),
    boxObstacle({ left: horizonLabel.x - horizonWidth - 2, right: horizonLabel.x + 2, top: horizonLabel.y - 14, bottom: horizonLabel.y + 4 }),
    arrowObstacle(base, slopeEnd, 5),
    arrowObstacle({ x: base.x - 30, y: base.y }, horizonEnd, 5),
    arrowObstacle(alongTip, wTip, 5),
    arrowObstacle(perpTip, wTip, 5),
  ]
  const lines = (pad: number): Obstacle[] => [
    arrowObstacle(body, wTip, pad),
    arrowObstacle(body, alongTip, pad),
    arrowObstacle(body, perpTip, pad),
  ]

  const layout = new Layout(fixed, COMPONENTS_BOUNDS)
  const labels = {
    w: layout.vector({ symbol: 'w', magnitude: `${weight} N` }, wTip, { x: 0, y: 1 }, lines(8), -1),
    f1: layout.vector({ symbol: 'F', subscript: '1', magnitude: `${fmt(along)} N` }, alongTip, downSlope, lines(8), 1),
    f2: layout.vector({ symbol: 'F', subscript: '2', magnitude: `${fmt(perp)} N` }, perpTip, intoSurface, lines(8), -1),
    aBase: layout.text('a', 13, add(base, baseBisector, 62), baseBisector, lines(5), 1, MATH),
    aBody: layout.text('a', 13, add(body, bodyBisector, 44), bodyBisector, lines(5), 1, MATH),
  }

  return {
    base,
    slopeEnd,
    body,
    upSlope,
    downSlope,
    intoSurface,
    wTip,
    alongTip,
    perpTip,
    horizonEnd,
    horizonLabel,
    horizonText,
    baseArc: arcPath(base, 52, { x: 1, y: 0 }, upSlope),
    bodyArc: arcPath(body, 34, { x: 0, y: 1 }, intoSurface),
    labels,
    arrows: [
      { a: body, b: wTip },
      { a: body, b: alongTip },
      { a: body, b: perpTip },
    ] as Segment[],
    bounds: COMPONENTS_BOUNDS,
  }
}
