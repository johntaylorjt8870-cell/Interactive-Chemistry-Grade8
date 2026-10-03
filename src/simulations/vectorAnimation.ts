import type { CSSProperties } from 'react'

export type Point2D = {
  x: number
  y: number
}

export type Segment2D = {
  start: Point2D
  end: Point2D
}

/** Drawing surface shared by the Physics Lesson 1 lab figures. */
export const LAB_SURFACE = { width: 480, height: 300 } as const

function clampTo(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Keeps a label inside the drawing surface, with room for the glyphs. */
export function clampToSurface(point: Point2D, margin = 10): Point2D {
  return {
    x: Number(clampTo(point.x, margin, LAB_SURFACE.width - margin).toFixed(2)),
    y: Number(clampTo(point.y, margin + 4, LAB_SURFACE.height - margin).toFixed(2)),
  }
}

/**
 * Position for a vector label, clear of its own arrowhead.
 *
 * These labels live inside an Arabic RTL page, so their *anchor* must not be
 * direction-dependent: every vector label is drawn with `text-anchor: middle`
 * and centred on the returned point. Under the SVG default (`start`) the same
 * coordinate resolves to the left edge in LTR and the right edge in RTL, which
 * is how a label ends up beside or around its shaft instead of beside the
 * arrowhead.
 *
 * Placement is geometric rather than bidi-dependent. The default `auto` side
 * offsets the label along the normal of the shaft (`dy, -dx`), which is the
 * "reading" side — straight above a horizontal vector, and beside a vertical
 * one — so the label stays `gap` px clear of the shaft at every angle. Because
 * the normal is derived from the *drawing* coordinates only, the result is
 * identical in an RTL and an LTR document. Callers may override the side for a
 * specific figure (see ForceComponentsLab's on-axis component).
 */
export type VectorLabelSide = 'auto' | 'above' | 'above-left' | 'above-right' | 'below' | 'left' | 'right'

export function vectorLabelPoint(
  origin: Point2D,
  anchor: Point2D,
  options: { gap?: number; side?: VectorLabelSide } = {},
): Point2D {
  const gap = options.gap ?? 11
  const dx = anchor.x - origin.x
  const dy = anchor.y - origin.y
  const length = Math.hypot(dx, dy) || 1

  switch (options.side ?? 'auto') {
    case 'above':
      return clampToSurface({ x: anchor.x, y: anchor.y - gap })
    case 'above-left':
      return clampToSurface({ x: anchor.x - gap, y: anchor.y - gap })
    case 'above-right':
      return clampToSurface({ x: anchor.x + gap, y: anchor.y - gap })
    case 'below':
      return clampToSurface({ x: anchor.x, y: anchor.y + gap })
    case 'left':
      return clampToSurface({ x: anchor.x - gap, y: anchor.y })
    case 'right':
      return clampToSurface({ x: anchor.x + gap, y: anchor.y })
    default:
      break
  }

  // Counter-clockwise normal of the shaft: above a rightward vector, beside a
  // vertical one. Always on the same side of the drawing, never of the text.
  const nx = dy / length
  const ny = -dx / length
  return clampToSurface({ x: anchor.x + nx * gap, y: anchor.y + ny * gap })
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
