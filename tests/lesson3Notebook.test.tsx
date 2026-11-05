import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { progressStore } from '@/data/progress'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'
import { chemistryLesson2 } from '@/data/curriculum/chemistryLesson2'
import { chemistryLesson2StudentNotebook } from '@/data/curriculum/chemistryLesson2Notebook'
import { chemistryLesson3 } from '@/data/curriculum/chemistryLesson3'
import { chemistryLesson3StudentNotebook } from '@/data/curriculum/chemistryLesson3Notebook'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-formulas'
const PLATFORM_LABEL = 'توضيح ضروري من المنصة — ليس نصاً من الكتاب'

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  progressStore.resetAll()
})

describe('student notebook — Lesson 3 source and scope', () => {
  it('is attached to Lesson 3 without changing the teaching sequence or earlier notebooks', () => {
    expect(chemistryLesson3.studentNotebook).toBe(chemistryLesson3StudentNotebook)
    expect(chemistryLesson3.steps).toHaveLength(32)
    expect(chemistryLesson3.steps.at(-1)?.id).toBe('final-test')
    expect(chemistryLesson3StudentNotebook.source.pages.map((page) => page.page)).toEqual([
      '18', '19', '20', '21', '22', '23',
    ])
    expect(chemistryLesson3StudentNotebook.source.verified).toBe(true)
    expect(chemistryLesson3StudentNotebook.source.readability?.notes).toContain('صور الصفحات الأصلية المطبوعة (ص18–23)')

    expect(chemistryLesson1.studentNotebook).toBe(lesson1StudentNotebook)
    expect(chemistryLesson2.studentNotebook).toBe(chemistryLesson2StudentNotebook)
  })

  it('keeps the 10 approved sections in order and labels only the 3 platform sections', () => {
    expect(chemistryLesson3StudentNotebook.sections.map((section) => section.id)).toEqual([
      'keywords-and-symbols',
      'symbol-vs-formula-reading',
      'covalent-valence',
      'ionic-valence',
      'valence-comparison',
      'elements-valence-table',
      'chemical-radicals',
      'writing-formulas-and-examples',
      'parentheses-balance-and-naming',
      'learn-box-summary',
    ])

    const marked = chemistryLesson3StudentNotebook.sections.filter((section) => section.source)
    expect(marked.map((section) => section.id)).toEqual([
      'symbol-vs-formula-reading',
      'valence-comparison',
      'parentheses-balance-and-naming',
    ])
    for (const section of marked) {
      expect(section.source).toBe(PLATFORM_LABEL)
    }

    const unmarked = chemistryLesson3StudentNotebook.sections.filter((section) => !section.source)
    expect(unmarked.map((section) => section.id)).toEqual([
      'keywords-and-symbols',
      'covalent-valence',
      'ionic-valence',
      'elements-valence-table',
      'chemical-radicals',
      'writing-formulas-and-examples',
      'learn-box-summary',
    ])
  })

  it('preserves the printed definitions from pages 19, 20, and 22 with their exact page sources', () => {
    const definitions = chemistryLesson3StudentNotebook.sections.flatMap((section) => section.definitions ?? [])
    expect(definitions).toEqual([
      {
        term: 'التّكافؤ الكيميائيّ في المركّبات ذات الرّوابط المشتركة',
        text: 'يساوي عدد الرّوابط التي اشتركت بها الذّرّة.',
        source: 'ص19 — صندوق «أستنتج»',
      },
      {
        term: 'التّكافؤ الكيميائيّ في المركّبات ذات الرّوابط الأيونية',
        text: 'هو: عدد الإلكترونات التي تكتسبها أو تفقدها ذرّة عنصر ما عند ارتباطها بذرّة عنصر آخر.',
        source: 'ص19 — صندوق «أستنتج»',
      },
      {
        term: 'الجذر الكيميائيّ',
        text: 'مجموعة ذرّات مترابطة بقوّة تسلك سلوك أيون أو ذرّة عنصر.',
        source: 'ص20 — صندوق «تعرّف»',
      },
      {
        term: 'التّكافؤ الكيميائيّ في المركّبات الأيونية',
        text: 'هو عدد الإلكترونات التي تكتسبها أو تفقدها ذرّة عنصر ما عند ارتباطها بذرّة عنصر آخر في المركّب الأيونيّ.',
        source: 'ص22 — صندوق «تعلّمتُ»',
      },
      {
        term: 'التّكافؤ الكيميائيّ في المركّبات ذات الرّوابط المشتركة',
        text: 'عدد الأزواج الإلكترونية التي اشتركت بها الذّرّة مع ذرّة أخرى.',
        source: 'ص22 — صندوق «تعلّمتُ»',
      },
      {
        term: 'الجذر الكيميائيّ',
        text: 'مجموعة ذرّية مترابطة تسلك سلوك ذرّة واحدة.',
        source: 'ص22 — صندوق «تعلّمتُ»',
      },
    ])
  })

  it('preserves the printed covalent observations, models, ionic equations, and uncompleted ion table from page 19', () => {
    const covalent = chemistryLesson3StudentNotebook.sections.find((section) => section.id === 'covalent-valence')!
    expect(covalent.points).toEqual([
      'الكربون شكّل أربع روابط مشتركة مع أربع ذرّات هدروجين في جزيء الميتان.',
      'النتروجين شكّل ثلاث روابط مشتركة مع ثلاث ذرّات هدروجين في جزيء النّشادر.',
      'الأكسجين شكّل رابطتين مشتركتين مع ذرّتي هدروجين في جزيء الماء.',
      'كل ذرّة هدروجين شكّلت رابطة مشتركة واحدة.',
    ])
    expect(covalent.table?.rows.map(({ cells }) => [cells.molecule, cells.central, cells.hydrogens, cells.bonds])).toEqual([
      ['الميتان CH₄', 'C', '4', '4'],
      ['النّشادر NH₃', 'N', '3', '3'],
      ['الماء H₂O', 'O', '2', '2'],
    ])

    const ionic = chemistryLesson3StudentNotebook.sections.find((section) => section.id === 'ionic-valence')!
    expect(ionic.points).toContain('Na → Na⁺ + e⁻')
    expect(ionic.points).toContain('Ca → Ca²⁺ + 2e⁻')
    expect(ionic.points).toContain('Mg → Mg²⁺ + 2e⁻')
    expect(ionic.points).toContain('Cl + e⁻ → Cl⁻')
    expect(ionic.points).toContain('O + 2e⁻ → O²⁻')
    expect(ionic.table?.rows).toEqual([
      { id: 'ion', cells: { label: 'الأيون', na: 'Na⁺', ca: '', mg: '', cl: '', o: '' } },
      {
        id: 'count',
        cells: { label: 'عدد الإلكترونات التي فقدتها أو اكتسبتها الذّرّة', na: '', ca: '', mg: '', cl: '', o: '' },
      },
    ])
  })

  it('preserves the 16-element valence table (p.20) and the 8-radical table with printed names (p.21)', () => {
    const elementsTable = chemistryLesson3StudentNotebook.sections.find(
      (section) => section.id === 'elements-valence-table',
    )!.table!
    expect(elementsTable.rows.map((row) => [row.cells.element, row.cells.valence, row.cells.element2, row.cells.valence2])).toEqual([
      ['Na', '1', 'Ca', '2'],
      ['H', '1', 'O', '2'],
      ['Br', '1', 'Zn', '2'],
      ['K', '1', 'Al', '3'],
      ['Cl', '1', 'Fe(III)', '3'],
      ['Ag', '1', 'Fe(II)', '2'],
      ['S', '2', 'Cu(II)', '2'],
      ['Mg', '2', 'Cu(I)', '1'],
    ])

    const radicalsSection = chemistryLesson3StudentNotebook.sections.find(
      (section) => section.id === 'chemical-radicals',
    )!
    expect(radicalsSection.points?.[0]).toBe(
      'تَنتُج الجذور الكيميائيّة عن تأيّن مركّبات الحموض أو مركّبات الأسس (ص20).',
    )
    expect(
      radicalsSection.table?.rows.map((row) => [
        row.cells.radical,
        row.cells.formula,
        row.cells.valence,
        row.cells.radical2,
        row.cells.formula2,
        row.cells.valence2,
      ]),
    ).toEqual([
      ['جذر النّترات', 'NO₃⁻', '1', 'جذر النّملات', 'HCOO⁻', '1'],
      ['جذر الكبريتات', 'SO₄²⁻', '2', 'جذر الخلّات', 'CH₃COO⁻', '1'],
      ['جذر الكربونات', 'CO₃²⁻', '2', 'جذر الهدروكسيل', 'OH⁻', '1'],
      ['جذر الفوسفات', 'PO₄³⁻', '3', 'جذر الأمونيوم', 'NH₄⁺', '1'],
    ])
  })

  it('records the 4 formula-writing stages once with both page 21 and page 22 sources, and keeps solved applications accurate', () => {
    const writing = chemistryLesson3StudentNotebook.sections.find(
      (section) => section.id === 'writing-formulas-and-examples',
    )!
    expect(writing.procedure?.title).toBe(
      'مراحل كتابة صيغة كيميائيّة (ص21 — صندوق «أستنتج»، وص22 — صندوق «تعلّمتُ»)',
    )
    expect(writing.procedure?.steps).toEqual([
      'أكتبُ رموز (صيغ أو جذور) مكوّنات الصّيغة.',
      'أكتبُ التّكافؤات.',
      'أبادلُ بين تكافؤات مكونات الصّيغة بحيث يتحقّق التّعادل الكهربائيّ.',
      'أحصلُ على الصّيغة المطلوبة.',
    ])
    expect(writing.points?.[0]).toContain('الرّمز (SO₄ | Al)')
    expect(writing.points?.[0]).toContain('Al₂(SO₄)₃')
    expect(writing.points?.[1]).toContain('المكوّنات (أكسجين | الكالسيوم) — الرّمز (O | Ca)')
    expect(writing.points?.[1]).toContain('CaO')

    // Ensure the 4 stages are not duplicated in learn-box-summary
    const learnBox = chemistryLesson3StudentNotebook.sections.find((section) => section.id === 'learn-box-summary')!
    expect(learnBox.procedure).toBeUndefined()
    expect(learnBox.ordered).toBeUndefined()
    expect(learnBox.points).toBeUndefined()
    expect(learnBox.definitions).toHaveLength(3)
  })

  it('excludes self-check questions, solutions, interactive labs, and revision checklist', () => {
    const serialized = JSON.stringify(chemistryLesson3StudentNotebook)
    expect(chemistryLesson3StudentNotebook.checklist).toBeUndefined()
    expect(serialized).not.toMatch(/أختبر نفسي|ضع إشارة|اختر الإجابة الصحيحة|الإجابة المرجعية|الحلّ النموذجي|رائق الكلس/)
  })
})

