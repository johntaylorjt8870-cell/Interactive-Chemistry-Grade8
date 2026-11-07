import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson4 } from '@/data/curriculum/chemistryLesson4'
import { chemistryLesson4StudentNotebook } from '@/data/curriculum/chemistryLesson4Notebook'
import { getLesson } from '@/data/curriculum/registry'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const notebook = chemistryLesson4StudentNotebook
const LESSON_PATH = '/chemistry/structural-chemistry/chemical-reactions'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('Lesson 4 student notebook — wiring and structure', () => {
  it('is attached to Lesson 4 and loads through the curriculum', () => {
    expect(chemistryLesson4.studentNotebook).toBe(notebook)
    const lesson = getLesson('chemistry', 'structural-chemistry', 'chemical-reactions')
    expect(lesson).toBeDefined()
    expect(lesson?.id).toBe('chem-u1-l4')
    expect(lesson?.studentNotebook).toBe(notebook)
  })

  it('ships exactly the same steps as before: 34, ending in the final test', () => {
    expect(chemistryLesson4.steps).toHaveLength(34)
    expect(chemistryLesson4.steps[chemistryLesson4.steps.length - 1]?.id).toBe('final-test')
  })

  it('the notebook is never a step', () => {
    expect(chemistryLesson4.steps.some((step) => /notebook/i.test(step.id))).toBe(false)
  })

  it('covers the printed range ص24–ص29', () => {
    expect(notebook.source.pages.map((page) => page.page)).toEqual([
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
    ])
    expect(notebook.source.verified).toBe(true)
  })

  it('has the reviewed section ids, titles and no duplicates', () => {
    const ids = notebook.sections.map((section) => section.id)
    expect(ids).toEqual([
      'objectives-and-keywords',
      'reaction-definition',
      'reactants-products-conditions-tools',
      'word-equation',
      'naming-and-formulas',
      'experiments',
      'combustion-types',
      'gases-and-safety',
      'co2-detection',
      'materials-table',
      'signs-table',
      'learned-summary',
    ])
    expect(new Set(ids).size).toBe(ids.length)
    for (const section of notebook.sections) {
      expect(section.title.trim().length).toBeGreaterThan(0)
    }
  })

  it('renders a reflection checklist with questions only, and no answers', () => {
    expect(notebook.checklist).toBeDefined()
    expect(notebook.checklist?.items.length).toBeGreaterThan(3)
    for (const item of notebook.checklist?.items ?? []) {
      expect(item.trim().endsWith('؟') || item.trim().endsWith('.')).toBe(true)
    }
    expect(JSON.stringify(notebook)).not.toMatch(/الإجابة\s*الصحيحة|إجابة\s*نموذجية/)
  })

  it('labels every platform-added section and leaves printed sections unlabelled', () => {
    const platformSections = notebook.sections.filter((section) => section.source)
    expect(platformSections.length).toBeGreaterThan(0)
    for (const section of platformSections) {
      // Either label is acceptable, but each must name the platform and deny the book.
      expect(section.source).toMatch(/^(توضيح ضروري من المنصة|إضافة من المنصة) — (ليس|ليست) نصاً? من الكتاب$/)
    }
    // The two authored working rules are additions, not clarifications of print.
    for (const id of ['reactants-products-conditions-tools', 'word-equation']) {
      expect(notebook.sections.find((section) => section.id === id)?.source).toBe(
        'إضافة من المنصة — ليست نصاً من الكتاب',
      )
    }
    // The sign table does explain printed material, so it keeps the clarification label.
    expect(notebook.sections.find((section) => section.id === 'signs-table')?.source).toBe(
      'توضيح ضروري من المنصة — ليس نصاً من الكتاب',
    )
    // Sections quoting printed material must not claim a platform source.
    const printedIds = ['objectives-and-keywords', 'learned-summary', 'materials-table']
    for (const id of printedIds) {
      expect(notebook.sections.find((section) => section.id === id)?.source).toBeUndefined()
    }
  })

  it('attributes every printed definition to a page, with no self-test or lab material', () => {
    const definitions = notebook.sections.flatMap((section) => section.definitions ?? [])
    expect(definitions.length).toBeGreaterThanOrEqual(4)
    for (const definition of definitions) {
      expect(definition.source).toMatch(/^ص\d{2}/)
      expect(definition.source).toMatch(/أستنتج|تعلّمت|صندوق|مخطط|دليل/)
    }
    const serialized = JSON.stringify(notebook)
    expect(serialized).not.toMatch(/أختبر نفسي/)
    expect(serialized).not.toMatch(/مختبر|محاكاة/)
  })
})

