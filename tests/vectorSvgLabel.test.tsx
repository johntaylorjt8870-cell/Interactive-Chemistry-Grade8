import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { VectorArrow, VectorArrowSet, VectorSvgLabel } from '@/scientific'
import { vectorLabelLayout } from '@/utils/vectorLabelMetrics'
import ConcurrentForcesLab from '../src/simulations/ConcurrentForcesLab'

/* ============================================================================
   SVG vector labels in an RTL page.
   ----------------------------------------------------------------------------
   Found in a real Chromium run (jsdom had passed): in an Arabic page SVG
   `text-anchor: start|end` follow the inherited `direction`, so labels anchored
   from the wrong edge, accents floated away from their letters, and the magnitude
   printed as `N 2.4`. jsdom cannot paint, so these tests pin the DOM facts that
   make the browser result correct: explicit LTR direction on every run, the
   symbol centred (symmetric in any direction), the accent centred over it, the
   magnitude as its own LTR run, and no dependence on start/end anchoring for the
   symbol itself.
   ========================================================================= */

const attr = (el: Element | null, name: string) => (el ? Number(el.getAttribute(name)) : NaN)

function renderInRtl(node: React.ReactNode) {
  return render(
    <div dir="rtl" lang="ar">
      <svg viewBox="0 0 200 100">{node}</svg>
    </div>,
  )
}

describe('VectorSvgLabel in an RTL page', () => {
  it('forces LTR on the label and on every text run, whatever the page direction', () => {
    const { container } = renderInRtl(<VectorSvgLabel x={50} y={40} symbol="F" subscript="1" tone="force1" magnitude="2.4 N" />)
    const group = container.querySelector('[data-vector-label="F"]')!
    expect(group.getAttribute('direction')).toBe('ltr')
    for (const text of group.querySelectorAll('text')) {
      expect(text.getAttribute('direction'), `${text.getAttribute('class')} direction`).toBe('ltr')
    }
  })

  it('centres the symbol and the accent on the same x — not via start/end anchors', () => {
    const { container } = renderInRtl(<VectorSvgLabel x={50} y={40} symbol="F" subscript="1" tone="force1" anchor="start" />)
    const symbol = container.querySelector('.vec-svg-label__symbol')!
    expect(symbol.getAttribute('text-anchor')).toBe('middle')
    const line = container.querySelector('.vec-svg-label__accent line')!
    const accentCentre = (attr(line, 'x1') + attr(line, 'x2')) / 2
    // the accent's centre follows the letter's centre (a small italic skew is allowed)
    expect(Math.abs(accentCentre - attr(symbol, 'x'))).toBeLessThan(2)
    // and it sits ABOVE the baseline
    expect(attr(line, 'y1')).toBeLessThan(-8)
  })

  it('keeps `2.4 N` in reading order as its own LTR run', () => {
    const { container } = renderInRtl(<VectorSvgLabel x={50} y={40} symbol="F" subscript="2" tone="force2" magnitude="2.4 N" anchor="middle" />)
    const magnitude = container.querySelector('.vec-svg-label__magnitude')!
    expect(magnitude.textContent).toBe('2.4 N') // not "N 2.4"
    expect(magnitude.getAttribute('direction')).toBe('ltr')
    expect(magnitude.getAttribute('unicode-bidi')).toBe('isolate')
    expect(magnitude.getAttribute('text-anchor')).toBe('middle')
    expect(attr(magnitude, 'y')).toBeGreaterThan(attr(container.querySelector('.vec-svg-label__sub'), 'y'))
  })

  it('aligns the whole block physically: start → right of x, end → left of x', () => {
    const symbolX = (anchor: 'start' | 'end') => {
      const { container, unmount } = renderInRtl(<VectorSvgLabel x={100} y={40} symbol="F" subscript="1" magnitude="4 N" anchor={anchor} />)
      const label = container.querySelector('[data-vector-label="F"]')!
      const translate = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(label.getAttribute('transform') ?? '')!
      const x = Number(translate[1]) + attr(container.querySelector('.vec-svg-label__symbol'), 'x')
      unmount()
      return x
    }
    expect(symbolX('start')).toBeGreaterThan(100) // block begins at x: the symbol is to its right
    expect(symbolX('end')).toBeLessThan(100) // block ends at x: the symbol is to its left
  })

  it('draws the accent as real geometry: a shaft plus a closed arrowhead pointing right', () => {
    const { container } = renderInRtl(<VectorSvgLabel x={50} y={40} symbol="w" tone="weight" />)
    const line = container.querySelector('.vec-svg-label__accent line')!
    const head = container.querySelector('.vec-svg-label__accent path')!
    expect(head.getAttribute('d')).toMatch(/^M [-\d.]+ [-\d.]+ L [-\d.]+ [-\d.]+ L [-\d.]+ [-\d.]+ Z$/)
    const tipX = Number(/^M ([-\d.]+)/.exec(head.getAttribute('d')!)![1])
    expect(tipX).toBeGreaterThan(attr(line, 'x1')) // points right, like KaTeX's \vec
    expect(container.textContent).not.toContain('\u20d7') // never the combining glyph
  })

  it('puts the accent lower over a lowercase letter than over a capital', () => {
    const accentY = (symbol: string) => attr(renderInRtl(<VectorSvgLabel x={0} y={0} symbol={symbol} />).container.querySelector('.vec-svg-label__accent line'), 'y1')
    expect(accentY('F')).toBeLessThan(accentY('w')) // more negative = higher
  })

  it('reads «نسخة F₁» right-to-left: the Arabic caption sits to the right of the symbol', () => {
    const { container } = renderInRtl(<VectorSvgLabel x={100} y={40} symbol="F" subscript="1" prefix="نسخة" size={13} anchor="middle" />)
    const prefix = container.querySelector('.vec-svg-label__prefix')!
    expect(prefix.textContent).toBe('نسخة')
    expect(prefix.getAttribute('direction')).toBe('rtl')
    expect(attr(prefix, 'x')).toBeGreaterThan(attr(container.querySelector('.vec-svg-label__symbol'), 'x'))
  })

  it('derives every coordinate from one pure layout (what the tests and the solver see is what is drawn)', () => {
    const layout = vectorLabelLayout({ symbol: 'F', subscript: '1', magnitude: '4 N', anchor: 'middle' })
    const { container } = renderInRtl(<VectorSvgLabel x={0} y={0} symbol="F" subscript="1" magnitude="4 N" anchor="middle" />)
    expect(attr(container.querySelector('.vec-svg-label__symbol'), 'x')).toBeCloseTo(layout.cx, 5)
    expect(attr(container.querySelector('.vec-svg-label__sub'), 'x')).toBeCloseTo(layout.sub!.x, 5)
    expect(attr(container.querySelector('.vec-svg-label__magnitude'), 'y')).toBeCloseTo(layout.magnitude!.y, 5)
  })
})

