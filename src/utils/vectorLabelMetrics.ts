/**
 * Geometry of vector labels drawn inside SVG diagrams (w⃗, F₁⃗, F₂⃗, OM⃗ …).
 *
 * Pure and framework-free: the SVG component renders what these functions
 * compute, and the lab layout solver (`labelPlacement.ts`) uses the very same
 * boxes to keep labels off arrows and off each other, so what the tests check
 * is what the browser draws.
 *
 * Why metrics instead of `text-anchor` guesses
 * --------------------------------------------
 * The arrow accent has to sit exactly over the letter. Two things make a
 * guess unreliable in this platform:
 *  1. The page is RTL. In SVG, `text-anchor: start|end` follow the inherited
 *     `direction`, so with an Arabic page `start` anchors the RIGHT edge of the
 *     text. Accent geometry computed as if LTR then lands on the wrong side
 *     (the stray floating arrows seen in a real Chromium run).
 *  2. Fallback serif fonts differ per device.
 * So labels are always laid out in LTR physical coordinates, the symbol is
 * centred (`text-anchor: middle`, symmetric in any direction) and the accent is
 * centred over it using advance widths measured from the bundled KaTeX_Math
 * Bold Italic face (the same glyphs the prose notation uses).
 */

export type LabelAnchor = 'start' | 'middle' | 'end'

export type Box = { left: number; top: number; right: number; bottom: number }

/** Advance widths (em) of the bundled KaTeX_Math Bold Italic face, measured in Chromium. */
const ADVANCE_EM: Readonly<Record<string, number>> = {
  A: 0.869, B: 0.866, C: 0.817, D: 0.938, E: 0.81, F: 0.689, G: 0.887, H: 0.982, I: 0.511, J: 0.631,
  K: 0.971, L: 0.756, M: 1.142, N: 0.95, O: 0.837, P: 0.723, Q: 0.869, R: 0.872, S: 0.693, T: 0.637,
  U: 0.8, V: 0.678, W: 1.093, X: 0.947, Y: 0.675, Z: 0.773,
  a: 0.633, b: 0.521, c: 0.513, d: 0.61, e: 0.554, f: 0.568, g: 0.545, h: 0.668, i: 0.405, j: 0.471,
  k: 0.604, l: 0.348, m: 1.032, n: 0.713, o: 0.585, p: 0.601, q: 0.542, r: 0.529, s: 0.531, t: 0.415,
  u: 0.681, v: 0.567, w: 0.831, x: 0.659, y: 0.59, z: 0.555,
}

/** KaTeX_Main digits (used for subscripts) are all 0.5em wide; the prime is 0.275em. */
const DIGIT_EM = 0.5
const PRIME_EM = 0.275

const CAP_HEIGHT_EM = 0.69
const X_HEIGHT_EM = 0.46
const DESCENDER_EM = 0.21
const DESCENDER_LETTERS = new Set(['g', 'j', 'p', 'q', 'y'])
const ASCENDER_LETTERS = new Set(['b', 'd', 'f', 'h', 'k', 'l', 't', 'i', 'j'])

/** Default label font size in SVG user units (viewBox ≈ 520 wide, shown ≈ 1.6× larger). */
export const VECTOR_LABEL_SIZE = 16

export type VectorLabelSpec = {
  /** Latin symbol letters, e.g. `F`, `w`, `OM`. */
  symbol: string
  /** Subscript as plain digits: `1` → F₁. */
  subscript?: string
  /** Prime mark after the symbol (the equilibrant F⃗′). */
  prime?: boolean
  /** Magnitude line under the symbol, e.g. `4 N`. Always laid out LTR. */
  magnitude?: string
  /** Short Arabic caption set to the right of the symbol (reads first in RTL): «نسخة F₁». */
  prefix?: string
  /**
   * Alignment of the whole label block relative to the origin (x, y):
   * `start` → block begins at x, `end` → block ends at x, `middle` → centred.
   */
  anchor?: LabelAnchor
  size?: number
}

