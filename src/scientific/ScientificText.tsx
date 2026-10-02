import type { CSSProperties, ElementType, ReactNode } from 'react'
import { splitScientificRuns } from '@/utils/scientificText'
import { ElectronConfiguration } from './ElectronConfiguration'
import { VectorNotation, splitVectorRuns } from './VectorNotation'

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
        // Physics vectors (`F₁⃗`, `OM⃗`): the printed combining arrow is not a
        // glyph the platform fonts carry, so the arrow is drawn structurally.
        // The whole run stays ONE isolate, so a mixed run such as `F⃗ = 100 N`
        // can never be visually reordered by the surrounding Arabic.
        const pieces = splitVectorRuns(run.value)
        if (pieces.length === 1 && pieces[0]!.kind === 'text') {
          return (
            <Sci key={index} variant={scienceVariant}>
              {run.value}
            </Sci>
          )
        }
        return (
          <Sci key={index} variant={scienceVariant}>
            {pieces.map((piece, pieceIndex) =>
              piece.kind === 'vector' ? (
                <VectorNotation
                  key={pieceIndex}
                  symbol={piece.vector.symbol}
                  subscript={piece.vector.subscript}
                  prime={piece.vector.prime}
                  tone={piece.vector.tone}
                />
              ) : (
                <span key={pieceIndex}>{piece.value}</span>
              ),
            )}
          </Sci>
        )
      })}
    </Component>
  )
}
