import type { ReactNode } from 'react'

export type BohrAtomProps = {
  /** Latin element symbol, e.g. `Na`, `Cl`. */
  symbol: string
  /** Electron count per shell, innermost first, e.g. `[2, 8, 1]`. */
  shells: number[]
  /** Ionic charge rendered as a structured superscript, e.g. `+`, `2-`. */
  charge?: string
  /** Mark the outermost shell electrons as the valence electrons. */
  highlightValence?: boolean
  /** Label rendered beneath the atom; defaults to the symbol (+ charge). */
  label?: string
  /** Pixel size of the square SVG box. */
  size?: number
  className?: string
}

const SHELL_STEP = 14
const OUTER_RADIUS = 54
const CENTER = 62

/**
 * Bohr shell atom as structured SVG.
 *
 * Every shell is a real circle and every electron a real, individually
 * addressable circle placed by polar coordinates — never a font glyph, never a
 * spaced text run. The whole figure is one LTR isolate; the symbol and charge
 * keep their own text direction inside it.
 */
export function BohrAtom({
  symbol,
  shells,
  charge,
  highlightValence = false,
  label,
  size = 132,
  className,
}: BohrAtomProps) {
  const shellRadii = shells.map((_count, index) => OUTER_RADIUS - (shells.length - 1 - index) * SHELL_STEP)
  const description = `ذرّة أو أيون ${symbol}: ${shells.join('-')} إلكتروناً في السويات${charge ? `، الشحنة ${charge}` : ''}.`

  return (
    <span className={['bohr', className].filter(Boolean).join(' ')} data-bohr={symbol} data-charge={charge ?? '0'}>
      <svg
        viewBox="0 0 124 124"
        width={size}
        height={size}
        role="img"
        aria-label={description}
        focusable="false"
      >
        <circle className="bohr__nucleus" cx={CENTER} cy={CENTER} r={13} />
        {shellRadii.map((radius, shellIndex) => (
          <circle
            key={`shell-${shellIndex}`}
            className="bohr__shell"
            cx={CENTER}
            cy={CENTER}
            r={radius}
            data-shell={shellIndex + 1}
          />
        ))}
        {shells.map((count, shellIndex) =>
          Array.from({ length: count }, (_unused, electronIndex) => {
            const angle = (2 * Math.PI * electronIndex) / count - Math.PI / 2
            const radius = shellRadii[shellIndex]!
            const cx = CENTER + radius * Math.cos(angle)
            const cy = CENTER + radius * Math.sin(angle)
            const isValence = shellIndex === shells.length - 1
            return (
              <circle
                key={`e-${shellIndex}-${electronIndex}`}
                className={[
                  'bohr__electron',
                  isValence && highlightValence ? 'bohr__electron--valence' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                cx={cx.toFixed(2)}
                cy={cy.toFixed(2)}
                r={3.4}
                data-shell={shellIndex + 1}
                data-electron={electronIndex + 1}
              />
            )
          }),
        )}
        {charge ? (
          <text className="bohr__charge" x={104} y={20} textAnchor="middle">
            {chargeMagnitude(charge)}
            {chargeSign(charge)}
          </text>
        ) : null}
      </svg>
      <span className="bohr__label" dir="ltr">
        {label ?? symbol}
        {charge ? (
          <sup className="bohr__label-charge">
            {chargeMagnitude(charge)}
            {chargeSign(charge)}
          </sup>
        ) : null}
      </span>
    </span>
  )
}

function chargeMagnitude(charge: string): string {
  const magnitude = charge.replace(/[^0-9]/g, '')
  return magnitude === '1' ? '' : magnitude
}

function chargeSign(charge: string): string {
  return charge.endsWith('-') ? '\u2212' : '+'
}

export type BohrAtomSummaryProps = {
  symbol: string
  shells: number[]
  caption?: ReactNode
}
