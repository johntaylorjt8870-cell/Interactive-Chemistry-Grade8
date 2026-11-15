import { describe, it, expect, vi } from 'vitest'
import { renderWithTheme } from './utils/renderApp'
import { chemistryLesson2StudentNotebook as book } from '@/data/curriculum/chemistryLesson2Notebook'
import { Lesson2NotebookFigure, ionicExamples, notebookAtoms } from '@/lessons/lesson2NotebookFigures'
import { StudentNotebookRevision, StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderToStaticMarkup } from 'react-dom/server'
import { readFileSync } from 'node:fs'

const body = JSON.stringify(book.sections)
const section = (id: string) => book.sections.find(s => s.id === id)!
describe('complete Lesson 2 notebook acceptance', () => {
  it('keeps every required activity and exam subquestion as actual solutions', () => {
    const source = book.sourcesAppendix!.rows.map(r => r.source).join(' ')
    for (const id of ['l2-act-name','l2-act-atoms','p13-activity-3','l2-act-h2','l2-act-o2','l2-act-n2','l2-act-compare','l2-act-octet','l2-act-research','l2-book-mc-1','l2-book-mc-2','l2-book-q2','l2-book-q3','l2-book-q4','l2-book-q5-1','l2-book-q5-2']) expect(source, id).toContain(id)
    expect(section('atomic-foundation').points!.join(' ')).toContain('16 − 8 = 8')
    expect(section('atomic-foundation').points!.join(' ')).toContain('8 + 2 = 10')
    expect(section('ionic-worked').ordered).toHaveLength(9)
    for (const required of ['Mg → Mg²⁺ + 2e⁻', 'Ca → Ca²⁺ + 2e⁻', '2Na → 2Na⁺ + 2e⁻', '2Cl + 2e⁻ → 2Cl⁻', '2(+1) + (−2) = 0', '(+2) + 2(−1) = 0']) expect(section('ionic-worked').ordered!.join(' ')).toContain(required)
    const lewis = section('lewis-worked').ordered!.join(' ')
    for (const term of ['7 + 7 = 14', '12 + 2 = 14', '6 + 2 = 8', '6 + 2×1 = 8', '4 + 4 = 8', '2 + 0 = 2', 'HCl', 'ثلاثة أزواج حرّة']) expect(lewis).toContain(term)
    expect(section('lewis-examples').table!.rows.map(r => Object.values(r.cells))).toEqual([
      ['H₂','1','1','1','2','وحيدة','0','2'], ['O₂','6','2','2','4','مضاعفة','2','8'], ['N₂','5','3','3','6','ثلاثية','1','8'],
    ])
    expect(section('review-errors').points).toHaveLength(8)
  })
  it('makes limitations and exceptions explicit, without duplicate definitions', () => {
    for (const term of ['نموذج تعليمي', 'السيليكا SiO₂', 'صورتان عنصريتان', 'اللامائي', 'الغرافيت', 'الزئبق Hg', 'لا فلزّ رغم']) expect(body).toContain(term)
    const defs = book.sections.flatMap(s => s.definitions ?? [])
    expect(defs).toHaveLength(3)
    defs.forEach(d => expect(body.split(d.text)).toHaveLength(2))
    expect(section('review-errors').definitions).toBeUndefined()
  })
  it('has one clean final appendix and documents every authored table and figure', () => {
    expect(book.source.verified).toBe(false)
    expect(book.sourcesAppendix!.rows.length).toBeGreaterThan(70)
    const items = book.sourcesAppendix!.rows.map(r => r.item)
    expect(new Set(items).size).toBe(items.length)
    for (const s of book.sections) {
      for (const t of [s.table, ...(s.tables ?? [])].filter(Boolean)) expect(items).toContain(t!.caption)
      for (const f of s.figures ?? []) expect(items).toContain(f.caption)
    }
    const { container } = renderWithTheme(<><StudentNotebookView notebook={book}/><StudentNotebookRevision notebook={book}/></>)
    const article = container.querySelector('article')!
    const sections = article.querySelector('.student-notebook__sections')!
    expect(sections.textContent).not.toMatch(/ص\s*\d|صفحة\s*\d|\[(كتاب|منصة|حل نشاط)\]|توضيح ضروري من المنصة/)
    expect(article.querySelectorAll('.student-notebook__source')).toHaveLength(0)
    expect(article.querySelectorAll('.student-notebook__sources')).toHaveLength(1)
    expect(article.lastElementChild).toHaveClass('student-notebook__sources')
    expect(article.querySelector('.student-notebook-revision')).toBeNull()
    expect(container.querySelector('.student-notebook-revision__list li')).not.toBeNull()
  })
  it('renders all core science without resolving interactive imports (static rendering)', () => {
    const html = renderToStaticMarkup(<StudentNotebookView notebook={book}/>)
    expect((html.match(/class="student-notebook__figure l2-notebook-static"/g) ?? [])).toHaveLength(10)
    for (const f of ['mgo','cao','na2o','mgcl2','nacl','valence','charge','hetero','research-lewis','compare']) expect(html).toContain(`data-notebook-figure="${f}"`)
    for (const term of ['Mg →', 'Ca →', '2Na →', 'Cl₂', 'H₂O', 'HCl']) expect(html).toContain(term.split(' ')[0]!)
  })
  it('checks every full atom drawing against proton, electron and shell counts', () => {
    for (const key of ['charge','mgo','cao','na2o','mgcl2'] as const) {
      const { container, unmount } = renderWithTheme(<Lesson2NotebookFigure figure={{ id: key, kind: 'lesson2-static', figureKey: key, caption: key }}/>)
      container.querySelectorAll<HTMLElement>('[data-atom-symbol]').forEach(atom => {
        const shells = atom.dataset.shells!.split('-').map(Number)
        const electrons = shells.reduce((a, b) => a + b, 0)
        expect(Number(atom.dataset.electrons)).toBe(electrons)
        expect(Number(atom.dataset.protons) - electrons).toBe(Number(atom.dataset.charge))
        expect(atom.querySelectorAll('circle[data-electron]')).toHaveLength(electrons)
        shells.forEach((count, i) => expect(atom.querySelectorAll(`circle[data-electron][data-shell="${i + 1}"]`)).toHaveLength(count))
        expect(atom.querySelectorAll('.bohr__shell')).toHaveLength(shells.length)
      })
      unmount()
    }
    const { container: transfer, unmount: done } = renderWithTheme(<Lesson2NotebookFigure figure={{ id:'nacl', kind:'lesson2-static', figureKey:'nacl', caption:'انتقال الإلكترون' }}/>)
    expect([...transfer.querySelectorAll('[data-bohr]')].map(a => a.querySelectorAll('circle[data-electron]').length)).toEqual([11,17,10,18])
    done()
    const { container: water } = renderWithTheme(<Lesson2NotebookFigure figure={{ id:'hetero', kind:'lesson2-static', figureKey:'hetero', caption:'لويس الماء' }}/>)
    expect(water.querySelectorAll('[data-water-electron="shared"]')).toHaveLength(4)
    expect(water.querySelectorAll('[data-water-electron="lone"]')).toHaveLength(4)
    Object.values(notebookAtoms).forEach(a => expect(a.shells.reduce((x, y) => x + y, 0)).toBe(a.z))
    Object.values(ionicExamples).forEach(e => expect(e.m * e.charge - e.n * e.gain).toBe(0))
  })
  it('draws valence-only diagrams separately and hides tools alone in scoped print CSS', () => {
    const { container } = renderWithTheme(<Lesson2NotebookFigure figure={{ id:'v', kind:'lesson2-static', figureKey:'valence', caption:'إلكترونات السوية الخارجية فقط' }}/>)
    const counts = [1,2,1,6,7]
    container.querySelectorAll('[data-valence-only]').forEach((e,i) => {
      expect(e.querySelectorAll('[data-valence-electron]')).toHaveLength(counts[i]!)
      expect(e.querySelector('.bohr__nucleus')).toBeNull()
    })
    const css = readFileSync('src/styles/lesson2.css', 'utf8').split('/* Notebook additions:')[1]!
    expect(css).toContain(".lesson-shell[data-lesson-id='chem-u1-l2'] .l2-notebook-tool { display: none !important; }")
    expect(css).not.toMatch(/\.l2-notebook-static[^{}]*\{[^}]*display:\s*none/)
    expect(css).not.toMatch(/\.student-notebook\s*\{[^}]*display:\s*none/)
  })
})

// Deliberate chunk rejection exercises the real boundary; never mocks core content.
vi.mock('@/lessons/lesson2NotebookWidgets', () => { throw new Error('intentional tool chunk failure') })
describe('failed tool isolation', () => {
  it('contains rejected tools without losing any of the eleven sections or figures', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const { container, findAllByRole } = renderWithTheme(<StudentNotebookView notebook={book}/>)
      await findAllByRole('status')
      expect(container.querySelectorAll('[data-notebook-section]')).toHaveLength(11)
      expect(container.querySelectorAll('.l2-notebook-static')).toHaveLength(10)
      expect(container.textContent).toContain('تعذّر تحميل الأداة')
      expect(container.textContent).toContain('(+2) + 2(−1) = 0')
    } finally { spy.mockRestore() }
  })
})