export type VectorLabelLayout = {
  size: number
  anchor: LabelAnchor
  /** Horizontal centre of the symbol, relative to the label origin. */
  cx: number
  symbolWidth: number
  accent: {
    x1: number
    x2: number
    /** Vertical centre of the arrow shaft (negative = above the baseline). */
    y: number
    strokeWidth: number
    headLength: number
    headHalf: number
  }
  sub?: { x: number; y: number; size: number; width: number }
  prime?: { x: number; y: number; size: number }
  magnitude?: { x: number; y: number; size: number; width: number }
  prefix?: { x: number; y: number; size: number; width: number }
  /** Ink box relative to the origin, padded a little so overlaps are conservative. */
  box: Box
}

export type TextFace = 'ui' | 'math' | 'arabic'

/**
 * Advance widths (em) of the fixed Arabic strings drawn inside the figures, measured in
 * Chromium with the bundled Noto Sans Arabic at weight 600. Arabic joins and ligates, so a
 * per-letter average is useless (a measured word ranged 0.44–0.77 em per letter).
 */
const ARABIC_WORD_EM: Readonly<Record<string, number>> = {
  'جسم': 2.31,
  'الأفق': 2.19,
  'لوح الزنابض': 4.97,
  'نسخة': 2.05,
}

/**
 * Width of a one-line label in SVG user units. A browser measurement is not available in
 * the pure layout code (and not in jsdom), so each face has its own model:
 *  - `math`: the exact KaTeX_Math Bold Italic advances used for the symbol labels;
 *  - `arabic`: measured words, otherwise a deliberately generous 0.7 em per letter;
 *  - `ui`: the Latin UI face (digits ≈ 0.62 em), good for `2.4 N` and `60°`.
 * Being too small is the costly error (labels then touch), so unknown text errs wide.
 */
export function estimateTextWidth(text: string, fontSize: number, face: TextFace = 'ui'): number {
  if (face === 'arabic') {
    const known = ARABIC_WORD_EM[text]
    if (known !== undefined) return known * fontSize * 1.04
    let em = 0
    for (const ch of text) em += ch === ' ' ? 0.28 : 0.7
    return em * fontSize
  }
  let em = 0
  for (const ch of text) {
    if (face === 'math') {
      if (ADVANCE_EM[ch] !== undefined) em += ADVANCE_EM[ch]!
      else if (/[₀-₉]/.test(ch)) em += 0.45
      else if (/[0-9]/.test(ch)) em += 0.55
      else if (ch === '°') em += 0.5
      else em += 0.72
      continue
    }
    if (/[0-9]/.test(ch)) em += 0.62
    else if (ch === '.' || ch === ',' || ch === ':' || ch === '′') em += 0.3
    else if (ch === ' ') em += 0.3
    else if (ch === '°') em += 0.52
    else if (/[A-Z]/.test(ch)) em += 0.7
    else if (/[a-z]/.test(ch)) em += 0.58
    else if (/[\u0600-\u06FF]/.test(ch)) em += 0.7
    else em += 0.62
  }
  return em * fontSize
}

function symbolAdvance(symbol: string, size: number): number {
  let em = 0
  for (const letter of symbol) em += ADVANCE_EM[letter] ?? 0.72
  return em * size
}

/** Height of the tallest ink in the symbol, used to lift the accent just above it. */
function symbolInkHeight(symbol: string, size: number): number {
  let em = X_HEIGHT_EM
  for (const letter of symbol) {
    if (/[A-Z]/.test(letter) || ASCENDER_LETTERS.has(letter)) em = Math.max(em, CAP_HEIGHT_EM)
  }
  return em * size
}

function symbolDescent(symbol: string, size: number): number {
  for (const letter of symbol) if (DESCENDER_LETTERS.has(letter)) return DESCENDER_EM * size
  return 0.02 * size
}

/**
 * Lays out one vector label. Everything is relative to the origin (0, 0), which
 * is the baseline point of the block selected by `anchor`.
 */