describe('student notebook — Lesson 3 structured scientific rendering and RTL', () => {
  it('renders formulas, ions, subscripts, parentheses, and charges structurally with zero stray glyphs', async () => {
    const { container } = renderWithTheme(<StudentNotebookView notebook={chemistryLesson3StudentNotebook} />)

    expect(strayScriptGlyphs(container)).toEqual([])

    expect(container.querySelector('[data-formula="H2O"] sub')).toHaveTextContent('2')
    expect(container.querySelector('[data-formula="CH4"] sub')).toHaveTextContent('4')
    expect(container.querySelector('[data-formula="NH3"] sub')).toHaveTextContent('3')
    expect(container.querySelector('[data-formula="ZnCl2"] sub')).toHaveTextContent('2')
    expect(container.querySelector('[data-formula="Al2O3"]')).not.toBeNull()
    expect(container.querySelector('[data-formula="Al2(SO4)3"]')).not.toBeNull()
    expect(container.querySelector('[data-formula="Ca(OH)2"]')).not.toBeNull()
    expect(container.querySelector('[data-formula="Zn(CH3COO)2"]')).not.toBeNull()
    expect([...container.querySelectorAll('.sci[dir="ltr"]')].some((node) => node.textContent === 'CaO')).toBe(true)

    const ions = container.querySelectorAll('.ion-notation')
    expect(ions.length).toBeGreaterThanOrEqual(15)
    for (const ion of ions) {
      expect(ion).toHaveAttribute('dir', 'ltr')
    }

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(
      results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'),
    ).toEqual([])
  })
})

