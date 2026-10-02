import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  ScientificNotationText,
  ScientificText,
  VectorNotation,
  parseVectorNotation,
  splitVectorRuns,
  vectorTone,
} from '@/scientific'
import { readProjectFile } from './utils/projectFiles'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const css = readProjectFile('src/styles/scientific-components.css')
const tokens = readProjectFile('src/styles/tokens.css')

/** Renders a mixed Arabic sentence the way every prose surface does. */
function renderRTL(text: string) {
  return render(
    <div dir="rtl">
      <p>
        <ScientificNotationText>{text}</ScientificNotationText>
      </p>
    </div>,
  )
}

describe('parseVectorNotation — the printed vector token', () => {
  it.each([
    ['F⃗', { symbol: 'F', subscript: '', prime: '', tone: 'resultant' }],
    ['F₁⃗', { symbol: 'F', subscript: '1', prime: '', tone: 'f1' }],
    ['F₂⃗', { symbol: 'F', subscript: '2', prime: '', tone: 'f2' }],
    ['w⃗', { symbol: 'w', subscript: '', prime: '', tone: 'weight' }],
    ['W⃗', { symbol: 'W', subscript: '', prime: '', tone: 'weight' }],
    ['OM⃗', { symbol: 'OM', subscript: '', prime: '', tone: 'resultant' }],
    ["F⃗'", { symbol: 'F', subscript: '', prime: "'", tone: 'resultant' }],
  ])('reads %s as structured vector notation', (source, expected) => {
    const parsed = parseVectorNotation(source)
    expect(parsed).not.toBeNull()
    expect(parsed).toMatchObject(expected)
  })

  it('rejects a symbol without the printed arrow', () => {
    expect(parseVectorNotation('F₁')).toBeNull()
    expect(parseVectorNotation('H₂O')).toBeNull()
    expect(parseVectorNotation('N')).toBeNull()
  })

  it('keeps the lesson semantic tones (F₁ green, F₂ blue, w⃗ red)', () => {
    expect(vectorTone('F', '1')).toBe('f1')
    expect(vectorTone('F', '2')).toBe('f2')
    expect(vectorTone('w', '')).toBe('weight')
    expect(vectorTone('OM', '')).toBe('resultant')
  })

  it('lifts vector tokens out of a longer run without reordering it', () => {
    expect(splitVectorRuns('F⃗ = 100 N').map((run) => run.value)).toEqual(['F⃗', ' = 100 N'])
    expect(splitVectorRuns('F₁⃗, F₂⃗')).toHaveLength(3)
    expect(splitVectorRuns('100 N')).toEqual([{ kind: 'text', value: '100 N' }])
  })
})

