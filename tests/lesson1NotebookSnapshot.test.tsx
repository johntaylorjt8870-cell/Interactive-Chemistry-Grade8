import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './utils/renderApp'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'

/**
 * Structure snapshot of «📒 دفتر الطالب».
 *
 * jsdom has no layout engine, so this file does not pretend to be a visual
 * test. What it does is render the real lesson route, open the real tab, and
 * write the resulting DOM — the tab strip and the notebook itself — to
 * `artifacts/lesson1-notebook/`. That file is the reviewable evidence of what
 * the browser is handed (which elements, in which order, inside which region),
 * and it is checked here so it cannot drift silently.
 *
 * The real-browser pass (`npm run verify:lesson1-notebook`) covers the visual
 * and overflow behaviour; it needs Chromium, which this sandbox cannot install.
 */
const OUT = path.join(process.cwd(), 'artifacts/lesson1-notebook')

describe('student notebook — rendered DOM snapshot', () => {
  it('renders the tab after the last step and the notebook inside the lesson region', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/chemistry/structural-chemistry/atom-and-element')
    await screen.findByRole('heading', { level: 1, name: /الذرّة والعنصر/ })

    const rail = screen.getByRole('complementary', { name: 'مخطط الدرس' })
    const nav = within(rail).getByRole('navigation', { name: 'خطوات الدرس' })
    const entries = within(nav).getAllByRole('button')

    // The tab strip, in order: 30 teaching steps, then the notebook.
    expect(entries).toHaveLength(chemistryLesson1.steps.length + 1)
    expect(entries.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(entries.at(-1)!)

    const content = screen.getByRole('region', { name: 'محتوى الدرس' })
    const notebook = within(content).getByRole('article', { name: /مادة الدفتر المدرسي/ })
    const headings = within(notebook).getAllByRole('heading')
    expect(headings[0]!).toHaveAccessibleName('الذرّة والعنصر — مادة الدفتر المدرسي')
    // Title + one heading per section + one per method block. The closing
    // checklist is no longer part of the notebook: it is revision material,
    // not something a student copies, so it must not render here.
    const methodHeadings = lesson1StudentNotebook.sections.filter((section) => section.procedure).length
    expect(headings).toHaveLength(1 + lesson1StudentNotebook.sections.length + methodHeadings)
    expect(within(notebook).queryByText(/قبل الاختبار/)).toBeNull()

    // The revision questions live outside the notebook, and say what they are.
    const revision = screen.getByRole('region', { name: /قبل الاختبار/ })
    expect(within(revision).getByText(/ليست مادة تُنسخ في الدفتر/)).toBeTruthy()
    // Each section heading carries its order number, so the page reads as a
    // numbered notebook rather than an unranked list of topics.
    const sectionHeadings = [...notebook.querySelectorAll('.student-notebook__section > .student-notebook__section-title')]
    expect(sectionHeadings.map((node) => node.querySelector('.student-notebook__section-index')?.textContent)).toEqual(
      lesson1StudentNotebook.sections.map((_, index) => String(index + 1)),
    )

    // Every section the data declares is on the page, in order.
    const renderedSections = [...notebook.querySelectorAll('[data-notebook-section]')].map((node) =>
      node.getAttribute('data-notebook-section'),
    )
    expect(renderedSections).toEqual(lesson1StudentNotebook.sections.map((section) => section.id))

    fs.mkdirSync(OUT, { recursive: true })
    const outlineFile = path.join(OUT, 'dom-tab-strip.html')
    const notebookFile = path.join(OUT, 'dom-notebook.html')
    fs.writeFileSync(outlineFile, nav.outerHTML.replace(/></g, '>\n<'), 'utf8')
    fs.writeFileSync(notebookFile, notebook.outerHTML.replace(/></g, '>\n<'), 'utf8')

    // The dumped files must contain the real content, not a placeholder.
    const dumped = fs.readFileSync(notebookFile, 'utf8')
    expect(dumped).toContain('student-notebook__definitions')
    // Real structured notation, not raw text: the isotope symbols go through
    // NuclearNotation and the ion table through the same cell promotion.
    // (KaTeX is no longer required here: the only TeX notes were the platform
    // formula glosses the final review removed.)
    expect(dumped).toContain('nuclear-notation')
    expect(dumped).toContain('student-notebook__table')
    expect(dumped).not.toContain('empty-state')
    expect(container.querySelectorAll('.student-notebook')).toHaveLength(1)
  })
})
