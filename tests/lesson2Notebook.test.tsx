import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { progressStore } from '@/data/progress'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'
import { chemistryLesson2 } from '@/data/curriculum/chemistryLesson2'
import { chemistryLesson2StudentNotebook } from '@/data/curriculum/chemistryLesson2Notebook'
import { chemistryLesson2Extra } from '@/data/curriculum/chemistryLesson2Extra'
import { getSubjectDefinition } from '@/data/curriculum/registry'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-bonds'
beforeEach(() => {
  window.history.replaceState(null, '', '/')
  progressStore.resetAll()
})

describe('student notebook — Lesson 2 source and scope', () => {
  it('is attached to Lesson 2 without changing the teaching sequence or Lesson 1 notebook', () => {
    expect(chemistryLesson2.studentNotebook).toBe(chemistryLesson2StudentNotebook)
    expect(chemistryLesson2.steps).toHaveLength(38)
    expect(chemistryLesson2.steps.at(-1)?.id).toBe('final-test')
    expect(chemistryLesson2StudentNotebook.source.pages.map((page) => page.page)).toEqual([
      '13', '14', '15', '16', '17',
    ])
    expect(chemistryLesson2StudentNotebook.source.verified).toBe(false)
    expect(chemistryLesson2StudentNotebook.source.readability?.notes).toContain(
      'صور الصفحات الأصلية لم تُعاين مباشرة',
    )

    expect(chemistryLesson1.studentNotebook).toBe(lesson1StudentNotebook)
    expect(lesson1StudentNotebook.sections.every((section) => section.lewisMolecules === undefined)).toBe(true)
  })

  it('records the two printed bond types explicitly as a separate point', () => {
    const opening = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'bond-meaning')!
    const classification = 'أنواع الروابط الكيميائية: الرابطة الأيونية والرابطة المشتركة.'
    expect(opening.points).toContain(classification)

    const sourceStep = chemistryLesson2.steps.find((step) => step.id === 'bond-definition')!
    const printedLine = sourceStep.blocks.find(
      (block) => block.kind === 'textbook-verbatim' && /نوعين من الروابط/.test(block.text),
    )
    expect(printedLine).toMatchObject({ kind: 'textbook-verbatim', source: { page: '14' } })
  })

  it('keeps all three complete «تعلّمُ» definitions exactly once', () => {
    const definitions = chemistryLesson2StudentNotebook.sections.flatMap((section) => section.definitions ?? [])
    expect(definitions).toEqual([
      {
        term: 'الرابطة الكيميائيّة',
        text: 'هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
        source: 'ص16',
      },
      {
        term: 'الرابطة الأيونية',
        text: 'هي قوة تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
        source: 'ص15',
      },
      {
        term: 'الرابطة المشتركة',
        text: 'هي اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
        source: 'ص16',
      },
    ])

    const learnBox = chemistryLesson2.steps.find((step) => step.id === 'learn-box')!
    const printedLines = learnBox.blocks.flatMap((block) =>
      block.kind === 'list' && block.attribution === 'textbook' ? block.items : [],
    )
    expect(definitions.map(({ term, text }) => `${term}: ${text}`)).toEqual(printedLines)
  })

  it('preserves printed transfer and properties, adding full foundations and solutions', () => {
    const transfer = chemistryLesson2StudentNotebook.sections.find(s => s.id === 'ionic-transfer')!
    expect(transfer.points?.[1]).toBe('عند ارتباط الصّوديوم مع الكلور تفقد ذرّة الصّوديوم إلكترونًا واحدًا متحوّلةً إلى أيون الصّوديوم Na⁺ بينما تكسب ذرّة الكلور ذلك الإلكترون متحوّلةً إلى أيون الكلوريد Cl⁻ وتتحقّق بذلك قاعدة الثمانية لكليهما.')
    expect(transfer.points?.[2]).toBe('تتجاذب أيونات الصّوديوم الموجبة Na⁺ مع أيونات الكلور السّالبة Cl⁻ لتشكيل جزيئات كلوريد الصّوديوم على شكل بلورات صلبة NaCl (ملح الطعام) المتعادل كهربائيًا.')
    expect(transfer.table?.rows.map(({ cells }) => Object.values(cells))).toEqual([
      ['Na','11','11','0','2-8-1'], ['Cl','17','17','0','2-8-7'], ['Na⁺','11','10','+1','2-8'], ['Cl⁻','17','18','−1','2-8-8'],
    ])
    expect(chemistryLesson2StudentNotebook.sections.find(s => s.id === 'ionic-properties')?.points?.[0]).toBe('المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.')
    expect(chemistryLesson2StudentNotebook.sections.find(s => s.id === 'lewis-worked')?.points?.[0]).toBe('المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.')
  })

  it('retains all research compounds and atomic numbers while requiring full exam solutions and revision', () => {
    const research = chemistryLesson2StudentNotebook.sections.find(s => s.id === 'comparison-research')!
    expect(research.tables?.[2]?.rows.map(r => r.cells['0'])).toEqual(['NH₃','H₂O','CH₄','CaO','AlCl₃'])
    expect(research.points?.[1]).toContain('₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl')
    research.tables?.[2]?.rows.forEach(r => expect(r.cells['3']!.length).toBeGreaterThan(35))
    expect(research.points?.[5]).toContain('المختلف CH₄')
    expect(research.points?.[6]).toContain('المختلف N₂')
    expect(research.points?.[6]).toContain('اختيار H₂')
    expect(chemistryLesson2StudentNotebook.checklist!.items).toHaveLength(7)
    expect(chemistryLesson2StudentNotebook.sections.filter(s => s.ordered || s.procedure).map(s => s.id)).toEqual(['ionic-worked','lewis-worked'])
  })

  it('replaces the eight-section brief with eleven complete clean sections and a separate revision', () => {
    expect(chemistryLesson2StudentNotebook.sections.map(s => s.id)).toEqual([
      'keywords-and-symbols','bond-meaning','atomic-foundation','metals-nonmetals-valence','ionic-transfer','ionic-worked','ionic-properties','lewis-examples','lewis-worked','comparison-research','review-errors',
    ])
    expect(chemistryLesson2StudentNotebook.sections.every(s => !s.source)).toBe(true)
    expect(chemistryLesson2StudentNotebook.sections[0]?.points?.[3]).toContain('الرقم الصغير السفلي')
    expect(chemistryLesson2StudentNotebook.sections[3]?.points?.join(' ')).toMatch(/الهيدروجين.*لا فلزّ/)
    expect(chemistryLesson2StudentNotebook.sections[3]?.points?.join(' ')).toContain('الزئبق Hg')
    expect(chemistryLesson2StudentNotebook.sections[3]?.points?.join(' ')).toContain('الغرافيت')
    expect(chemistryLesson2StudentNotebook.checklist?.items).toHaveLength(7)
    expect(chemistryLesson2StudentNotebook.sections[8]?.procedure?.steps).toHaveLength(4)
    const research = chemistryLesson2StudentNotebook.sections[9]!
    expect(research.tables?.[2]?.rows.map(r => r.cells['0'])).toEqual(['NH₃','H₂O','CH₄','CaO','AlCl₃'])
    expect(research.tables?.[1]?.rows.map(r => r.cells['1'])).toEqual(['13','20','6','1','8','7','17'])
    expect(research.points?.join(' ')).toContain('اختر المختلف')
    expect(research.points?.join(' ')).toContain('N₂')
    expect(chemistryLesson2StudentNotebook.sourcesAppendix?.caption).toBe('جدول مصادر بنود دفتر الطالب')
  })
})

