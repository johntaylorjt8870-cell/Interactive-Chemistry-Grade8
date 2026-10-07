import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { readFileSync } from 'node:fs'
import { getLesson } from '@/data/curriculum/registry'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { chemistryLesson3, bookQuestions, bookActivitySolutions, finalTest } from '@/data/curriculum/chemistryLesson3'
import { validateLesson } from '@/data/sourceFidelity'
import ValenceModelLab from '@/simulations/ValenceModelLab'
import IonEquationLab from '@/simulations/IonEquationLab'
import FormulaBuilderLab from '@/simulations/FormulaBuilderLab'
import { evaluateQuestion } from '@/assessment/evaluate'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TEACHER_LESSONS, getTeacherLesson } from '@/teacher/teacherContent'
import { getTestDefinition, listTestDefinitions } from '@/data/testArea/registry'
import '@/data/testArea/register'
import { renderApp } from './utils/renderApp'
import type { LessonStep } from '@/data/curriculum/schema'

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-formulas'

function sourceSteps(): LessonStep[] {
  return chemistryLesson3.steps.filter((step) => step.source?.pages.length)
}

describe('curriculum registry — lesson 3', () => {
  it('publishes lesson 3 inside unit 1 after lessons 1–2', () => {
    const lesson = getLesson('chemistry', 'structural-chemistry', 'chemical-formulas')
    expect(lesson).toBeDefined()
    expect(lesson?.id).toBe('chem-u1-l3')
    expect(lesson?.order).toBe(3)
    expect(lesson?.status).toBe('source-verified')
    expect(lesson?.title).toContain('صيغةُ المركّباتِ الكيميائيَّةِ')
  })

  it('covers exactly pages 18–23 with a fully clear readability report', () => {
    const pages = chemistryLesson3.source.pages.map((page) => page.page)
    expect(pages).toEqual(['18', '19', '20', '21', '22', '23'])
    expect(chemistryLesson3.source.verified).toBe(true)
    const readability = chemistryLesson3.source.readability!
    for (const level of Object.values(readability)) {
      if (typeof level === 'string' && level !== 'clear' && !level.includes('Source')) {
        expect(level).toBe('clear')
      }
    }
  })

  it('passes the platform fidelity validators', () => {
    expect(validateLesson(chemistryLesson3, 'chem-u1-l3')).toEqual([])
  })

  it('keeps textbook pages in book order across the steps', () => {
    const order = sourceSteps().map((step) => Number(step.source!.pages[0]!.page))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order[0]).toBe(18)
    expect(order[order.length - 1]).toBe(23)
    expect(chemistryLesson3.steps[chemistryLesson3.steps.length - 1]!.kind).toBe('final-test')
  })

  it('references only registered interactives, in lesson order', () => {
    const ids = chemistryLesson3.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'interactive')
      .map((block) => (block.kind === 'interactive' ? block.interactiveId : ''))
    expect(ids).toEqual(['valence-model-lab', 'ion-equation-lab', 'formula-builder-lab'])
  })
})

