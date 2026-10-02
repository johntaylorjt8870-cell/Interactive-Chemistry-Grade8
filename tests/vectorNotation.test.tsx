import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { VectorNotation, VectorSvgLabel, ScientificNotationText, MathFormula } from '@/scientific'
import { parseVectorToken, splitVectorRuns, isExactVectorToken } from '@/utils/vectorText'

/* ============================================================================
   Vector notation regression suite.
   ----------------------------------------------------------------------------
   The textbook writes w⃗ / F₁⃗ / F₂⃗ / OM⃗ with the combining U+20D7 glyph,
   which text fonts do not draw. These tests lock the structured replacement:
   every vector symbol is promoted to real accent geometry (KaTeX) inside an
   LTR isolate, works in Arabic surroundings, and keeps its subscript/prime.
   ========================================================================= */

describe('vector token parsing', () => {
  it('parses every textbook vector form', () => {
    expect(parseVectorToken('w⃗')).toMatchObject({ symbol: 'w', subscript: undefined, prime: false })
    expect(parseVectorToken('F₁⃗')).toMatchObject({ symbol: 'F', subscript: '1', prime: false })
    expect(parseVectorToken('F₂⃗')).toMatchObject({ symbol: 'F', subscript: '2', prime: false })
    expect(parseVectorToken('OM⃗')).toMatchObject({ symbol: 'OM', subscript: undefined, prime: false })
    expect(parseVectorToken('R⃗')).toMatchObject({ symbol: 'R', subscript: undefined, prime: false })
    expect(parseVectorToken("F⃗'")).toMatchObject({ symbol: 'F', prime: true })
  })

  it('rejects plain symbols without the vector arrow', () => {
    expect(parseVectorToken('F1')).toBeNull()
    expect(parseVectorToken('NaCl')).toBeNull()
    expect(parseVectorToken('F₁')).toBeNull()
    expect(isExactVectorToken('OM⃗')).toBe(true)
    expect(isExactVectorToken('F = 6 N')).toBe(false)
  })

  it('splits Arabic prose around vector tokens without touching the prose', () => {
    const runs = splitVectorRuns('قوّتان F₁⃗ ، F₂⃗ متلاقيتان في O')
    expect(runs.filter((run) => run.kind === 'vector').map((run) => run.value)).toEqual(['F₁⃗', 'F₂⃗'])
    expect(runs[0]).toEqual({ kind: 'prose', value: 'قوّتان ' })
  })
})

describe('VectorNotation component', () => {
  it('renders w⃗ with a real accent (KaTeX), isolated LTR, with an accessible label', () => {
    render(<VectorNotation raw="w⃗" />)
    const notation = document.querySelector('[data-vector="true"]')!
    expect(notation).toHaveAttribute('dir', 'ltr')
    expect(notation).toHaveAttribute('data-has-arrow', 'true')
    expect(notation).toHaveAttribute('data-vector-symbol', 'w')
    // the arrow is math accent geometry inside KaTeX, never a bare U+20D7
    expect(notation.querySelector('.katex')).not.toBeNull()
    expect(notation.querySelector('annotation')?.textContent).toContain('vec')
    const math = notation.querySelector('[role="math"]')!
    expect(math).toHaveAttribute('aria-label', 'المتجه w')
  })

  it('renders F₁⃗ and F₂⃗ with real subscripts and the same arrow treatment', () => {
    render(
      <>
        <VectorNotation raw="F₁⃗" />
        <VectorNotation raw="F₂⃗" />
      </>,
    )
    const [f1, f2] = [...document.querySelectorAll('[data-vector="true"]')]
    expect(f1).toHaveAttribute('data-vector-symbol', 'F')
    expect(f1).toHaveAttribute('data-vector-subscript', '1')
    expect(f2).toHaveAttribute('data-vector-subscript', '2')
    for (const el of [f1, f2]) {
      expect(el).toHaveAttribute('data-has-arrow', 'true')
      expect(el!.querySelector('annotation')?.textContent).toContain('vec')
    }
  })

  it('renders OM⃗ with a spanning arrow over both letters', () => {
    render(<VectorNotation raw="OM⃗" />)
    const notation = document.querySelector('[data-vector="true"]')!
    expect(notation.querySelector('annotation')?.textContent).toContain('overrightarrow')
  })

  it('renders the prime form F⃗-prime', () => {
    render(<VectorNotation raw="F⃗'" />)
    const notation = document.querySelector('[data-vector="true"]')!
    expect(notation).toHaveAttribute('data-vector-prime', 'true')
    expect(notation.querySelector('annotation')?.textContent).toContain('prime')
  })

  it('supports explicit parts and an optional magnitude', () => {
    render(<VectorNotation symbol="F" subscript="1" magnitude={4} magnitudeUnit="N" tone="force1" />)
    const notation = document.querySelector('[data-vector="true"]')!
    expect(notation).toHaveAttribute('data-vector-subscript', '1')
    expect(notation).toHaveClass('vector-notation--force1')
    expect(notation.querySelector('[data-vector-magnitude]')?.textContent).toBe('=4N')
  })

  it('keeps Arabic RTL surroundings from reordering the symbol', () => {
    const { container } = render(
      <div dir="rtl">
        <ScientificNotationText>{'القوّة F₁⃗ تؤثّر في النقطة O'}</ScientificNotationText>
      </div>,
    )
    const notation = container.querySelector('[data-vector="true"]')!
    expect(notation).toHaveAttribute('dir', 'ltr')
    // prose sits outside the isolate and is preserved verbatim
    expect(container.textContent).toContain('القوّة')
    expect(container.textContent).toContain('تؤثّر في النقطة')
  })
})

