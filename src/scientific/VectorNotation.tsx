export type VectorNotationProps = {
  /** The Latin letters the arrow sits over: `F`, `w`, `OM`. */
  symbol: string
  /** Index shown as a real subscript after the symbol: `1` for F₁. */
  subscript?: string | number
  /** Primes after the symbol; the balancing force F′ has one. */
  primes?: number
  className?: string
  /** Overrides the generated Arabic description for assistive technology. */
  label?: string
}

const PRIME = '\u2032'

/** Spoken form: «متجه F1», «متجه F شرطة» — the name teachers use for F′. */
function describeVector(symbol: string, subscript: string | undefined, primes: number): string {
  const prime = primes === 0 ? '' : primes === 1 ? ' شرطة' : primes === 2 ? ' شرطتان' : ` ${primes} شرطات`
  return `متجه ${symbol}${subscript ?? ''}${prime}`
}

/**
 * A vector symbol — F₁, F₂, w, OM — with a real arrow over the WHOLE symbol.
 *
 * Why this component exists: the textbook source marks a vector with the
 * Unicode combining arrow U+20D7 after the letters. A combining mark attaches
 * to the single glyph before it (after `F₁` that is the subscript, not the
 * `F`), is tiny, and is missing from many fonts — so it can never be displayed
 * reliably. Here the arrow is structure, not a glyph:
 *
 *  - the letters and the arrow are stacked inside one inline-block, so the
 *    arrow is exactly as wide as the symbol it marks (`OM` gets one arrow over
 *    both letters) and the block's baseline is the letters' baseline;
 *  - the subscript is a real `<sub>` and the prime follows the arrow's span,
 *    as in the printed form: arrow over F, index and prime after it;
 *  - the arrow is painted from `currentColor` (see scientific-components.css),
 *    so any surrounding colour — including a semantic force colour — applies
 *    to the symbol and its arrow together.
 *
 * Bidi safety is structural, as for the other notations: the container is a
 * `dir="ltr"` isolate, so surrounding Arabic can neither reorder the symbol
 * nor strand its subscript or prime. No invisible control characters and no
 * pixel offsets are involved.
 */
export function VectorNotation({ symbol, subscript, primes = 0, className, label }: VectorNotationProps) {
  const index = subscript === undefined || subscript === '' ? undefined : String(subscript)
  const primeCount = Number.isFinite(primes) ? Math.max(0, Math.floor(primes)) : 0

  return (
    <span
      className={['vector-notation', className].filter(Boolean).join(' ')}
      dir="ltr"
      data-sci="isolated"
      data-vector={`${symbol}${index ?? ''}${"'".repeat(primeCount)}`}
      role="math"
      aria-label={label ?? describeVector(symbol, index, primeCount)}
    >
      <span className="vector-notation__base" aria-hidden="true">
        <span className="vector-notation__arrow" />
        <span className="vector-notation__symbol">{symbol}</span>
      </span>
      {index ? (
        <sub className="sci-sub vector-notation__subscript" aria-hidden="true">
          {index}
        </sub>
      ) : null}
      {primeCount > 0 ? (
        <span className="vector-notation__prime" aria-hidden="true">
          {PRIME.repeat(primeCount)}
        </span>
      ) : null}
    </span>
  )
}