describe('verbatim fidelity against the finalized source report', () => {
  const allText = JSON.stringify(chemistryLesson3)

  it.each([
    'الكلماتِ المفتاحيّة: صيغةٌ كيميائيّةٌ – التّكافؤُ الكيميائيُّ – مركّبٌ كيميائيٌّ – جَذْرٌ كيميائيٌّ.',
    'تتّحدُ ذرّاتُ هيدروجينٍ مع ذرّةِ أكسجينٍ فتُكوِّنُ جزيءَ الماءِ، فما الصّيغةُ الكيميائيّةُ لجزئِ الماء؟',
    'شكّلَ الكربونُ أربعَ روابطَ مشتركةٍ مع أربعةِ ذرّاتِ هيدروجينٍ في جزيءِ الميتان.',
    'التّكافؤُ الكيميائيُّ في المركّباتِ ذاتِ الرّوابطِ المشتركةِ يساوي عددَ الرّوابطِ التي شاركتْ بها الذّرّةُ.',
    'أَرْبِطُ المعادلاتِ الأيُونيّةِ الآتيّةِ، وأمْلَأِ الجدولَ الآتيِّ:',
    'عددُ الإلّكتروناتِ الّتي فقدْها أو اكتسبْها الذّرّة',
    'التّكافؤُ الكيميائيُّ في المركّباتِ ذاتِ الرّوابطِ الأيونيّةِ هو: عددُ الإلّكتروناتِ التي تفقدُها أو تكتسبُها ذرّةُ عنصرٍ ما عندَ ارتباطِها بأذرّةِ عناصرِ أخرى.',
    'تنجمُ الجذورُ الكيميائيّةُ عن ذرّتينِ أو أكثرِ في مركّباتِ حامضيّةٍ أو مركّباتِ أسّيّةٍ.',
    'الجذورُ صيغٌ ثابتةٌ:',
    'الجَذْرُ الكيميائيُّ: مجموعةُ ذرّاتٍ مترابِطَةٍ بقوّةٍ تسلكُ سلوكَ أيونٍ أو ذرّةٍ واحدةٍ.',
    'أكتبُ رموزَ (صيغَ أو جذورِ) مكوناتِ الشّيئةِ.',
    'أربطُ بينَ تكافؤاتِ مكوناتِ الشّيئةِ بحيثِ يتحقّقُ التعادلُ الكهربائيُّ.',
    '1. أكتبُ صيغةَ كبريتاتِ الألمنيومِ:',
    '2. أكتبْ صيغةَ أكسيدِ الكالسيومِ:',
    'المُؤلِّفانِ',
    'التَّكافؤُ الكيميائيُّ في المركّباتِ الأيُونيّةِ: هو عددُ الإلّكتروناتِ الّتي تفقدُها أو تكتسبُها ذرّةُ عنصرٍ عند ارتباطِها بذرّةِ عنصرٍ آخرَ في المركّبِ الأيُونيِّ.',
    'التَّكافؤُ الكيميائيُّ في المركّباتِ ذاتِ الرّوابطِ المشتركةِ: عددُ الأزواجِ الإلّكترونيّةِ الّتي اشتركتْ بها الذَّرّةُ مع ذرّةٍ أخرى.',
  ])('keeps the printed wording character for character: %s', (text) => {
    expect(allText).toContain(text)
  })

  it('keeps the ion-activity table exactly as printed: example Na filled, the rest empty', () => {
    const table = chemistryLesson3.steps
      .flatMap((step) => step.blocks)
      .find((block) => block.kind === 'table' && block.caption.includes('جدول نشاط الأيونات'))
    expect(table).toBeDefined()
    if (table?.kind !== 'table') return
    const ionRow = table.rows.find((row) => row.cells.label === 'الأيُون')!
    expect(ionRow.cells).toEqual({ label: 'الأيُون', na: 'Na⁺', ca: '', mg: '', cl: '', o: '' })
    const countRow = table.rows.find((row) => row.id === 'count')!
    expect([countRow.cells.na, countRow.cells.ca, countRow.cells.mg, countRow.cells.cl, countRow.cells.o]).toEqual([
      '', '', '', '', '',
    ])
  })

  it('keeps the element-valence table content in book order', () => {
    const table = chemistryLesson3.steps
      .flatMap((step) => step.blocks)
      .find((block) => block.kind === 'table' && block.caption.includes('جدول تكافؤات بعض العناصر'))
    if (table?.kind !== 'table') return
    expect(table.rows.map((row) => row.cells.element)).toEqual([
      'Na', 'H', 'Br', 'K', 'Cl', 'Ag', 'S', 'Mg', 'Ca', 'O', 'Zn', 'Al', 'Fe(III)', 'Fe(II)', 'Cu(II)', 'Cu(I)',
    ])
    expect(table.rows.map((row) => row.cells.valence)).toEqual([
      '1', '1', '1', '1', '1', '1', '2', '2', '2', '2', '2', '3', '3', '2', '2', '1',
    ])
  })

  it('keeps the radicals table with the finalized names and charges', () => {
    const table = chemistryLesson3.steps
      .flatMap((step) => step.blocks)
      .find((block) => block.kind === 'table' && block.caption.includes('بعض الجذور الكيميائية'))
    if (table?.kind !== 'table') return
    expect(table.rows.map((row) => row.cells.name)).toEqual([
      'جذور النترات', 'جذور الكبريتات', 'جذور الكربونات', 'جذور الفوسفات',
      'جذور الفورمات', 'جذور الأسيتات', 'جذور الهيدروكسيل', 'جذور الأمونيوم',
    ])
    expect(table.rows.map((row) => row.cells.formula)).toEqual([
      'NO₃⁻', 'SO₄²⁻', 'CO₃²⁻', 'PO₄³⁻', 'HCOO⁻', 'CH₃COO⁻', 'OH⁻', 'NH₄⁺',
    ])
  })

  it('keeps the solved-application tables with the printed header and empty symbols row', () => {
    const tables = chemistryLesson3.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'table' && block.caption.includes('التطبيق'))
    expect(tables).toHaveLength(2)
    for (const table of tables) {
      if (table.kind !== 'table') continue
      expect(table.columns[0]?.header).toBe('المُؤلِّفانِ')
      expect(table.rows[0]?.cells.label).toBe('')
    }
    const first = tables[0]
    if (first?.kind === 'table') {
      expect(first.rows[0]?.cells).toEqual({ label: '', first: 'SO₄', second: 'Al' })
      expect(first.rows[1]?.cells).toEqual({ label: 'التّكافُؤ', first: '2', second: '3' })
    }
  })

  it('keeps the book questions and their options untouched', () => {
    expect(bookQuestions.map((question) => question.source?.page)).toEqual(
      ['23', '23', '23', '23', '23', '23', '23', '23', '23', '23', '23', '23', '23', '23', '23'],
    )
    expect(bookQuestions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.map((question) => question.source?.page)).toEqual(['18', '19', '19', '20', '21'])

    const mc1 = bookQuestions.find((question) => question.id === 'l3-book-mc-1')!
    if (mc1.type === 'multiple-choice') {
      expect(mc1.options.map((option) => option.label)).toEqual([
        'كربيدُ الكالسيوم.', 'كبريتاتُ الكالسيوم.', 'كربوناتُ الكالسيوم.', 'كلوراتُ الكالسيوم.',
      ])
      expect(mc1.correctOptionIds).toEqual(['c'])
    }
  })

  it('keeps question 3 substances in the finalized RTL reading order', () => {
    const prompts = bookQuestions
      .filter((question) => question.id.startsWith('l3-book-q3-'))
      .map((question) => question.prompt)
    expect(prompts[0]).toContain('كبريتاتُ الألمنيومِ')
    expect(prompts[1]).toContain('أكسيدُ الحَديدِ I')
    expect(prompts[2]).toContain('هيدروكسيدُ الصوديومِ')
    expect(prompts[3]).toContain('خَلّاتُ الزنكِ')
  })

  it('keeps question 4 formulas in the finalized RTL reading order', () => {
    const prompts = bookQuestions
      .filter((question) => question.id.startsWith('l3-book-q4-'))
      .map((question) => question.prompt)
    expect(prompts[0]).toContain('FeO')
    expect(prompts[1]).toContain('Al(NO₃)₃')
    expect(prompts[2]).toContain('NH₄Cl')
    expect(prompts[3]).toContain('ZnSO₄')
  })

  it('keeps the everyday-materials wording of question 5 verbatim', () => {
    const q5 = bookQuestions.find((question) => question.id === 'l3-book-q5')!
    expect(q5.prompt).toContain('ملحُ الطعامِ – الجبسُ – الحَجَرُ الكَلْسيُّ – الكَلْسُ الحيُّ – رائقُ الكَلْسِ.')
  })

  it('stores no bidi control characters in data', () => {
    const file = readFileSync('src/data/curriculum/chemistryLesson3.ts', 'utf8')
    expect(file).not.toMatch(/[‎‏‪-‮⁦-⁩]/u)
  })
})