describe('automatic promotion inside mixed prose', () => {
  it('promotes w⃗, F₁⃗, F₂⃗ and OM⃗ wherever they appear in sentences', () => {
    const { container } = render(
      <div dir="rtl">
        <ScientificNotationText>
          {'أرسمُ منها شعاعاً يُمثّلُ القوّة F⃗ وليكن الشعاع OM⃗ ، ثمّ أحلّل w⃗ إلى F₁⃗ و F₂⃗ .'}
        </ScientificNotationText>
      </div>,
    )
    const vectors = [...container.querySelectorAll('[data-vector="true"]')]
    expect(vectors.map((el) => el.getAttribute('data-vector-symbol'))).toEqual(['F', 'OM', 'w', 'F', 'F'])
    expect(vectors.map((el) => el.getAttribute('data-vector-subscript'))).toEqual(['', '', '', '1', '2'])
  })

  it('promotes inside list items and question-like sentences too', () => {
    const { container } = render(
      <div dir="rtl">
        <ScientificNotationText>{'شدّتا الربيعتين F₁⃗ و F₂⃗ وثقل الجسم w⃗ قوى متلاقية.'}</ScientificNotationText>
      </div>,
    )
    expect(container.querySelectorAll('[data-vector="true"]').length).toBe(3)
    // no raw combining arrow is left as bare prose text (KaTeX's own MathML
    // accent glyph inside .vector-notation is structured, not bare text)
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node) {
      const parent = node.parentElement
      if (parent && !parent.closest('[data-vector="true"]')) {
        expect(node.textContent ?? '').not.toContain('⃗')
      }
      node = walker.nextNode()
    }
  })

  it('never breaks chemical notation promotion (H₂O and SO₄²⁻ stay structured)', () => {
    const { container } = render(
      <div dir="rtl">
        <ScientificNotationText>{'مرّت H₂O بجانب القوّة F₁⃗ ثمّ SO₄²⁻ .'}</ScientificNotationText>
      </div>,
    )
    expect(container.querySelector('.chem-formula')).not.toBeNull()
    expect(container.querySelector('.ion-notation')).not.toBeNull()
    expect(container.querySelector('[data-vector="true"]')).not.toBeNull()
  })
})

describe('vector notation in SVG diagrams', () => {
  it('draws a real arrow accent above the symbol with label geometry', () => {
    const { container } = render(
      <svg>
        <VectorSvgLabel x={10} y={20} symbol="F" subscript="1" tone="force1" magnitude="4 N" />
      </svg>,
    )
    const group = container.querySelector('[data-vector-label="F"]')!
    expect(group).toHaveAttribute('data-has-arrow', 'true')
    expect(group.querySelector('.vec-svg-label__accent line')).not.toBeNull()
    expect(group.querySelector('.vec-svg-label__accent path')).not.toBeNull()
    expect(group.querySelector('.vec-svg-label__sub')?.textContent).toBe('1')
    expect(group.querySelector('.vec-svg-label__magnitude')?.textContent).toBe('4 N')
    expect(group.getAttribute('class')).toContain('vec-svg-label--force1')
  })
})

describe('equations stay LTR', () => {
  it('isolates the Pythagoras formula', () => {
    const { container } = render(<MathFormula tex="F = \sqrt{F_1^2 + F_2^2}" display="block" />)
    const formula = container.querySelector('.math-formula')!
    expect(formula).toHaveAttribute('dir', 'ltr')
  })
})
