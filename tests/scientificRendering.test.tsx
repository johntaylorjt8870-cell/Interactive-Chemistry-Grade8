import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import {
  ChargeValue,
  ChemicalEquation,
  ChemicalFormula,
  IonNotation,
  LewisStructure,
  MathFormula,
  NuclearNotation,
  PlatformAddition,
  ScientificTable,
  ScientificText,
  ScientificValue,
  SciSub,
  SciSup,
  TextbookSource,
} from '@/scientific'

/** Every scientific component must declare its own direction explicitly. */
function expectIsolatedLtr(element: Element) {
  expect(element.getAttribute('dir')).toBe('ltr')
  expect(element.className).toMatch(/sci|chem-formula|ion-|charge-value|nuclear-notation|lewis__diagram/)
}

describe('bidi isolation primitives', () => {
  it('isolates a scientific run with an explicit LTR direction', () => {
    const { container } = render(<ScientificText>كتلة الجسم 5 kg هنا</ScientificText>)
    const isolated = container.querySelector('[data-sci="isolated"]')

    expect(isolated).not.toBeNull()
    expect(isolated!.textContent).toBe('5 kg')
    expectIsolatedLtr(isolated!)
  })

  it('keeps the surrounding Arabic text out of the isolated run', () => {
    const { container } = render(<ScientificText>درجة الحرارة 25 °C في المثال</ScientificText>)

    expect(container.textContent).toBe('درجة الحرارة 25 °C في المثال')
    const isolated = container.querySelector('[data-sci="isolated"]')!
    expect(isolated.textContent).toBe('25 °C')
    // The Arabic before the value is a sibling text node, not inside the isolate.
    expect(isolated.previousSibling?.textContent).toBe('درجة الحرارة ')
    expect(isolated.nextSibling?.textContent).toBe(' في المثال')
  })

  it('can be switched off for pure prose', () => {
    const { container } = render(<ScientificText autoIsolate={false}>نص عربي فقط</ScientificText>)
    expect(container.querySelector('[data-sci="isolated"]')).toBeNull()
  })
})

describe('ScientificValue — number before unit', () => {
  it('renders the number first and the unit to its right, LTR isolated', () => {
    const { container } = render(<ScientificValue value={5} unit="kg" />)
    const value = container.querySelector('.sci-value')!

    expect(value.getAttribute('dir')).toBe('ltr')
    const children = [...value.children].map((child) => child.className)
    expect(children).toEqual(['sci-value__number', 'sci-value__unit'])
    expect(value.textContent).toBe('5kg')
  })

  it('keeps a compound unit intact after the number', () => {
    const { container } = render(<ScientificValue value={9.8} unit="m/s²" />)
    expect(container.querySelector('.sci-value__number')!.textContent).toBe('9.8')
    expect(container.querySelector('.sci-value__unit')!.textContent).toBe('m/s²')
  })

  it('renders scientific notation with a raised exponent', () => {
    const { container } = render(<ScientificValue value="6.02" exponent="23" unit="mol⁻¹" />)
    const exponent = container.querySelector('.sci-value__exponent')!

    expect(exponent.querySelector('.sci-value__base')!.textContent).toBe('10')
    expect(exponent.querySelector('sup')!.textContent).toBe('23')
    expect(container.querySelector('.sci-value__unit')!.textContent).toBe('mol⁻¹')
  })

  it('supports uncertainty', () => {
    const { container } = render(<ScientificValue value="9.8" uncertainty="0.1" unit="m/s²" />)
    expect(container.querySelector('.sci-value__uncertainty')!.textContent).toBe('0.1')
    expect(container.textContent).toContain('±')
  })
})