describe('lesson 3 simulations — kinetic learning', () => {
  it('builds water bonds one by one and reads the valence from the bond count', async () => {
    const user = userEvent.setup()
    const { container } = render(<ValenceModelLab interactiveId="valence-model-lab" reducedMotion />)
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-molecule', 'H2O')

    await user.click(within(section).getByRole('button', { name: 'كوّن رابطة مشتركة' }))
    expect(section).toHaveAttribute('data-bonds-formed', '1')
    expect(within(section).getByRole('status').textContent).toContain('تشكّلت 1 من 2')

    await user.click(within(section).getByRole('button', { name: 'كوّن رابطة مشتركة' }))
    expect(section).toHaveAttribute('data-bonds-formed', '2')
    expect(container.querySelectorAll('.valence-lab__shared-pair')).toHaveLength(2)
    expect(within(section).getByRole('status').textContent).toContain('تكافؤه في الماء = 2')
  })

  it('switches molecules and reports their valences (CH₄ = 4, NH₃ = 3)', async () => {
    const user = userEvent.setup()
    const { container } = render(<ValenceModelLab interactiveId="valence-model-lab" reducedMotion />)
    const section = container.querySelector('section')!

    await user.click(within(section).getByRole('button', { name: /CH4/ }))
    await user.click(within(section).getByRole('button', { name: 'تشغيل التكوين كاملاً' }))
    await waitFor(() => expect(within(section).getByRole('status').textContent).toContain('تكافؤه في الميتان = 4'))
    expect(container.querySelectorAll('.valence-lab__shared-pair')).toHaveLength(4)

    await user.click(within(section).getByRole('button', { name: /NH3/ }))
    expect(section).toHaveAttribute('data-bonds-formed', '0')
  })

  it('transfers electrons in the printed equations and lands on the book ion', async () => {
    const user = userEvent.setup()
    const { container } = render(<IonEquationLab interactiveId="ion-equation-lab" reducedMotion />)
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-equation', 'Na')

    await user.click(within(section).getByRole('button', { name: 'انقل إلكتروناً من الذرّة' }))
    expect(section.querySelector('.ion-equation-lab__process')).toHaveAttribute('data-direction', 'loss')

    await user.click(within(section).getByRole('button', { name: /O/ }))
    expect(section).toHaveAttribute('data-equation', 'O')
    const gain = within(section).getByRole('button', { name: 'انقل إلكتروناً إلى الذرّة' })
    await user.click(gain)
    await user.click(gain)
    expect(section).toHaveAttribute('data-complete', 'true')
    expect(within(section).getByRole('status').textContent).toContain('اكتسبت ذرّة الأكسجين إلكترونَيْن')
    expect(container.querySelector('.ion-notation')).not.toBeNull()
  })

  it('balances charges for aluminium sulfate and explains the parentheses', async () => {
    const user = userEvent.setup()
    const { container } = render(<FormulaBuilderLab interactiveId="formula-builder-lab" reducedMotion />)
    const section = container.querySelector('section')!

    await user.click(within(section).getByRole('button', { name: /كبريتات الألمنيوم/ }))
    await user.click(within(section).getByRole('button', { name: 'ابدأ تحقيق التعادل' }))
    await user.click(within(section).getByRole('button', { name: 'ضع الكل دفعة واحدة' }))

    expect(section).toHaveAttribute('data-balanced', 'true')
    expect(within(section).getByText(/تعادلت الشحنة/)).toBeInTheDocument()
    expect(within(section).getByText(/لماذا القوس حول الجذر؟/)).toBeInTheDocument()
    expect(container.querySelector('.chem-formula')).not.toBeNull()
    expect(section.textContent).toContain('2 : 3')
  })

  it('shows no parentheses verdict when the radical occurs once (NaOH)', async () => {
    const user = userEvent.setup()
    const { container } = render(<FormulaBuilderLab interactiveId="formula-builder-lab" reducedMotion />)
    const section = container.querySelector('section')!

    await user.click(within(section).getByRole('button', { name: /هيدروكسيد الصوديوم/ }))
    await user.click(within(section).getByRole('button', { name: 'ابدأ تحقيق التعادل' }))
    await user.click(within(section).getByRole('button', { name: 'ضع الكل دفعة واحدة' }))

    expect(within(section).getByText(/لا حاجة للقوس هنا/)).toBeInTheDocument()
    expect(container.querySelector('[data-balanced="true"]')).not.toBeNull()
  })

  it('has no serious or critical axe violations inside the three labs', async () => {
    for (const Lab of [ValenceModelLab, IonEquationLab, FormulaBuilderLab]) {
      const { container, unmount } = render(<Lab interactiveId="lab" reducedMotion />)
      const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
      expect(
        results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'),
        Lab.name,
      ).toEqual([])
      unmount()
    }
  })
})

