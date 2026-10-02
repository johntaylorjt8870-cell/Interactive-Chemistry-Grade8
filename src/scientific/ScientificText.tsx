import { Fragment } from 'react'
import type { CSSProperties, ElementType, ReactNode } from 'react'
import { splitScientificRuns, splitVectorNotation } from '@/utils/scientificText'
import type { VectorSegment } from '@/utils/scientificText'
import { ElectronConfiguration } from './ElectronConfiguration'
import { VectorNotation } from './VectorNotation'

/* ============================================================================
   ScientificText — the bidi boundary of the whole platform.
   Arabic prose stays RTL; scientific runs are lifted into their own
   `direction: ltr; unicode-bidi: isolate` elements so the browser's bidi
   algorithm can never reorder `5 kg` into `kg 5` or split `9.8 m/s²`.
   ========================================================================= */

export type SciVariant = 'mono' | 'textual' | 'plain'

type SciOwnProps<T extends ElementType> = {
  children: ReactNode
  /**
   * `mono`    — expressions, units and symbols (monospace, tabular)
   * `textual` — Latin words and names (keeps the text typeface)
   * `plain`   — isolated only; inherits the surrounding typeface
   */
  variant?: SciVariant
  as?: T
  className?: string
  style?: CSSProperties
  /** Optional accessible label, e.g. when the visual form is symbolic. */
  label?: string
}

export type SciProps<T extends ElementType = 'span'> = SciOwnProps<T>

/**
 * Explicitly isolates a scientific run from the surrounding RTL flow.
 * Prefer this component over hand-written `dir` attributes so isolation is
 * applied consistently and is testable.
 */
export function Sci<T extends ElementType = 'span'>({
  children,
  variant = 'mono',
  as,
  className,
  style,
  label,
}: SciProps<T>) {
  const Component = (as ?? 'span') as ElementType
  const classes = ['sci', variant !== 'mono' && variant !== 'plain' ? `sci--${variant}` : null, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      dir="ltr"
      className={classes}
      style={style}
      data-sci="isolated"
      {...(label ? { 'aria-label': label } : {})}
    >
      {children}
    </Component>
  )
}

export type ScriptProps = {
  children: ReactNode
  className?: string
  title?: string
}

/** Real superscript markup with a stable baseline, sized from design tokens. */
export function SciSup({ children, className, title }: ScriptProps) {
  return (
    <sup className={['sci-sup', className].filter(Boolean).join(' ')} title={title}>
      {children}
    </sup>
  )
}

/** Real subscript markup used for chemical indices and variable indices. */
export function SciSub({ children, className, title }: ScriptProps) {
  return (
    <sub className={['sci-sub', className].filter(Boolean).join(' ')} title={title}>
      {children}
    </sub>
  )
}

/**
 * A science run that contains vector symbols (F₁, w, OM — written in the source
 * with the combining arrow U+20D7). The arrow can never be displayed reliably as
 * a character, so each symbol becomes a <VectorNotation />.
 *
 * Vectors are promoted *inside* the run rather than by splitting the prose on
 * them: `F = F₁ + F₂` with arrows is still one left-to-right unit, and cutting it
 * into separate isolates would let the RTL paragraph reorder its pieces.
 */
function renderVectorRun(segments: VectorSegment[], key: number, variant: SciVariant) {
  const parts = segments.map((segment, position) =>
    segment.kind === 'vector' ? (
      <VectorNotation
        key={position}
        symbol={segment.vector.symbol}
        subscript={segment.vector.subscript}
        primes={segment.vector.primes}
      />
    ) : (
      segment.value
    ),
  )

  // A run that is nothing but one vector symbol is already an isolate.
  if (segments.length === 1) return <Fragment key={key}>{parts}</Fragment>

  return (
    <Sci key={key} variant={variant}>
      {parts}
    </Sci>
  )
}

export type ScientificTextProps<T extends ElementType = 'span'> = {
  /** Mixed Arabic + scientific content, e.g. `الكتلة 5 kg تماماً`. */
  children: string
  as?: T
  className?: string
  /** When false the string is rendered untouched (pure Arabic prose). */
  autoIsolate?: boolean
  /** Variant applied to automatically detected scientific runs. */
  scienceVariant?: SciVariant
}

/**
 * Renders mixed prose so that every scientific run is isolated automatically.
 * Arabic text is never transformed — only Latin/technical runs are wrapped.
 */
export function ScientificText<T extends ElementType = 'span'>({
  children,
  as,
  className,
  autoIsolate = true,
  scienceVariant = 'mono',
}: ScientificTextProps<T>) {
  const Component = (as ?? 'span') as ElementType

  if (!autoIsolate) {
    return <Component className={className}>{children}</Component>
  }

  const runs = splitScientificRuns(children)

  return (
    <Component className={className}>
      {runs.map((run, index) => {
        if (run.kind !== 'science') return <span key={index}>{run.value}</span>
        // Electron configurations get one structured isolate instead of a
        // chain of separate runs the RTL paragraph could reorder.
        if (run.notation === 'electron-configuration') {
          return <ElectronConfiguration key={index} value={run.value} />
        }
        const segments = splitVectorNotation(run.value)
        if (segments.some((segment) => segment.kind === 'vector')) {
          return renderVectorRun(segments, index, scienceVariant)
        }
        return (
          <Sci key={index} variant={scienceVariant}>
            {run.value}
          </Sci>
        )
      })}
    </Component>
  )
}
