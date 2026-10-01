import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MathFormula, NuclearNotation, ScientificNotationText } from '@/scientific'
import { parseCompactNuclearNotation } from '@/scientific/NuclearNotation'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { getInteractive, listInteractives } from '@/simulations/registry'
import BohrEnergyTransition from '@/simulations/BohrEnergyTransition'
import IonFormationLab from '@/simulations/IonFormationLab'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { readProjectFile } from './utils/projectFiles'

const scientificComponentsCss = readProjectFile('src/styles/scientific-components.css')
const scientificCss = readProjectFile('src/styles/scientific.css')

describe('permanent LTR mathematics contract', () => {
  it('keeps the law and a complete substitution chain in one LTR isolate', () => {
    const { container } = render(
      <MathFormula tex={'n = 2 \\Longrightarrow y = 2 \\times 2^2 \\Longrightarrow y = 8'} display="block" />,
    )
    const formula = container.querySelector('[data-math="block"]')!

    expect(formula).toHaveAttribute('dir', 'ltr')
    expect(formula).not.toHaveAttribute('data-math-error')
    expect(formula.querySelector('.katex')).not.toBeNull()
  })

  it('isolates a complete arithmetic table cell instead of splitting its terms', () => {
    const { container } = render(<ContentBlocks blocks={[{
      kind: 'table', caption: 'تعويض',
      columns: [{ key: 'work', header: 'العملية' }],
      rows: [{ id: 'l', cells: { work: '2 × 2² = 8' } }],
      attribution: 'platform',
    }]} />)
    const cellRun = container.querySelector('[data-column="work"] .sci')!
    expect(cellRun).toHaveAttribute('dir', 'ltr')
    expect(cellRun).toHaveTextContent('2 × 2² = 8')
  })

  it('makes both formula wrappers and KaTeX explicitly LTR-isolated', () => {
    expect(scientificCss).toMatch(/\.math-formula\s*\{[^}]*direction:\s*ltr/s)
    expect(scientificCss).toMatch(/\.math-formula\s*\{[^}]*unicode-bidi:\s*isolate/s)
    expect(scientificCss).toMatch(/\.math-formula \.katex\s*\{[^}]*direction:\s*ltr/s)
  })
})

describe('compact and structured nuclear notation', () => {
  const cases = [
    ['³⁵₁₇Cl', { symbol: 'Cl', massNumber: '35', atomicNumber: '17' }],
    ['¹⁶₈O', { symbol: 'O', massNumber: '16', atomicNumber: '8' }],
    ['¹⁷₈O', { symbol: 'O', massNumber: '17', atomicNumber: '8' }],
    ['¹⁸₈O', { symbol: 'O', massNumber: '18', atomicNumber: '8' }],
    ['₁₃Al', { symbol: 'Al', atomicNumber: '13' }],
    ['₁₂Mg', { symbol: 'Mg', atomicNumber: '12' }],
    ['₈O', { symbol: 'O', atomicNumber: '8' }],
  ] as const

  it.each(cases)('parses %s without changing its scientific values', (compact, expected) => {
    expect(parseCompactNuclearNotation(compact)).toEqual(expected)
  })

  it('keeps the two numbers in one compact grid directly beside the symbol', () => {
    const { container } = render(<NuclearNotation symbol="Cl" massNumber="35" atomicNumber="17" />)
    const notation = container.querySelector('.nuclear-notation')!

    expect(notation).toHaveAttribute('dir', 'ltr')
    expect([...notation.children].map((node) => node.className)).toEqual([
      'nuclear-notation__numbers',
      'nuclear-notation__symbol',
    ])
    expect(scientificComponentsCss).toMatch(/\.nuclear-notation\s*\{[^}]*display:\s*inline-grid/s)
    expect(scientificComponentsCss).toMatch(/column-gap:\s*0\.025em/)
  })

  it('promotes embedded notation in Arabic assessment text to structured DOM', () => {
    const { container } = render(<ScientificNotationText>قارن بين ¹⁶₈O و¹⁸₈O ثم ادرس ₁₃Al.</ScientificNotationText>)
    const notations = container.querySelectorAll('.nuclear-notation')
    expect(notations).toHaveLength(3)
    expect([...notations].map((node) => node.getAttribute('dir'))).toEqual(['ltr', 'ltr', 'ltr'])
    expect(container.querySelector('[data-nuclear="Al"] .nuclear-notation__atomic')).toHaveTextContent('13')
  })

  it('turns compact table values into structured NuclearNotation DOM', () => {
    const { container } = render(<ContentBlocks blocks={[{
      kind: 'table',
      caption: 'اختبار الترميز',
      columns: [{ key: 'isotope', header: 'النظير' }],
      rows: cases.map(([value], index) => ({ id: String(index), cells: { isotope: value } })),
      attribution: 'textbook',
    }]} />)

    expect(container.querySelectorAll('.nuclear-notation')).toHaveLength(cases.length)
    expect(container.querySelector('[data-nuclear="Cl"] .nuclear-notation__mass')).toHaveTextContent('35')
    expect(container.querySelector('[data-nuclear="Al"] .nuclear-notation__atomic')).toHaveTextContent('13')
  })
})

describe('lesson-one explanatory interactives', () => {
  it('registers both explanatory simulations with real lazy loaders', () => {
    expect(getInteractive('bohr-energy-transition')?.kind).toBe('simulation')
    expect(getInteractive('ion-formation-lab')?.kind).toBe('simulation')
    expect(listInteractives().map((item) => item.id)).toEqual(expect.arrayContaining([
      'bohr-energy-transition',
      'ion-formation-lab',
    ]))
  })

  it('moves the Bohr electron up by absorption and down by emission', async () => {
    const user = userEvent.setup()
    render(<BohrEnergyTransition interactiveId="bohr-energy-transition" reducedMotion />)

    expect(screen.getByText('K · n = 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /امتصاص طاقة/ }))
    expect(screen.getByText('L · n = 2')).toBeInTheDocument()
    expect(screen.getByText('انتقل الإلكترون إلى سوية أعلى.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /إصدار طاقة/ }))
    expect(screen.getByText('إصدار طاقة على شكل ضوء')).toBeInTheDocument()
  })

  it('changes measured charge when an electron is lost or gained', async () => {
    const user = userEvent.setup()
    render(<IonFormationLab interactiveId="ion-formation-lab" reducedMotion />)

    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'افقد إلكتروناً' }))
    expect(screen.getByText(/تكوّن أيون موجب/)).toBeInTheDocument()
    expect(screen.getAllByText('+1').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'F' }))
    await user.click(screen.getByRole('button', { name: 'اكتسب إلكتروناً' }))
    expect(screen.getByText(/تكوّن أيون سالب/)).toBeInTheDocument()
    expect(screen.getAllByText('−1').length).toBeGreaterThan(0)
  })

  it('keeps textbook Bohr statements and marks the added explanation and interactive as platform content', () => {
    const bohr = chemistryLesson1.steps.find((step) => step.id === 'bohr')!
    expect(bohr.attribution).toBe('textbook')
    expect(bohr.blocks.some((block) => block.kind === 'list' && block.attribution === 'textbook')).toBe(true)
    expect(bohr.blocks.filter((block) => block.kind === 'paragraph').every((block) => block.attribution === 'platform')).toBe(true)
    expect(bohr.blocks.some((block) => block.kind === 'interactive' && block.interactiveId === 'bohr-energy-transition')).toBe(true)
  })
})
