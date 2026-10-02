import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ScientificNotationText } from '@/scientific'
import { strayScriptGlyphs } from './utils/strayGlyphs'

/** Regression suite: compact scientific runs inside Arabic RTL prose must be
 * promoted to structured, LTR-isolated DOM — never split so that a subscript
 * or charge glyph floats in the RTL flow. */
describe('ScientificNotationText promotes compact runs inside RTL prose', () => {
  const renderRTL = (text: string) =>
    render(
      <div dir="rtl">
        <p>
          <ScientificNotationText>{text}</ScientificNotationText>
        </p>
      </div>,
    )

  it('promotes unicode-subscript formulas to ChemicalFormula with real subscripts', () => {
    const { container } = renderRTL(
      'ينتج عن التفاعل غاز الكلور Cl₂ والماء H₂O والميثان CH₄ وكلوريد الألمنيوم AlCl₃ والأمونيا NH₃.',
    )
    for (const formula of ['Cl2', 'H2O', 'CH4', 'AlCl3', 'NH3']) {
      const el = container.querySelector(`.chem-formula[data-formula="${formula}"]`)
      expect(el, formula).not.toBeNull()
      expect(el!.getAttribute('dir')).toBe('ltr')
      expect(el!.getAttribute('role')).toBe('math')
      expect(el!.querySelector('sub.sci-sub'), formula).not.toBeNull()
    }
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('never promotes ordinary Latin words such as Newton', () => {
    const { container } = renderRTL('قانون Newton الثاني يربط القوة بالكتلة والتسارع.')
    expect(container.querySelector('.chem-formula')).toBeNull()
    expect(container.textContent).toContain('Newton')
  })

  it('keeps ion and nuclide promotion ahead of formula promotion', () => {
    const { container } = renderRTL(
      'أيون الصوديوم Na⁺ وأيون الكلوريد Cl⁻ والأكسجين ¹⁶₈O والألمنيوم ₁₃Al في نص عربي واحد.',
    )
    const ions = container.querySelectorAll('.ion-notation')
    expect(ions).toHaveLength(2)
    expect(ions[0]!.getAttribute('data-ion')).toBe('Na+')
    expect(ions[1]!.getAttribute('data-ion')).toBe('Cl\u2212')
    const nuclides = container.querySelectorAll('.nuclear-notation')
    expect(nuclides).toHaveLength(2)
    // The only chem-formula nodes allowed are the bodies inside the ions.
    const formulas = [...container.querySelectorAll('.chem-formula')]
    expect(formulas).toHaveLength(2)
    for (const el of formulas) expect(el.closest('.ion-notation')).not.toBeNull()
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('promotes a trailing formula touching Arabic punctuation', () => {
    const { container } = renderRTL('المركب الناتج هو CaO.')
    expect(container.querySelector('.chem-formula[data-formula="CaO"]')).toBeNull() // no subscript: stays an isolated Sci run
    const sci = [...container.querySelectorAll('.sci')].map((el) => el.textContent)
    expect(sci.some((text) => text?.includes('CaO'))).toBe(true)
    expect(strayScriptGlyphs(container)).toEqual([])
  })
})
