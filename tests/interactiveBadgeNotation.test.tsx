/**
 * Interactive particle badges — the `e⁻` contract.
 *
 * Why this suite exists: four interactive components hardcoded `e` immediately
 * followed by a bare sup element inside badge containers that are CSS Grid
 * (`display: grid|inline-grid; place-items: center`).
 *
 * In grid layout every child of the container becomes a grid item in its own
 * implicit row, and `vertical-align` does not apply to grid items. The `e` and
 * the sup therefore became two rows: measured in real Chromium on the shipped
 * build, the charge sat +15…+34 px below the top of the badge and to the right
 * of the `e`, i.e. on a second line instead of raised above it.
 *
 * The contract therefore has three parts, and this suite asserts all three:
 *
 *  1. DOM — every badge holds exactly ONE element child: the shared
 *     `ChargeNotation` wrapper, which owns the body AND the charge. The charge
 *     must never be a sibling of the body inside a grid container.
 *  2. Source — no simulation may hand-write a scientific charge outside the
 *     shared notation layer.
 *  3. Layout — the shared `.sci-sup` raise must not be cancelled by a component
 *     rule. `.ion-notation__charge` used to reset `position` to `static` and
 *     `inset` to `auto`, which silently discarded
 *     `top: calc(-1 * var(--sci-sup-raise))` and left the charge lifted by the
 *     grid row alignment instead (~0.54em) — off the platform contract.
 *
 * Part 3's pixel-level half needs a layout engine and is verified by
 * `scripts/verify-badge-rendering.mjs` (real Chromium, see its header), because
 * jsdom computes no layout at all.
 */

import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ChargeNotation, IonNotation } from '@/scientific'
import BohrEnergyTransition from '@/simulations/BohrEnergyTransition'
import IonicBondingLab from '@/simulations/IonicBondingLab'
import IonFormationLab from '@/simulations/IonFormationLab'
import IonEquationLab from '@/simulations/IonEquationLab'
import type { InteractiveProps } from '@/simulations/registry'
import { readProjectFile } from './utils/projectFiles'

/* ---------------------------------------------------------------------------
 * The four interactive badges and the container each one renders `e⁻` into.
 * `advance` clicks the lab's primary action the given number of times: the
 * IonFormationLab and IonEquationLab badges only exist once a transfer started.
 * ------------------------------------------------------------------------ */

type BadgeCase = {
  name: string
  Component: (props: InteractiveProps) => JSX.Element
  interactiveId: string
  /** CSS class of the grid container that draws the electron disc. */
  container: string
  advance: number
}

const BADGES: BadgeCase[] = [
  { name: 'BohrEnergyTransition', Component: BohrEnergyTransition, interactiveId: 'bohr-energy-transition', container: 'bohr-electron', advance: 0 },
  { name: 'IonicBondingLab', Component: IonicBondingLab, interactiveId: 'ionic-bonding-lab', container: 'ionic-bond-lab__particle', advance: 0 },
  { name: 'IonFormationLab', Component: IonFormationLab, interactiveId: 'ion-formation-lab', container: 'ion-transfer-particle', advance: 1 },
  { name: 'IonEquationLab', Component: IonEquationLab, interactiveId: 'ion-equation-lab', container: 'ion-equation-lab__particle', advance: 1 },
]

/** Renders the lab, drives it to the state that shows the badge, returns it. */
function renderBadge(testCase: BadgeCase): { badge: HTMLElement; unmount: () => void } {
  const { container, unmount } = render(
    <testCase.Component interactiveId={testCase.interactiveId} reducedMotion />,
  )

  for (let step = 0; step < testCase.advance; step += 1) {
    const trigger = container.querySelector<HTMLButtonElement>('.lab__actions .button--primary')
    expect(trigger, `${testCase.name}: primary action must exist`).not.toBeNull()
    fireEvent.click(trigger!)
  }

  const badge = container.querySelector<HTMLElement>(`.${testCase.container}`)
  expect(badge, `${testCase.name}: .${testCase.container} must render`).not.toBeNull()
  return { badge: badge!, unmount }
}