describe('VectorArrow halo layering and stroke width', () => {
  it('applies strokeWidth inline, so a CSS rule cannot silently override it', () => {
    const { container } = render(
      <svg>
        <VectorArrow x1={0} y1={0} x2={80} y2={0} role="force1" strokeWidth={4.5} />
      </svg>,
    )
    const shaft = container.querySelector('.diagram-vector__shaft') as SVGElement
    expect(shaft.style.strokeWidth).toBe('4.5')
  })

  it('has no halo unless asked for (a lone halo would fringe over earlier arrows)', () => {
    const plain = render(
      <svg>
        <VectorArrow x1={0} y1={0} x2={80} y2={0} role="force1" />
      </svg>,
    )
    expect(plain.container.querySelector('.diagram-vector__halo')).toBeNull()
    const haloed = render(
      <svg>
        <VectorArrow x1={0} y1={0} x2={80} y2={0} role="force1" halo />
      </svg>,
    )
    expect(haloed.container.querySelector('.diagram-vector__halo')).not.toBeNull()
  })

  it('VectorArrowSet draws ALL halos before ANY arrow, and keeps one arrow group per child', () => {
    const { container } = render(
      <svg>
        <VectorArrowSet>
          <VectorArrow x1={10} y1={10} x2={90} y2={10} role="force1" />
          <VectorArrow x1={10} y1={10} x2={90} y2={60} role="force2" />
          <VectorArrow x1={10} y1={10} x2={10} y2={90} role="weight" />
        </VectorArrowSet>
      </svg>,
    )
    const order = [...container.querySelectorAll('.diagram-vector-halos, .diagram-vector')]
    expect(order).toHaveLength(4) // one halo layer + the three arrows, unchanged
    expect(order[0]!.classList.contains('diagram-vector-halos')).toBe(true) // underneath everything
    expect(container.querySelectorAll('.diagram-vector-halos .diagram-vector__halo')).toHaveLength(3)
    // the arrows themselves carry no halo, so none can paint over another arrow
    for (const arrow of container.querySelectorAll('.diagram-vector')) {
      expect(arrow.querySelector('.diagram-vector__halo')).toBeNull()
      expect(arrow.querySelector('.diagram-vector__shaft')).not.toBeNull()
      expect(arrow.querySelector('.diagram-vector__head')).not.toBeNull()
    }
    // and the halo layer is decorative: hidden from assistive technology
    expect(container.querySelector('.diagram-vectors-halos, .diagram-vector-halos')!.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('concurrent forces lab: figure facts the layout must keep true', () => {
  it('draws each spring along its force and labels F₁, F₂ and w with arrow accents', () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="concurrent-forces-lab" reducedMotion />)
    const labels = [...container.querySelectorAll('[data-vector-label]')].map((node) => node.getAttribute('data-vector-label'))
    expect(labels.sort()).toEqual(['F', 'F', 'w'])
    for (const label of container.querySelectorAll('[data-vector-label]')) expect(label.getAttribute('direction')).toBe('ltr')
    // the three arrows share ONE halo layer
    expect(container.querySelectorAll('.diagram-vector-halos')).toHaveLength(1)
    expect(container.querySelectorAll('[data-forces="tensions"] .diagram-vector')).toHaveLength(3)
    // the magnitudes read `value N`, never `N value`
    for (const magnitude of container.querySelectorAll('.vec-svg-label__magnitude')) {
      expect(magnitude.textContent).toMatch(/^[\d.]+ N$/)
    }
  })
})