describe('student notebook — Lesson 3 integration', () => {
  it('is the last navigation tab after the 32 existing teaching steps', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chemistryLesson3.steps.length + 1)
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(buttons.at(-1)!)
    const article = screen.getByRole('article', { name: /مادة الدفتر المدرسي/ })
    expect(
      within(article).getByRole('heading', { level: 3, name: /صيغ المركّبات الكيميائيّة — مادة الدفتر المدرسي/ }),
    ).toBeInTheDocument()
    expect(within(article).getAllByText(PLATFORM_LABEL)).toHaveLength(3)
    expect(article.querySelectorAll('[data-notebook-section]')).toHaveLength(10)
  })

  it('keeps a written answer when leaving a lesson step and returning from the notebook', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/#step-2')
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    const step = document.querySelector<HTMLElement>('.step')!
    expect(step).toBeInTheDocument()
    expect(step).not.toHaveAttribute('hidden')
    const answer = screen.getAllByRole('textbox')[0] as HTMLTextAreaElement
    await user.type(answer, 'H2O')
    expect(answer).toHaveValue('H2O')

    await user.click(screen.getByRole('button', { name: /دفتر الطالب/ }))
    expect(document.querySelector('.step')).toBe(step)
    expect(step).toHaveAttribute('hidden')
    expect(answer).toHaveValue('H2O')

    await user.click(screen.getByRole('button', { name: /العودة إلى الدرس/ }))
    expect(document.querySelector('.step')).toBe(step)
    expect(step).not.toHaveAttribute('hidden')
    expect(answer).toHaveValue('H2O')
  })
})
