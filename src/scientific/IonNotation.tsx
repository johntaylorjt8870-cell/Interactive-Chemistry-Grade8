import { SciSub, SciSup } from './ScientificText'
import { ChemicalFormula } from './ChemicalFormula'
import { normalizeCharge, type Charge } from '@/utils/scientificText'

export type IonNotationStyle = 'superscript' | 'stacked'

export type IonNotationProps = {
  /** Ion body without the charge, e.g. `Na`, `Cl`, `Ca`, `SO4`, `(NH4)`. */
  formula: string
  /**
   * Charge in any conventional spelling: `+`, `-`, `2+`, `2-`, `+2`, `-2`,
   * `²⁺`, `²⁻`. Normalised internally.
   */
  charge: string | number
  /**
   * `superscript` — textbook inline form: SO₄²⁻, Ca²⁺
   * `stacked`     — structural form with the charge raised above the body
   */
  style?: IonNotationStyle
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

/**
 * Renders an ion with chemical conventions preserved:
 *
 *  - the charge magnitude precedes its sign (`Ca²⁺`, `SO₄²⁻`, never `Ca⁺²`),
 *    which is the conventional ionic spelling;
 *  - a *standalone* charge value is rendered sign-first (`−2`, `+2`) by
 *    <ChargeValue /> — the two conventions are intentionally different and
 *    are kept in separate components so neither can leak into the other.
 */
export function IonNotation({
  formula,
  charge,
  style = 'superscript',
  size = 'md',
  className,
  label,
}: IonNotationProps) {
  const parsed: Charge = normalizeCharge(charge)
  const sign = parsed.sign === '+' ? '+' : parsed.sign === '-' ? '\u2212' : ''
  const accessible = label ?? `${formula} ${parsed.display}`

  if (style === 'stacked') {
    return (
      <span
        className={['ion-stacked', `ion-stacked--${size}`, className].filter(Boolean).join(' ')}
        dir="ltr"
        role="math"
        aria-label={accessible}
        data-ion={`${formula}${parsed.display}`}
      >
        <span className="ion-stacked__charge sci" aria-hidden="true">
          <span className="ion-stacked__magnitude">{parsed.magnitude}</span>
          {sign ? <span className="ion-stacked__sign">{sign}</span> : null}
        </span>
        <span className="ion-stacked__body">
          <ChemicalFormula formula={formula} size={size} />
        </span>
      </span>
    )
  }

  return (
    <span
      className={['ion-notation', `ion-notation--${size}`, className].filter(Boolean).join(' ')}
      dir="ltr"
      role="math"
      aria-label={accessible}
      data-ion={`${formula}${parsed.display}`}
    >
      <ChemicalFormula formula={formula} size={size} />
      <SciSup className="ion-notation__charge">
        {parsed.magnitude ? (
          <span className="ion-notation__magnitude">{parsed.magnitude}</span>
        ) : null}
        {sign ? <span className="ion-notation__sign">{sign}</span> : null}
      </SciSup>
    </span>
  )
}

export type ChargeValueProps = {
  /**
   * Standalone charge value: `-2`, `2-`, `+2`, `2`, `^2-` are all accepted and
   * normalised to the sign-first form.
   */
  value: string | number
  /** Render the sign as a raised superscript (as in `q = −2` is not raised). */
  raised?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

/**
 * A charge used as a *value* (electric charge quantity, plate charge, …).
 * The sign is always written first: `−2`, `+2` — never `2−` or `2+`,
 * regardless of the direction of the surrounding text.
 */
export function ChargeValue({ value, raised = false, size = 'md', className, label }: ChargeValueProps) {
  const parsed = normalizeCharge(value)
  const sign = parsed.sign === '+' ? '+' : parsed.sign === '-' ? '\u2212' : ''
  const accessible = label ?? parsed.display

  const content = (
    <>
      {sign ? (
        <span className="charge-value__sign" aria-hidden="true">
          {sign}
        </span>
      ) : null}
      <span className="charge-value__magnitude">{parsed.magnitude}</span>
    </>
  )

  return (
    <span
      className={['charge-value', `charge-value--${size}`, className].filter(Boolean).join(' ')}
      dir="ltr"
      role="math"
      aria-label={accessible}
      data-charge={parsed.display}
    >
      {raised ? (
        <SciSup className="charge-value__raised">{content}</SciSup>
      ) : (
        <span className="sci charge-value__inline">{content}</span>
      )}
    </span>
  )
}

export type SubscriptedIonProps = {
  symbol: string
  index: string | number
  charge?: string | number
  className?: string
}

/** Convenience wrapper for species such as `SO₄²⁻` authored separately. */
export function SubscriptedIon({ symbol, index, charge, className }: SubscriptedIonProps) {
  const parsed = charge === undefined ? null : normalizeCharge(charge)
  return (
    <span className={['ion-notation', className].filter(Boolean).join(' ')} dir="ltr" role="math">
      <span className="chem-formula__element">{symbol}</span>
      <SciSub>{index}</SciSub>
      {parsed ? (
        <SciSup className="ion-notation__charge">
          <span className="ion-notation__magnitude">{parsed.magnitude}</span>
          <span className="ion-notation__sign">
            {parsed.sign === '+' ? '+' : parsed.sign === '-' ? '\u2212' : ''}
          </span>
        </SciSup>
      ) : null}
    </span>
  )
}