describe('lesson 3 assessment', () => {
  it('keeps the final test inside platform policy with varied types', () => {
    expect(finalTest.questions.length).toBeGreaterThanOrEqual(10)
    expect(finalTest.questions.length).toBeLessThanOrEqual(20)
    expect(finalTest.origin).toBe('platform')
    const types = new Set(finalTest.questions.map((question) => question.type))
    expect(types.size).toBeGreaterThanOrEqual(6)
    expect(finalTest.questions.every((question) => question.origin === 'platform')).toBe(true)
    expect(finalTest.questions.every((question) => (question.explanation ?? '').length > 20)).toBe(true)
  })

  it('grades correct answers as correct', () => {
    const mc = finalTest.questions.find((question) => question.id === 'l3-final-2')!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['b'] } }).outcome).toBe('correct')

    const tf = finalTest.questions.find((question) => question.id === 'l3-final-3')!
    expect(evaluateQuestion(tf, { questionId: tf.id, value: { type: 'boolean', value: true } }).outcome).toBe('correct')

    const num = finalTest.questions.find((question) => question.id === 'l3-final-9')!
    expect(evaluateQuestion(num, { questionId: num.id, value: { type: 'number', value: '17' } }).outcome).toBe('correct')

    const blank = finalTest.questions.find((question) => question.id === 'l3-final-6')!
    expect(
      evaluateQuestion(blank, { questionId: blank.id, value: { type: 'blanks', values: { b1: 'أيون', b2: 'واحدة' } } }).outcome,
    ).toBe('correct')
  })

  it('grades a wrong book answer as incorrect without revealing it inline', () => {
    const mc = bookQuestions.find((question) => question.id === 'l3-book-mc-2')!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['a'] } }).outcome).toBe('incorrect')
  })
})

