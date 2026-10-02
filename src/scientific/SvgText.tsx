import type { ReactNode } from 'react'

/* ============================================================================
   SvgText — direction-safe text for coordinate-positioned SVG diagrams.
   ----------------------------------------------------------------------------
   SVG <text> inherits `direction` from the page. In an Arabic (RTL) page that
   makes `text-anchor: start` mean "the right edge" and reorders `2.4 N` into
   `N 2.4`, which is how diagram labels used to render reversed and clipped.

   `SvgText` therefore sets the direction explicitly and takes a *visual*
   alignment (left / centre / right) which it maps to the right `text-anchor`
   for that direction:

     latin  (digits, symbols, units)   direction: ltr   left → start
     ar     (Arabic words)             direction: rtl   left → end

   Never mix Arabic words and numbers in one SvgText: give the number its own
   latin SvgText. (No Unicode direction marks, no reversed strings, no pixel
   nudges.)
   ========================================================================= */

export type SvgTextAlign = 'left' | 'center' | 'right'

export type SvgTextProps = {
  x: number
  y: number
  children: ReactNode
  /** Visual alignment around `x`: its left edge, centre or right edge. */
  align?: SvgTextAlign
  /** `latin` — numbers, symbols, units (LTR). `ar` — Arabic words (RTL). */
  script?: 'latin' | 'ar'
  className?: string
  fontSize?: number
  fontWeight?: number | string
  /** Paint a board-coloured outline behind the glyphs so they stay legible over lines. */
  halo?: boolean
  /** Optional semantic tone class suffix, e.g. `muted`, `angle`, `accent`. */
  tone?: string
}

/** Maps a visual alignment to the SVG `text-anchor` for a writing direction. */
export function textAnchorFor(align: SvgTextAlign, rtl: boolean): 'start' | 'middle' | 'end' {
  if (align === 'center') return 'middle'
  return (align === 'left') !== rtl ? 'start' : 'end'
}

export function SvgText({
  x,
  y,
  children,
  align = 'center',
  script = 'latin',
  className,
  fontSize,
  fontWeight,
  halo = false,
  tone,
}: SvgTextProps) {
  const rtl = script === 'ar'
  const classes = [
    'svg-text',
    `svg-text--${script}`,
    tone ? `svg-text--${tone}` : null,
    halo ? 'svg-text--halo' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <text
      x={x}
      y={y}
      className={classes}
      textAnchor={textAnchorFor(align, rtl)}
      direction={rtl ? 'rtl' : 'ltr'}
      {...(fontSize !== undefined ? { fontSize } : {})}
      {...(fontWeight !== undefined ? { fontWeight } : {})}
    >
      {children}
    </text>
  )
}

/**
 * Text of a physical quantity for use inside an SVG: `2.4 N`, `60°`, `5 cm`.
 * The number and unit are kept together in the order they are printed; an
 * angle sign is attached to its number (no gap), every other unit follows a
 * normal space.
 */
export function quantityText(value: number | string, unit?: string, digits = 1): string {
  const text = typeof value === 'number' ? String(Number(value.toFixed(digits))) : value
  if (!unit) return text
  return unit === '°' || unit === '′' || unit === '″' ? `${text}${unit}` : `${text} ${unit}`
}