describe('ChemicalFormula — real subscripts', () => {
  it('renders subscripts as <sub> elements, never as spacing tricks', () => {
    const { container } = render(<ChemicalFormula formula="H2O" />)
    const formula = container.querySelector('.chem-formula')!

    expectIsolatedLtr(formula)
    expect(formula.getAttribute('data-formula')).toBe('H2O')
    expect(within(formula as HTMLElement).getByText('2').tagName).toBe('SUB')
    expect(formula.textContent).toBe('H2O')
  })

  it('keeps a subscript attached to the element it indexes', () => {
    const { container } = render(<ChemicalFormula formula="CaCO3" />)
    const nodes = [...container.querySelectorAll('.chem-formula__element')].map((node) => node.textContent)
    expect(nodes).toEqual(['Ca', 'C', 'O'])
    expect(container.querySelector('sub')!.textContent).toBe('3')
  })

  it('renders groups with their own subscript', () => {
    const { container } = render(<ChemicalFormula formula="Ca(OH)2" />)
    const group = container.querySelector('.chem-formula__group')!

    expect(group.textContent).toBe('(OH)')
    expect(container.querySelector('sub')!.textContent).toBe('2')
    // The closing parenthesis is a real character, not a bracket workaround.
    expect(group.textContent?.endsWith(')')).toBe(true)
  })

  it('renders a charge inside a formula as magnitude then sign', () => {
    const { container } = render(<ChemicalFormula formula="SO42-" />)
    const charge = container.querySelector('.chem-formula__charge')!

    expect(charge.tagName).toBe('SUP')
    expect(charge.textContent).toBe('2\u2212')
  })

  it('describes the formula for assistive technology', () => {
    render(<ChemicalFormula formula="H2O" />)
    expect(screen.getByRole('math', { name: 'H2O' })).toBeInTheDocument()
  })
})

describe('ChemicalEquation', () => {
  it('renders reactants before products with an arrow', () => {
    const { container } = render(<ChemicalEquation reactants={['CaCO3']} products={['CaO', 'CO2']} />)
    const equation = container.querySelector('.chem-equation')!

    expect(equation.getAttribute('dir')).toBe('ltr')
    expect(equation.textContent).toContain('→')
    const first = equation.querySelector('.chem-formula')!
    expect(first.textContent).toBe('CaCO3')
  })
})

describe('IonNotation and ChargeValue — the two charge conventions', () => {
  it('renders an ion charge as magnitude then sign (Ca²⁺)', () => {
    const { container } = render(<IonNotation formula="Ca" charge="2+" />)
    const ion = container.querySelector('.ion-notation')!
    const charge = ion.querySelector('.ion-notation__charge')!

    expectIsolatedLtr(ion)
    expect(charge.tagName).toBe('SUP')
    expect(charge.querySelector('.ion-notation__magnitude')!.textContent).toBe('2')
    expect(charge.querySelector('.ion-notation__sign')!.textContent).toBe('+')
  })

  it.each([
    ['Ca', '2+', '2+'],
    ['K', '+', '+'],
    ['F', '-', '−'],
    ['O', '2-', '2−'],
    ['Na', '+', '+'],
    ['Cl', '-', '−'],
    ['SO4', '2-', '2−'],
  ])('keeps the charge at the upper-right of %s in magnitude-sign order', (formula, chargeInput, expectedCharge) => {
    const { container } = render(<div dir="rtl"><IonNotation formula={formula} charge={chargeInput} /></div>)
    const ion = container.querySelector('.ion-notation')!
    const charge = ion.querySelector('.ion-notation__charge')!

    expectIsolatedLtr(ion)
    expect([...ion.children].map((child) => child.className)).toEqual([
      'ion-notation__body',
      'sci-sup ion-notation__charge',
    ])
    expect([...charge.children].map((child) => child.className)).toEqual(
      expectedCharge.length === 1 ? ['ion-notation__sign'] : ['ion-notation__magnitude', 'ion-notation__sign'],
    )
    expect(charge.textContent).toBe(expectedCharge)
    expect(ion.getAttribute('data-ion')).toBe(`${formula}${expectedCharge}`)
  })

  it('renders a polyatomic ion with its subscript and charge', () => {
    const { container } = render(<IonNotation formula="SO4" charge="2-" />)

    expect(container.querySelector('sub')!.textContent).toBe('4')
    expect(container.querySelector('.ion-notation__magnitude')!.textContent).toBe('2')
    expect(container.querySelector('.ion-notation__sign')!.textContent).toBe('\u2212')
  })

  it('renders a bare charge sign for single-charge ions', () => {
    const { container } = render(<IonNotation formula="Cl" charge="-" />)
    expect(container.querySelector('.ion-notation__sign')!.textContent).toBe('\u2212')
    // A bare sign renders no magnitude element at all (no empty blank marker).
    expect(container.querySelector('.ion-notation__magnitude')).toBeNull()
  })

  it('renders a standalone charge sign-first, never 2−', () => {
    const { container } = render(<ChargeValue value="2-" />)
    const charge = container.querySelector('.charge-value')!

    expect(charge.getAttribute('data-charge')).toBe('\u22122')
    const inline = charge.querySelector('.charge-value__inline')!
    const children = [...inline.children].map((child) => child.className)
    expect(children).toEqual(['charge-value__sign', 'charge-value__magnitude'])
    expect(inline.textContent).toBe('\u22122')
  })

  it('accepts both -2 and 2- and produces the same rendering', () => {
    const first = render(<ChargeValue value="-2" />)
    const a = first.container.querySelector('.charge-value')!.getAttribute('data-charge')
    first.unmount()

    const second = render(<ChargeValue value="2-" />)
    const b = second.container.querySelector('.charge-value')!.getAttribute('data-charge')

    expect(a).toBe(b)
  })
})

