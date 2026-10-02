import { SciSup } from './ScientificText'
import { formatNumber, type FormatNumberOptions } from '@/utils/format'

export type ScientificValueSize = 'sm' | 'md' | 'lg' | 'xl'

export type ScientificValueProps = {
  /** Numeric or preformatted value. */
  value: number | string
  /**
   * Unit symbol exactly as printed in the source, e.g. `kg`, `°C`, `m/s²`.
   * The unit is placed to the right of the number and never reordered.
   */
  unit?: string
  /** Power of ten, e.g. `23` for 6.02×10²³. */
  exponent?: number | string
  /** Explicit uncertainty, rendered as `± value`. */
  uncertainty?: string | number
  size?: ScientificValueSize
  /** Overrides automatic decimal handling (`{ precision: 2 }`). */
  format?: FormatNumberOptions
  className?: string
  /** Accessible description for symbolic units when needed. */
  label?: string
}

/**
 * A measurement: number, optional uncertainty, optional power of ten, unit.
 *
 * The whole expression is one LTR isolated unit, so in Arabic prose the value
 * always reads `9.8 m/s²` — the unit to the right of the number — and bidi
 * reordering can never produce `kg 5` or `°C 25`.
 */
export function ScientificValue({
  value,
  unit,
  exponent,
  uncertainty,
  size = 'md',
  format,
  className,
  label,
}: ScientificValueProps) {
  const text = formatNumber(value, format)
  const hasExponent = exponent !== undefined && exponent !== ''

  return (
    <span
      className={['sci-value', `sci-value--${size}`, unit === '°' ? 'sci-value--angle' : null, className].filter(Boolean).join(' ')}
      dir="ltr"
      data-sci="isolated"
      data-value={text}
      {...(label ? { 'aria-label': label } : {})}
    >
      <span className="sci-value__number">{text}</span>
      {uncertainty !== undefined && uncertainty !== '' ? (
        <>
          <span className="sci-value__operator" aria-hidden="true">
            ±
          </span>
          <span className="sci-value__uncertainty">{formatNumber(uncertainty)}</span>
        </>
      ) : null}
      {hasExponent ? (
        <span className="sci-value__exponent">
          <span className="sci-value__times" aria-hidden="true">
            ×
          </span>
          <span className="sci-value__base">10</span>
          <SciSup>{String(exponent).replace(/^\+/, '')}</SciSup>
        </span>
      ) : null}
      {unit ? <span className="sci-value__unit">{unit}</span> : null}
    </span>
  )
}

export type ScientificRangeProps = {
  from: number | string
  to: number | string
  unit?: string
  size?: ScientificValueSize
  className?: string
}

/** A measurement range, e.g. `20 – 25 °C` (never reordered in Arabic prose). */
export function ScientificRange({ from, to, unit, size = 'md', className }: ScientificRangeProps) {
  return (
    <span
      className={['sci-range', `sci-value--${size}`, className].filter(Boolean).join(' ')}
      dir="ltr"
      data-sci="isolated"
    >
      <ScientificValue value={from} size={size} />
      <span className="sci-range__dash" aria-hidden="true">
        –
      </span>
      <ScientificValue value={to} size={size} unit={unit} />
    </span>
  )
}
