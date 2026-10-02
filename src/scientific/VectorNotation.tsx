import { toSubscript, VECTOR_ARROW, type VectorTone } from '@/utils/scientificText'

export type VectorNotationProps = {
  /** Latin letter(s) the arrow sits above: `F`, `OM`, `w`. */
  symbol: string
  /** Printed index, in plain digits: `1` renders F₁ with a real <sub>. */
  subscript?: string
  /** Prime that closes the symbol, e.g. `'` for F′. */
  prime?: string
  /**
   * Semantic colour. `neutral` (the default) inherits the surrounding text
   * colour; the force tones use the shared `--force-*` tokens, so the same
   * force keeps the same colour in prose and in the labs.
   */
  tone?: VectorTone
  /** The printed source form (`F₁⃗`), used as the accessible label. */
  label?: string
  className?: string
}

/**
 * A printed vector symbol (`F⃗`, `F₁⃗`, `w⃗`, `OM⃗`).
 *
 * The arrow is **drawn**, not typed: the source's combining arrow (U+20D7) is
 * consumed by `parseVectorNotation` and never reaches the DOM as rendered text
 * (it survives only in the accessible label, which spells the printed symbol).
 * Text fonts routinely drop that mark, attach it to the wrong glyph (the
 * subscript in `F₁⃗`) or stretch it across the wrong width, so the notation
 * would silently lose the very thing that makes it a vector. Here the mark is
 * a shaft plus an arrowhead in its own row above the symbol:
 *
 *  - the row is a block-level flex line, so it spans exactly the shrink-to-fit
 *    width of the symbol and the arrowhead keeps its own aspect ratio (no
 *    stretched or clipped head, no fixed pixel geometry, no absolute
 *    positioning);
 *  - the row reserves its space in `em`, so the arrow scales with the font and
 *    never collides with the line above, while the symbol keeps its normal
 *    baseline (the inline-block's last line box is the symbol line);
 *  - the index is a real `<sub class="sci-sub">` (the same subscript contract
 *    as `SciSub`, used directly here so this module never depends back on
 *    `ScientificText`), not a Unicode glyph;
 *  - `dir="ltr"` + `unicode-bidi: isolate` (CSS) keep the whole symbol one
 *    neutral unit inside RTL Arabic, and the prime stays inside that isolate so
 *    it is laid out after the symbol instead of being flipped to its left.
 */
export function VectorNotation({
  symbol,
  subscript,
  prime,
  tone = 'neutral',
  label,
  className,
}: VectorNotationProps) {
  // The accessible name is the printed notation itself: the symbol, its index
  // and the mark that makes it a vector. Generated callers pass the source
  // string, so the two agree character for character.
  const printed = label ?? `${symbol}${subscript ? toSubscript(subscript) : ''}${VECTOR_ARROW}${prime ?? ''}`

  return (
    <span
      className={['sci-vector', tone !== 'neutral' ? `sci-vector--${tone}` : null, className]
        .filter(Boolean)
        .join(' ')}
      dir="ltr"
      data-sci="isolated"
      data-vector={symbol}
      data-tone={tone}
      role="math"
      aria-label={printed}
    >
      <span className="sci-vector__mark" aria-hidden="true">
        <span className="sci-vector__shaft" />
        <svg className="sci-vector__head" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor" />
        </svg>
      </span>
      <span className="sci-vector__symbol">
        {symbol}
        {subscript ? <sub className="sci-sub">{subscript}</sub> : null}
      </span>
      {prime ? <span className="sci-vector__prime">{prime}</span> : null}
    </span>
  )
}
