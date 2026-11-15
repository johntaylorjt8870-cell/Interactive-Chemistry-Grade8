import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderWithTheme } from './utils/renderApp'
import { chemistryLesson2StudentNotebook as notebook } from '@/data/curriculum/chemistryLesson2Notebook'
import { LESSON2_LEDGER } from '@/data/curriculum/lesson2SourceLedger'
import { ionicExamples, Lesson2NotebookFigure } from '@/lessons/lesson2NotebookFigures'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'

const sources = notebook.sourcesAppendix!.rows
const sections = notebook.sections

describe('Lesson 2 closing review — real content and diagrams', () => {
  it('separates the answer, printed conclusion and platform analogy without in-body source labels', () => {
    const points = sections[0]!.points!
    const answer = points.find(p => p.startsWith('ما الذي يربط'))!
    const conclusion = points.find(p => p.startsWith('هناك قوى'))!
    const analogy = points.find(p => p.startsWith('لا مادة لاصقة'))!
    expect(answer).toBe('ما الذي يربط ذرّات المادة لتبقى متماسكة؟ تربطها قوى تجاذب نسمّيها روابط كيميائية.')
    expect(conclusion).toBe('هناك قوى تربط بين الذرّات المكوّنة للمادّة نسمّيها روابط كيميائيّة.')
    expect(analogy).toContain('لا إضافة مادة جديدة بينها')
    expect(answer).not.toContain('لاصقة')
    expect(conclusion).not.toContain('لاصقة')
    expect(sources.find(r => r.item === 'حل نشاط التماسك')).toMatchObject({ classification: 'حل النشاط', page: '13' })
    expect(sources.find(r => r.item === 'الاستنتاج المطبوع عن قوى الترابط')).toMatchObject({ classification: 'نص الكتاب بحسب التفريغ المحلي', source: 'p14-conclusion', page: '14' })
    expect(sources.find(r => r.item === 'توضيح طبيعة قوة الترابط')?.classification).toContain('إضافة منصة')
    expect(points.join(' ')).not.toMatch(/ص\d|\[(كتاب|منصة)\]/)
  })

  it('keeps both transcribed wordings in one source row, but displays only the singular definition', () => {
    const plural = 'هي القوى التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.'
    const singular = 'هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.'
    expect(LESSON2_LEDGER.find(r => r.id === 'p14-bond-definition')?.excerpt).toBe(plural)
    expect(LESSON2_LEDGER.find(r => r.id === 'p16-learn-line-1')?.excerpt).toBe(`الرابطة الكيميائيّة: ${singular}`)
    const definitions = sections.flatMap(s => s.definitions ?? []).filter(d => d.term === 'الرابطة الكيميائيّة')
    expect(definitions).toEqual([{ term: 'الرابطة الكيميائيّة', text: singular, source: 'ص16' }])
    const rows = sources.filter(r => r.item === 'الرابطة الكيميائيّة')
    expect(rows).toHaveLength(1)
    for (const value of [plural, singular, 'p14-bond-definition', 'p16-learn-line-1', 'لم تُعاين صور الأصل مباشرة']) expect(rows[0]!.source).toContain(value)
    expect(JSON.stringify(sections).split(singular)).toHaveLength(2)
    expect(notebook.source.verified).toBe(false)
  })

  it('shows all four MgO stages with the correct particles, transfer count and neutral ratio', () => {
    const { container } = renderWithTheme(<Lesson2NotebookFigure figure={{ id: 'mgo', kind: 'lesson2-static', figureKey: 'mgo', caption: 'مراحل MgO' }}/>)
    expect(Object.keys(ionicExamples)).toEqual(['nacl', 'cao', 'na2o', 'mgcl2'])
    const stages = container.querySelectorAll('.l2-notebook-stages > section')
    expect(stages).toHaveLength(4)
    expect([...stages[0]!.querySelectorAll<HTMLElement>('[data-atom-symbol]')].map(a => [a.dataset.atomSymbol, a.dataset.protons, a.dataset.electrons, a.dataset.shells, a.dataset.charge])).toEqual([
      ['Mg', '12', '12', '2-8-2', '0'], ['O', '8', '8', '2-6', '0'],
    ])
    expect(stages[1]!.querySelector('svg')?.textContent).toContain('2e⁻')
    expect([...stages[2]!.querySelectorAll<HTMLElement>('[data-atom-symbol]')].map(a => [a.dataset.atomSymbol, a.dataset.protons, a.dataset.electrons, a.dataset.shells, a.dataset.charge])).toEqual([
      ['Mg', '12', '10', '2-8', '2'], ['O', '8', '10', '2-8', '-2'],
    ])
    expect(stages[2]!.querySelectorAll('circle[data-electron]')).toHaveLength(20)
    expect(stages[3]!.textContent).toContain('1(+2) + 1(−2) = 0 ⇒ MgO')
    const written = sections.find(s => s.id === 'ionic-worked')!.ordered!.join(' ')
    expect(written).toContain('Mg → Mg²⁺ + 2e⁻')
    expect(written).toContain('O + 2e⁻ → O²⁻')
    expect(sources.find(r => r.item.startsWith('مراحل تكوّن MgO'))?.classification).toContain('إضافة منصة')
  })

  it.each([
    { formula: 'NH3', central: 'N', hydrogens: 3, pairs: 3, shared: 6, lone: 2 },
    { formula: 'CH4', central: 'C', hydrogens: 4, pairs: 4, shared: 8, lone: 0 },
  ])('draws $formula with actual shared and lone electron marks and correct total', ({ formula, central, hydrogens, pairs, shared, lone }) => {
    const { container } = renderWithTheme(<Lesson2NotebookFigure figure={{ id: 'research-lewis', kind: 'lesson2-static', figureKey: 'research-lewis', caption: 'لويس' }}/>)
    const molecule = container.querySelector(`[data-research-lewis="${formula}"]`)!
    expect(molecule.querySelector('[data-central-atom]')).toHaveTextContent(central)
    expect(molecule.querySelectorAll('[data-hydrogen]')).toHaveLength(hydrogens)
    expect(molecule.querySelectorAll('[data-shared-pair]')).toHaveLength(pairs)
    molecule.querySelectorAll('[data-shared-pair]').forEach(pair => expect(pair.querySelectorAll('circle[data-lewis-electron="shared"]')).toHaveLength(2))
    expect(molecule.querySelectorAll('[data-lewis-electron="shared"]')).toHaveLength(shared)
    expect(molecule.querySelectorAll('[data-lewis-electron="lone"]')).toHaveLength(lone)
    expect(shared + lone).toBe(8)
    expect(molecule.querySelectorAll('[data-lone-pair]')).toHaveLength(lone / 2)
    expect(molecule.textContent).toContain('ولا يمثّل الشكل الفراغي')
    expect(molecule.querySelector('svg')).toHaveAccessibleName(/لويس/)
  })

  it('renders the new science eagerly, with written reasoning and provenance even without tools', () => {
    const html = renderToStaticMarkup(<StudentNotebookView notebook={notebook}/>)
    for (const marker of ['data-notebook-figure="mgo"', 'data-research-lewis="NH3"', 'data-research-lewis="CH4"']) expect(html).toContain(marker)
    expect(sections.find(s => s.id === 'comparison-research')!.points!.join(' ')).toContain('ويبقى إلكترونان نضعهما زوجاً حرّاً على N')
    expect(sections.find(s => s.id === 'comparison-research')!.points!.join(' ')).toContain('ولا يبقى زوج حرّ على C')
    expect(sources.filter(r => r.item.includes('تمثيلا لويس للنشادر'))).toHaveLength(1)
  })
})
