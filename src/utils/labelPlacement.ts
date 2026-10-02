/**
 * Deterministic label placement for the physics diagrams.
 *
 * Force arrows rotate with the sliders, so a label positioned by a fixed
 * offset eventually lands on a spring, an arrowhead or another label (seen in
 * real Chromium runs: `F₁` sitting on a spring coil, `w` on top of the weight
 * arrowhead, «نسخة F₁» printed over the magnitude of F₁). Instead of tuning
 * offsets by hand for every slider value, each label is given a target point
 * (usually an arrow tip) and a preferred direction, and this solver picks the
 * nearest position whose box clears every obstacle.
 *
 * Pure geometry, no DOM, no randomness: the same inputs always produce the
 * same placement, so it is unit-testable in jsdom.
 */

import { textLabelBox, vectorLabelLayout } from './vectorLabelMetrics'
import type { Box, TextFace, VectorLabelSpec } from './vectorLabelMetrics'

export type Pt = { x: number; y: number }

export type SegmentObstacle = { kind: 'segment'; a: Pt; b: Pt; /** clearance around the segment */ pad: number }
export type BoxObstacle = { kind: 'box'; box: Box }
export type Obstacle = SegmentObstacle | BoxObstacle

export type Placement = {
  /** Origin to hand to `<VectorSvgLabel anchor="middle">` / a `middle`-anchored `<text>`. */
  x: number
  y: number
  box: Box
  /** False only when no candidate position was free: the least-bad one is returned. */
  clear: boolean
  score: number
}

export type PlaceOptions = {
  obstacles: readonly Obstacle[]
  /** Labels must stay inside this box (usually the viewBox minus a margin). */
  bounds: Box
  /** Side tried first when the preferred direction is blocked: +1 clockwise on screen, -1 anticlockwise. */
  preferSide?: 1 | -1
  distances?: readonly number[]
  angles?: readonly number[]
}

export const translateBox = (box: Box, dx: number, dy: number): Box => ({
  left: box.left + dx,
  top: box.top + dy,
  right: box.right + dx,
  bottom: box.bottom + dy,
})

export const inflateBox = (box: Box, pad: number): Box => ({
  left: box.left - pad,
  top: box.top - pad,
  right: box.right + pad,
  bottom: box.bottom + pad,
})

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

export function overlapArea(a: Box, b: Box): number {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left)
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  return width > 0 && height > 0 ? width * height : 0
}

/** Does the segment a→b pass within `pad` of the box? (Liang–Barsky clipping against the inflated box.) */
export function segmentHitsBox(a: Pt, b: Pt, box: Box, pad = 0): boolean {
  const left = box.left - pad
  const right = box.right + pad
  const top = box.top - pad
  const bottom = box.bottom + pad
  const dx = b.x - a.x
  const dy = b.y - a.y
  let t0 = 0
  let t1 = 1
  const clip = (p: number, q: number): boolean => {
    if (p === 0) return q >= 0
    const r = q / p
    if (p < 0) {
      if (r > t1) return false
      if (r > t0) t0 = r
    } else {
      if (r < t0) return false
      if (r < t1) t1 = r
    }
    return true
  }
  return clip(-dx, a.x - left) && clip(dx, right - a.x) && clip(-dy, a.y - top) && clip(dy, bottom - a.y)
}

export const arrowObstacle = (a: Pt, b: Pt, pad = 8): SegmentObstacle => ({ kind: 'segment', a, b, pad })
export const boxObstacle = (box: Box): BoxObstacle => ({ kind: 'box', box })

/** 0 when the box is free; larger is worse. */
export function obstacleScore(box: Box, obstacles: readonly Obstacle[], bounds: Box): number {
  let score = 0
  for (const obstacle of obstacles) {
    if (obstacle.kind === 'box') {
      const area = overlapArea(box, obstacle.box)
      if (area > 0) score += 20 + area / 10
    } else if (segmentHitsBox(obstacle.a, obstacle.b, box, obstacle.pad)) {
      score += 30
    }
  }
  const overflow =
    Math.max(0, bounds.left - box.left) +
    Math.max(0, box.right - bounds.right) +
    Math.max(0, bounds.top - box.top) +
    Math.max(0, box.bottom - bounds.bottom)
  if (overflow > 0) score += 40 + overflow
  return score
}

const DEFAULT_DISTANCES = [4, 10, 18, 28, 40, 54] as const
const DEFAULT_ANGLES = [0, 35, -35, 70, -70, 110, -110, 150, -150, 180] as const
// Phase 2 (only when phase 1 finds nothing free): a dense fan, so a free spot that the
// coarse fan steps over (a 1–2 px gap between two small labels) is still found.
const FINE_DISTANCES = Array.from({ length: 30 }, (_, i) => 2 + i * 3)

