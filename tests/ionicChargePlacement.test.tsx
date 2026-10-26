/**
 * Ionic charge placement — position and internal ordering, on every surface.
 *
 * Why this suite exists
 * ---------------------
 * The platform could already render `Ca²⁺` correctly, and it passed its own
 * audits while the LESSON 1 TABLE rendered the sodium ion as `+²³₁₁Na`:
 *
 *   · `²³₁₁Na⁺` is a compact nuclide WITH a charge. The nuclide rule matched
 *     the leading script digits and the symbol (`²³₁₁Na`) and stopped; the
 *     charge rule never saw the token, because its body pattern requires a
 *     Latin letter. So the trailing `⁺` was left over as PROSE.
 *   · Prose is not isolated. A `<span>⁺</span>` inside an RTL cell is laid out
 *     by the bidi algorithm as its own neutral run — to the LEFT of the
 *     isolated nuclide — and, having no `<sup>`, on the normal baseline.
 *
 * The audits missed it because they only flagged a sign that was ADJACENT to a
 * species character inside one text node. Here a bare sign text node is the
 * defect, and `chargeNotationCoverage.test.tsx` now flags that too.
 *
 * What is asserted
 * ----------------
 *  A. Ordering      the charge is ONE `<sup>` holding the magnitude and then
 *                   the sign (`2+`, `3−`), never the reverse; a magnitude of
 *                   one is omitted (`Na⁺`, `Cl⁻`).
 *  B. Placement     the charge element follows the body element in DOM order
 *                   inside one LTR-isolated notation unit, so the charge is at
 *                   the upper right of the symbol/group and cannot be moved to
 *                   its left by `direction: rtl`; it is raised by the shared
 *                   `.sci-sup` baseline rule and not by a paint offset.
 *  C. Subscripts    indices stay `<sub>` (below the baseline) and a group keeps
 *                   its own charge (`(SO4)2-`, `Ca(OH)2`), the charge attached
 *                   to the group rather than to the last atom.
 *  D. Direction     the same species produce the same charge DOM inside an LTR
 *                   isolate, an Arabic RTL paragraph, an ion badge, a chemical
 *                   equation, a lesson content block and a simulation.
 *  E. Nuclides      mass and atomic numbers keep their left-side positions and
 *                   the charge is a superscript on the symbol's right.
 *  F. Scale         `--script-scale` overrides keep one raise owner.
 *
 * The pixel-level half of B (an actual bounding box) needs a layout engine and
 * is verified in real Chromium by `scripts/verify-charge-notation.mjs`, which
 * measures the rendered specimens of the shipped build.
 */

import { describe, expect, it, beforeEach } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from '@/app/theme'
import {
  ChemicalEquation,
  ChemicalFormula,
  IonNotation,
  NuclearNotation,
  ScientificNotationText,
  ScientificText,
} from '@/scientific'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import {
  parseCompactNuclideCharge,
  splitScientificRuns,
} from '@/utils/scientificText'
import IonEquationLab from '@/simulations/IonEquationLab'
import IonFormationLab from '@/simulations/IonFormationLab'
import type { InteractiveProps } from '@/simulations/registry'
import { readProjectFile } from './utils/projectFiles'

const MINUS = '\u2212'
const PLUS_GLYPH = '\u207A'
const MINUS_GLYPH = '\u207B'

/* ---------------------------------------------------------------------------
 * Shared assertions
 * ------------------------------------------------------------------------ */

/** The charge `<sup>` of a notation unit. */
function chargeSup(container: HTMLElement): HTMLElement {
  const sups = [...container.querySelectorAll('sup')]
  expect(sups, 'a charge must be a real <sup> element').toHaveLength(1)
  const sup = sups[0] as HTMLElement
  expect(sup.classList.contains('sci-sup'), sup.outerHTML).toBe(true)
  return sup
}