describe('NuclearNotation', () => {
  it('places the mass number above the atomic number, both left of the symbol', () => {
    const { container } = render(<NuclearNotation symbol="C" massNumber={12} atomicNumber={6} />)
    const notation = container.querySelector('.nuclear-notation')!
    const numbers = notation.querySelector('.nuclear-notation__numbers')!

    expectIsolatedLtr(notation)
    expect([...numbers.children].map((node) => node.className)).toEqual([
      'nuclear-notation__mass',
      'nuclear-notation__atomic',
    ])
    expect(notation.querySelector('.nuclear-notation__symbol')!.textContent).toBe('C')
    expect(notation.getAttribute('data-rows')).toBe('2')
  })

  it('does not leave empty blank marker positions when a number is missing', () => {
    const { container } = render(<NuclearNotation symbol="C" massNumber={12} />)
    const notation = container.querySelector('.nuclear-notation')!

    expect(notation.querySelector('.nuclear-notation__mass')).not.toBeNull()
    expect(notation.querySelector('.nuclear-notation__atomic')).toBeNull()
    expect(notation.getAttribute('data-rows')).toBe('1')
  })

  it('renders only the symbol when no numbers are supplied', () => {
    const { container } = render(<NuclearNotation symbol="C" />)
    expect(container.querySelector('.nuclear-notation__mass')).toBeNull()
    expect(container.querySelector('.nuclear-notation__atomic')).toBeNull()
    expect(container.querySelector('.nuclear-notation__symbol')!.textContent).toBe('C')
  })

  it('describes the nuclide for assistive technology', () => {
    render(<NuclearNotation symbol="C" massNumber={12} atomicNumber={6} />)
    expect(screen.getByRole('math', { name: /العدد الكتلي 12، العدد الذري 6/ })).toBeInTheDocument()
  })
})

describe('LewisStructure', () => {
  it('renders every electron as an independent element', () => {
    const { container } = render(
      <LewisStructure
        symbol="O"
        pairs={{ top: 1, bottom: 1 }}
        dots={[
          { position: 'left', slot: 0 },
          { position: 'right', slot: 0 },
        ]}
      />,
    )
    const diagram = container.querySelector('.lewis__diagram')!

    expect(diagram.getAttribute('dir')).toBe('ltr')
    expect(container.querySelectorAll('[data-electron]')).toHaveLength(6)
    expect(container.querySelectorAll('.lewis__pair')).toHaveLength(2)
  })

  it('places dots in the requested slots only', () => {
    const { container } = render(<LewisStructure symbol="Cl" dots={[{ position: 'top', slot: 0 }]} />)

    expect(container.querySelector('[data-position="top"]')).not.toBeNull()
    expect(container.querySelector('[data-position="bottom"]')).toBeNull()
    expect(container.querySelector('[data-position="left"]')).toBeNull()
    expect(container.querySelector('[data-position="right"]')).toBeNull()
  })

  it('renders bonds when a partner is given', () => {
    const { container } = render(
      <LewisStructure symbol="O" bonds={[{ position: 'right', partner: 'H' }]} pairs={{ top: 1 }} />,
    )
    expect(container.querySelector('.lewis__bond')?.getAttribute('data-partner')).toBe('H')
  })

  it('exposes a structured accessible description', () => {
    render(<LewisStructure symbol="O" pairs={{ top: 1 }} dots={[{ position: 'left' }]} />)
    expect(screen.getByRole('img', { name: /رمز العنصر O/ })).toBeInTheDocument()
  })
})