/* ---------------------------------------------------------------------------
 * 1. DOM: one inline notation child, never `e` and the charge as siblings.
 * ------------------------------------------------------------------------ */

describe('interactive electron badges — one inline notation unit', () => {
  for (const testCase of BADGES) {
    describe(testCase.name, () => {
      it('holds exactly one element child — no second grid item for the charge', () => {
        const { badge, unmount } = renderBadge(testCase)

        // A second element child would become a second grid item, i.e. a second
        // row, which is precisely the defect this suite guards.
        expect(badge.children).toHaveLength(1)
        // Whitespace-free: a stray text node next to the wrapper would be laid
        // out as its own anonymous grid item too.
        const textChildren = [...badge.childNodes].filter(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
        )
        expect(textChildren).toHaveLength(0)

        unmount()
      })

      it('renders the shared ChargeNotation wrapper with body and charge inside', () => {
        const { badge, unmount } = renderBadge(testCase)
        const wrapper = badge.firstElementChild as HTMLElement

        expect(wrapper.tagName).toBe('SPAN')
        expect(wrapper.classList.contains('charge-notation')).toBe(true)
        expect(wrapper.classList.contains('particle-notation')).toBe(true)

        // The body and the charge are children of the SAME inline wrapper, so
        // they share one line box and `vertical-align` applies to the charge.
        const body = wrapper.querySelector('.charge-notation__body')
        expect(body?.textContent).toBe('e')

        const charge = wrapper.querySelector('sup')
        expect(charge?.classList.contains('sci-sup')).toBe(true)
        expect(charge?.textContent).toBe('\u2212')
        expect(charge?.parentElement).not.toBe(badge)

        unmount()
      })

      it('keeps the charge out of the grid container and inside the shared contract', () => {
        const { badge, unmount } = renderBadge(testCase)

        // Exactly one sup, it carries `.sci-sup`, and no bare sup element
        // survives anywhere in the badge.
        const sups = [...badge.querySelectorAll('sup')]
        expect(sups).toHaveLength(1)
        expect(sups[0]!.classList.contains('sci-sup')).toBe(true)

        // The element that draws `e` and the element that draws `−` are not
        // siblings inside the container: `e` sits one level deeper.
        const body = badge.querySelector('.charge-notation__body')!
        expect(body.parentElement).not.toBe(badge)
        expect(body.parentElement).toBe(sups[0]!.closest('.charge-notation'))

        // Accessible name still reads as one species.
        expect(badge.firstElementChild?.getAttribute('aria-label')).toBe('e\u207B')

        unmount()
      })
    })
  }
})

/* ---------------------------------------------------------------------------
 * 2. Source: scientific charges only ever come from the shared layer.
 * ------------------------------------------------------------------------ */

describe('no interactive component hand-writes a scientific charge', () => {
  const simulationFiles = [
    'BohrEnergyTransition',
    'IonicBondingLab',
    'IonFormationLab',
    'IonEquationLab',
    'ValenceModelLab',
    'FormulaBuilderLab',
    'CovalentBondLab',
    'ElectronShellBuilder',
    'IsotopeLab',
    'RutherfordScattering',
  ].map((name) => `src/simulations/${name}.tsx`)

  it('emits no bare sup element in the simulation layer', () => {
    for (const file of simulationFiles) {
      const source = readProjectFile(file)
      expect(source, `${file} must use SciSup/ChargeNotation, not a bare sup element`).not.toMatch(/<sup[\s/>]/)
    }
  })

  it('does not hardcode an electron or proton charge next to a script tag', () => {
    for (const file of simulationFiles) {
      const source = readProjectFile(file)
      // `e<sup>`, `p<sup>`, `2e<sup>` — the exact shape of the defect.
      expect(source, `${file} must not glue a particle symbol to a script tag`).not.toMatch(/[A-Za-z0-9]\s*<\s*sup/)
    }
  })

  it('renders the BohrAtom charge through the shared superscript component', () => {
    const source = readProjectFile('src/scientific/BohrAtom.tsx')
    expect(source).not.toMatch(/<sup[\s/>]/)
    expect(source).toContain('SciSup')
  })
})

