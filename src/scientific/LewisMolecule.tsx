import type { ReactNode } from 'react'

export type LewisMoleculeSide = 'top' | 'right' | 'bottom' | 'left'

export type LewisMoleculeAtom = {
  /** Latin element symbol, e.g. `H`, `O`, `N`, `Cl`. */
  symbol: string
  /**
   * Sides carrying one lone (non-bonding) pair each, in the LTR diagram space:
   * `left`/`right` render a vertical pair, `top`/`bottom` a horizontal pair.
   */
  lonePairSides?: LewisMoleculeSide[]
}

export type LewisMoleculeProps = {
  left: LewisMoleculeAtom
  right: LewisMoleculeAtom
  /** Number of shared electron pairs between the two atoms (1, 2 or 3). */
  sharedPairs: 1 | 2 | 3
  /** Render the ball-and-stick model column beside the Lewis column. */
  showModel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Accessible description; a structured one is generated when omitted. */
  label?: string
  caption?: ReactNode
}

const BOND_NAMES: Record<1 | 2 | 3, string> = {
  1: 'رابطة وحيدة',
  2: 'رابطة مضاعفة',
  3: 'رابطة ثلاثية',
}

/**
 * Diatomic molecule exactly as the textbook prints it on page 15:
 * a Lewis dot column and, beside it, the ball-and-stick model column.
 *
 * The Lewis column is a real CSS grid — outer lone pairs, symbol, shared dot
 * block, symbol, outer lone pairs, with bottom lone pairs on their own row —
 * so every electron is an independently addressable element. Shared electrons
 * are printed as one row of two dots per shared pair (2 dots for a single
 * bond, a 2×2 block for a double bond, a 2×3 block for a triple bond), and
 * lone pairs keep the orientation the book uses (vertical on the outer side,
 * horizontal below the symbol). Nothing is simulated with spaces, zero-width
 * characters or text alignment.
 */
export function LewisMolecule({
  left,
  right,
  sharedPairs,
  showModel = true,
  size = 'md',
  className,
  label,
  caption,
}: LewisMoleculeProps) {
  const formula = `${left.symbol}${subscript(2)}`
  const description =
    label ??
    `تمثيل لويس للجزيء ${left.symbol}${right.symbol}: ${sharedPairs} زوج إلكتروني مشترك (${sharedPairs * 2} إلكتروناً)` +
      `؛ أزواج غير مشتركة: ${left.lonePairSides?.length ?? 0} حول ${left.symbol} و${right.lonePairSides?.length ?? 0} حول ${right.symbol}.`

  return (
    <figure className={['lewis-mol', `lewis-mol--${size}`, className].filter(Boolean).join(' ')} data-molecule={formula}>
      <span className="lewis-mol__row" dir="ltr">
        <span className="lewis-mol__lewis" role="img" aria-label={description} data-lewis-molecule={formula}>
          <AtomCell atom={left} side="left" />
          <span className="lewis-mol__shared" data-shared-pairs={sharedPairs} data-shared-electrons={sharedPairs * 2}>
            {Array.from({ length: sharedPairs }, (_unused, pairIndex) => (
              <span className="lewis-mol__shared-pair" data-pair={pairIndex + 1} key={pairIndex}>
                <span className="lewis-mol__dot" data-electron="shared" />
                <span className="lewis-mol__dot" data-electron="shared" />
              </span>
            ))}
          </span>
          <AtomCell atom={right} side="right" />
        </span>
        {showModel ? <BondModel left={left} right={right} sharedPairs={sharedPairs} /> : null}
      </span>
      {caption ? <figcaption className="lewis-mol__caption">{caption}</figcaption> : null}
    </figure>
  )
}

function AtomCell({ atom, side }: { atom: LewisMoleculeAtom; side: 'left' | 'right' }) {
  return (
    <span className="lewis-mol__atom" data-atom={atom.symbol} data-lone-pairs={(atom.lonePairSides ?? []).length} data-outer-side={side}>
      <span className="lewis-mol__atom-grid">
        {renderLone(atom, 'top')}
        {renderLone(atom, 'left')}
        <span className="lewis-mol__symbol" dir="ltr">
          {atom.symbol}
        </span>
        {renderLone(atom, 'right')}
        {renderLone(atom, 'bottom')}
      </span>
    </span>
  )
}

function renderLone(atom: LewisMoleculeAtom, side: LewisMoleculeSide) {
  const has = (atom.lonePairSides ?? []).includes(side)
  if (!has) return <span className={`lewis-mol__slot lewis-mol__slot--${side}`} data-side={side} data-empty="true" />
  return (
    <span className={`lewis-mol__slot lewis-mol__slot--${side}`} data-side={side}>
      <span className="lewis-mol__pair" data-electron="lone-pair" data-side={side}>
        <span className="lewis-mol__dot" data-electron="lone" />
        <span className="lewis-mol__dot" data-electron="lone" />
      </span>
    </span>
  )
}

/** Ball-and-stick model column: spheres, bond lines and non-bonding discs. */
export function BondModel({
  left,
  right,
  sharedPairs,
}: {
  left: LewisMoleculeAtom
  right: LewisMoleculeAtom
  sharedPairs: 1 | 2 | 3
}) {
  const loneLeft = left.lonePairSides?.length ?? 0
  const loneRight = right.lonePairSides?.length ?? 0
  return (
    <span
      className="bond-model"
      dir="ltr"
      data-bond-order={sharedPairs}
      data-bond-name={BOND_NAMES[sharedPairs]}
      role="img"
      aria-label={`نموذج الجزيء: كرة ${left.symbol} وكرة ${right.symbol} بينهما ${BOND_NAMES[sharedPairs]}${loneLeft ? `، وحول كل كرة ${loneLeft} زوج غير مشترك` : ''}.`}
    >
      <ModelAtom symbol={left.symbol} lonePairs={loneLeft} />
      <span className="bond-model__bond" data-order={sharedPairs} aria-hidden="true">
        {Array.from({ length: sharedPairs }, (_unused, index) => (
          <span className="bond-model__bond-line" key={index} />
        ))}
      </span>
      <ModelAtom symbol={right.symbol} lonePairs={loneRight} />
    </span>
  )
}

function ModelAtom({ symbol, lonePairs }: { symbol: string; lonePairs: number }) {
  return (
    <span className="bond-model__atom" data-symbol={symbol}>
      <span className="bond-model__discs" data-place="top">
        {Array.from({ length: lonePairs }, (_unused, index) => (
          <span className="bond-model__disc" key={index} data-electron-pair="lone" aria-hidden="true">
            −
          </span>
        ))}
      </span>
      <span className="bond-model__sphere" dir="ltr">
        {symbol}
      </span>
      <span className="bond-model__discs" data-place="bottom">
        {Array.from({ length: lonePairs }, (_unused, index) => (
          <span className="bond-model__disc" key={index} data-electron-pair="lone" aria-hidden="true">
            −
          </span>
        ))}
      </span>
    </span>
  )
}

function subscript(value: number): string {
  return String(value).replace(/\d/g, (digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)])
}

export const LEWIS_MOLECULE_BOND_NAMES = BOND_NAMES