describe('MathFormula — KaTeX', () => {
  it('renders a real fraction, not a slash', () => {
    const { container } = render(<MathFormula tex="\frac{1}{2}" />)
    const formula = container.querySelector('.math-formula')!

    expect(formula.getAttribute('dir')).toBe('ltr')
    expect(container.querySelector('.mfrac')).not.toBeNull()
    expect(formula.textContent).not.toContain('/')
  })

  it('renders superscripts and roots as structured markup', () => {
    const { container } = render(<MathFormula tex="a^{2}+\sqrt{2}" />)
    expect(container.querySelector('.msupsub, .msup')).not.toBeNull()
    expect(container.querySelector('.sqrt')).not.toBeNull()
  })

  it('renders display equations as blocks', () => {
    const { container } = render(<MathFormula tex="v=\frac{\Delta x}{\Delta t}" display="block" />)
    const formula = container.querySelector('.math-formula')!
    expect(formula.className).toContain('math-formula--block')
    expect(formula.getAttribute('data-math')).toBe('block')
  })

  it('falls back visibly instead of crashing on invalid TeX', () => {
    const { container } = render(<MathFormula tex="\frac{1}{" />)
    const formula = container.querySelector('.math-formula')!

    expect(formula.getAttribute('data-math-error')).toBe('true')
    expect(formula.textContent).toContain('\\frac{1}{')
  })
})

describe('ScientificTable', () => {
  const columns = [
    { key: 'quantity', header: 'المقدار', rowHeader: true },
    { key: 'symbol', header: 'الرمز', align: 'center' as const },
    { key: 'value', header: 'القيمة', numeric: true },
  ]
  const rows = [
    { id: 'a', cells: { quantity: 'الطول', symbol: 'l', value: '12' }, selected: true },
    { id: 'b', cells: { quantity: 'الكتلة', symbol: 'm', value: '5' }, active: true },
  ]

  it('renders a caption, column headers and row headers', () => {
    render(<ScientificTable caption="جدول قياس" columns={columns} rows={rows} />)

    const table = screen.getByRole('table', { name: 'جدول قياس' })
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3)
    expect(within(table).getAllByRole('rowheader')).toHaveLength(2)
  })

  it('marks selected and active rows so styling can follow real state', () => {
    const { container } = render(<ScientificTable caption="جدول" columns={columns} rows={rows} />)

    expect(container.querySelector('[data-row="a"]')!.getAttribute('data-selected')).toBe('true')
    expect(container.querySelector('[data-row="b"]')!.getAttribute('data-active')).toBe('true')
    expect(container.querySelector('[data-row="a"]')!.getAttribute('data-active')).toBeNull()
  })

  it('marks numeric cells for tabular alignment', () => {
    const { container } = render(<ScientificTable caption="جدول" columns={columns} rows={rows} />)
    const numeric = container.querySelector('[data-column="value"][data-numeric="true"]')

    expect(numeric).not.toBeNull()
    expect(numeric!.className).toContain('is-end')
  })

  it('renders a header unit in an isolated LTR run', () => {
    const { container } = render(
      <ScientificTable
        caption="جدول"
        columns={[{ key: 'mass', header: 'الكتلة', unit: 'kg' }]}
        rows={[{ id: 'a', cells: { mass: '5' } }]}
      />,
    )
    const unit = container.querySelector('.sci-table__head-unit')!

    expect(unit.textContent).toBe('kg')
    expect(unit.getAttribute('dir')).toBe('ltr')
  })
})

describe('attribution markers', () => {
  it('marks platform-authored material with the required wording', () => {
    render(<PlatformAddition />)
    expect(screen.getByText('إضافة من المنصة')).toBeInTheDocument()
    expect(screen.getByText('Platform Addition')).toBeInTheDocument()
  })

  it('marks verbatim textbook material with its page reference', () => {
    const { container } = render(
      <TextbookSource page="42" item="سؤال 3">
        نص منقول
      </TextbookSource>,
    )
    const source = container.querySelector('[data-origin="textbook"]')!

    expect(source.textContent).toContain('من الكتاب المدرسي')
    expect(source.textContent).toContain('42')
    expect(within(source as HTMLElement).getByText('نص منقول')).toBeInTheDocument()
  })
})

describe('SciSub / SciSup primitives', () => {
  it('emit real sub and sup elements', () => {
    const { container } = render(
      <span>
        <SciSup>2</SciSup>
        <SciSub>1</SciSub>
      </span>,
    )
    expect(container.querySelector('sup')!.textContent).toBe('2')
    expect(container.querySelector('sub')!.textContent).toBe('1')
  })
})
