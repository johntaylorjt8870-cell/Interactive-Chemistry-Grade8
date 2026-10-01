import type { ReactNode } from 'react'

export type LewisPosition = 'top' | 'right' | 'bottom' | 'left'
export type LewisSize = 'sm' | 'md' | 'lg'

export type LewisDot = {
  /** Side of the symbol the electron occupies. */
  position: LewisPosition
  /** Distinguishes electrons on the same side (`0` is placed first). */
  slot?: number
  /** Optional bond partner drawn as a line instead of a dot. */
  bond?: string
}

export type LewisStructureProps = {
  /** Central element symbol, e.g. `O`, `N`, `Cl`. */
  symbol: string
  /**
   * Lone pairs per side — each pair is rendered as one unit that contains two
   * independent electron marks.
   */
  pairs?: Partial<Record<LewisPosition, number>>
  /** Individual unpaired electrons, positioned independently. */
  dots?: LewisDot[]
  /** Explicit bond lines from the central symbol, e.g. `{ position: 'right', bond: 'H' }`. */
  bonds?: Array<{ position: LewisPosition; partner: string }>
  size?: LewisSize
  className?: string
  /** Accessible description; a structured fallback is generated when omitted. */
  label?: string
  /** Optional caption rendered beneath the diagram. */
  caption?: ReactNode
}

const POSITION_LABELS: Record<LewisPosition, string> = {
  top: 'أعلى',
  right: 'يمين',
  bottom: 'أسفل',
  left: 'يسار',
}

/**
 * Electron-dot (Lewis) structure.
 *
 * Every electron is an independently rendered element inside a positioned
 * slot: top / right / bottom / left. Nothing is faked with spaces, zero-width
 * characters or text alignment, so the diagram stays correct at any font size
 * and each electron can be addressed individually by future simulations.
 */
export function LewisStructure({
  symbol,
  pairs = {},
  dots = [],
  bonds = [],
  size = 'md',
  className,
  label,
  caption,
}: LewisStructureProps) {
  const dotsByPosition = (position: LewisPosition) =>
    dots
      .filter((dot) => dot.position === position)
      .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))

  const description =
    label ??
    (() => {
      const parts: string[] = [`رمز العنصر ${symbol}`]
      ;(Object.keys(POSITION_LABELS) as LewisPosition[]).forEach((position) => {
        const pairCount = pairs[position] ?? 0
        const dotCount = dotsByPosition(position).length
        if (pairCount === 0 && dotCount === 0) return
        const details = [
          pairCount > 0 ? `${pairCount} زوج إلكتروني` : null,
          dotCount > 0 ? `${dotCount} إلكترون مفرد` : null,
        ]
          .filter(Boolean)
          .join(' و')
        parts.push(`${POSITION_LABELS[position]}: ${details}`)
      })
      bonds.forEach((bond) => parts.push(`رابطة مع ${bond.partner} (${POSITION_LABELS[bond.position]})`))
      return parts.join('، ')
    })()

  const renderSlot = (position: LewisPosition) => {
    const pairCount = pairs[position] ?? 0
    const slotDots = dotsByPosition(position)
    const bond = bonds.find((item) => item.position === position)

    if (pairCount === 0 && slotDots.length === 0 && !bond) {
      // Empty slots are omitted entirely — no placeholder boxes, no filler.
      return null
    }

    return (
      <span className={`lewis__slot lewis__slot--${position}`} data-position={position}>
        {bond ? <span className="lewis__bond" data-partner={bond.partner} aria-hidden="true" /> : null}
        {Array.from({ length: pairCount }, (_unused, pairIndex) => (
          <span key={`pair-${pairIndex}`} className="lewis__pair" data-pair={pairIndex}>
            <span className="lewis__dot" data-electron />
            <span className="lewis__dot" data-electron />
          </span>
        ))}
        {slotDots.map((dot, dotIndex) => (
          <span key={`dot-${dotIndex}`} className="lewis__dot" data-electron data-slot={dot.slot ?? dotIndex} />
        ))}
      </span>
    )
  }

  return (
    <figure className={['lewis', `lewis--${size}`, className].filter(Boolean).join(' ')}>
      <span className="lewis__diagram" dir="ltr" role="img" aria-label={description} data-lewis={symbol}>
        {renderSlot('top')}
        {renderSlot('left')}
        <span className="lewis__symbol">{symbol}</span>
        {renderSlot('right')}
        {renderSlot('bottom')}
      </span>
      {caption ? <figcaption className="lewis__caption">{caption}</figcaption> : null}
    </figure>
  )
}
