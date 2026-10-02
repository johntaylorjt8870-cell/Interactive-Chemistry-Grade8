import { KATEX_DIGIT_WIDTH, KATEX_MATH_ITALIC, KATEX_PRIME_WIDTH } from './katexMetrics'

/**
 * Geometry helpers for vector diagrams (SVG).
 *
 * All angles are in degrees with the mathematical orientation (counter-
 * clockwise from the +x axis). SVG's y axis points down, so every helper that
 * returns screen coordinates flips y internally — callers never negate it.
 */

export type Point = { x: number; y: number }

const rad = (degrees: number) => (degrees * Math.PI) / 180
const fmt = (value: number) => Number(value.toFixed(2))

/** Screen point at distance `r` and direction `deg` from `origin`. */
export function polar(origin: Point, r: number, deg: number): Point {
  return { x: origin.x + r * Math.cos(rad(deg)), y: origin.y - r * Math.sin(rad(deg)) }
}

/** Distance between two points. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Point on the segment `a→b` at distance `d` from `a` (clamped to the segment). */
export function pointAlong(a: Point, b: Point, d: number): Point {
  const length = distance(a, b)
  if (length === 0) return { ...a }
  const t = Math.min(Math.max(d / length, 0), 1)
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/** Direction (degrees, mathematical orientation) of the segment `a→b`. */
export function directionOf(a: Point, b: Point): number {
  return (Math.atan2(a.y - b.y, b.x - a.x) * 180) / Math.PI
}

/**
 * SVG path of a circular arc around `centre`, from direction `fromDeg` to
 * `toDeg`, drawn counter-clockwise on screen (the short way when the span is
 * under 180°).
 */
export function arcPath(centre: Point, r: number, fromDeg: number, toDeg: number): string {
  const span = (((toDeg - fromDeg) % 360) + 360) % 360
  const start = polar(centre, r, fromDeg)
  const end = polar(centre, r, fromDeg + span)
  const large = span > 180 ? 1 : 0
  return `M ${fmt(start.x)} ${fmt(start.y)} A ${fmt(r)} ${fmt(r)} 0 ${large} 0 ${fmt(end.x)} ${fmt(end.y)}`
}

/** Direction of the bisector of two directions (used to place an angle label). */
export function bisector(fromDeg: number, toDeg: number): number {
  const span = (((toDeg - fromDeg) % 360) + 360) % 360
  return fromDeg + span / 2
}

/**
 * The little square that marks a right angle at `vertex`, between the
 * directions `dir1Deg` and `dir2Deg` (which should differ by 90°).
 */
export function rightAnglePath(vertex: Point, dir1Deg: number, dir2Deg: number, size = 10): string {
  const p1 = polar(vertex, size, dir1Deg)
  const p2 = polar(vertex, size, dir2Deg)
  const corner = { x: p1.x + p2.x - vertex.x, y: p1.y + p2.y - vertex.y }
  return `M ${fmt(p1.x)} ${fmt(p1.y)} L ${fmt(corner.x)} ${fmt(corner.y)} L ${fmt(p2.x)} ${fmt(p2.y)}`
}

/**
 * The four corners of the parallelogram O, P1, M, P2 built on two vectors
 * starting at `origin` (screen points `p1` and `p2` are the tips).
 */
export function parallelogramCorners(origin: Point, p1: Point, p2: Point) {
  const m = { x: p1.x + p2.x - origin.x, y: p1.y + p2.y - origin.y }
  return { o: origin, p1, m, p2 }
}

/** Clip the infinite line through `through` with direction `deg` to a rectangle. */
export function lineThroughRect(through: Point, deg: number, rect: { x: number; y: number; width: number; height: number }) {
  const dx = Math.cos(rad(deg))
  const dy = -Math.sin(rad(deg))
  const ts: number[] = []
  const push = (t: number) => {
    const x = through.x + dx * t
    const y = through.y + dy * t
    if (x >= rect.x - 0.01 && x <= rect.x + rect.width + 0.01 && y >= rect.y - 0.01 && y <= rect.y + rect.height + 0.01) ts.push(t)
  }
  if (Math.abs(dx) > 1e-9) {
    push((rect.x - through.x) / dx)
    push((rect.x + rect.width - through.x) / dx)
  }
  if (Math.abs(dy) > 1e-9) {
    push((rect.y - through.y) / dy)
    push((rect.y + rect.height - through.y) / dy)
  }
  const tMin = Math.min(...ts)
  const tMax = Math.max(...ts)
  return {
    a: { x: through.x + dx * tMin, y: through.y + dy * tMin },
    b: { x: through.x + dx * tMax, y: through.y + dy * tMax },
  }
}

/* ============================================================================
   Vector label geometry (the arrow accent over a symbol such as F₁⃗, w⃗, OM⃗)
   ----------------------------------------------------------------------------
   KaTeX positions `\vec` / `\overrightarrow` from the glyph metrics of its own
   fonts. The same metrics place the accent of a label drawn inside an SVG, so
   an arrow in a diagram sits over its symbol exactly like the arrow in prose
   — without measuring text in the browser and without any pixel offsets
   tuned by eye. The label is laid out left to right from x = 0 on the text
   baseline (y = 0, negative y is up); anchoring is applied by the caller.
   ========================================================================= */

export type VectorLabelGeometry = {
  fontSize: number
  /** Advance width of the symbol letters. */
  symbolWidth: number
  /** Left edge of the subscript (if any) and its font size and vertical shift. */
  sub: { x: number; y: number; fontSize: number; width: number } | null
  prime: { x: number } | null
  /** The arrow accent: shaft from `x1` to the base of the head, head tip at `x2`. */
  accent: { x1: number; x2: number; y: number; headLength: number; headHalfWidth: number }
  /** Total laid-out width (symbol + subscript + prime, or the accent when wider). */
  width: number
  /** Height above the baseline occupied by the label (symbol + accent). */
  ascent: number
}

const FALLBACK_LETTER = { height: 0.68, width: 0.65, skew: 0.08, italic: 0 }

function scriptWidth(text: string): number {
  return [...text].reduce((sum, ch) => {
    if (/\d/.test(ch)) return sum + KATEX_DIGIT_WIDTH
    return sum + (KATEX_MATH_ITALIC[ch]?.width ?? FALLBACK_LETTER.width)
  }, 0)
}

export function vectorLabelGeometry(
  symbol: string,
  options: { subscript?: string; prime?: boolean; fontSize?: number } = {},
): VectorLabelGeometry {
  const fontSize = options.fontSize ?? 17
  const letters = [...symbol]
  const metrics = letters.map((ch) => KATEX_MATH_ITALIC[ch] ?? FALLBACK_LETTER)

  const symbolWidth = metrics.reduce((sum, m) => sum + m.width, 0) * fontSize
  const capHeight = Math.max(...metrics.map((m) => m.height)) * fontSize
  const lastSkew = (metrics[metrics.length - 1]?.skew ?? FALLBACK_LETTER.skew) * fontSize

  // Accent: one letter → an arrow about as wide as the letter; several
  // letters (OM⃗) → one arrow spanning all of them, like \overrightarrow.
  const single = letters.length === 1
  const accentLength = single ? Math.max(0.52 * fontSize, symbolWidth * 0.96) : symbolWidth + 0.04 * fontSize
  const centre = symbolWidth / 2 + (single ? lastSkew : lastSkew * 0.4)
  const accentY = -(capHeight + 0.22 * fontSize)
  const headLength = 0.3 * fontSize
  const headHalfWidth = 0.115 * fontSize

  const subFontSize = fontSize * 0.7
  const subWidth = options.subscript ? scriptWidth(options.subscript) * subFontSize : 0
  const sub = options.subscript
    ? { x: symbolWidth + 0.03 * fontSize, y: 0.2 * fontSize, fontSize: subFontSize, width: subWidth }
    : null

  const primeStart = sub ? sub.x + sub.width + 0.03 * fontSize : symbolWidth + 0.03 * fontSize
  const prime = options.prime ? { x: primeStart } : null
  const primeEnd = prime ? prime.x + KATEX_PRIME_WIDTH * fontSize : 0

  const accent = { x1: centre - accentLength / 2, x2: centre + accentLength / 2, y: accentY, headLength, headHalfWidth }
  const right = Math.max(accent.x2, symbolWidth, sub ? sub.x + sub.width : 0, primeEnd)
  const left = Math.min(0, accent.x1)

  return {
    fontSize,
    symbolWidth,
    sub,
    prime,
    accent,
    width: right - left,
    ascent: -accentY + headHalfWidth,
  }
}

/** SVG path of the arrowhead of a label accent (a filled triangle). */
export function accentHeadPath(accent: VectorLabelGeometry['accent'], offsetX = 0): string {
  const { x2, y, headLength, headHalfWidth } = accent
  const tip = x2 + offsetX
  const base = tip - headLength
  return `M ${fmt(tip)} ${fmt(y)} L ${fmt(base)} ${fmt(y - headHalfWidth)} L ${fmt(base)} ${fmt(y + headHalfWidth)} Z`
}
