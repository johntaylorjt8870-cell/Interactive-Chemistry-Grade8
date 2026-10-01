import type { ElementType, ReactNode } from 'react'
import { NuclearNotation, parseCompactNuclearNotation } from './NuclearNotation'
import { ScientificText, type SciVariant } from './ScientificText'

const COMPACT_NUCLEAR_RUN = /[⁰¹²³⁴⁵⁶⁷⁸⁹]*[₀₁₂₃₄₅₆₇₈₉]+[A-Z][a-z]?/gu

export type ScientificNotationTextProps<T extends ElementType = 'span'> = {
  children: string
  as?: T
  className?: string
  scienceVariant?: SciVariant
}

/**
 * Mixed Arabic/scientific prose with compact nuclide runs promoted to the
 * structured NuclearNotation renderer. This keeps `³⁵₁₇Cl` correct in prose,
 * choices, tests, tables and teacher solutions instead of relying on bidi or
 * Unicode glyph positioning.
 */
export function ScientificNotationText<T extends ElementType = 'span'>({
  children,
  as,
  className,
  scienceVariant = 'textual',
}: ScientificNotationTextProps<T>) {
  const Component = (as ?? 'span') as ElementType
  const parts: ReactNode[] = []
  let cursor = 0

  COMPACT_NUCLEAR_RUN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = COMPACT_NUCLEAR_RUN.exec(children)) !== null) {
    if (match.index > cursor) {
      parts.push(
        <ScientificText key={`text-${cursor}`} scienceVariant={scienceVariant}>
          {children.slice(cursor, match.index)}
        </ScientificText>,
      )
    }
    const compact = parseCompactNuclearNotation(match[0])
    if (compact) {
      parts.push(
        <NuclearNotation
          key={`nuclear-${match.index}`}
          symbol={compact.symbol}
          massNumber={compact.massNumber}
          atomicNumber={compact.atomicNumber}
          size="sm"
        />,
      )
    }
    cursor = match.index + match[0].length
  }

  if (cursor < children.length) {
    parts.push(
      <ScientificText key={`text-${cursor}`} scienceVariant={scienceVariant}>
        {children.slice(cursor)}
      </ScientificText>,
    )
  }

  return <Component className={className}>{parts.length > 0 ? parts : <ScientificText scienceVariant={scienceVariant}>{children}</ScientificText>}</Component>
}
