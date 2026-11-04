import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { progressStore } from '@/data/progress'
import { chemistryLesson1 } from '@/data/curriculum/chemistryLesson1'
import { lesson1StudentNotebook } from '@/data/curriculum/chemistryLesson1Notebook'
import { chemistryLesson2 } from '@/data/curriculum/chemistryLesson2'
import { chemistryLesson2StudentNotebook } from '@/data/curriculum/chemistryLesson2Notebook'
import { StudentNotebookView } from '@/lessons/StudentNotebookView'
import { renderApp, renderWithTheme } from './utils/renderApp'

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-bonds'
const FORMULA_READING_NOTE =
  'الحرف اللاتيني الكبير (أو الكبير متبوعاً بصغير مثل Na وCl) يدلّ على نوع العنصر، والرقم الصغير السفلي على يمين الرمز يدلّ على عدد ذرّات ذلك العنصر وحده: ففي H₂O ذرّتا هيدروجين وذرّة أكسجين واحدة.'
const METALS_NONMETALS_POINTS = [
  'إلكترونات التكافؤ (إلكترونات السطح) هي إلكترونات السوية الخارجية الأخيرة في الذرّة، أي آخر رقم في التوزيع الإلكتروني، وهي التي تُفقد أو تُكتسب أو تُشارك عند تكوّن الرابطة.',
  'الفلزّات الممثّلة في هذا الدرس، ومنها الصوديوم Na والكالسيوم Ca والألمنيوم Al، تحمل سويتها الأخيرة عدداً قليلاً من إلكترونات التكافؤ (1 أو 2 أو 3) فوق سوية داخلية مكتملة؛ وعند ارتباطها باللافلزّات تفقد إلكترونات تكافئها وتتحوّل إلى أيونات موجبة.',
  'اللافلزّات في هذا الدرس، ومنها الكربون C والنيتروجين N والأكسجين O والكلور Cl، تحمل سويتها الأخيرة غالباً من 4 إلى 7 إلكترونات تكافؤ. أمّا الهيدروجين H فلا فلزّ رغم أن سطحه إلكترون واحد، وتكتمل سويته الأولى بإلكترونين، لذلك يميل إلى المشاركة.',
  'عند لقاء فلزّ بلا فلزّ ينتقل إلكترون أو أكثر من الفلزّ إلى اللافلزّ، فيتكوّن أيون موجب وأيون سالب يتجاذبان في رابطة أيونية. أمّا عند لقاء لا فلزّين فتتشارك الذرّات زوجاً من الإلكترونات أو أكثر دون تكوّن أيونات، فتتكوّن رابطة مشتركة؛ ولهذا لا يصح القول إن اللافلزّ يكتسب دائماً، بل يتوقّف سلوكه على الذرّة المقابلة.',
]

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
    const opening = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'keywords-and-symbols')!
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
        source: 'ص16 — صندوق «تعلّمُ»',
      },
      {
        term: 'الرابطة الأيونية',
        text: 'هي قوة تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
        source: 'ص16 — صندوق «تعلّمُ»',
      },
      {
        term: 'الرابطة المشتركة',
        text: 'هي اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
        source: 'ص16 — صندوق «تعلّمُ»',
      },
    ])

    const learnBox = chemistryLesson2.steps.find((step) => step.id === 'learn-box')!
    const printedLines = learnBox.blocks.flatMap((block) =>
      block.kind === 'list' && block.attribution === 'textbook' ? block.items : [],
    )
    expect(definitions.map(({ term, text }) => `${term}: ${text}`)).toEqual(printedLines)
  })

  it('preserves the complete printed ionic transfer data and only the printed comparison properties', () => {
    const transfer = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'ionic-transfer')!
    expect(transfer.points).toEqual([
      'عند ارتباط الصّوديوم مع الكلور تفقد ذرّة الصّوديوم إلكترونًا واحدًا متحوّلةً إلى أيون الصّوديوم Na⁺ بينما تكسب ذرّة الكلور ذلك الإلكترون متحوّلةً إلى أيون الكلوريد Cl⁻ وتتحقّق بذلك قاعدة الثمانية لكليهما.',
      'تتجاذب أيونات الصّوديوم الموجبة Na⁺ مع أيونات الكلور السّالبة Cl⁻ لتشكيل جزيئات كلوريد الصّوديوم على شكل بلورات صلبة NaCl (ملح الطعام) المتعادل كهربائيًا.',
    ])
    expect(transfer.table?.rows.map(({ cells }) => [cells.electrons, cells.configuration])).toEqual([
      ['11', '2-8-1'],
      ['17', '2-8-7'],
      ['10', '2-8'],
      ['18', '2-8-8'],
    ])

    const properties = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'compound-properties')!
    expect(properties.table?.rows.map(({ cells }) => cells.properties)).toEqual([
      'المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.',
      'المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.',
    ])
  })

  it('uses the two authorized platform additions verbatim and labels them visibly', () => {
    const marked = chemistryLesson2StudentNotebook.sections.filter((section) => section.source)
    expect(marked.map((section) => section.id)).toEqual(['formula-reading', 'metals-nonmetals-valence'])
    for (const section of marked) {
      expect(section.source).toBe('توضيح ضروري من المنصة — ليس نصاً من الكتاب')
    }
    expect(marked[0]?.notes?.map((note) => note.text)).toEqual([FORMULA_READING_NOTE])
    expect(marked[1]?.points).toEqual(METALS_NONMETALS_POINTS)

    expect(chemistryLesson2StudentNotebook.sections.map((section) => section.id)).toEqual([
      'keywords-and-symbols',
      'formula-reading',
      'metals-nonmetals-valence',
      'ionic-transfer',
      'lewis-examples',
      'compound-properties',
      'printed-compounds',
      'learn-box-definitions',
    ])
  })

  it('keeps the printed research examples and atomic numbers, but no questions, solutions or checklist', () => {
    const research = chemistryLesson2StudentNotebook.sections.find((section) => section.id === 'printed-compounds')!
    expect(research.table?.rows.map(({ cells }) => [cells.name, cells.formula])).toEqual([
      ['غاز النشادر', 'NH₃'],
      ['الماء', 'H₂O'],
      ['غاز الميتان', 'CH₄'],
      ['أكسيد الكالسيوم', 'CaO'],
      ['كلوريد الألمنيوم', 'AlCl₃'],
    ])
    expect(research.points).toEqual(['حيث: ₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl.'])

    const serialized = JSON.stringify(chemistryLesson2StudentNotebook)
    expect(chemistryLesson2StudentNotebook.checklist).toBeUndefined()
    expect(chemistryLesson2StudentNotebook.sections.every((section) => !section.procedure && !section.ordered)).toBe(true)
    expect(serialized).not.toMatch(/أختبر نفسي|اختر المختلف|الإجابة المرجعية|الحلّ النموذجي|أجب عن/)
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
    const figures = [...container.querySelectorAll<HTMLElement>('.student-notebook__lewis')]
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
    expect(container.querySelectorAll('.nuclear-notation')).toHaveLength(7)
    expect(container.querySelectorAll('.electron-configuration')).toHaveLength(4)
  })
})

describe('student notebook — lesson integration', () => {
  it('is the last navigation tab after the 38 existing teaching steps', async () => {
    const user = userEvent.setup()
    renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })

    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chemistryLesson2.steps.length + 1)
    expect(buttons.at(-1)).toHaveAttribute('data-tab', 'notebook')

    await user.click(buttons.at(-1)!)
    const article = screen.getByRole('article', { name: /مادة الدفتر المدرسي/ })
    expect(within(article).getByRole('heading', { level: 3, name: /الروابط الكيميائية — مادة الدفتر المدرسي/ })).toBeInTheDocument()
    expect(within(article).getAllByRole('figure')).toHaveLength(3)
    expect(within(article).getAllByText('توضيح ضروري من المنصة — ليس نصاً من الكتاب')).toHaveLength(2)
    expect(
      within(article).getByRole('heading', { level: 4, name: 'الفلزّات واللافلزّات وسلوك إلكترونات التكافؤ' }),
    ).toBeInTheDocument()
    const foundation = article.querySelector<HTMLElement>('[data-notebook-section="metals-nonmetals-valence"]')!
    expect(within(foundation).getAllByRole('listitem')).toHaveLength(4)
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