describe('student notebook — reuses the printed Lewis diagrams', () => {
  it('matches the source lesson dot maps for H₂, O₂ and N₂', () => {
    const sourceStep = chemistryLesson2.steps.find((step) => step.id === 'covalent-figure')!
    const sourceMolecules = sourceStep.blocks.flatMap((block) => (block.kind === 'lewis-molecule' ? [block] : []))
    const notebookMolecules = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'lewis-examples')!
      .lewisMolecules!

    const normalizedNotebook = notebookMolecules.map((molecule) => ({
      formula: molecule.formula,
      leftSymbol: molecule.left.symbol,
      leftLonePairSides: molecule.left.lonePairSides ?? [],
      rightSymbol: molecule.right.symbol,
      rightLonePairSides: molecule.right.lonePairSides ?? [],
      sharedPairs: molecule.sharedPairs,
    }))
    const normalizedSource = sourceMolecules.map((molecule) => ({
      formula: `${molecule.leftSymbol}2`,
      leftSymbol: molecule.leftSymbol,
      leftLonePairSides: molecule.leftLonePairSides ?? [],
      rightSymbol: molecule.rightSymbol,
      rightLonePairSides: molecule.rightLonePairSides ?? [],
      sharedPairs: molecule.sharedPairs,
    }))
    expect(normalizedNotebook).toEqual(normalizedSource)
  })

  it('renders the three real LewisMolecule figures and structured formula notation', () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={chemistryLesson2StudentNotebook} />)
    const figures = [...container.querySelectorAll<HTMLElement>('[data-notebook-section="lewis-examples"] .student-notebook__lewis')]
    expect(figures).toHaveLength(3)

    const expected = [
      { formula: 'H2', sharedPairs: 1, lonePairsPerAtom: [0, 0] },
      { formula: 'O2', sharedPairs: 2, lonePairsPerAtom: [2, 2] },
      { formula: 'N2', sharedPairs: 3, lonePairsPerAtom: [1, 1] },
    ]
    figures.forEach((figure, index) => {
      const molecule = expected[index]!
      const lewis = figure.querySelector<HTMLElement>('[data-lewis-molecule]')!
      const shared = lewis.querySelector<HTMLElement>('.lewis-mol__shared')!
      const formula = figure.querySelector<HTMLElement>('.chem-formula')!
      expect(formula).toHaveAttribute('data-formula', molecule.formula)
      expect(formula.querySelector('sub')).toHaveTextContent('2')
      expect(shared).toHaveAttribute('data-shared-pairs', String(molecule.sharedPairs))
      expect(shared.querySelectorAll('[data-electron="shared"]')).toHaveLength(molecule.sharedPairs * 2)
      expect([...lewis.querySelectorAll<HTMLElement>('[data-atom]')].map((atom) => Number(atom.dataset.lonePairs))).toEqual(
        molecule.lonePairsPerAtom,
      )
      expect(figure.querySelector('.bond-model')).toHaveAttribute('data-bond-order', String(molecule.sharedPairs))
    })

    expect(container.querySelector('.student-notebook__lewis .lewis-mol__row')).toHaveAttribute('dir', 'ltr')
    expect(container.querySelector('.student-notebook__table [data-formula="NH3"] sub')).toHaveTextContent('3')
    expect(container.querySelector('.student-notebook__table [data-formula="H2O"] sub')).toHaveTextContent('2')
    expect(container.querySelector('.student-notebook__table [data-formula="CH4"] sub')).toHaveTextContent('4')
    expect(container.querySelector('.student-notebook__table [data-formula="AlCl3"] sub')).toHaveTextContent('3')
    expect(container.querySelectorAll('.nuclear-notation')).toHaveLength(11)
    expect(container.querySelectorAll('[data-notebook-section="comparison-research"] .nuclear-notation')).toHaveLength(7)
    expect(container.querySelectorAll('.electron-configuration')).toHaveLength(35)
    expect(container.querySelectorAll('[data-notebook-section="ionic-transfer"] .student-notebook__table .electron-configuration')).toHaveLength(4)
  })
})