/* ---------------------------------------------------------------------------
 * 3. Layout: the shared raise must not be cancelled, and badges stay centered.
 * ------------------------------------------------------------------------ */

describe('the shared superscript contract survives every component rule', () => {
  const scientificCss = readProjectFile('src/styles/scientific.css')
  const componentsCss = readProjectFile('src/styles/scientific-components.css')
  const appComponentsCss = readProjectFile('src/styles/components.css')

  /**
   * The declaration block of the first rule whose selector starts with
   * `selector`. A rule may follow another rule or a comment, so no fixed
   * preceding character is required; the trailing `{` is what pins the match to
   * the rule itself rather than to a longer class name such as
   * `.ion-notation__body`.
   */
  function blockOf(css: string, selector: string): string {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return css.match(new RegExp(`${escaped}\\s*(?:,[^{}]*)?\\{([^}]*)\\}`, 's'))?.[1] ?? ''
  }

  it('still raises every shared sup from the design token', () => {
    const scriptBlock = scientificCss.match(/\.sci-sup,\s*\.sci-sub\s*\{[^}]*\}/s)?.[0] ?? ''
    expect(scriptBlock).toContain('position: relative')

    const supBlock = scientificCss.match(/\.sci-sup\s*\{[^}]*top:[^}]*\}/s)?.[0] ?? ''
    expect(supBlock).toContain('vertical-align: baseline')
    expect(supBlock).toContain('top: calc(-1 * var(--sci-sup-raise))')
  })

  it('does not let .ion-notation__charge cancel the raise', () => {
    const block = blockOf(componentsCss, '.ion-notation__charge')

    // Resetting either of these discards `top: calc(-1 * var(--sci-sup-raise))`
    // (a static box ignores `top`; `inset: auto` overwrites the offset).
    expect(block, '.ion-notation__charge must not reset position').not.toMatch(/position:\s*static/)
    expect(block, '.ion-notation__charge must not reset inset').not.toMatch(/inset:\s*auto/)
    expect(block, '.ion-notation__charge must not reset top').not.toMatch(/(?:^|[;\s])top:\s*auto/)
  })

  it('aligns ion notation on the baseline, so only the token lifts the charge', () => {
    const block = blockOf(componentsCss, '.ion-notation')

    // `align-items: start` also lifted the charge, by the row alignment of its
    // shorter line box (~0.54em) — a second, silent raise that made the token
    // ineffectual.
    expect(block).toMatch(/align-items:\s*baseline/)
    expect(block).not.toMatch(/align-items:\s*start/)
  })

  it('keeps the badge context rule that preserves colour and weight', () => {
    const block = blockOf(componentsCss, '.particle-notation')
    expect(block).toContain('color: inherit')
    expect(block).toContain('font-weight: inherit')
    // It must load after the shared component defaults it overrides.
    expect(componentsCss.indexOf('.particle-notation')).toBeGreaterThan(
      componentsCss.indexOf('.charge-notation {'),
    )
  })

  it('keeps every badge container centering its single notation child', () => {
    for (const testCase of BADGES) {
      const block = blockOf(appComponentsCss, `.${testCase.container}`)
      expect(block, `${testCase.container} block must exist`).not.toBe('')
      expect(block, `${testCase.container} must be a grid container`).toMatch(/display:\s*(?:inline-)?grid/)
      // `place-items: center` or the equivalent pair — centering must survive.
      const centers = /place-items:\s*center/.test(block) ||
        (/align-items:\s*center/.test(block) && /justify-content:\s*center/.test(block)) ||
        (/align-items:\s*center/.test(block) && /justify-items:\s*center/.test(block) && !/place-items/.test(block))
      expect(centers, `${testCase.container} must center its content`).toBe(true)
    }
  })
})

/* ---------------------------------------------------------------------------
 * 4. Every required species renders as one notation unit with a real <sup>.
 * ------------------------------------------------------------------------ */

type SpeciesCase = {
  source: string
  body: string
  sup: string
  sub?: string
  coefficient?: string
}