describe('VectorNotation rendering', () => {
  it('draws the arrow instead of typing a combining arrow', () => {
    const { container } = render(<VectorNotation symbol="F" subscript="1" />)
    const notation = container.querySelector('.vector-notation')!

    expect(notation.getAttribute('dir')).toBe('ltr')
    // The combining arrow is never emitted as text — the arrow is an SVG.
    expect(container.textContent).not.toContain('⃗')
    expect(notation.querySelectorAll('svg line')).toHaveLength(2)
    expect(notation.querySelector('.vector-notation__shaft')).not.toBeNull()
    expect(notation.querySelector('.vector-notation__head')).not.toBeNull()
  })

  it('renders the subscript as a real <sub> element, in order', () => {
    const { container } = render(<div dir="rtl"><VectorNotation symbol="F" subscript="2" /></div>)
    const notation = container.querySelector('.vector-notation')!
    const symbol = notation.querySelector('.vector-notation__symbol')!

    expect(symbol.textContent).toBe('F2')
    expect(symbol.querySelector('sub')!.textContent).toBe('2')
    expect(notation.getAttribute('data-vector')).toBe('F2')
    expect(notation.getAttribute('data-tone')).toBe('f2')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('gives every instance its own marker id, referenced by the arrowhead', () => {
    const { container } = render(
      <p>
        <VectorNotation symbol="F" subscript="1" />
        <VectorNotation symbol="F" subscript="2" />
        <VectorNotation symbol="OM" />
      </p>,
    )
    const ids = [...container.querySelectorAll('marker')].map((marker) => marker.id)

    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    for (const id of ids) {
      expect(id).toMatch(/^vector-arrow-/)
      // React's useId contains ':'; the id must stay a legal URL fragment.
      expect(id).not.toContain(':')
      expect(container.querySelector(`line[marker-end="url(#${id})"]`)).not.toBeNull()
    }
  })

  it('exposes one LTR-isolated accessible name per vector', () => {
    const { container } = render(<VectorNotation symbol="OM" />)
    const notation = container.querySelector('.vector-notation')!

    expect(notation.getAttribute('role')).toBe('math')
    expect(notation.getAttribute('aria-label')).toBe('المتجه OM')
    expect(notation.getAttribute('dir')).toBe('ltr')
  })
})

describe('vector notation inside Arabic RTL prose', () => {
  it('promotes w⃗, F₁⃗, F₂⃗ and OM⃗ from the lesson sentences', () => {
    const { container } = renderRTL(
      'فيتأثّر بقوّة ثقله w⃗ . وتمثّلان المركّبتين F₁⃗ و F₂⃗ المحصّلة، وليكن الشعاع OM⃗ .',
    )
    const labels = [...container.querySelectorAll('.vector-notation')].map((node) => node.getAttribute('data-vector'))

    expect(labels).toEqual(['w', 'F1', 'F2', 'OM'])
    // Every vector lives inside an LTR isolate.
    for (const node of container.querySelectorAll('.vector-notation')) {
      expect(node.getAttribute('dir')).toBe('ltr')
      expect(node.closest('[dir="ltr"]')).not.toBeNull()
    }
    expect(container.textContent).not.toContain('⃗')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('keeps the Arabic prose around a vector untouched', () => {
    const { container } = renderRTL('أعلّقُ جسماً في خطّاف ربيعة، فيتأثّر بقوّة ثقله w⃗ .')
    const isolate = container.querySelector('.vector-notation')!.parentElement!

    expect(isolate.getAttribute('dir')).toBe('ltr')
    expect(isolate.previousSibling?.textContent).toContain('فيتأثّر بقوّة ثقله ')
    expect(isolate.nextSibling?.textContent).toBe(' .')
  })

  it('keeps a vector mixed into a longer formula inside ONE isolate', () => {
    const { container } = render(<ScientificText>محصّلة القوّتين F⃗ = 100 N تماماً</ScientificText>)
    const isolates = [...container.querySelectorAll('.sci')]

    expect(isolates).toHaveLength(1)
    expect(isolates[0]!.querySelector('.vector-notation')).not.toBeNull()
    expect(isolates[0]!.textContent).toBe('F = 100 N')
  })

  it('leaves chemistry notation alone', () => {
    const { container } = renderRTL('الماء H₂O وثاني أكسيد الكربون CO₂ وأيون الصوديوم Na⁺ والكلوريد Cl⁻.')
    expect(container.querySelector('.vector-notation')).toBeNull()
    expect(container.querySelector('.chem-formula[data-formula="H2O"]')).not.toBeNull()
    expect(container.querySelector('.chem-formula[data-formula="CO2"]')).not.toBeNull()
    expect(container.querySelectorAll('.ion-notation')).toHaveLength(2)
    expect(strayScriptGlyphs(container)).toEqual([])
  })
})

describe('vector colour and theming contract', () => {
  it('defines a colour token for every force role in both themes', () => {
    const light = tokens.match(/:root,\s*\n\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const dark = tokens.match(/\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''

    for (const token of ['--vector-f1', '--vector-f2', '--vector-weight', '--vector-resultant']) {
      expect(light, token).toContain(`${token}:`)
      expect(dark, token).toContain(`${token}:`)
    }
    // The dark theme must not reuse the light values (arrows vanish on ink).
    for (const token of ['--vector-f1', '--vector-f2', '--vector-weight']) {
      const lightValue = light.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1]?.trim()
      const darkValue = dark.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1]?.trim()
      expect(darkValue, token).not.toBe(lightValue)
    }
  })

  it('paints the arrow with currentColor so it follows the theme and the role', () => {
    expect(css).toMatch(/\.vector-notation--f1\s*\{\s*color:\s*var\(--vector-f1\)/)
    expect(css).toMatch(/\.vector-notation--f2\s*\{\s*color:\s*var\(--vector-f2\)/)
    expect(css).toMatch(/\.vector-notation--weight\s*\{\s*color:\s*var\(--vector-weight\)/)
    expect(css).toMatch(/\.vector-notation--resultant\s*\{\s*color:\s*var\(--vector-resultant\)/)
    expect(css).toMatch(/\.vector-notation__arrow\s*\{[^}]*display:\s*flex/s)
    // No absolute positioning, no negative margins around the arrow.
    const block = css.match(/\.vector-notation\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    expect(block).not.toContain('position: absolute')
    expect(block).not.toContain('margin-')
  })

  it('keeps a visible diagram arrowhead where context-stroke is unsupported', () => {
    // `currentColor` first (always valid), `context-stroke` only as a refinement.
    expect(css).toMatch(/\.diagram-arrow__head\s*\{\s*fill:\s*currentColor;\s*fill:\s*context-stroke;/s)
    expect(css).toMatch(/\.diagram-arrow\s*\{\s*color:\s*var\(--text-primary\)/s)
  })
})