describe('test area — lesson 3 registration', () => {
  it('registers a 20-question lesson test with the authored distribution', () => {
    const definition = getTestDefinition('chem-u1-l3')
    expect(definition).toBeDefined()
    expect(definition?.meta.questionCount).toBe(20)
    expect(definition?.meta.difficulty).toEqual({ basic: 6, medium: 7, advanced: 4, thinking: 3 })
    expect(definition?.meta.pageRange).toBe('18–23')
    expect(listTestDefinitions().map((entry) => entry.meta.id)).toEqual([
      'chem-u1-l1', 'chem-u1-l2', 'chem-u1-l3', 'chem-u1',
    ])
  })

  it('loads a bank and a matching solution set', async () => {
    const definition = getTestDefinition('chem-u1-l3')!
    const bank = (await definition.load()).default
    const solutions = (await definition.loadSolutions()).default
    expect(bank.questions).toHaveLength(20)
    expect(solutions.solutions).toHaveLength(20)
    expect(solutions.solutions.map((solution) => solution.questionId)).toEqual(bank.questions.map((question) => question.id))
  })
})

describe('teacher area — lesson 3 tab', () => {
  beforeEach(() => {
    teacherAccess.lock()
    teacherAccess.unlock(TEACHER_PASSWORD)
  })

  it('registers lesson 3 as an independent teacher lesson', () => {
    expect(TEACHER_LESSONS.map((lesson) => lesson.lessonId)).toContain('chem-u1-l3')
    expect(getTeacherLesson('chem-u1-l3').label).toBe('الدرس الثالث — كيمياء: صيغةُ المركّباتِ الكيميائيَّةِ')
    expect(getTeacherLesson(null).lessonId).toBe('chem-u1-l1')
    expect(getTeacherLesson('chem-u1-l3').bookQuestions).toHaveLength(20)
  })

  it('shows lesson 3 book solutions with page references after switching tabs', async () => {
    const user = userEvent.setup()
    renderApp('/teacher/book-solutions')
    await user.click(screen.getByRole('link', { name: 'الدرس الثالث — كيمياء: صيغةُ المركّباتِ الكيميائيَّةِ' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الثالث — كيمياء: صيغةُ المركّباتِ الكيميائيَّةِ' })).toBeInTheDocument()
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة 23/).length).toBeGreaterThan(10)
    expect(screen.getAllByText(/التفسير وخطوات الحل/).length).toBeGreaterThan(10)
  })

  it('shows complete solutions for every final-test question of lesson 3', async () => {
    renderApp('/teacher/final-test-solutions?lesson=chem-u1-l3')

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الثالث — كيمياء: صيغةُ المركّباتِ الكيميائيَّةِ' })).toBeInTheDocument()
    expect(screen.getAllByText(/التفسير وخطوات الحل/)).toHaveLength(finalTest.questions.length)
    expect(screen.queryByText('الدرس الأول — كيمياء: الذرّة والعنصر', { selector: 'h2' })).not.toBeInTheDocument()
  })
})

describe('lesson 3 page rendering', () => {
  it('renders the lesson engine with all steps in the outline', async () => {
    const { container } = renderApp(LESSON_PATH)
    expect(await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).getAllByRole('button')).toHaveLength(chemistryLesson3.steps.length)
    expect(container.textContent).toContain('أُلاحِظُ وأستنتجُ')
  })

  it('mounts the registered interactives on their simulation steps', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })

    await user.click(screen.getByRole('button', { name: /مختبر: تشكيل الروابط في النماذج الثلاثة/ }))
    expect(await screen.findByText('كيف تتكوّن الروابط المشتركة في النماذج الثلاثة؟')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="valence-model-lab"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /مختبر: نفّذ المعادلات الخمس بنفسك/ }))
    expect(await screen.findByText('منذ المعادلة المطبوعة إلى حركة الإلكترونات')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="ion-equation-lab"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /مختبر: ابنِ الصيغة بنفسك/ }))
    expect(await screen.findByText('من الأيونات المتعادلة إلى الصيغة النهائية')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="formula-builder-lab"]')).not.toBeNull()
  })

  it('has no serious or critical axe violations on the lesson page', async () => {
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /صيغةُ المركّباتِ الكيميائيَّةِ/ })
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(
      results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'),
    ).toEqual([])
  })
})

