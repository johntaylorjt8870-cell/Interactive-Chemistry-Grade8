import type { CSSProperties } from 'react'

export type Point2D = {
  x: number
  y: number
}

export type Segment2D = {
  start: Point2D
  end: Point2D
}

/** Euclidean length of an SVG vector segment in viewBox units. */
export function vectorLength(start: Point2D, end: Point2D): number {
  return Number(Math.hypot(end.x - start.x, end.y - start.y).toFixed(2))
}

/**
 * Physical angle in degrees relative to +x (with upward screen direction as +y).
 */
export function vectorAngleDeg(start: Point2D, end: Point2D): number {
  return Number(((Math.atan2(start.y - end.y, end.x - start.x) * 180) / Math.PI).toFixed(1))
}

/**
 * Clockwise angle in SVG screen coordinates (+x right, +y down), matching CSS `rotate()`.
 */
function svgAngleDeg(start: Point2D, end: Point2D): number {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
}

function shortestAngleDelta(fromDeg: number, toDeg: number): number {
  let delta = ((fromDeg - toDeg + 180) % 360 + 360) % 360 - 180
  if (Object.is(delta, -0)) delta = 0
  return delta
}

/**
 * Builds deterministic CSS custom properties for an SVG vector or construction
 * segment so that:
 * 1. During construction stages, the segment grows outward from `current.start`
 *    (`transformOrigin: "${x}px ${y}px"`).
 * 2. When a lab parameter changes, the segment interpolates smoothly from its
 *    previous geometry (`previous`) to its new geometry (`current`) via a
 *    similarity transform (`--origin-dx`, `--origin-dy`, `--delta-rot`,
 *    `--scale-ratio`) while keeping the exact final SVG coordinates in the DOM.
 * 3. In `prefers-reduced-motion` mode (`reducedMotion: true`), all deltas are
 *    zeroed so the final state is presented immediately without motion.
 */
export function buildSegmentMotionStyle(
  current: Segment2D,
  previous: Segment2D | undefined,
  options: { delayMs?: number; reducedMotion: boolean },
): CSSProperties {
  const delay = `${options.delayMs ?? 0}ms`
  const origin = `${current.start.x}px ${current.start.y}px`

  if (options.reducedMotion || !previous) {
    return {
      transformOrigin: origin,
      '--vec-delay': delay,
      '--origin-dx': '0px',
      '--origin-dy': '0px',
      '--delta-rot': '0deg',
      '--scale-ratio': '1',
    } as CSSProperties
  }

  const currLen = Math.max(1, Math.hypot(current.end.x - current.start.x, current.end.y - current.start.y))
  const prevLen = Math.max(1, Math.hypot(previous.end.x - previous.start.x, previous.end.y - previous.start.y))
  const currAngle = svgAngleDeg(current.start, current.end)
  const prevAngle = svgAngleDeg(previous.start, previous.end)
  const deltaRot = Number(shortestAngleDelta(prevAngle, currAngle).toFixed(2))
  const scaleRatio = Number((prevLen / currLen).toFixed(3))
  const originDx = Number((previous.start.x - current.start.x).toFixed(1))
  const originDy = Number((previous.start.y - current.start.y).toFixed(1))

  return {
    transformOrigin: origin,
    '--vec-delay': delay,
    '--origin-dx': `${originDx}px`,
    '--origin-dy': `${originDy}px`,
    '--delta-rot': `${deltaRot}deg`,
    '--scale-ratio': String(scaleRatio),
  } as CSSProperties
}

/**
 * Builds deterministic CSS custom properties for an SVG point or label so it
 * reveals after its vector shaft during construction and glides smoothly from
 * its previous position when parameters change.
 */
export function buildPointMotionStyle(
  current: Point2D,
  previous: Point2D | undefined,
  options: { delayMs?: number; reducedMotion: boolean },
): CSSProperties {
  const delay = `${options.delayMs ?? 0}ms`
  if (options.reducedMotion || !previous) {
    return {
      '--vec-delay': delay,
      '--point-dx': '0px',
      '--point-dy': '0px',
    } as CSSProperties
  }

  const dx = Number((previous.x - current.x).toFixed(1))
  const dy = Number((previous.y - current.y).toFixed(1))
  return {
    '--vec-delay': delay,
    '--point-dx': `${dx}px`,
    '--point-dy': `${dy}px`,
  } as CSSProperties
}
