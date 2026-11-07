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
  it('opts into the existing notebook without adding or reordering steps', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'mass-and-fixed-proportions')?.studentNotebook).toBe(notebook)
    expect(chemistryLesson5.steps.map((step) => step.id)).toEqual(stepIds)
    expect(notebook.source.pages.map((page) => page.page)).toEqual(['30', '31', '32', '33', '34', '35'])
    expect(notebook.source.verified).toBe(false)
    expect(notebook.source.readability?.notes).toContain('لم تُعاين صور الصفحات الأصلية مباشرة')
    expect(notebook.sections.map((item) => item.id)).toEqual(['objectives-and-keywords', 'atom-conservation', 'mass-conservation', 'fixed-proportions', 'learned-summary'])
  })

  it('renders the enrichment with safe links and revision outside the article', async () => {
    const { container } = renderWithTheme(<><StudentNotebookView notebook={notebook} /><StudentNotebookRevision notebook={notebook} /></>)
    const article = screen.getByRole('article')
    expect(article.querySelectorAll('[data-notebook-section]')).toHaveLength(5)
    expect(article.querySelectorAll('.student-notebook__definition')).toHaveLength(2)
    expect(article.querySelectorAll('.student-notebook__enrichment-item')).toHaveLength(2)
    expect(article).toHaveTextContent('إثراء علمي من خارج الكتاب')
    const co2 = article.querySelector('[data-formula="CO2"]')
    expect(co2).toHaveAttribute('dir', 'ltr')
    expect(co2?.querySelector('sub')).toHaveTextContent('2')
    const co = Array.from(article.querySelectorAll('[dir="ltr"]')).find((node) => node.textContent === 'CO')
    expect(co).toBeDefined()
    for (const link of article.querySelectorAll('.student-notebook__enrichment-link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    }
    expect(article.querySelector('.student-notebook-revision')).toBeNull()
    expect(screen.getByText('أسئلة مراجعة — ليست مادة تُنسخ في الدفتر')).toBeInTheDocument()
    expect(strayScriptGlyphs(container)).toEqual([])
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')).map((violation) => violation.id)).toEqual([])
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