describe('Lesson 4 student notebook — enrichment layer', () => {
  const enriched = notebook.sections.flatMap((section) => section.enrichment ?? [])

  it('carries enrichment items, all with a name, a citation and a link', () => {
    expect(enriched.length).toBeGreaterThanOrEqual(6)
    for (const item of enriched) {
      expect(item.text.trim().length).toBeGreaterThan(20)
      expect(item.reference.trim().length).toBeGreaterThan(0)
      expect(item.citation.trim().length).toBeGreaterThan(10)
      expect(item.url).toMatch(/^https:\/\//)
      expect(item.why.trim().length).toBeGreaterThan(10)
    }
  })

  it('never stores enrichment inside printed points or definitions', () => {
    for (const section of notebook.sections) {
      if (!section.enrichment?.length) continue
      const enrichmentTexts = section.enrichment.map((item) => item.text)
      for (const point of section.points ?? []) {
        expect(enrichmentTexts).not.toContain(point)
      }
      for (const definition of section.definitions ?? []) {
        expect(enrichmentTexts).not.toContain(definition.text)
      }
    }
  })

  it('keeps the approved chemistry with no balancing and no mercaptan formula', () => {
    const serialized = JSON.stringify(notebook)
    expect(serialized).toContain('Ca(OH)₂')
    expect(serialized).toContain('CaCO₃')
    expect(serialized).not.toMatch(/C₂H₅SH|C2H5SH|إيثان\s*ثيول/)
    // No numeric coefficients around reaction arrows: balancing is Lesson 5.
    expect(serialized).not.toMatch(/\d+\s*[A-Z][a-z]?\d?\s*\+.*→/)
  })

  it('states the chlorine hazard from bleach and acids, without an experimental recipe', () => {
    const serialized = JSON.stringify(notebook)
    expect(serialized).toMatch(/الكلور/)
    expect(serialized).toMatch(/حمض/)
    expect(serialized).not.toMatch(/اخلط|امزج\s+كمية/)
  })
})

describe('Lesson 4 student notebook — rendering', () => {
  it('renders as one page with a labelled enrichment block per enriched section', async () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)

    expect(
      screen.getByRole('heading', { level: 3, name: /التفاعلات الكيميائية — مادة الدفتر المدرسي/ }),
    ).toBeInTheDocument()

    const sections = container.querySelectorAll('[data-notebook-section]')
    expect(sections).toHaveLength(notebook.sections.length)

    const enrichedSections = notebook.sections.filter((section) => section.enrichment?.length)
    const blocks = container.querySelectorAll('[data-notebook-enrichment]')
    expect(blocks).toHaveLength(enrichedSections.length)

    for (const block of blocks) {
      expect(block.textContent).toContain('إثراء علمي من خارج الكتاب')
      expect(block.querySelectorAll('a[href^="https://"]').length).toBeGreaterThan(0)
    }

    expect(strayScriptGlyphs(container)).toEqual([])

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )
    expect(serious.map((violation) => violation.id)).toEqual([])
  })

  it('links every citation out safely', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    const links = Array.from(container.querySelectorAll('.student-notebook__enrichment-link'))
    expect(links.length).toBeGreaterThanOrEqual(6)
    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('isolates each citation by direction instead of letting the RTL paragraph reorder it', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    const citations = Array.from(container.querySelectorAll('.student-notebook__enrichment-citation'))
    expect(citations).toHaveLength(
      notebook.sections.flatMap((section) => section.enrichment ?? []).length,
    )
    for (const citation of citations) {
      const parts = Array.from(citation.children) as HTMLElement[]
      expect(parts.length).toBeGreaterThan(0)
      for (const part of parts) {
        // Every part declares its own direction; none is left to the paragraph.
        expect(['ltr', 'rtl']).toContain(part.getAttribute('dir'))
      }
      // At most one Latin head and one Arabic note, in that visual order.
      const directions = parts.map((part) => part.getAttribute('dir'))
      expect(directions.filter((direction) => direction === 'ltr').length).toBeLessThanOrEqual(1)
      expect(directions.filter((direction) => direction === 'rtl').length).toBeLessThanOrEqual(1)
      if (directions.length === 2) expect(directions).toEqual(['ltr', 'rtl'])
    }
  })

  it('keeps an all-Latin citation in one run so its words cannot be reversed', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    const latin = Array.from(
      container.querySelectorAll('.student-notebook__enrichment-citation-latin'),
    ) as HTMLElement[]
    expect(latin.length).toBeGreaterThan(0)
    const prevention = latin.find((node) => node.textContent?.includes('You Can Prevent'))
    expect(prevention).toBeDefined()
    expect(prevention?.getAttribute('dir')).toBe('ltr')
    // The reference sentence arrives as one text node, not word-by-word runs.
    expect(prevention?.childElementCount).toBe(0)
  })

  it('appears as the last tab of Lesson 4, without changing the step count', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /التفاعلات الكيميائية/ })

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chemistryLesson4.steps.length + 1)
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(buttons.at(-1) as HTMLElement)
    const rendered = container.querySelectorAll('[data-notebook-section]')
    expect(rendered).toHaveLength(notebook.sections.length)
  })
})
