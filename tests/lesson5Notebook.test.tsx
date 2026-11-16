import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson5, chemistryLesson5StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson5'
import { getLesson } from '@/data/curriculum/registry'
import { StudentNotebookRevision, StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const path = '/chemistry/structural-chemistry/mass-and-fixed-proportions'
const stepIds = ['opening', 'discovery-atoms', 'prerequisites-bridge', 'atom-count-source', 'atom-count-lab', 'atom-conclusion-source', 'atom-deep-explanation', 'enrichment-bicarbonate', 'mass-experiment-source', 'mass-law-source', 'mass-deep-explanation', 'mass-boundary-lab', 'worked-example-mass', 'proust-trials-source', 'proust-table-source', 'proust-conclusion-source', 'proust-deep-explanation', 'worked-example-proust', 'iron-sulfur-source', 'fixed-ratio-lab', 'laws-comparison', 'learned-summary', 'misconceptions', 'book-question-1', 'book-question-2', 'book-question-3', 'connected-summary', 'final-test']

beforeEach(() => window.history.replaceState(null, '', '/'))

describe('Lesson 5 notebook — wiring and display', () => {
  it('opts into the complete notebook without adding or reordering steps', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'mass-and-fixed-proportions')?.studentNotebook).toBe(notebook)
    expect(chemistryLesson5.steps.map((step) => step.id)).toEqual(stepIds)
    expect(notebook.source.pages.map((page) => page.page)).toEqual(['30', '31', '32', '33', '34', '35'])
    expect(notebook.source.verified).toBe(true)
    expect(notebook.source.readability?.arabicText).toBe('clear')
    // New complete notebook has 19 sections (objectives through self-tests) plus comparison etc.
    expect(notebook.sections.length).toBeGreaterThanOrEqual(14)
    expect(notebook.sections.map((s) => s.id)).toContain('objectives-and-keywords')
    expect(notebook.sections.map((s) => s.id)).toContain('atom-observation')
    expect(notebook.sections.map((s) => s.id)).toContain('mass-experiment')
    expect(notebook.sections.map((s) => s.id)).toContain('proust-law')
    expect(notebook.sections.map((s) => s.id)).toContain('iron-sulfur')
    expect(notebook.sections.map((s) => s.id)).toContain('self-test-3')
    expect(notebook.sourcesAppendix).toBeDefined()
    expect(notebook.sourcesAppendix!.caption).toBe('جدول مصادر بنود دفتر الطالب')
    expect(notebook.sourcesAppendix!.rows.length).toBeGreaterThanOrEqual(30)
    expect(notebook.hidePageTagsInBody).toBe(true)
  })

  it('renders enrichment with safe links and revision outside the article', async () => {
    const { container } = renderWithTheme(<><StudentNotebookView notebook={notebook} /><StudentNotebookRevision notebook={notebook} /></>)
    const article = screen.getByRole('article')
    expect(article.querySelectorAll('[data-notebook-section]').length).toBeGreaterThanOrEqual(14)
    expect(article.querySelectorAll('.student-notebook__definition').length).toBeGreaterThanOrEqual(2)
    // enrichment items are in proust-law section
    expect(article.querySelectorAll('.student-notebook__enrichment-item').length).toBeGreaterThanOrEqual(2)
    expect(article).toHaveTextContent('إثراء علمي من خارج الكتاب')
    // Check formula rendering for CO2 and CO
    const co2 = article.querySelector('[data-formula="CO2"]')
    expect(co2).toHaveAttribute('dir', 'ltr')
    expect(co2?.querySelector('sub')).toHaveTextContent('2')
    for (const link of article.querySelectorAll('.student-notebook__enrichment-link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
    expect(article.querySelector('.student-notebook-revision')).toBeNull()
    expect(screen.getByText('أسئلة مراجعة — ليست مادة تُنسخ في الدفتر')).toBeInTheDocument()
    expect(strayScriptGlyphs(container)).toEqual([])
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')).map((v) => v.id)).toEqual([])
  })

  it('renders static figures without requiring interactive labs', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    expect(container.querySelector('[data-notebook-figure="fig-balance"]')).not.toBeNull()
    expect(container.querySelector('[data-notebook-figure="fig-scale"]')).not.toBeNull()
    expect(container.querySelector('[data-notebook-figure="fig-trials"]')).not.toBeNull()
    expect(container.querySelector('[data-notebook-figure="fig-balance"] svg')).not.toBeNull()
    expect(container.textContent).not.toContain('جارٍ تحميل')
  })

  it('hides page numbers in the body and shows them only in the appendix', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    const body = container.querySelector('.student-notebook__sections')!
    expect(body.textContent ?? '').not.toMatch(/ص\d/)
    expect(body.textContent ?? '').not.toMatch(/\[كتاب\]|\[حل نشاط\]|\[منصة\]/)
    const appendix = container.querySelector('.student-notebook__sources')!
    expect(appendix).not.toBeNull()
    expect(appendix.textContent).toContain('30')
    expect(container.querySelectorAll('.student-notebook__source')).toHaveLength(0)
    // Ensure no source references next to headings (they would be chips)
    expect(container.querySelectorAll('.student-notebook__section-source').length).toBe(0)
  })

  it('keeps tables printable and with correct scientific values', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={notebook} />)
    const tables = container.querySelectorAll('.student-notebook__table')
    expect(tables.length).toBeGreaterThanOrEqual(5)
    // Check specific values present
    expect(container.textContent).toContain('6.41')
    expect(container.textContent).toContain('1.75')
    expect(container.textContent).toContain('1.5')
    expect(container.textContent).toContain('26.66')
    expect(container.textContent).toContain('52.5')
    expect(container.textContent).toContain('82.5')
    expect(container.textContent).toContain('125.100')
  })

  it('opens as the last tab, leaves progress unchanged, and returns to the step', async () => {
    const user = userEvent.setup()
    renderApp(path)
    await screen.findByRole('heading', { level: 1, name: /قانونا التفاعل الكيميائي/ })
    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')
    expect(buttons.filter((button) => !button.hasAttribute('data-tab'))).toHaveLength(28)
    const progress = screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })
    const before = progress.getAttribute('aria-valuenow')
    const step = document.querySelector('[data-step]')!
    await user.click(buttons.at(-1)!)
    expect(window.location.hash).toBe('#student-notebook')
    expect(step).toHaveAttribute('hidden')
    expect(progress).toHaveAttribute('aria-valuenow', before)
    expect(screen.getByRole('article', { name: /قانونا التفاعل الكيميائي — مادة الدفتر المدرسي/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(step).not.toHaveAttribute('hidden')
    expect(progress).toHaveAttribute('aria-valuenow', before)
  })
})
