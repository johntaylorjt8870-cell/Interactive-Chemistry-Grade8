import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import {
  DiagramDefs,
  DiagramVector,
  ScientificNotationText,
  ScientificText,
  VectorNotation,
  diagramArrowId,
} from '@/scientific'
import type { DiagramArrowTone, VectorNotationProps } from '@/scientific'
import {
  parseVectorNotation,
  splitScientificRuns,
  splitVectorNotation,
  VECTOR_ARROW,
} from '@/utils/scientificText'
import { bookQuestions, finalTest, physicsLesson1 } from '@/data/curriculum/physicsLesson1'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { readProjectFile } from './utils/projectFiles'

/**
 * Vector notation: F₁, F₂, w and OM (and F, R, F′) shown with a clearly visible
 * arrow over the whole symbol, built from structure — never from the Unicode
 * combining arrow, never from control characters or offsets.
 *
 * The lesson data stores vectors with U+20D7 (source fidelity). Strings below
 * are assembled from that constant so no invisible combining character is ever
 * typed into this file.
 */
const ARROW = VECTOR_ARROW
const v = (letters: string, subscript = '', primes = '') => `${letters}${subscript}${ARROW}${primes}`

const BIDI_CONTROLS = /[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/u
const ARABIC_LETTER = /[\u0600-\u06FF]/u

/** Strips CSS comments so assertions never match explanatory prose. */
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** Declarations of the first rule whose selector is exactly `selector`. */
function declarations(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const block = stripComments(css).match(new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
  const result: Record<string, string> = {}
  for (const line of block.split(';')) {
    const at = line.indexOf(':')
    if (at > 0) result[line.slice(0, at).trim()] = line.slice(at + 1).trim()
  }
  return result
}

const tokensCss = readProjectFile('src/styles/tokens.css')
const componentsCss = readProjectFile('src/styles/components.css')
const scientificComponentsCss = readProjectFile('src/styles/scientific-components.css')

/* -------------------------------------------------------------------------- */

describe('vector grammar (pure helpers)', () => {
  it.each([
    [v('F', '₁'), { symbol: 'F', subscript: '1', primes: 0 }],
    [v('F', '₂'), { symbol: 'F', subscript: '2', primes: 0 }],
    [v('w'), { symbol: 'w', primes: 0 }],
    [v('OM'), { symbol: 'OM', primes: 0 }],
    [v('F'), { symbol: 'F', primes: 0 }],
    [v('R'), { symbol: 'R', primes: 0 }],
    [v('F', '', "'"), { symbol: 'F', primes: 1 }],
    [v('F', '', '\u2032'), { symbol: 'F', primes: 1 }],
    [v('F', '₁₀'), { symbol: 'F', subscript: '10', primes: 0 }],
  ])('reads %s as one vector symbol', (token, expected) => {
    expect(parseVectorNotation(token)).toEqual(expected)
  })

  it.each(['F', 'F₁', 'OM', ARROW, `F = ${v('F', '₁')}`, `2${v('F')}`, 'قوة'])(
    'does not read %s as a single vector symbol',
    (value) => {
      expect(parseVectorNotation(value)).toBeNull()
    },
  )

  it('finds vectors inside a run and gives every character back, in order', () => {
    const run = `F = ${v('F', '₁')} + ${v('F', '₂')}`
    const segments = splitVectorNotation(run)

    expect(segments.map((segment) => segment.kind)).toEqual(['text', 'vector', 'text', 'vector'])
    expect(segments.map((segment) => segment.value).join('')).toBe(run)
    expect(splitVectorNotation('5 kg')).toEqual([{ kind: 'text', value: '5 kg' }])
    expect(splitVectorNotation('')).toEqual([])
  })

  it('keeps the prime of the balancing force in the same run as its symbol (it must not leak into RTL prose)', () => {
    const runs = splitScientificRuns(`ما قيمة القوّة ${v('F', '', "'")} التي إذا أثّرت`)

    expect(runs).toEqual([
      { kind: 'prose', value: 'ما قيمة القوّة ' },
      { kind: 'science', value: v('F', '', "'") },
      { kind: 'prose', value: ' التي إذا أثّرت' },
    ])
  })

  it('leaves the existing vector runs exactly as they were', () => {
    expect(splitScientificRuns(`وليكن الشعاع ${v('OM')} .`)).toEqual([
      { kind: 'prose', value: 'وليكن الشعاع ' },
      { kind: 'science', value: v('OM') },
      { kind: 'prose', value: ' .' },
    ])
  })
})

/* -------------------------------------------------------------------------- */

describe('<VectorNotation /> — F₁, F₂, w and OM', () => {
  const cases: Array<[string, VectorNotationProps, string, string | null]> = [
    ['F₁', { symbol: 'F', subscript: 1 }, 'F', '1'],
    ['F₂', { symbol: 'F', subscript: '2' }, 'F', '2'],
    ['w', { symbol: 'w' }, 'w', null],
    ['OM', { symbol: 'OM' }, 'OM', null],
  ]

  it.each(cases)('draws one arrow over the whole symbol %s', (_name, props, letters, subscript) => {
    const { container } = render(<VectorNotation {...props} />)
    const root = container.querySelector('.vector-notation')!
    const base = root.querySelector('.vector-notation__base')!

    // The arrow and the letters share one block, so the arrow is as wide as the
    // letters by layout (OM gets ONE arrow over both letters).
    expect(root.querySelectorAll('.vector-notation__arrow')).toHaveLength(1)
    expect(base.querySelector('.vector-notation__arrow')).not.toBeNull()
    expect(base.querySelector('.vector-notation__symbol')!.textContent).toBe(letters)

    // The arrow sits ABOVE the letters: it precedes them in the block.
    const order = [...base.children].map((child) => child.className)
    expect(order).toEqual(['vector-notation__arrow', 'vector-notation__symbol'])

    // The index is a real subscript outside the arrow's span.
    const sub = root.querySelector('sub.sci-sub')
    if (subscript === null) {
      expect(sub).toBeNull()
    } else {
      expect(sub!.textContent).toBe(subscript)
      expect(base.contains(sub)).toBe(false)
    }
  })

  it('is an LTR isolate with a stable identity', () => {
    const { container } = render(<VectorNotation symbol="F" subscript="1" />)
    const root = container.querySelector('.vector-notation')!

    expect(root.getAttribute('dir')).toBe('ltr')
    expect(root.getAttribute('data-sci')).toBe('isolated')
    expect(root.getAttribute('data-vector')).toBe('F1')
  })

  it('places a prime after the symbol, outside the arrow', () => {
    const { container } = render(<VectorNotation symbol="F" primes={1} />)
    const root = container.querySelector('.vector-notation')!
    const prime = root.querySelector('.vector-notation__prime')!

    expect(prime.textContent).toBe('\u2032')
    expect(root.querySelector('.vector-notation__base')!.contains(prime)).toBe(false)
    expect(root.getAttribute('data-vector')).toBe("F'")
  })

  it('never renders the combining arrow or any bidi control character', () => {
    const { container } = render(
      <p dir="rtl">
        <VectorNotation symbol="F" subscript="1" primes={2} />
        <VectorNotation symbol="OM" />
      </p>,
    )

    expect(container.textContent).not.toContain(ARROW)
    expect(container.innerHTML).not.toMatch(BIDI_CONTROLS)
  })

  it('has an Arabic accessible name instead of reading out a glyph', () => {
    render(
      <>
        <VectorNotation symbol="F" subscript="1" />
        <VectorNotation symbol="w" />
        <VectorNotation symbol="OM" />
        <VectorNotation symbol="F" primes={1} />
        <VectorNotation symbol="F" label="القوة الأولى" />
      </>,
    )

    for (const name of ['متجه F1', 'متجه w', 'متجه OM', 'متجه F شرطة', 'القوة الأولى']) {
      expect(screen.getByRole('math', { name })).toBeInTheDocument()
    }
  })

  it('accepts a class name for the caller', () => {
    const { container } = render(<VectorNotation symbol="w" className="legend-symbol" />)
    expect(container.querySelector('.vector-notation')).toHaveClass('legend-symbol')
  })

  it('ignores a non-numeric prime count instead of rendering garbage', () => {
    const { container } = render(<VectorNotation symbol="F" primes={Number.NaN} />)
    expect(container.querySelector('.vector-notation__prime')).toBeNull()
    expect(container.querySelector('.vector-notation')!.getAttribute('data-vector')).toBe('F')
  })

  it('has no accessibility violations inside Arabic prose', async () => {
    const { container } = render(
      <main>
        <p dir="rtl" lang="ar">
          <ScientificNotationText>
            {`قوّتان ${v('F', '₁')} ، ${v('F', '₂')} تؤثّران في النقطة O، وثقله ${v('w')} والشعاع ${v('OM')} والموازِنة ${v('F', '', "'")} .`}
          </ScientificNotationText>
        </p>
      </main>,
    )

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})

/* -------------------------------------------------------------------------- */

describe('<ScientificText /> promotes vector tokens', () => {
  const renderRTL = (text: string, Component: typeof ScientificText = ScientificText) =>
    render(
      <p dir="rtl">
        <Component>{text}</Component>
      </p>,
    )

  it('turns F₁ and F₂ inside an Arabic sentence into notation, in source order', () => {
    const { container } = renderRTL(`قوّتان ${v('F', '₁')} ، ${v('F', '₂')} متلاقيتان`)

    const vectors = [...container.querySelectorAll('.vector-notation')]
    expect(vectors.map((vector) => vector.getAttribute('data-vector'))).toEqual(['F1', 'F2'])
    expect(container.textContent).toBe('قوّتان F1 ، F2 متلاقيتان')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('keeps Arabic RTL: no Arabic letter is ever inside an LTR isolate', () => {
    const { container } = renderRTL(`أرسمُ شعاعاً يُمثّلُ القوّة ${v('F')} وليكن الشعاع ${v('OM')} .`)
    const isolates = [...container.querySelectorAll('[dir="ltr"]')]

    expect(isolates).toHaveLength(2)
    for (const isolate of isolates) {
      expect(isolate.textContent).not.toMatch(ARABIC_LETTER)
      expect(isolate).toHaveClass('vector-notation')
    }
    expect(container.querySelector('p')!.getAttribute('dir')).toBe('rtl')
  })

  it('promotes w and the balancing force F′ without stranding the prime in the prose', () => {
    const { container } = renderRTL(`ثقله ${v('w')}. وقيمة القوّة ${v('F', '', "'")} التي تُوازنها`)

    const names = [...container.querySelectorAll('.vector-notation')].map((el) => el.getAttribute('data-vector'))
    expect(names).toEqual(['w', "F'"])
    // The prime travels inside the symbol: no apostrophe is left in the RTL prose.
    expect(container.textContent).toBe('ثقله w. وقيمة القوّة F\u2032 التي تُوازنها')
    expect(container.textContent).not.toContain("'")
  })

  it('keeps an equation with vectors ONE left-to-right unit, with the vectors structured inside it', () => {
    const { container } = renderRTL(`العلاقة F = ${v('F', '₁')} + ${v('F', '₂')} هنا`)
    const equation = container.querySelectorAll('.sci')

    expect(equation).toHaveLength(1)
    expect(equation[0]!.textContent).toBe('F = F1 + F2')
    expect([...equation[0]!.querySelectorAll('.vector-notation')].map((el) => el.getAttribute('data-vector'))).toEqual([
      'F1',
      'F2',
    ])
  })

  it('does not change how ordinary scientific runs are rendered', () => {
    const { container } = renderRTL('كتلة الجسم 5 kg وتسارعه 9.8 m/s²')

    expect(container.querySelector('.vector-notation')).toBeNull()
    expect([...container.querySelectorAll('.sci')].map((el) => el.textContent)).toEqual(['5 kg', '9.8 m/s²'])
  })

  it('works through ScientificNotationText next to a promoted chemical formula', () => {
    const { container } = renderRTL(`المتجه ${v('F', '₁')} والماء H₂O`, ScientificNotationText)

    expect(container.querySelector('.vector-notation[data-vector="F1"]')).not.toBeNull()
    expect(container.querySelector('.chem-formula[data-formula="H2O"]')).not.toBeNull()
    expect(container.textContent).not.toContain(ARROW)
  })
})

/* -------------------------------------------------------------------------- */

describe('Physics Lesson 1 — every vector in the real data becomes structured notation', () => {
  function collectStrings(value: unknown, into: string[] = []): string[] {
    if (typeof value === 'string') into.push(value)
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into))
    else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, into))
    return into
  }

  const withVectors = collectStrings([physicsLesson1, bookQuestions, finalTest]).filter((text) => text.includes(ARROW))
  const arrowsIn = (text: string) => [...text].filter((char) => char === ARROW).length

  it('finds the vector-bearing strings of the lesson', () => {
    expect(withVectors.length).toBeGreaterThan(20)
  })

  it('keeps the source data verbatim — the fix is a rendering concern, not a data edit', () => {
    expect(JSON.stringify(physicsLesson1)).toContain(ARROW)
  })

  it('renders each arrow in the source as exactly one vector notation and leaves no combining arrow', () => {
    for (const text of withVectors) {
      const { container, unmount } = render(
        <div dir="rtl">
          <ScientificNotationText>{text}</ScientificNotationText>
        </div>,
      )

      expect(container.querySelectorAll('.vector-notation'), text).toHaveLength(arrowsIn(text))
      expect(container.textContent, text).not.toContain(ARROW)
      expect(strayScriptGlyphs(container), text).toEqual([])
      unmount()
    }
  })

  it('covers every symbol the lesson prints: F, F₁, F₂, w, R, OM and F′', () => {
    const symbols = new Set<string>()
    for (const text of withVectors) {
      for (const segment of splitVectorNotation(text)) {
        if (segment.kind === 'vector') {
          const { symbol, subscript = '', primes } = segment.vector
          symbols.add(`${symbol}${subscript}${"'".repeat(primes)}`)
        }
      }
    }
    expect([...symbols].sort()).toEqual(["F", "F'", 'F1', 'F2', 'OM', 'R', 'w'].sort())
  })
})

/* -------------------------------------------------------------------------- */

describe('vector notation CSS contract', () => {
  const rules = stripComments(scientificComponentsCss).match(/\.vector-notation[^{}]*\{[^}]*\}/g) ?? []

  it('isolates the symbol with direction and unicode-bidi', () => {
    const root = declarations(scientificComponentsCss, '.vector-notation')

    expect(root['direction']).toBe('ltr')
    expect(root['unicode-bidi']).toBe('isolate')
    expect(root['white-space']).toBe('nowrap')
  })

  it('paints a visible arrow: currentColor, a clipped shaft+head, never thinner than 1.5px', () => {
    const arrow = declarations(scientificComponentsCss, '.vector-notation__arrow')

    expect(arrow['background']).toBe('currentColor')
    expect(arrow['clip-path']).toContain('polygon(')
    expect(arrow['print-color-adjust']).toBe('exact')
    expect(tokensCss).toMatch(/--sci-vector-stroke:\s*max\(1\.5px,/)
    expect(arrow['clip-path']).toContain('var(--sci-vector-stroke)')
  })

  it('keeps the arrow visible in forced-colors (high contrast) mode', () => {
    expect(stripComments(scientificComponentsCss)).toMatch(
      /@media \(forced-colors: active\)\s*\{\s*\.vector-notation__arrow\s*\{[^}]*CanvasText/,
    )
  })

  it('uses layout, not pixel positioning: no offsets, transforms or negative margins', () => {
    expect(rules.length).toBeGreaterThan(3)
    const css = rules.join('\n')

    expect(css).not.toMatch(/(?:^|[\s{;])(?:position|top|left|right|bottom|translate|transform)\s*:/)
    expect(css).not.toMatch(/(?:^|[\s{;])inset[a-z-]*\s*:/)
    expect(css).not.toMatch(/margin[a-z-]*\s*:[^;]*-\d/)
  })

  it('stores no bidi control characters in the notation sources or styles', () => {
    for (const file of [
      'src/scientific/VectorNotation.tsx',
      'src/scientific/ScientificText.tsx',
      'src/utils/scientificText.ts',
      'src/styles/scientific-components.css',
      'src/styles/tokens.css',
    ]) {
      expect(readProjectFile(file), file).not.toMatch(BIDI_CONTROLS)
    }
  })
})

/* -------------------------------------------------------------------------- */

describe('shared SVG arrowheads', () => {
  const TONES: DiagramArrowTone[] = ['accent', 'support', 'muted', 'danger', 'f1', 'f2', 'w', 'resultant']

  const renderDefs = () =>
    render(
      <svg>
        <DiagramDefs />
      </svg>,
    ).container

  it('declares the generic marker every drawing already references, plus one explicit marker per tone', () => {
    const ids = [...renderDefs().querySelectorAll('marker')].map((marker) => marker.id)

    expect(ids).toHaveLength(new Set(ids).size)
    expect(new Set(ids)).toEqual(new Set(['diagram-arrow', ...TONES.map((tone) => `diagram-arrow-${tone}`)]))
    expect(diagramArrowId()).toBe('diagram-arrow')
    expect(diagramArrowId('f1')).toBe('diagram-arrow-f1')
  })

  it('does not rely on SVG 2 features older engines lack (context-stroke, auto-start-reverse)', () => {
    const container = renderDefs()

    expect(container.innerHTML).not.toContain('context-stroke')
    expect(container.innerHTML).not.toContain('auto-start-reverse')
    for (const marker of container.querySelectorAll('marker')) {
      expect(marker.getAttribute('orient')).toBe('auto')
    }
  })

  it('hides the end of the line inside the head instead of letting it poke out at the tip', () => {
    for (const marker of renderDefs().querySelectorAll('marker')) {
      // 10-unit head; the line ends 8 units in, where the triangle is 2 units tall —
      // wider than the 10/6 units the line occupies (the marker scales with stroke width).
      expect(marker.getAttribute('viewBox')).toBe('0 0 10 10')
      expect(marker.getAttribute('refX')).toBe('8')
      expect(Number(marker.getAttribute('markerWidth'))).toBe(6)
    }
  })

  it('gives every head a tone class and a visible baseline fill', () => {
    const container = renderDefs()

    for (const tone of ['auto', ...TONES]) {
      const head = container.querySelector(`.diagram-arrowhead--${tone}`)
      expect(head, tone).not.toBeNull()
      expect(head!.getAttribute('fill')).toBe('currentColor')
    }
  })

  it('points a DiagramVector at the marker of its own tone', () => {
    const { container } = render(
      <svg>
        <DiagramDefs />
        <DiagramVector x1={0} y1={0} x2={40} y2={0} tone="support" />
        <DiagramVector x1={0} y1={10} x2={40} y2={10} />
        <DiagramVector x1={0} y1={20} x2={40} y2={20} arrow={false} />
      </svg>,
    )
    const lines = [...container.querySelectorAll('g.diagram-vector line')]

    expect(lines[0]!.getAttribute('marker-end')).toBe('url(#diagram-arrow-support)')
    expect(lines[1]!.getAttribute('marker-end')).toBe('url(#diagram-arrow-accent)')
    expect(lines[2]!.hasAttribute('marker-end')).toBe(false)
    for (const line of lines.slice(0, 2)) {
      const target = line.getAttribute('marker-end')!.slice('url(#'.length, -1)
      expect(container.querySelector(`marker#${target}`)).not.toBeNull()
    }
  })
})

describe('semantic force colours are preserved', () => {
  it('keeps the exact values the laboratories used: F₁ green, F₂ blue, weight red', () => {
    expect(tokensCss).toMatch(/--vector-f1:\s*#059669;/)
    expect(tokensCss).toMatch(/--vector-f2:\s*#2563eb;/)
    expect(tokensCss).toMatch(/--vector-w:\s*#dc2626;/)
  })

  it.each([
    ['f1', '--vector-f1'],
    ['f2', '--vector-f2'],
    ['w', '--vector-w'],
  ])('draws the %s line and its arrowhead from the same token', (tone, token) => {
    const line = declarations(componentsCss, `.vec-lab__force--${tone}`)
    const head = declarations(scientificComponentsCss, `.diagram-arrowhead--${tone}`)

    expect(line['stroke']).toBe(`var(${token})`)
    expect(head['fill']).toBe(`var(${token})`)
    // The stylesheet picks the matching head, so it never depends on `context-stroke`.
    expect(line['marker-end']).toBe(`url(#diagram-arrow-${tone})`)
  })

  it('draws the resultant and its arrowhead from the accent token', () => {
    const line = declarations(componentsCss, '.vec-lab__resultant')
    const head = declarations(scientificComponentsCss, '.diagram-arrowhead--resultant')

    expect(line['stroke']).toBe('var(--accent-strong)')
    expect(head['fill']).toBe('var(--accent-strong)')
    expect(line['marker-end']).toBe('url(#diagram-arrow-resultant)')
  })

  it('keeps the generic marker visible where context paint is unsupported', () => {
    expect(declarations(scientificComponentsCss, '.diagram-arrowhead')['fill']).toBe('currentColor')
    expect(stripComments(scientificComponentsCss)).toMatch(
      /@supports \(fill: context-stroke\)\s*\{\s*\.diagram-arrowhead--auto\s*\{\s*fill:\s*context-stroke/,
    )
  })
})
