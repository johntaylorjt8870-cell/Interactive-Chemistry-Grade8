import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import {
  ScientificNotationText,
  ScientificText,
  VectorNotation,
  VECTOR_ARROW,
  parseVectorNotation,
  vectorTone,
} from '@/scientific'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { readProjectFile } from './utils/projectFiles'

const scientificComponentsCss = readProjectFile('src/styles/scientific-components.css')
const componentsCss = readProjectFile('src/styles/components.css')
const tokensCss = readProjectFile('src/styles/tokens.css')
const diagramSource = readProjectFile('src/scientific/ScientificDiagram.tsx')

/** The mark as it is written in the textbook source; never rendered as text. */
const MARK = VECTOR_ARROW

function renderRTL(text: string) {
  return render(
    <div dir="rtl">
      <p>
        <ScientificNotationText>{text}</ScientificNotationText>
      </p>
    </div>,
  )
}

describe('parseVectorNotation — reading the printed mark, never rendering it', () => {
  it('reads F₁⃗ as the letter F with a real index', () => {
    expect(parseVectorNotation(`F₁${MARK}`)).toEqual([
      { kind: 'vector', value: `F₁${MARK}`, symbol: 'F', subscript: '1' },
    ])
  })

  it('keeps multi-letter symbols together (OM⃗)', () => {
    expect(parseVectorNotation(`OM${MARK}`)).toEqual([
      { kind: 'vector', value: `OM${MARK}`, symbol: 'OM' },
    ])
  })

  it('keeps a prime that belongs to the symbol', () => {
    expect(parseVectorNotation(`F${MARK}'`)).toEqual([
      { kind: 'vector', value: `F${MARK}'`, symbol: 'F', prime: "'" },
    ])
  })

  it('splits a symbol from the text around it without rewriting either', () => {
    expect(parseVectorNotation(`F${MARK} = 5 N`)).toEqual([
      { kind: 'vector', value: `F${MARK}`, symbol: 'F' },
      { kind: 'text', value: ' = 5 N' },
    ])
  })

  it('never lets a stray mark reach the text, even with no symbol before it', () => {
    expect(parseVectorNotation(MARK)).toEqual([])
    expect(parseVectorNotation(`كتلة ${MARK} 5 kg`)).toEqual([{ kind: 'text', value: 'كتلة  5 kg' }])
  })

  it('accepts plain digits as an index too (F1⃗)', () => {
    expect(parseVectorNotation(`F1${MARK}`)).toEqual([
      { kind: 'vector', value: `F1${MARK}`, symbol: 'F', subscript: '1' },
    ])
  })
})

describe('force colours are semantic and shared with the labs', () => {
  it('maps the printed force symbols to the platform force tones', () => {
    expect(vectorTone('F', '1')).toBe('force-f1')
    expect(vectorTone('F', '2')).toBe('force-f2')
    expect(vectorTone('w')).toBe('force-w')
  })

  it('leaves vectors the platform does not colour-code neutral', () => {
    expect(vectorTone('F')).toBe('neutral')
    expect(vectorTone('R')).toBe('neutral')
    expect(vectorTone('OM')).toBe('neutral')
  })

  it('defines the shared tokens for both themes', () => {
    for (const token of ['--force-f1', '--force-f2', '--force-w']) {
      const uses = tokensCss.match(new RegExp(`${token}:`, 'g')) ?? []
      expect(uses.length, `${token} must be theme-specific`).toBeGreaterThanOrEqual(2)
    }
    const light = tokensCss.match(/--force-f1:\s*([^;]+);/)?.[1]
    const dark = tokensCss.match(/--force-f1:\s*([^;]+);[\s\S]*?--force-f1:\s*([^;]+);/)?.[2]
    expect(light).toBeDefined()
    expect(dark).toBeDefined()
    expect(light).not.toBe(dark)
  })

  it('strokes the lab force arrows with the same tokens as the prose', () => {
    for (const [force, token] of [
      ['f1', '--force-f1'],
      ['f2', '--force-f2'],
      ['w', '--force-w'],
    ]) {
      expect(componentsCss).toMatch(
        new RegExp(`\\.vec-lab__force--${force}\\s*\\{\\s*stroke:\\s*var\\(${token}\\)`),
      )
    }
  })
})

