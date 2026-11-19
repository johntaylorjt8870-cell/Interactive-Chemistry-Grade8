import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { beforeEach, describe, expect, it } from 'vitest'
import { chemistryLesson7 } from '@/data/curriculum/chemistryLesson7'
import { chemistryLesson7Notebook } from '@/data/curriculum/chemistryLesson7Notebook'
import { NOTEBOOK_SOURCES_APPENDIX_CAPTION, collectNotebookBodyItems } from '@/data/sourceFidelity'
import { StudentNotebookRevision, StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const LESSON7_ROUTE = '/chemistry/structural-chemistry/chemical-calculations'
const BIDI_CONTROLS = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u

describe('Lesson 7 student notebook — rendering, wiring, accessibility, and scientific hygiene', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders all 22 sections, separate checklist card, clean body without page chips, and single 5-column sources appendix', () => {
    const { container } = renderWithTheme(
      <>
        <StudentNotebookView notebook={chemistryLesson7Notebook} />
        <StudentNotebookRevision notebook={chemistryLesson7Notebook} />
      </>,
    )

    expect(screen.getByRole('heading', { name: chemistryLesson7Notebook.title })).toBeInTheDocument()
    expect(container.querySelectorAll('.student-notebook__section')).toHaveLength(22)

    // Separate self-revision card exists outside the copyable sections body.
    const checklist = container.querySelector('.student-notebook-revision')
    expect(checklist).not.toBeNull()
    expect(within(checklist as HTMLElement).getAllByRole('listitem')).toHaveLength(
      chemistryLesson7Notebook.checklist!.items.length,
    )

    // Zero inline page numbers, zero page chips, zero BIDI controls, zero stray script glyphs.
    const sectionsRoot = container.querySelector('.student-notebook__sections') as HTMLElement
    expect(sectionsRoot).not.toBeNull()
    expect(sectionsRoot.textContent ?? '').not.toMatch(/(?:^|[\s(«،؛])(?:ص\.?\s*\d+|صفحة\s*\d+)/u)
    expect(sectionsRoot.textContent ?? '').not.toMatch(/L7-P\d+-E\d+/u)
    expect(container.querySelector('.student-notebook__source')).toBeNull()
    expect(container.textContent ?? '').not.toMatch(BIDI_CONTROLS)
    expect(strayScriptGlyphs(container)).toEqual([])

    // Single final 5-column sources table matching every body item 1-to-1 in exact DOM reading order.
    const appendices = container.querySelectorAll('.student-notebook__sources')
    expect(appendices).toHaveLength(1)
    const appendix = appendices[0] as HTMLElement
    expect(within(appendix).getByRole('heading', { name: NOTEBOOK_SOURCES_APPENDIX_CAPTION })).toBeInTheDocument()

    const headers = [...appendix.querySelectorAll('thead th')].map((th) => th.textContent?.trim())
    expect(headers).toEqual(['البند', 'النوع', 'التصنيف', 'المصدر', 'الصفحة'])

    const bodyItems = collectNotebookBodyItems(chemistryLesson7Notebook)
    const renderedRows = [...appendix.querySelectorAll('tbody tr')]
    expect(renderedRows).toHaveLength(bodyItems.length)

    const displayedNumbers = [
      ...sectionsRoot.querySelectorAll(
        '.student-notebook__definition dt, .student-notebook__list > li, .student-notebook__notes > li, .student-notebook__table caption, .student-notebook__figure figcaption',
      ),
    ].map((el) => {
      const textWithoutFormula = (el.textContent ?? '').trim()
      const match =
        el.querySelector('.student-notebook__notation-note > span:last-child')?.textContent?.trim().match(/^([٠-٩]+) ـ /u) ??
        textWithoutFormula.match(/^([٠-٩]+) ـ /u)
      return match?.[1]
    })

    expect(displayedNumbers).toHaveLength(bodyItems.length)
    renderedRows.forEach((tr, index) => {
      const cells = [...tr.querySelectorAll('th, td')].map((cell) => (cell.textContent ?? '').trim())
      expect(cells).toHaveLength(5)
      expect(cells.every((cell) => cell.length > 0)).toBe(true)
      expect(cells[0]).toBe(displayedNumbers[index])
    })
  })

  it('renders all 5 static printable figures (4 original textbook crops + 1 static stoichiometry SVG) with zero interactive gating', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={chemistryLesson7Notebook} />)

    const figures = [...container.querySelectorAll('figure[data-l7-figure]')]
    expect(figures.map((fig) => fig.getAttribute('data-l7-figure'))).toEqual([
      'counting-objects',
      'balance-original',
      'gases-original',
      'stoichiometry-map',
      'jabir-original',
    ])

    const imgs = [...container.querySelectorAll('img.l7-notebook-figure__img')] as HTMLImageElement[]
    expect(imgs).toHaveLength(4)
    for (const img of imgs) {
      expect(img.getAttribute('src')).toBeTruthy()
      expect((img.getAttribute('alt') ?? '').trim().length).toBeGreaterThan(20)
    }

    const svgMap = container.querySelector('svg.l7-notebook-map__svg')
    expect(svgMap).not.toBeNull()
    expect(svgMap?.getAttribute('role')).toBe('img')
    expect((svgMap?.getAttribute('aria-label') ?? '').length).toBeGreaterThan(30)

    // Strictly static & printable: no hidden toggles, buttons, inputs, selects, or embedded labs.
    expect(container.querySelectorAll('button, input, select, textarea, details')).toHaveLength(0)
    expect(container.querySelectorAll('.katex-display').length).toBeGreaterThanOrEqual(18)
  })

  it('has zero serious or critical axe accessibility violations', async () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={chemistryLesson7Notebook} />)
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(blocking).toEqual([])
  })

  it('opens as the final tab after all 33 Lesson 7 steps, preserves step state and answers, and returns cleanly', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON7_ROUTE)

    const outline = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(outline).getAllByRole('button')
    // 33 teaching steps + 1 final Student Notebook tab = 34 buttons.
    expect(chemistryLesson7.steps).toHaveLength(33)
    expect(buttons).toHaveLength(34)

    const notebookTab = buttons.at(-1)!
    expect(notebookTab).toHaveTextContent('دفتر الطالب')

    // Navigate to step 2 (p40 mole questions) and type an answer before opening the notebook.
    const moleStepButton = buttons[1]!
    await user.click(moleStepButton)
    const textarea = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement
    await user.type(textarea, '12 قلماً في الدزينة')
    expect(textarea.value).toBe('12 قلماً في الدزينة')

    // Open the Student Notebook tab: both the notebook article and separate revision card appear.
    await user.click(notebookTab)
    expect(notebookTab).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: chemistryLesson7Notebook.title })).toBeVisible()
    expect(container.querySelector('[data-lesson-id="chem-u1-l7"] .student-notebook')).not.toBeNull()
    expect(container.querySelector('[data-lesson-id="chem-u1-l7"] .student-notebook-revision')).not.toBeNull()

    // Return to the step: state and typed answer remain intact.
    await user.click(moleStepButton)
    expect((screen.getAllByRole('textbox')[0] as HTMLTextAreaElement).value).toBe('12 قلماً في الدزينة')
  })
})
