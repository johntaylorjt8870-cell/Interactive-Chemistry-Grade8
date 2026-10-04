import type { CSSProperties, ElementType, ReactNode } from 'react'
import { splitScientificRuns } from '@/utils/scientificText'
import { ElectronConfiguration } from './ElectronConfiguration'

/* ============================================================================
   ScientificText — the bidi boundary of the whole platform.
   Arabic prose stays RTL; scientific runs are lifted into their own
   `direction: ltr; unicode-bidi: isolate` elements so the browser's bidi
   algorithm can never reorder `5 g` into `g 5` or split `6.02×10²³ mol⁻¹`.
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

export type ScientificTextProps<T extends ElementType = 'span'> = {
  /** Mixed Arabic + scientific content, e.g. `كمية المادة 1 mol تماماً`. */
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
        return (
          <Sci key={index} variant={scienceVariant}>
            {run.value}
          </Sci>
        )
      })}
    </Component>
  )
}
