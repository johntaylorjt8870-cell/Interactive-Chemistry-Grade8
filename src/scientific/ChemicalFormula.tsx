import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { SciSub, SciSup } from './ScientificText'
import { parseFormula, type FormulaNode } from '@/utils/scientificText'

export type ChemicalFormulaSize = 'sm' | 'md' | 'lg'

export type ChemicalFormulaProps = {
  /**
   * Formula source in plain text, e.g. `H2O`, `CaCO3`, `Ca(OH)2`,
   * `[Cu(NH3)4]2+`, `CuSO4.5H2O`, `SO4^2-`.
   */
  formula: string
  size?: ChemicalFormulaSize
  className?: string
  /** Spoken description; when omitted the formula text is used as-is. */
  label?: string
  /** Trim the surrounding whitespace of a chain such as `H2 + O2 -> H2O`. */
  display?: 'inline' | 'block'
}

function renderNodes(nodes: FormulaNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'element':
        return (
          <Fragment key={index}>
            <span className="chem-formula__element">{node.symbol}</span>
            {node.subscript ? <SciSub>{node.subscript}</SciSub> : null}
          </Fragment>
        )
      case 'group':
        return (
          <Fragment key={index}>
            <span className="chem-formula__group">
              <span className="chem-formula__paren">(</span>
              {renderNodes(node.nodes)}
              <span className="chem-formula__paren">)</span>
            </span>
            {node.subscript ? <SciSub>{node.subscript}</SciSub> : null}
            {node.charge ? (
              <SciSup className="chem-formula__charge">
                <span className="chem-formula__charge-magnitude">{node.charge.magnitude}</span>
                <span className="chem-formula__charge-sign">
                  {node.charge.sign === '+' ? '+' : '\u2212'}
                </span>
              </SciSup>
            ) : null}
          </Fragment>
        )
      case 'charge':
        return (
          <SciSup key={index} className="chem-formula__charge">
            <span className="chem-formula__charge-magnitude">{node.magnitude}</span>
            <span className="chem-formula__charge-sign">{node.sign === '+' ? '+' : '\u2212'}</span>
          </SciSup>
        )
      case 'literal':
        return (
          <span key={index} className="chem-formula__literal">
            {node.value}
          </span>
        )
    }
  })
}

/**
 * Renders chemical formulae with real subscript/superscript DOM elements.
 *
 * Subscripts are never simulated with spaces or Unicode look-alikes: they are
 * `<sub>` elements, so the notation stays correct at any font size, is copied
 * correctly, and is exposed to assistive technology in reading order.
 */
export function ChemicalFormula({
  formula,
  size = 'md',
  className,
  label,
  display = 'inline',
}: ChemicalFormulaProps) {
  const nodes = parseFormula(formula)

  return (
    <span
      className={[
        'chem-formula',
        `chem-formula--${size}`,
        display === 'block' ? 'chem-formula--block' : null,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      dir="ltr"
      data-formula={formula}
      role="math"
      aria-label={label ?? formula}
    >
      {renderNodes(nodes)}
    </span>
  )
}

export type ChemicalEquationProps = {
  /** Reactant side, e.g. `['CaCO3']` or `['2H2', 'O2']`. */
  reactants: string[]
  /** Product side, e.g. `['CaO', 'CO2']`. */
  products: string[]
  /** Arrow style: `->` (reaction) or `<=>` (equilibrium). */
  arrow?: 'forward' | 'equilibrium'
  /** Optional condition written above the arrow, e.g. heat. */
  condition?: string
  className?: string
  label?: string
}

/**
 * Renders a balanced equation as an LTR chain: reactants → products.
 * The whole chain is isolated so it never reorders inside Arabic prose.
 */
export function ChemicalEquation({
  reactants,
  products,
  arrow = 'forward',
  condition,
  className,
  label,
}: ChemicalEquationProps) {
  const glyph = arrow === 'equilibrium' ? '⇌' : '→'
  const plainText = `${reactants.join(' + ')} ${glyph} ${products.join(' + ')}`

  return (
    <span
      className={['chem-equation', className].filter(Boolean).join(' ')}
      dir="ltr"
      role="math"
      aria-label={label ?? plainText}
      data-equation={plainText}
    >
      {reactants.map((species, index) => (
        <Fragment key={`r-${index}`}>
          {index > 0 ? <span className="chem-equation__operator">+</span> : null}
          <ChemicalFormula formula={species} />
        </Fragment>
      ))}
      <span className="chem-equation__arrow">
        {condition ? <span className="chem-equation__condition rtl">{condition}</span> : null}
        <span aria-hidden="true">{glyph}</span>
      </span>
      {products.map((species, index) => (
        <Fragment key={`p-${index}`}>
          {index > 0 ? <span className="chem-equation__operator">+</span> : null}
          <ChemicalFormula formula={species} />
        </Fragment>
      ))}
    </span>
  )
}