function rotate(v: Pt, degrees: number): Pt {
  const rad = (degrees * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

function unit(v: Pt): Pt {
  const length = Math.hypot(v.x, v.y)
  return length < 1e-9 ? { x: 0, y: -1 } : { x: v.x / length, y: v.y / length }
}

/** 0, +step, −step, +2·step, −2·step … up to ±limit (limit = 180 gives the full circle). */
function denseFan(step: number, limit: number, oneSided: boolean): number[] {
  const angles = [0]
  for (let angle = step; angle <= limit; angle += step) {
    angles.push(angle)
    if (!oneSided && angle < 180) angles.push(-angle)
  }
  return angles
}

function scan(
  rel: Box,
  target: Pt,
  base: Pt,
  distances: readonly number[],
  angles: readonly number[],
  options: PlaceOptions,
): Placement {
  const halfWidth = (rel.right - rel.left) / 2
  const halfHeight = (rel.bottom - rel.top) / 2
  const relCx = (rel.left + rel.right) / 2
  const relCy = (rel.top + rel.bottom) / 2
  let best: Placement | null = null
  for (const distance of distances) {
    for (const angle of angles) {
      const v = rotate(base, angle)
      const reach = distance + Math.abs(v.x) * halfWidth + Math.abs(v.y) * halfHeight
      const x = target.x + v.x * reach - relCx
      const y = target.y + v.y * reach - relCy
      const box = translateBox(rel, x, y)
      const score = obstacleScore(box, options.obstacles, options.bounds)
      if (score === 0) return { x, y, box, clear: true, score }
      if (best === null || score < best.score) best = { x, y, box, clear: false, score }
    }
  }
  // `best` is always set: distances and angles are never empty.
  return best as Placement
}

/**
 * Finds the nearest free position for a box (given relative to its origin)
 * around `target`, trying `dir` first and then fanning out to both sides.
 */
export function placeBox(rel: Box, target: Pt, dir: Pt, options: PlaceOptions): Placement {
  const side = options.preferSide ?? 1
  const base = unit(dir)

  const coarse = scan(
    rel,
    target,
    base,
    options.distances ?? DEFAULT_DISTANCES,
    (options.angles ?? DEFAULT_ANGLES).map((angle) => angle * side),
    options,
  )
  if (coarse.clear) return coarse

  const oneSided = options.angles !== undefined
  const limit = oneSided ? Math.max(...options.angles!.map(Math.abs)) : 180
  const fine = scan(
    rel,
    target,
    base,
    FINE_DISTANCES,
    denseFan(12, limit, oneSided).map((angle) => angle * side),
    options,
  )
  return fine.score < coarse.score ? fine : coarse
}

/** Places a vector label (centre-anchored) near `target`. */
export function placeVectorLabel(
  spec: Omit<VectorLabelSpec, 'anchor'>,
  target: Pt,
  dir: Pt,
  options: PlaceOptions,
): Placement {
  const { box } = vectorLabelLayout({ ...spec, anchor: 'middle' })
  return placeBox(box, target, dir, options)
}

/** Places a plain, centre-anchored text label (baseline origin) near `target`. */
export function placeTextLabel(
  text: string,
  size: number,
  target: Pt,
  dir: Pt,
  options: PlaceOptions,
  face: TextFace = 'ui',
): Placement {
  return placeBox(textLabelBox(text, size, face), target, dir, options)
}

/** Obstacle box of a plain text label that is drawn at a fixed baseline position. */
export function fixedTextBox(text: string, size: number, x: number, y: number, face: TextFace = 'ui'): Box {
  return translateBox(textLabelBox(text, size, face), x, y)
}

/** Distance along `dir` from `origin` until the ray leaves `rect` (origin inside the rect). */
export function rayExit(origin: Pt, dir: Pt, rect: Box): number {
  const tx = dir.x > 1e-9 ? (rect.right - origin.x) / dir.x : dir.x < -1e-9 ? (rect.left - origin.x) / dir.x : Infinity
  const ty = dir.y > 1e-9 ? (rect.bottom - origin.y) / dir.y : dir.y < -1e-9 ? (rect.top - origin.y) / dir.y : Infinity
  return Math.min(tx, ty)
}

/**
 * SVG path for the SHORTER circular arc around `centre` from direction `from` to
 * direction `to` (unit vectors, screen coordinates, y down). The sweep flag is
 * derived from the cross product, so the arc always bulges around the centre —
 * a hand-picked flag draws the mirrored arc (a "~" instead of a wedge) for one
 * of the two orientations.
 */
export function arcPath(centre: Pt, radius: number, from: Pt, to: Pt): string {
  const start = { x: centre.x + from.x * radius, y: centre.y + from.y * radius }
  const end = { x: centre.x + to.x * radius, y: centre.y + to.y * radius }
  const cross = from.x * to.y - from.y * to.x
  const sweep = cross > 0 ? 1 : 0
  return `M ${round(start.x)} ${round(start.y)} A ${radius} ${radius} 0 0 ${sweep} ${round(end.x)} ${round(end.y)}`
}

const round = (value: number): number => Math.round(value * 100) / 100

export const unitVector = unit