describe('the over-arrow is drawn, not typed', () => {
  it('renders F₁⃗ with a real arrow, a real subscript and no combining mark', () => {
    const { container } = renderRTL(`يمثّلان المركّبتين F₁${MARK} ، F₂${MARK} .`)
    const text = container.textContent ?? ''

    // The mark is gone from the DOM text; the Arabic sentence is intact.
    expect(text).not.toContain(MARK)
    expect(text).toContain('يمثّلان المركّبتين')
    expect(text).toContain('F1')
    expect(text).toContain('F2')

    const vectors = [...container.querySelectorAll('.sci-vector')]
    expect(vectors).toHaveLength(2)

    const [f1, f2] = vectors
    expect(f1!.getAttribute('dir')).toBe('ltr')
    expect(f1!.closest('[dir="ltr"]')).not.toBeNull()
    expect(f2!.getAttribute('dir')).toBe('ltr')

    // Index in source order, as a real <sub> — never a Unicode glyph.
    expect(f1!.querySelector('sub.sci-sub')?.textContent).toBe('1')
    expect(f2!.querySelector('sub.sci-sub')?.textContent).toBe('2')
    expect(f1!.querySelector('.sci-vector__symbol')?.textContent).toBe('F1')

    // A visible arrowhead and a shaft, both part of the drawn arrow.
    for (const vector of vectors) {
      const head = vector.querySelector('svg.sci-vector__head path')
      expect(head).not.toBeNull()
      expect(head!.getAttribute('d')).toBeTruthy()
      expect(vector.querySelector('.sci-vector__shaft')).not.toBeNull()
      // The drawing is decoration: the accessible name is the printed symbol.
      expect(vector.querySelector('.sci-vector__mark')?.getAttribute('aria-hidden')).toBe('true')
      expect(vector.getAttribute('aria-label')).toBe(vector.getAttribute('data-tone') === 'force-f1' ? `F₁${MARK}` : `F₂${MARK}`)
    }

    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('colours F₁ green and F₂ blue with the force tones', () => {
    const { container } = renderRTL(`قوّتان F₁${MARK} ، F₂${MARK} متلاقيتان`)
    const [f1, f2] = [...container.querySelectorAll('.sci-vector')]

    expect(f1!.getAttribute('data-tone')).toBe('force-f1')
    expect(f1!.className).toContain('sci-vector--force-f1')
    expect(f2!.getAttribute('data-tone')).toBe('force-f2')
    expect(f2!.className).toContain('sci-vector--force-f2')
  })

  it('keeps the weight w⃗ red and the unlabelled symbols neutral', () => {
    const { container } = renderRTL(`الثقل w${MARK} والمحصّلة F${MARK} وردّ الفعل R${MARK}`)
    const tones = [...container.querySelectorAll('.sci-vector')].map((vector) => vector.getAttribute('data-tone'))

    expect(tones).toEqual(['force-w', 'neutral', 'neutral'])
  })

  it('renders a multi-letter vector (OM⃗) as one symbol under one arrow', () => {
    const { container } = renderRTL(`وليكن الشعاع OM${MARK} .`)
    const vector = container.querySelector('.sci-vector')!

    expect(vector.getAttribute('data-vector')).toBe('OM')
    expect(vector.querySelector('.sci-vector__symbol')?.textContent).toBe('OM')
    expect(vector.querySelector('sub')).toBeNull()
    expect(vector.querySelector('.sci-vector__head')).not.toBeNull()
    expect(container.textContent).not.toContain(MARK)
  })

  it('keeps a prime inside the isolate, after the symbol', () => {
    const { container } = renderRTL(`القوّة F${MARK}' التي إذا أثّرت`)
    const vector = container.querySelector('.sci-vector')!

    expect(vector.querySelector('.sci-vector__prime')?.textContent).toBe("'")
    expect([...vector.children].map((child) => child.className)).toEqual([
      'sci-vector__mark',
      'sci-vector__symbol',
      'sci-vector__prime',
    ])
    expect(container.textContent).toContain(`F'`)
  })

  it('leaves vector-free scientific runs exactly as they were', () => {
    const { container } = render(
      <p dir="rtl">
        <ScientificText>الكتلة 5 kg والحرارة 25 °C</ScientificText>
      </p>,
    )
    expect(container.querySelectorAll('.sci-vector')).toHaveLength(0)
    expect(container.textContent).toContain('5 kg')
    expect(container.textContent).toContain('25 °C')
    expect(container.querySelector('[data-sci="isolated"]')).not.toBeNull()
  })

  it('is a complete isolate when used directly', () => {
    const { container } = render(<VectorNotation symbol="F" subscript="1" tone="force-f1" />)
    const vector = container.querySelector('.sci-vector')!

    expect(vector.getAttribute('dir')).toBe('ltr')
    expect(vector.getAttribute('data-sci')).toBe('isolated')
    expect(vector.getAttribute('role')).toBe('math')
    expect(vector.getAttribute('aria-label')).toBe(`F₁${MARK}`)
  })
})

describe('vector notation CSS contract', () => {
  it('isolates the symbol with direction and unicode-bidi', () => {
    const block = scientificComponentsCss.match(/\.sci-vector\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(block).toContain('direction: ltr')
    expect(block).toContain('unicode-bidi: isolate')
  })

  it('stretches the shaft and keeps the arrowhead proportional, in em only', () => {
    const shaft = scientificComponentsCss.match(/\.sci-vector__shaft\s*\{[^}]*\}/s)?.[0] ?? ''
    const head = scientificComponentsCss.match(/\.sci-vector__head\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(shaft).toContain('flex: 1 1 auto')
    expect(shaft).toContain('background: currentColor')
    // A hairline must still render on low-density displays.
    expect(shaft).toContain('min-block-size: 1px')
    expect(head).toContain('flex: 0 0 auto')
    expect(head).toContain('0.34em')
    expect(head).not.toContain('px')
    // No absolute positioning or negative margins are involved anywhere.
    expect(scientificComponentsCss).not.toMatch(/\.sci-vector__[a-z-]+\s*\{[^}]*position:\s*absolute/s)
    expect(scientificComponentsCss).not.toMatch(/\.sci-vector[a-z_-]*\s*\{[^}]*margin[^;]*:\s*-/s)
  })

  it('colours each force tone from its token', () => {
    for (const token of ['--force-f1', '--force-f2', '--force-w']) {
      const tone = token.replace('--force-', '')
      expect(scientificComponentsCss).toMatch(
        new RegExp(`\\.sci-vector--force-${tone}\\s*\\{\\s*color:\\s*var\\(${token}\\)`),
      )
    }
  })

  it('gives the shared SVG arrowhead a theme-aware fill fallback before context-stroke', () => {
    const fallback = scientificComponentsCss.indexOf('fill: var(--text-primary)')
    const contextStroke = scientificComponentsCss.indexOf('fill: context-stroke')

    expect(fallback).toBeGreaterThan(-1)
    expect(contextStroke).toBeGreaterThan(-1)
    // The fallback must come first: engines that do not know context-stroke
    // drop the second declaration and keep the visible colour.
    expect(fallback).toBeLessThan(contextStroke)
    expect(scientificComponentsCss).toMatch(/\.diagram-arrowhead\s*\{\s*fill:\s*var\(--text-primary\)/)
    expect(diagramSource).toContain('className="diagram-arrowhead"')
  })
})