/**
 * Asserts the charge is ONE superscript unit in magnitude-then-sign order and
 * returns the (magnitude, sign) text pair a reader sees.
 *
 * The order is asserted on the DOM, which is the only thing that survives a
 * change of direction, display mode or font: `2+` is the ionic convention and
 * `+2` is a defect, whatever a screenshot at one zoom level might suggest.
 */
function expectChargeUnit(sup: HTMLElement, expected: { magnitude?: string; sign: '+' | '-' }) {
  const signText = expected.sign === '+' ? '+' : MINUS

  // The charge's two halves live inside ONE inline run, so they share a line box
  // and their order is plain DOM order.
  const run = (sup.querySelector('[class$="run"]') as HTMLElement | null) ?? sup
  for (const part of run.children) {
    expect(['SPAN'], part.outerHTML).toContain(part.tagName)
  }

  const magnitude = run.querySelector('[class$="magnitude"]')
  const sign = run.querySelector('[class$="sign"]')

  expect(sign, `the charge must end with a sign element: ${sup.outerHTML}`).not.toBeNull()
  expect(sign!.textContent).toBe(signText)

  if (expected.magnitude) {
    expect(magnitude, `the charge must carry a magnitude element: ${sup.outerHTML}`).not.toBeNull()
    expect(magnitude!.textContent).toBe(expected.magnitude)

    // Magnitude BEFORE sign, as siblings, in that order.
    expect(
      magnitude!.compareDocumentPosition(sign!) & Node.DOCUMENT_POSITION_FOLLOWING,
      `the magnitude must precede the sign in ${sup.outerHTML}`,
    ).toBeTruthy()
    expect(run.lastElementChild).toBe(sign)
    expect(run.firstElementChild).toBe(magnitude)
    expect(sup.textContent).toBe(`${expected.magnitude}${signText}`)
  } else {
    // A magnitude of one is omitted: `Na⁺`, never `Na1⁺`.
    expect(magnitude, 'a unit charge carries no digit').toBeNull()
    expect(sup.textContent).toBe(signText)
  }

  // No Unicode superscript glyph may survive inside the charge.
  expect(sup.textContent).not.toMatch(/[\u2070-\u2079\u207A\u207B]/)
  return { magnitude: magnitude?.textContent ?? '', sign: sign!.textContent ?? '' }
}

/**
 * The symbol or group a charge is attached to: the nearest preceding element,
 * skipping any subscript between them (`SO₄²⁻` is the charge of the species,
 * written after the index; `(SO₄)²⁻` is the charge of the whole group).
 */
function bodyBefore(sup: HTMLElement): HTMLElement | null {
  // A nuclear charge lives INSIDE the symbol element, which is its body.
  const parent = sup.parentElement
  if (parent?.classList.contains('nuclear-notation__symbol')) return parent

  let node = sup.previousElementSibling as HTMLElement | null
  while (node && node.tagName === 'SUB') node = node.previousElementSibling as HTMLElement | null
  return node
}

/**
 * Asserts the charge is attached to the body it belongs to: same notation unit,
 * after the body in DOM order, inside a `dir="ltr"` isolate.
 */
function expectChargeAttached(container: HTMLElement) {
  const sup = chargeSup(container)
  const notation = sup.closest('[dir="ltr"]')
  expect(notation, `the charge must sit in an LTR isolate: ${sup.outerHTML}`).not.toBeNull()

  const body = bodyBefore(sup)
  expect(body, 'the notation must have a body element').not.toBeNull()
  // The charge follows the body: the upper RIGHT of the symbol, not its left.
  expect(
    body!.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING,
    'the charge must come after the body element',
  ).toBeTruthy()
  // And the body is not inside the superscript.
  expect(sup.contains(body!)).toBe(false)
  return { sup, body: body as HTMLElement, notation: notation as HTMLElement }
}