describe('platform additions are labelled', () => {
  it('marks every explanation and simulation step as platform material', () => {
    for (const step of chemistryLesson3.steps) {
      if (step.kind === 'explanation' || step.kind === 'simulation' || step.kind === 'common-error') {
        expect(step.attribution, step.id).toBe('platform')
      }
      if (step.kind === 'source' || step.kind === 'activity' || step.kind === 'question') {
        expect(['textbook', 'mixed'], step.id).toContain(step.attribution)
      }
    }
  })
})

describe('regression — inline notation inside Lesson 3 content renders structurally', () => {
  const renderStepBlocks = (stepId: string) => {
    const step = chemistryLesson3.steps.find((candidate) => candidate.id === stepId)
    expect(step, stepId).toBeDefined()
    const blocks = step!.blocks.filter((block) => block.kind !== 'interactive' && block.kind !== 'question')
    return render(
      <div dir="rtl">
        <ContentBlocks blocks={blocks} />
      </div>,
    )
  }

  it('promotes the ion equations of page 19 into structured equation DOM', () => {
    const { container } = renderStepBlocks('ionic-equations')
    expect(container.querySelectorAll('.chem-equation').length).toBeGreaterThanOrEqual(5)
    expect(container.querySelector('.chem-formula')).not.toBeNull()
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('renders the five dissociation equations of page 20 structurally', () => {
    const { container } = renderStepBlocks('radicals-intro')
    expect(container.querySelectorAll('.chem-equation').length).toBeGreaterThanOrEqual(5)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('leaves no subscript or charge glyph floating in RTL prose in ANY Lesson 3 step', () => {
    for (const step of chemistryLesson3.steps) {
      const blocks = step.blocks.filter((block) => block.kind !== 'interactive' && block.kind !== 'question')
      if (blocks.length === 0) continue
      const { container } = render(
        <div dir="rtl">
          <ContentBlocks blocks={blocks} />
        </div>,
      )
      expect(strayScriptGlyphs(container), step.id).toEqual([])
      container.remove()
    }
  })
})