export function vectorLabelLayout(spec: VectorLabelSpec): VectorLabelLayout {
  const size = spec.size ?? VECTOR_LABEL_SIZE
  const anchor = spec.anchor ?? 'middle'
  const symbolWidth = symbolAdvance(spec.symbol, size)

  const subSize = size * 0.7
  const subWidth = spec.subscript ? [...spec.subscript].length * DIGIT_EM * subSize : 0
  const primeSize = size * 0.8
  const primeWidth = spec.prime ? PRIME_EM * primeSize : 0
  const tail = Math.max(subWidth, primeWidth)
  const symbolBlock = symbolWidth + (tail > 0 ? size * 0.03 + tail : 0)

  const magnitudeSize = size * 0.72
  const magnitudeWidth = spec.magnitude ? estimateTextWidth(spec.magnitude, magnitudeSize) : 0

  const prefixSize = size * 0.68
  const prefixWidth = spec.prefix ? estimateTextWidth(spec.prefix, prefixSize, 'arabic') : 0
  const prefixGap = spec.prefix ? size * 0.3 : 0
  const headBlock = symbolBlock + (spec.prefix ? prefixGap + prefixWidth : 0)

  // Both rows (symbol + caption, magnitude) share the block's anchor edge, so a wide
  // magnitude line can never push the symbol away from its own accent.
  const rowLeft = anchor === 'start' ? 0 : anchor === 'middle' ? -headBlock / 2 : -headBlock

  // Reading order in an Arabic page is right-to-left: the caption comes first
  // (rightmost), the symbol follows it on the left.
  const symbolLeft = rowLeft
  const cx = symbolLeft + symbolWidth / 2

  const strokeWidth = size * 0.115
  const headLength = size * 0.36
  const headHalf = size * 0.17
  const inkHeight = symbolInkHeight(spec.symbol, size)
  const accentY = -(inkHeight + size * 0.15 + strokeWidth / 2)
  const skew = size * 0.05 // italic letters lean right; the arrow follows the ink
  const accentHalf = Math.max(size * 0.3, symbolWidth * 0.5)

  const layout: VectorLabelLayout = {
    size,
    anchor,
    cx,
    symbolWidth,
    accent: {
      x1: cx - accentHalf + skew,
      x2: cx + accentHalf + skew,
      y: accentY,
      strokeWidth,
      headLength,
      headHalf,
    },
    box: { left: 0, top: 0, right: 0, bottom: 0 },
  }

  const tailX = symbolLeft + symbolWidth + size * 0.03
  if (spec.subscript) layout.sub = { x: tailX, y: size * 0.2, size: subSize, width: subWidth }
  if (spec.prime) layout.prime = { x: tailX, y: -size * 0.36, size: primeSize }
  if (spec.prefix) {
    layout.prefix = {
      x: symbolLeft + symbolBlock + prefixGap + prefixWidth / 2,
      y: 0,
      size: prefixSize,
      width: prefixWidth,
    }
  }

  const descent = Math.max(symbolDescent(spec.symbol, size), spec.subscript ? size * 0.2 + subSize * 0.2 : 0)
  let bottom = descent
  if (spec.magnitude) {
    const y = size * 1.05
    // x = 0 for every anchor: the <text> uses the same `text-anchor` as the block.
    layout.magnitude = { x: 0, y, size: magnitudeSize, width: magnitudeWidth }
    bottom = y + magnitudeSize * 0.24
  }

  const top = accentY - Math.max(headHalf, strokeWidth / 2)
  const pad = size * 0.08
  const magnitudeLeft = anchor === 'start' ? 0 : anchor === 'middle' ? -magnitudeWidth / 2 : -magnitudeWidth
  layout.box = {
    left: Math.min(rowLeft, spec.magnitude ? magnitudeLeft : rowLeft) - pad,
    right: Math.max(rowLeft + headBlock, spec.magnitude ? magnitudeLeft + magnitudeWidth : rowLeft + headBlock) + pad,
    top: top - pad,
    bottom: bottom + pad,
  }
  return layout
}

/** Ink box of a label placed with its origin at (x, y). */
export function vectorLabelBox(spec: VectorLabelSpec, x: number, y: number): Box {
  const { box } = vectorLabelLayout(spec)
  return { left: box.left + x, top: box.top + y, right: box.right + x, bottom: box.bottom + y }
}

/** Relative box of a plain, centre-anchored text label whose baseline is at y = 0. */
export function textLabelBox(text: string, size: number, face: TextFace = 'ui'): Box {
  const width = estimateTextWidth(text, size, face)
  const above = face === 'arabic' ? 0.95 : 0.82
  const below = face === 'arabic' ? 0.5 : 0.26
  // italic math letters lean past their advance (M ≈ +1.3 px at 15 px): a little side room
  const side = face === 'math' ? 2.2 : 1.5
  return { left: -width / 2 - side, right: width / 2 + side, top: -size * above, bottom: size * below }
}