/** Charge ordering across the whole required table, authored three ways. */
const ORDERING_CASES: Array<{
  source: string
  /** ASCII spelling used by compact data (`Ca2+`). */
  formula: string
  /** Body without the charge (`PO4`), for the standalone component. */
  body: string
  /** Charge without the body (`3-`), for the standalone component. */
  charge: string
  magnitude?: string
  sign: '+' | '-'
}> = [
  { source: 'Na⁺', formula: 'Na+', body: 'Na', charge: '+', sign: '+' },
  { source: 'Ca²⁺', formula: 'Ca2+', body: 'Ca', charge: '2+', magnitude: '2', sign: '+' },
  { source: 'Cl⁻', formula: 'Cl-', body: 'Cl', charge: '-', sign: '-' },
  { source: 'O²⁻', formula: 'O2-', body: 'O', charge: '2-', magnitude: '2', sign: '-' },
  { source: 'Fe³⁺', formula: 'Fe3+', body: 'Fe', charge: '3+', magnitude: '3', sign: '+' },
  // A magnitude-three charge with a negative sign (phosphate).
  { source: 'PO₄³⁻', formula: 'PO43-', body: 'PO4', charge: '3-', magnitude: '3', sign: '-' },
]

/* ---------------------------------------------------------------------------
 * A. Ordering
 * ------------------------------------------------------------------------ */

describe('A. charge ordering — magnitude then sign, never sign then magnitude', () => {
  for (const testCase of ORDERING_CASES) {
    it(`renders ${testCase.source} as one superscript in the textbook order`, () => {
      // Authored the three ways the platform stores ions: Unicode glyphs, ASCII,
      // and the caret form the simulations use. All three must agree.
      const caret = `${testCase.body}^${testCase.charge}`
      for (const spelling of [testCase.formula!, caret]) {
        const { container, unmount } = render(
          <div dir="rtl">
            <ChemicalFormula formula={spelling} />
          </div>,
        )
        const { sup } = expectChargeAttached(container)
        expectChargeUnit(sup, { magnitude: testCase.magnitude, sign: testCase.sign })
        unmount()
      }

      // The prose path, which is where the nuclide bug surfaced.
      const prose = render(
        <p dir="rtl">
          <ScientificNotationText>{`الأيون ${testCase.source} في المحلول`}</ScientificNotationText>
        </p>,
      )
      const { sup } = expectChargeAttached(prose.container)
      expectChargeUnit(sup, { magnitude: testCase.magnitude, sign: testCase.sign })
      prose.unmount()

      // The standalone component the lesson blocks use.
      const ion = render(
        <div dir="rtl">
          <IonNotation formula={testCase.body} charge={testCase.charge} />
        </div>,
      )
      const ionCharge = expectChargeAttached(ion.container)
      expectChargeUnit(ionCharge.sup, {
        magnitude: testCase.magnitude,
        sign: testCase.sign,
      })
      ion.unmount()
    })
  }

  it('never renders a sign before its magnitude for a multi-digit-scale charge', () => {
    // The wrong spellings the previous implementation could produce are asserted
    // ABSENT, so a future refactor cannot silently reintroduce them.
    for (const source of ['Ca²⁺', 'O²⁻', 'Fe³⁺']) {
      const { container, unmount } = render(
        <p dir="rtl">
          <ScientificNotationText>{source}</ScientificNotationText>
        </p>,
      )
      const sup = chargeSup(container)
      expect(sup.textContent).not.toBe('+2')
      expect(sup.textContent).not.toBe(`${MINUS}2`)
      expect(sup.textContent!.indexOf('2')).toBeLessThan(sup.textContent!.search(/[+−]/))
      unmount()
    }
  })

  it('omits the digit for a magnitude of one', () => {
    for (const [source, sign] of [['Na⁺', '+'], ['Cl⁻', '-']] as const) {
      const { container, unmount } = render(<p dir="rtl"><ScientificNotationText>{source}</ScientificNotationText></p>)
      expectChargeUnit(chargeSup(container), { sign })
      unmount()
    }
    // `1+` / `1−` are accepted as input but still render without a digit.
    for (const charge of ['1+', '1-', '+1', '-1']) {
      const { container, unmount } = render(<IonNotation formula="Na" charge={charge} />)
      expectChargeUnit(chargeSup(container), { sign: charge.includes('+') ? '+' : '-' })
      unmount()
    }
  })
})

