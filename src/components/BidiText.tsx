import type { ElementType, ReactNode } from 'react'

/* ============================================================================
   Bidi runs — the UI-level counterpart of <Sci />.

   <Sci /> isolates a *scientific* run inside Arabic prose. These two components
   isolate a *UI* run whose content mixes Arabic with digits, Latin terms or
   scientific notation — counters, ranges, scores, progress labels.

   Why an explicit run instead of relying on the parent: an inline element that
   only inherits `direction` from the document still takes part in the parent's
   bidi algorithm and can be reordered by it, and a run placed inside an LTR
   context (a solution card, an input row, an isolated equation) inherits the
   WRONG direction while looking correct in isolation. `direction` plus
   `unicode-bidi: isolate` makes the run a self-contained paragraph fragment:
   its internal order is fixed by its own content, and the surrounding flow
   treats it as one neutral object.

   Use <RtlRun /> for Arabic UI text (`الخطوة 3 من 27`) and <LtrRun /> for
   scientific UI text (`18–23`, `6.02×10²³ mol⁻¹`).
   ========================================================================= */

export type BidiRunProps<T extends ElementType = 'span'> = {
  children: ReactNode
  /** Rendered element; defaults to `span` so the run stays inline-safe. */
  as?: T
  className?: string
  /** Accessible label, when the visual form is symbolic. */
  label?: string
}

export type RtlRunProps<T extends ElementType = 'span'> = BidiRunProps<T>
export type LtrRunProps<T extends ElementType = 'span'> = BidiRunProps<T>

/**
 * Arabic-first run: RTL base direction, isolated from the surrounding flow.
 * Digits and Latin words inside keep their own left-to-right order, so
 * `الخطوة 3 من 27` never becomes `27 من 3`.
 */
export function RtlRun<T extends ElementType = 'span'>({
  children,
  as,
  className,
  label,
}: RtlRunProps<T>) {
  const Component = (as ?? 'span') as ElementType
  return (
    <Component
      dir="rtl"
      className={['rtl-run', className].filter(Boolean).join(' ')}
      data-bidi="rtl-isolate"
      {...(label ? { 'aria-label': label } : {})}
    >
      {children}
    </Component>
  )
}

/**
 * Scientific-first run: LTR base direction, isolated from the surrounding flow.
 * Used for values that must read left to right inside an Arabic interface.
 */
export function LtrRun<T extends ElementType = 'span'>({
  children,
  as,
  className,
  label,
}: LtrRunProps<T>) {
  const Component = (as ?? 'span') as ElementType
  return (
    <Component
      dir="ltr"
      className={['ltr-run', className].filter(Boolean).join(' ')}
      data-bidi="ltr-isolate"
      {...(label ? { 'aria-label': label } : {})}
    >
      {children}
    </Component>
  )
}
