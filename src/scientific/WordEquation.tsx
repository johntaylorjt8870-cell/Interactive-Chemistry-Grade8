import { Fragment } from 'react'
import { RtlRun } from '@/components/BidiText'
import { Sci } from './ScientificText'
import { ScientificNotationText } from './ScientificNotationText'
import './word-equation.css'

export type WordEquationProps = {
  /** Printed left-to-right order. Arabic substance names stay RTL within it. */
  reactants: string[]
  products: string[]
  condition?: string
  reactantRoles?: string[]
  productRoles?: string[]
  label?: string
}

/**
 * A word reaction uses the same isolation primitive as symbolic science, but
 * substance NAMES are Arabic runs, not input to a chemical-formula parser.
 * Source blanks, role labels and the condition above the arrow remain intact.
 * The single chain never wraps between an operator and its species; a narrow
 * viewport scrolls this component, not the whole page.
 */
export function WordEquation({ reactants, products, condition, reactantRoles, productRoles, label }: WordEquationProps) {
  const description = label ?? `${reactants.join(' + ')} → ${products.join(' + ')}${condition ? `؛ ${condition}` : ''}`

  function side(species: string[], roles?: string[]) {
    return species.map((name, index) => (
      <Fragment key={`${index}-${name}`}>
        {index > 0 ? <Sci className="word-equation__operator">+</Sci> : null}
        <span className="word-equation__term">
          <RtlRun className="word-equation__name"><ScientificNotationText>{name}</ScientificNotationText></RtlRun>
          {roles?.[index] ? <RtlRun className="word-equation__role">{roles[index]}</RtlRun> : null}
        </span>
      </Fragment>
    ))
  }

  return (
    <>
      <span className="word-equation-scroll" data-word-equation={description} role="group" aria-label={description.replace(/\.{3,}/g, 'فراغ')} tabIndex={0}>
        <Sci className="word-equation" variant="plain" label={description}>
          {side(reactants, reactantRoles)}
          <span className="word-equation__arrow">
            {condition ? <RtlRun className="word-equation__condition">{condition}</RtlRun> : null}
            <Sci label="ينتج" className="word-equation__arrow-glyph">→</Sci>
          </span>
          {side(products, productRoles)}
        </Sci>
      </span>
      <RtlRun className="word-equation-hint">أداة عرض المنصة: اسحب أفقياً لرؤية المعادلة كاملة.</RtlRun>
    </>
  )
}