describe('student notebook — lesson integration', () => {
  it('is the last navigation tab after the 38 existing teaching steps', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chemistryLesson2.steps.length + 2)
    expect(buttons.at(-2)).toHaveAttribute('data-tab', 'extra')
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(buttons.at(-1)!)
    const article = screen.getByRole('article', { name: /مادة الدفتر المدرسي/ })
    expect(within(article).getByRole('heading', { level: 3, name: /الروابط الكيميائية — مادة الدفتر المدرسي/ })).toBeInTheDocument()
    expect(article.querySelectorAll('.l2-notebook-static')).toHaveLength(10)
    expect(article.querySelectorAll('.student-notebook__lewis')).toHaveLength(4)
    expect(within(article).queryByText('توضيح ضروري من المنصة — ليس نصاً من الكتاب')).not.toBeInTheDocument()
    expect(within(article).getByText('جدول مصادر بنود دفتر الطالب')).toBeInTheDocument()
    expect(
      within(article).getByRole('heading', { level: 4, name: /الفلزّات واللافلزّات وسلوك الذرّة بحسب الشريك/ }),
    ).toBeInTheDocument()
    const foundation = article.querySelector<HTMLElement>('[data-notebook-section="metals-nonmetals-valence"]')!
    expect(within(foundation).getAllByRole('listitem')).toHaveLength(3)
    expect(within(foundation).getAllByRole('row')).toHaveLength(6)
  })

  it('keeps a written answer when leaving a lesson step and returning from the notebook', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#step-3')
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })

    const step = document.querySelector<HTMLElement>('.step')!
    expect(step).toBeInTheDocument()
    expect(step).not.toHaveAttribute('hidden')
    const answer = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement
    await user.type(answer, 'إجابة مؤقتة')
    expect(answer).toHaveValue('إجابة مؤقتة')

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))
    expect(document.querySelector('.step')).toBe(step)
    expect(step).toHaveAttribute('hidden')
    expect(answer).toHaveValue('إجابة مؤقتة')

    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(document.querySelector('.step')).toBe(step)
    expect(step).not.toHaveAttribute('hidden')
    expect(answer).toHaveValue('إجابة مؤقتة')
  })
})