/* ---------------------------------------------------------------------------
 * B. Placement
 * ------------------------------------------------------------------------ */

describe('B. charge placement — upper right of the symbol, above the baseline', () => {
  it('keeps the charge inside the notation unit, after the body, in one LTR isolate', () => {
    for (const testCase of ORDERING_CASES) {
      const { container, unmount } = render(
        <div dir="rtl">
          <ChemicalFormula formula={testCase.formula!} />
        </div>,
      )
      const { sup, body, notation } = expectChargeAttached(container)

      // One inline box: `vertical-align` applies to an inline-level `<sup>`, so
      // the raise is measured from the symbol's baseline. A flex or grid parent
      // would make the charge a separate item and cancel the raise.
      expect(notation.getAttribute('dir')).toBe('ltr')
      expect(body.parentElement).toBe(sup.parentElement)
      expect(notation.children.length).toBeGreaterThan(0)
      unmount()
    }
  })

  it('positions the charge with the shared baseline raise, never a paint offset', () => {
    const scientificCss = readProjectFile('src/styles/scientific.css')
    const componentsCss = readProjectFile('src/styles/scientific-components.css')

    // The raise has exactly one owner, and it is `vertical-align`.
    const raiseBlocks = [...scientificCss.matchAll(/\.sci-sup[^{}]*\{([^}]*)\}/g)].map((m) => m[1]!)
    const raise = raiseBlocks.find((block) => /vertical-align/.test(block))
    expect(raise, '.sci-sup must own the raise').toBeDefined()
    expect(raise).toMatch(/calc\(\s*var\(--sci-sup-raise\)\s*\/\s*var\(--script-scale/)
    expect(raise).not.toMatch(/position|transform|top:/)

    // No notation component may restate or cancel it. Only `--script-scale`
    // (size) and spacing may be set on a charge.
    for (const selector of [
      '.ion-notation__charge',
      '.chem-formula__charge',
      '.charge-notation__charge',
      '.nuclear-notation__charge',
    ]) {
      const blocks = [...componentsCss.matchAll(new RegExp(`${selector.replace(/[.[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g'))].map(
        (m) => m[1]!,
      )
      for (const block of blocks) {
        expect(block, `${selector} must not re-state the raise`).not.toMatch(/vertical-align|position:\s*(relative|absolute)/)
      }
    }
  })

  it('keeps the charge tight to the symbol it belongs to', () => {
    // A charge that "floats" away is not attached; the only spacing a charge may
    // add is a sub-percent inline margin, and it must be logical (start/end), so
    // it cannot flip to the far side of the symbol in RTL.
    const componentsCss = readProjectFile('src/styles/scientific-components.css')
    for (const selector of ['.ion-notation__charge', '.chem-formula__charge', '.charge-notation__charge']) {
      const blocks = [...componentsCss.matchAll(new RegExp(`${selector.replace(/[.[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g'))].map(
        (m) => m[1]!,
      )
      for (const block of blocks) {
        expect(block, `${selector} must not use a physical side`).not.toMatch(/(?:^|[;{\s])margin-(?:left|right)\s*:/)
        expect(block, `${selector} must not use a physical side`).not.toMatch(/[;{\s](?:left|right)\s*:/)
      }
    }
  })

  it('keeps the charge attached to the group or element a formula put it on', () => {
    // `SO42-`: the 4 is a subscript of O and the charge belongs to the species.
    const { container } = render(<ChemicalFormula formula="SO42-" />)
    const { sup, body } = expectChargeAttached(container)
    expect(body.className).toContain('chem-formula__element')
    expect(body.textContent).toBe('O')
    expect(container.querySelector('sub')!.textContent).toBe('4')
    expect(chargeSup(container)).toBe(sup)
  })
})

/* ---------------------------------------------------------------------------
 * C. Subscripts and grouped ions
 * ------------------------------------------------------------------------ */

describe('C. subscripts and grouped ions', () => {
  it('keeps the index a real subscript below the baseline and the charge above it', () => {
    for (const [source, index, charge] of [
      ['SO₄²⁻', '4', `2${MINUS}`],
      ['CO₃²⁻', '3', `2${MINUS}`],
      ['PO₄³⁻', '4', `3${MINUS}`],
    ] as const) {
      const { container, unmount } = render(
        <p dir="rtl">
          <ScientificNotationText>{source}</ScientificNotationText>
        </p>,
      )
      const sub = container.querySelector('sub')!
      expect(sub, source).not.toBeNull()
      expect(sub.classList.contains('sci-sub')).toBe(true)
      expect(sub.textContent).toBe(index)
      expect(sub.tagName).toBe('SUB')

      const sup = chargeSup(container)
      // Adjacent script content: the subscript and the superscript are separate
      // elements, and the superscript comes last.
      expect(
        sub.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING,
        `${source}: the charge must follow the subscript`,
      ).toBeTruthy()
      expect(sup.textContent, source).toBe(charge)
      unmount()
    }
  })

  it('keeps subscripts and the charge apart in the shared script rules', () => {
    const scientificCss = readProjectFile('src/styles/scientific.css')
    // The subscript drops, the superscript rises: two different owners, so a
    // charge can never be dragged down by an index rule.
    expect(scientificCss).toMatch(/\.sci-sub\s*\{[^}]*vertical-align:\s*calc\(\s*-1\s*\*\s*var\(--sci-sub-drop\)/)
    expect(scientificCss).toMatch(/\.sci-sup\s*\{[^}]*vertical-align:\s*calc\(\s*var\(--sci-sup-raise\)/)
  })

  it('attaches the charge to a parenthesised group, not to the last atom', () => {
    // `(SO4)2-`: the charge belongs to the whole group, after the bracket.
    const { container } = render(
      <div dir="rtl">
        <ChemicalFormula formula="(SO4)2-" />
      </div>,
    )
    const group = container.querySelector('.chem-formula__group')
    expect(group, 'the parentheses must stay a group').not.toBeNull()
    expect(group!.textContent).toBe('(SO4)')

    const sup = chargeSup(container)
    expect(sup.previousElementSibling).toBe(group)
    // The charge is emitted after the group's subscript, so `(SO₄)²⁻` and not
    // `(SO₄²⁻)` with the charge swallowed by the bracket.
    expect(chargeSup(container).parentElement!.lastElementChild).toBe(sup)
    expectChargeUnit(sup, { magnitude: '2', sign: '-' })
  })

  it('keeps a group subscript low while the charge stays high', () => {
    const { container } = render(<ChemicalFormula formula="Ca(OH)2" />)
    const group = container.querySelector('.chem-formula__group')!
    expect(group.textContent).toBe('(OH)')
    const subs = [...container.querySelectorAll('sub')].map((element) => element.textContent)
    expect(subs).toEqual(['2'])
    // No charge, so no superscript: a subscript may not be promoted.
    expect(container.querySelector('sup')).toBeNull()
  })
})

/* ---------------------------------------------------------------------------
 * D. RTL and LTR interaction
 * ------------------------------------------------------------------------ */

/** Everything that decides how a rendered charge reads, as a comparable string. */
function chargeSignature(container: HTMLElement) {
  const sup = chargeSup(container)
  return {
    tag: sup.tagName,
    text: sup.textContent,
    parts: [
      ...((sup.querySelector('[class$="run"]') as HTMLElement | null) ?? sup).children,
    ].map((child) => `${child.tagName}:${child.textContent}`),
    runDir: sup.querySelector('[dir]')?.getAttribute('dir') ?? null,
    afterBody: (() => {
      const body = bodyBefore(sup)
      return body ? Boolean(body.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING) : null
    })(),
  }
}

describe('D. the rendered charge does not change with the surrounding direction', () => {
  const sites: Array<{ name: string; surround: 'ltr' | 'rtl'; render: () => HTMLElement }> = [
    {
      name: 'isolated LTR expression',
      surround: 'ltr',
      render: () => render(<div dir="ltr"><IonNotation formula="Ca" charge="2+" /></div>).container,
    },
    {
      name: 'Arabic RTL paragraph',
      surround: 'rtl',
      render: () =>
        render(
          <p dir="rtl">
            <ScientificNotationText>الأيون Ca²⁺ في المحلول</ScientificNotationText>
          </p>,
        ).container,
    },
    {
      name: 'Arabic RTL paragraph, pure ScientificText',
      surround: 'rtl',
      render: () =>
        render(
          <p dir="rtl">
            <ScientificText>الأيون Ca²⁺ في المحلول</ScientificText>
          </p>,
        ).container,
    },
    {
      name: 'ion badge (grid container)',
      surround: 'rtl',
      render: () =>
        render(
          <div dir="rtl" style={{ display: 'grid', placeItems: 'center' }}>
            <IonNotation formula="Ca" charge="2+" size="lg" />
          </div>,
        ).container,
    },
    {
      name: 'chemical equation',
      surround: 'rtl',
      render: () =>
        render(
          <div dir="rtl">
            <ChemicalEquation reactants={['Ca']} products={['Ca2+']} />
          </div>,
        ).container,
    },
    {
      name: 'lesson content block',
      surround: 'rtl',
      render: () =>
        render(
          <div dir="rtl">
            <ContentBlocks
              blocks={[{ kind: 'ion', formula: 'Ca', charge: '2+', attribution: 'textbook' }]}
            />
          </div>,
        ).container,
    },
  ]

  it('produces the same charge DOM in every site', () => {
    const signatures = new Map<string, unknown>()
    for (const site of sites) {
      const container = site.render()
      // The surrounding direction really is what the site claims.
      expect(container.querySelector(`[dir="${site.surround}"]`), site.name).not.toBeNull()
      signatures.set(site.name, chargeSignature(container))
    }

    const [first, ...rest] = [...signatures.entries()]
    for (const [name, signature] of rest) {
      expect(signature, `${name} must render the charge exactly like ${first![0]}`).toEqual(first![1])
    }
    // And the charge is magnitude-then-sign in all of them, attached to the
    // body, inside an LTR run.
    expect(first![1]).toEqual({
      tag: 'SUP',
      text: '2+',
      parts: ['SPAN:2', 'SPAN:+'],
      runDir: 'ltr',
      afterBody: true,
    })
  })

  it('renders the same ordering inside a simulation', () => {
    const { container, unmount } = render(
      <ThemeProvider>
        <IonEquationLab interactiveId="ion-equation-lab" reducedMotion />
      </ThemeProvider>,
    )
    // The lab opens on the sodium half-equation; the calcium equation carries
    // the `2+` charge this suite is about.
    const calcium = [...container.querySelectorAll<HTMLButtonElement>('.ion-equation-lab__choice')].find(
      (button) => button.textContent?.trim() === 'Ca',
    )
    expect(calcium, 'the lab must offer the calcium equation').toBeDefined()
    fireEvent.click(calcium!)

    const sups = [...container.querySelectorAll('sup')].map((element) => element.textContent)
    expect(sups).toContain('2+')
    expect(sups).toContain(MINUS)
    // No sign-first ordering anywhere in the simulation.
    expect(sups).not.toContain('+2')
    expect(sups).not.toContain(`${MINUS}2`)
    // Every superscript is raised by the shared rule.
    for (const sup of container.querySelectorAll('sup')) {
      expect(sup.classList.contains('sci-sup')).toBe(true)
    }
    unmount()
  })

  it('renders the same ordering in an interactive ion badge', () => {
    const Component = IonFormationLab as (props: InteractiveProps) => JSX.Element
    const { container, unmount } = render(
      <ThemeProvider>
        <Component interactiveId="ion-formation-lab" reducedMotion />
      </ThemeProvider>,
    )
    // Walk the lab to the state that shows the calcium ion badge.
    for (let step = 0; step < 12; step += 1) {
      const trigger = container.querySelector<HTMLButtonElement>('.lab__actions .button--primary')
      if (!trigger) break
      trigger.click()
    }
    const sups = [...container.querySelectorAll('sup')].map((element) => element.textContent)
    expect(sups).not.toContain('+2')
    for (const sup of container.querySelectorAll('sup')) {
      expect(sup.classList.contains('sci-sup')).toBe(true)
    }
    unmount()
  })
})

/* ---------------------------------------------------------------------------
 * E. Nuclear notation
 * ------------------------------------------------------------------------ */

describe('E. nuclear notation — numbers left, charge right', () => {
  it('renders a charged compact nuclide as one species with a real superscript charge', () => {
    // This is the exact defect: the sign used to be left over as prose, which an
    // RTL cell laid out to the LEFT of the nuclide and on the baseline.
    for (const [source, mass, atomic, symbol, magnitude, sign] of [
      ['²³₁₁Na⁺', '23', '11', 'Na', undefined, '+'],
      ['³⁵₁₇Cl⁻', '35', '17', 'Cl', undefined, '-'],
      ['¹⁸₈O²⁻', '18', '8', 'O', '2', '-'],
    ] as const) {
      // The splitter claims the whole species as ONE run.
      expect(splitScientificRuns(source), source).toEqual([
        { kind: 'science', value: source, notation: 'nuclide-charge' },
      ])
      expect(parseCompactNuclideCharge(source)).toMatchObject({
        symbol,
        massNumber: mass,
        atomicNumber: atomic,
        magnitude: magnitude ?? '',
        sign,
      })

      const { container, unmount } = render(
        <div dir="rtl">
          <p>
            <ScientificNotationText>{`نموذج ${source} في الجدول`}</ScientificNotationText>
          </p>
        </div>,
      )

      const notation = container.querySelector('.nuclear-notation')!
      expect(notation, source).not.toBeNull()
      expect(notation.getAttribute('dir')).toBe('ltr')

      // Numbers on the LEFT of the symbol, symbol centred, charge on its right.
      const numbers = notation.querySelector('.nuclear-notation__numbers')!
      const symbolElement = notation.querySelector('.nuclear-notation__symbol')!
      expect(numbers.textContent).toBe(`${mass}${atomic}`)
      expect(
        numbers.compareDocumentPosition(symbolElement) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()

      const sup = chargeSup(container)
      expect(symbolElement.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expectChargeUnit(sup, { magnitude, sign })

      // Nothing is left behind in the prose, on either side of the nuclide: the
      // charge glyphs must not survive as text.
      expect(container.textContent).not.toContain(PLUS_GLYPH)
      expect(container.textContent).not.toContain(MINUS_GLYPH)
      unmount()
    }
  })

  it('keeps the charge path of NuclearNotation in magnitude-then-sign order', () => {
    for (const [charge, magnitude, sign] of [
      ['2+', '2', '+'],
      ['3-', '3', '-'],
      ['+', undefined, '+'],
      ['-', undefined, '-'],
      ['1+', undefined, '+'],
    ] as const) {
      const { container, unmount } = render(
        <div dir="rtl">
          <NuclearNotation symbol="Na" massNumber={23} atomicNumber={11} charge={charge} />
        </div>,
      )
      expectChargeUnit(chargeSup(container), { magnitude, sign })
      // The numbers are still on the left and untouched.
      expect(container.querySelector('.nuclear-notation__numbers')!.textContent).toBe('2311')
      unmount()
    }
  })

  it('does not confuse a nuclide with an ion charge', () => {
    // A charge alone must not become a nuclide, and a nuclide alone must not
    // acquire a charge.
    expect(parseCompactNuclideCharge('Ca²⁺')).toBeNull()
    expect(parseCompactNuclideCharge('²³₁₁Na')).toBeNull()
    expect(splitScientificRuns('¹⁶₈O')).toEqual([{ kind: 'science', value: '¹⁶₈O' }])
    expect(splitScientificRuns('Ca²⁺')[0]).toMatchObject({ notation: 'charge' })
  })
})

/* ---------------------------------------------------------------------------
 * F. Scale overrides
 * ------------------------------------------------------------------------ */

describe('F. scale overrides keep one raise owner', () => {
  it('keeps the charge DOM identical while --script-scale changes', () => {
    // The scale changes the SIZE of the script only. The DOM — and therefore the
    // order and the attachment — must not depend on it.
    const signatures = [
      { '--sci-sup-scale': '0.62' },
      { '--script-scale': '0.36' },
      { '--script-scale': '0.66' },
    ].map((style) => {
      const { container, unmount } = render(
        <div dir="rtl">
          <span style={style as React.CSSProperties}>
            <IonNotation formula="Fe" charge="3+" />
          </span>
        </div>,
      )
      const signature = chargeSignature(container)
      unmount()
      return signature
    })

    for (const signature of signatures) {
      expect(signature.text).toBe('3+')
      expect(signature.parts).toEqual(['SPAN:3', 'SPAN:+'])
    }
    expect(signatures[1]).toEqual(signatures[0])
    expect(signatures[2]).toEqual(signatures[0])
  })

  it('leaves the production overrides stated as a unitless scale only', () => {
    const componentsCss = readProjectFile('src/styles/scientific-components.css')
    for (const [selector, scale] of [
      ['.nuclear-notation__charge', '0.36'],
      ['.bohr__label-charge', '0.66'],
    ] as const) {
      const blocks = [...componentsCss.matchAll(new RegExp(`${selector.replace(/[.[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`, 'g'))].map(
        (m) => m[1]!,
      )
      expect(blocks.join('\n'), selector).toMatch(new RegExp(`--script-scale:\\s*${scale};`))
      // The override must not carry a raise of its own.
      expect(blocks.join('\n'), selector).not.toMatch(/vertical-align/)
    }
  })
})

/* ---------------------------------------------------------------------------
 * The whole-app audit that missed the original defect, tightened.
 * ------------------------------------------------------------------------ */

describe('no surface may leave an orphan charge sign in prose', () => {
  beforeEach(() => {
    teacherAccess.lock()
    teacherAccess.unlock(TEACHER_PASSWORD)
  })

  it('renders the lesson 1 nuclide-ion table cells with superscript charges', () => {
    // The exact surface on which `+²³₁₁Na` was visible: the book table of
    // sodium and chlorine ion models.
    const { container, unmount } = render(
      <div dir="rtl">
        <ScientificNotationText>
          {'نموذج أيون الصوديوم ²³₁₁Na⁺ ونموذج أيون الكلور ³⁵₁₇Cl⁻'}
        </ScientificNotationText>
      </div>,
    )

    expect(container.textContent).not.toContain(PLUS_GLYPH)
    expect(container.textContent).not.toContain(MINUS_GLYPH)

    const notations = [...container.querySelectorAll('.nuclear-notation')]
    expect(notations).toHaveLength(2)
    const sups = [...container.querySelectorAll('sup')].map((element) => element.textContent)
    expect(sups).toEqual(['+', MINUS])

    // Each charge is inside the notation of its own nuclide, after the symbol.
    for (const notation of notations) {
      const sup = notation.querySelector('sup')!
      const symbol = notation.querySelector('.nuclear-notation__symbol')!
      expect(
        symbol.compareDocumentPosition(sup) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
    unmount()
  })
})
