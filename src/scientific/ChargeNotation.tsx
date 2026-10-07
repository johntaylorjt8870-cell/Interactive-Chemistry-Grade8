import { SciSup } from './ScientificText'
import { ChemicalFormula } from './ChemicalFormula'
import { parseCompactCharge } from '@/utils/scientificText'

export type ChargeNotationSize = 'sm' | 'md' | 'lg'

export type ChargeNotationProps = {
  /**
   * The token exactly as authored, e.g. `e⁻`, `2e⁻`, `Cl⁻`, `Na⁺`, `Ca²⁺`,
   * `O²⁻`, `Al³⁺`, `SO₄²⁻`. The characters are never re-spelled or reordered.
   */
  source: string
  /** Type scale for block contexts. Inline prose inherits its size. */
  size?: ChargeNotationSize
  className?: string
  /** Accessible description; defaults to the source spelling. */
  label?: string
}

/**
 * A charge-bearing species whose charge is a REAL superscript (`e⁻`, `Ca²⁺`).
 *
 * Why this component exists: a compact token such as `Ca²⁺` carries its charge
 * in Unicode superscript glyphs. Rendered as plain text those glyphs sit on the
 * baseline, and — worse — the sign is a separate bidi character that an RTL
 * paragraph may place away from the symbol it belongs to (`⁺Ca`). Here:
 *
 *  - the whole species is ONE `dir="ltr"` isolate, so the RTL flow can never
 *    reorder the coefficient, the body and the charge relative to each other;
 *  - the charge is emitted as `<sup>` markup (`SciSup`) using the same basis
 *    glyphs as `IonNotation`, so `e⁻`, `Cl⁻` and `Al³⁺` are raised by CSS and
 *    not by look-alike characters;
 *  - the body is rendered through `ChemicalFormula` when it is an element
 *    formula, so subscripts inside `SO₄²⁻` stay real `<sub>` elements;
 *  - `e⁻` is recognised explicitly: an electron is a species with a charge, not
 *    a Latin letter followed by a loose minus sign.
 */
export function ChargeNotation({
  source,
  size,
  className,
  label,
}: ChargeNotationProps) {
  const parsed = parseCompactCharge(source)

  // Defensive: a token that is not a compact charge is still isolated as one
  // LTR run rather than being split or transformed.
  if (!parsed) {
    return (
      <span
        className={['charge-notation', size ? `charge-notation--${size}` : null, className]
          .filter(Boolean)
          .join(' ')}
        dir="ltr"
        data-sci="isolated"
        role="math"
        aria-label={label ?? source}
      >
        {source}
      </span>
    )
  }

  const classes = [
    'charge-notation',
    size ? `charge-notation--${size}` : null,
    parsed.formula === null ? 'charge-notation--bare' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={classes}
      dir="ltr"
      data-sci="isolated"
      data-charge-notation={source}
      role="math"
      aria-label={label ?? source}
    >
      {parsed.coefficient ? (
        <span className="charge-notation__coefficient">{parsed.coefficient}</span>
      ) : null}
      <span className="charge-notation__body">
        {parsed.formula ? (
          <ChemicalFormula formula={parsed.formula} size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} />
        ) : (
          parsed.body
        )}
      </span>
      <SciSup className="charge-notation__charge">
        <span className="charge-notation__charge-run" dir="ltr">
          {parsed.magnitude ? (
            <span className="charge-notation__magnitude">{parsed.magnitude}</span>
          ) : null}
          <span className="charge-notation__sign">{parsed.sign === '+' ? '+' : '\u2212'}</span>
        </span>
      </SciSup>
    </span>
  )
}