describe('Lesson 2 — independent extra tab', () => {
  it('retains every approved board value and exact text, separate from clarification', () => {
    expect(chemistryLesson2.extra).toBe(chemistryLesson2Extra)
    expect(chemistryLesson2.steps).toHaveLength(38)
    expect(chemistryLesson2.steps.at(-1)?.id).toBe('final-test')
    expect(chemistryLesson2.steps.some((step) => step.id === 'extra')).toBe(false)
    const [definition, metals, nonmetals] = chemistryLesson2Extra.sections
    expect(definition.blocks[0]).toMatchObject({
      kind: 'definition',
      text: 'هو عدد الإلكترونات التي تفقدها أو تكتسبها أو تشترك بها الذرة أثناء تفاعلها لتصل لحالة الاستقرار',
    })
    const metalTable = metals.blocks[0]
    const nonmetalTable = nonmetals.blocks[0]
    expect(metalTable.kind).toBe('table')
    expect(nonmetalTable.kind).toBe('table')
    if (metalTable.kind !== 'table' || nonmetalTable.kind !== 'table') throw new Error('Missing board tables')
    expect(metalTable.rows.map(({ cells }) => [cells.symbol, cells.valence])).toEqual([
      ['Na', '1'], ['K', '1'], ['Ag', '1'], ['Au', '1'], ['Hg', '1'],
      ['Cu I', '1'], ['Cu II', '2'], ['Mg', '2'], ['Ca', '2'], ['Ba', '2'],
      ['Pb', '2'], ['Zn', '2'], ['Al', '3'], ['Fe I', '1'], ['Fe II', '2'],
    ])
    expect(nonmetalTable.rows.map(({ cells }) => [cells.symbol, cells.valence])).toEqual([
      ['Cl', '1'], ['Br', '1'], ['F', '1'], ['H', '1'], ['O', '2'],
      ['S', '2'], ['N', '3'], ['P', '3'], ['C', '2 و4'],
    ])
    expect(metals.blocks[1]).toMatchObject({
      text: 'يدلنا التكافؤ على عدد الالكترونات المفقودة لذلك نعتبر المعادن أيونات موجبة',
    })
    expect(nonmetals.blocks[1]).toMatchObject({
      text: 'يدلنا التكافؤ على عدد الالكترونات المكتسبة فتعتبر اللامعادن أيونات سالبة',
    })
    const source = JSON.stringify(chemistryLesson2Extra.sections)
    expect(source).not.toMatch(/Cd|هيليوم|هليوم|نيون|أرغون|Fe III|CH[₄4]|CO[₂2]|textbook-verbatim/)
    expect(chemistryLesson2Extra.clarification.every((block) => 'attribution' in block && block.attribution === 'platform')).toBe(true)
    for (const id of chemistryLesson2Extra.relatedStepIds) {
      expect(chemistryLesson2.steps.some((step) => step.id === id), id).toBe(true)
    }
  })

  it('renders two complete RTL board tables and a clearly separated scientific note', async () => {
    window.history.replaceState(null, '', '/#extra')
    renderApp(LESSON_PATH)
    const article = await screen.findByRole('article', { name: 'إضافي' })
    expect(within(article).getAllByRole('table')).toHaveLength(2)
    const [metals, nonmetals] = within(article).getAllByRole('table')
    expect(within(metals).getAllByRole('row')).toHaveLength(16)
    expect(within(nonmetals).getAllByRole('row')).toHaveLength(10)
    for (const rowId of ['cu-i', 'cu-ii', 'fe-i', 'fe-ii']) {
      const cell = metals.querySelector(`[data-row="${rowId}"] [data-column="symbol"]`)!
      expect(cell.querySelector('[dir="ltr"]')).toBeInTheDocument()
    }
    expect(within(article).getByRole('heading', { name: 'توضيح إضافي' })).toBeInTheDocument()
    expect(article.querySelector('[data-extra-source="board"]')).not.toHaveTextContent('الزوج المدرسي الشائع')
    expect(article.querySelector('[data-extra-source="platform"]')).toHaveTextContent('الزوج المدرسي الشائع')
    expect(article.querySelector('[data-extra-section="nonmetals"]')).toHaveTextContent('ملاحظة السبورة — اللافلزات')
    expect(article.querySelector('[data-extra-section="metals"]')).not.toHaveTextContent('المكتسبة')
    expect(progressStore.getLesson(chemistryLesson2.id)).toBeUndefined()
    expect(window.location.hash).toBe('#extra')
    expect(screen.getByRole('progressbar', { name: 'التقدّم في الدرس' })).toHaveAttribute('aria-valuemax', '38')
  })

  it('preserves the answer, active step and progress across extra → notebook → extra → lesson', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#step-3')
    renderApp(LESSON_PATH)
    const answer = (await screen.findAllByRole('textbox'))[0]
    await user.type(answer, 'إجابة محفوظة')
    const step = document.querySelector('.step')!
    const before = progressStore.getSnapshot()
    await user.click(screen.getByRole('button', { name: /إضافي.*محتوى السبورة/ }))
    expect(window.location.hash).toBe('#extra')
    expect(step).toHaveAttribute('hidden')
    expect(progressStore.getSnapshot()).toBe(before)
    expect(document.activeElement).toBe(document.getElementById('lesson-content'))
    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))
    expect(window.location.hash).toBe('#student-notebook')
    expect(screen.queryByRole('article', { name: 'إضافي' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /إضافي.*محتوى السبورة/ }))
    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(window.location.hash).toBe('#step-3')
    expect(document.querySelector('.step')).toBe(step)
    expect(step).not.toHaveAttribute('hidden')
    expect(answer).toHaveValue('إجابة محفوظة')
    expect(progressStore.getLesson(chemistryLesson2.id)?.seenStepIds).toEqual(before.lessons[chemistryLesson2.id].seenStepIds)
  })

  it('opens a real existing step from a short reference, not an invented extra step', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#extra')
    renderApp(LESSON_PATH)
    const references = screen.getByRole('navigation', { name: 'إحالات إلى شرح الدرس' })
    await user.click(within(references).getAllByRole('button')[0])
    expect(document.querySelector('.step')).toHaveAttribute('data-step', 'atoms-and-shells')
    expect(window.location.hash).toBe('#step-4')
    expect(progressStore.getLesson(chemistryLesson2.id)?.seenStepIds).toEqual(['atoms-and-shells'])
  })

  it('supports opening extra from the drawer and returning without losing focus', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await user.click(screen.getByRole('button', { name: 'خطوات الدرس' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /إضافي.*محتوى السبورة/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'إضافي' })).toBeInTheDocument()
    expect(document.activeElement).toBe(document.getElementById('lesson-content'))
  })

  const otherLessons = getSubjectDefinition('chemistry').units.flatMap((unit) =>
    unit.lessons.filter((lesson) => lesson.id !== 'chem-u1-l2').map((lesson) => ({ unit, lesson })),
  )
  it.each(otherLessons)('does not attach or render extra in $lesson.id, even at #extra', ({ unit, lesson }) => {
    expect(lesson.extra).toBeUndefined()
    window.history.replaceState(null, '', '/#extra')
    renderApp(`/chemistry/${unit.slug}/${lesson.slug}`)
    expect(document.querySelector('[data-tab="extra"]')).not.toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'إضافي' })).not.toBeInTheDocument()
    expect(document.querySelector('.step')).not.toHaveAttribute('hidden')
  })
})

describe('Lesson 2 sources are consolidated after its notebook upgrade', () => {
  it('hides all three definition chips and documents the original occurrences in one appendix', () => {
    const { container } = renderWithTheme(
      <StudentNotebookView notebook={chemistryLesson2StudentNotebook} />,
    )
    const sources = [...container.querySelectorAll('.student-notebook__source')].map((node) => node.textContent)
    expect(sources).toEqual([])
    expect(chemistryLesson2StudentNotebook.hidePageTagsInBody).toBe(true)
    const rows = chemistryLesson2StudentNotebook.sourcesAppendix!.rows.filter(r => r.item === 'الرابطة الكيميائيّة')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.source).toContain('p14-bond-definition')
    expect(rows[0]?.source).toContain('p16-learn-line-1')
  })
})
