import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Sci } from './ScientificText'

export type MathFormulaProps = {
  /** TeX source. Fractions, roots, exponents and signs are preserved exactly. */
  tex: string
  /** `inline` flows with prose; `block` centres a display equation. */
  display?: 'inline' | 'block'
  className?: string
  /** Fallback text announced by assistive technology; defaults to the TeX. */
  label?: string
}

type Rendered = { html: string; failed: false } | { html: string; failed: true }

/**
 * Renders mathematical content with KaTeX.
 *
 * KaTeX output is HTML, so the result is always wrapped in an LTR isolated
 * element: in an RTL document a display fraction would otherwise inherit the
 * paragraph direction. Rendering errors never break the page — the raw TeX is
 * shown isolated so the mistake is visible and fixable rather than silent.
 */
export function MathFormula({ tex, display = 'inline', className, label }: MathFormulaProps) {
  const rendered = useMemo<Rendered>(() => {
    try {
      return {
        html: katex.renderToString(tex, {
          displayMode: display === 'block',
          throwOnError: true,
          strict: 'warn',
          trust: false,
          output: 'htmlAndMathml',
        }),
        failed: false,
      }
    } catch {
      return { html: '', failed: true }
    }
  }, [tex, display])

  const classes = [
    'math-formula',
    display === 'block' ? 'math-formula--block' : 'math-formula--inline',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (rendered.failed) {
    return (
      <span className={`${classes} math-formula--invalid`} data-math-error="true" title={label ?? tex}>
        <Sci variant="textual">{tex}</Sci>
      </span>
    )
  }

  return (
    <span
      className={classes}
      dir="ltr"
      data-math={display}
      {...(label ? { role: 'math', 'aria-label': label } : {})}
      dangerouslySetInnerHTML={{ __html: rendered.html }}
    />
  )
}

export type EquationRowProps = {
  /** Ordered TeX fragments joined by relation/operator glyphs. */
  parts: Array<{ tex: string } | { symbol: string }>
  display?: 'inline' | 'block'
  caption?: string
}

/** A relation chain such as `n = m / M` that stays LTR as one unit. */
export function EquationRow({ parts, display = 'block', caption }: EquationRowProps) {
  return (
    <span className={['equation-row', `equation-row--${display}`].join(' ')} dir="ltr">
      {parts.map((part, index) =>
        'symbol' in part ? (
          <span key={index} className="equation-row__symbol" aria-hidden="true">
            {part.symbol}
          </span>
        ) : (
          <MathFormula key={index} tex={part.tex} display="inline" />
        ),
      )}
      {caption ? <span className="visually-hidden">{caption}</span> : null}
    </span>
  )
}