const SPECIES: SpeciesCase[] = [
  { source: 'e\u207B', body: 'e', sup: '\u2212' },
  { source: '2e\u207B', body: 'e', sup: '\u2212', coefficient: '2' },
  { source: 'H\u207A', body: 'H', sup: '+' },
  { source: '2H\u207A', body: 'H', sup: '+', coefficient: '2' },
  { source: 'Na\u207A', body: 'Na', sup: '+' },
  { source: 'Cl\u207B', body: 'Cl', sup: '\u2212' },
  { source: 'OH\u207B', body: 'OH', sup: '\u2212' },
  { source: 'NH\u2084\u207A', body: 'NH', sup: '+', sub: '4' },
  { source: 'Ca\u00B2\u207A', body: 'Ca', sup: '2+' },
  { source: 'O\u00B2\u207B', body: 'O', sup: '2\u2212' },
  { source: 'Al\u00B3\u207A', body: 'Al', sup: '3+' },
  { source: 'SO\u2084\u00B2\u207B', body: 'SO', sup: '2\u2212', sub: '4' },
  { source: 'NO\u2083\u207B', body: 'NO', sup: '\u2212', sub: '3' },
  { source: 'PO\u2084\u00B3\u207B', body: 'PO', sup: '3\u2212', sub: '4' },
]

describe('required species render as one notation unit', () => {
  it('renders each species through ChargeNotation with the charge in a shared <sup>', () => {
    for (const species of SPECIES) {
      const { container, unmount } = render(<ChargeNotation source={species.source} />)

      const wrapper = container.querySelector('.charge-notation')
      expect(wrapper, species.source).not.toBeNull()
      // The Unicode superscript glyphs are re-spelled into real markup, so the
      // drawn text is coefficient + body + index + sign on the plain baseline.
      expect(wrapper?.textContent, species.source).toBe(
        `${species.coefficient ?? ''}${species.body}${species.sub ?? ''}${species.sup}`,
      )

      const sups = [...container.querySelectorAll('sup')]
      expect(sups.map((element) => element.textContent), species.source).toEqual([species.sup])
      expect(sups[0]!.classList.contains('sci-sup'), species.source).toBe(true)

      const subs = [...container.querySelectorAll('sub')]
      expect(subs.map((element) => element.textContent), species.source).toEqual(
        species.sub ? [species.sub] : [],
      )

      const body = container.querySelector('.charge-notation__body')
      expect(body?.textContent, species.source).toContain(species.body)

      const coefficient = container.querySelector('.charge-notation__coefficient')
      expect(coefficient?.textContent, species.source).toBe(species.coefficient ?? undefined)

      // No Unicode charge glyph may survive outside a script element.
      const loose = [...container.querySelectorAll('*')]
        .filter((element) => !element.closest('sup, sub'))
        .map((element) => element.textContent ?? '')
        .join('')
      expect(loose, species.source).not.toMatch(/[\u207A\u207B]/)

      unmount()
    }
  })

  it('renders the ionic species used by the labs through IonNotation', () => {
    const cases: Array<[string, string, string, string?]> = [
      ['Na', '+', 'Na', undefined],
      ['Cl', '-', 'Cl', undefined],
      ['Ca', '2+', 'Ca', undefined],
      ['SO4', '2-', 'SO4', '4'],
    ]

    for (const [formula, charge, body, sub] of cases) {
      const { container, unmount } = render(<IonNotation formula={formula} charge={charge} />)

      const sups = [...container.querySelectorAll('sup')]
      expect(sups, `${formula}${charge}`).toHaveLength(1)
      expect(sups[0]!.classList.contains('sci-sup')).toBe(true)
      const subs = [...container.querySelectorAll('sub')]
      expect(subs.map((element) => element.textContent)).toEqual(sub ? [sub] : [])
      expect(container.textContent).toContain(body)

      // The charge is a grid item here on purpose (the ion is an inline-grid of
      // body + charge) — what must hold is that it stays inside the shared
      // contract: `.sci-sup`, and no glyph escaping above the body.
      const loose = [...container.querySelectorAll('*')]
        .filter((element) => !element.closest('sup, sub'))
        .map((element) => element.textContent ?? '')
        .join('')
      expect(loose, `${formula}${charge}`).not.toMatch(/[\u207A\u207B]/)

      unmount()
    }
  })
})
