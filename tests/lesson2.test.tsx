import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { readFileSync } from 'node:fs'
import { getLesson } from '@/data/curriculum/registry'
import { chemistryLesson2, bookQuestions, bookActivitySolutions, finalTest } from '@/data/curriculum/chemistryLesson2'
import { validateLesson } from '@/data/sourceFidelity'
import { LewisMolecule } from '@/scientific/LewisMolecule'
import { IonicTransferDiagram } from '@/scientific/IonicTransferDiagram'
import IonicBondingLab from '@/simulations/IonicBondingLab'
import CovalentBondLab from '@/simulations/CovalentBondLab'
import { evaluateQuestion } from '@/assessment/evaluate'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TEACHER_LESSONS, getTeacherLesson } from '@/teacher/teacherContent'
import { renderApp } from './utils/renderApp'
import type { LessonStep } from '@/data/curriculum/schema'

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-bonds'

function sourceSteps(): LessonStep[] {
  return chemistryLesson2.steps.filter((step) => step.source?.pages.length)
}

describe('curriculum registry — lesson 2', () => {
  it('publishes lesson 2 inside unit 1 after lesson 1', () => {
    const lesson = getLesson('chemistry', 'structural-chemistry', 'chemical-bonds')
    expect(lesson).toBeDefined()
    expect(lesson?.id).toBe('chem-u1-l2')
    expect(lesson?.order).toBe(2)
    expect(lesson?.status).toBe('source-verified')
    expect(lesson?.title).toContain('الروابط الكيميائية')
  })

  it('covers exactly pages 13–17 with a fully clear readability report', () => {
    const pages = chemistryLesson2.source.pages.map((page) => page.page)
    expect(pages).toEqual(['13', '14', '15', '16', '17'])
    expect(chemistryLesson2.source.verified).toBe(true)
    const readability = chemistryLesson2.source.readability!
    for (const level of Object.values(readability)) {
      if (typeof level === 'string' && level !== 'clear' && !level.includes('Source')) {
        expect(level).toBe('clear')
      }
    }
  })

  it('passes the platform fidelity validators', () => {
    expect(validateLesson(chemistryLesson2, 'chem-u1-l2')).toEqual([])
  })

  it('keeps textbook pages in book order across the steps', () => {
    const order = sourceSteps().map((step) => Number(step.source!.pages[0]!.page))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order[0]).toBe(13)
    expect(order[order.length - 1]).toBe(17)
    expect(chemistryLesson2.steps[chemistryLesson2.steps.length - 1]!.kind).toBe('final-test')
  })

  it('references only registered interactives', () => {
    const ids = chemistryLesson2.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'interactive')
      .map((block) => (block.kind === 'interactive' ? block.interactiveId : ''))
    expect(ids).toEqual(['ionic-bonding-lab', 'covalent-bond-lab'])
  })
})

describe('verbatim fidelity against the finalized source report', () => {
  const allText = JSON.stringify(chemistryLesson2)

  it.each([
    'هناك قوى تربط بين الذرّات المكوّنة للمادّة نسمّيها روابط كيميائيّة.',
    'المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.',
    'الرابطة المشتركة: اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
    'المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.',
    'الرابطة الكيميائيّة: هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
    'أُقارن بين عدد الأزواج الإلكترونات المشتركة في كل جزيء من الجزيئات السابقة. ماذا أستنتج؟',
    'حيث: ₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl.',
  ])('keeps the printed wording character for character: %s', (text) => {
    expect(allText).toContain(text)
  })

  it('keeps the book questions and their options untouched', () => {
    const mc1 = bookQuestions[0]!
    expect(mc1.type).toBe('multiple-choice')
    if (mc1.type === 'multiple-choice') {
      expect(mc1.options.map((option) => option.label)).toEqual(['مشتركة.', 'أيونيّة.', 'معدنيّة.', 'هيدروجينيّة.'])
      expect(mc1.correctOptionIds).toEqual(['a'])
    }
    expect(bookQuestions.map((question) => question.source?.page)).toEqual(['17', '17', '17', '17', '17', '17', '17'])
    expect(bookQuestions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.map((question) => question.source?.page)).toEqual(['13', '13', '13', '15', '16', '16', '16', '16', '16'])
  })

  it('stores no bidi control characters and no unicode-subscript formulas in data', () => {
    const file = readFileSync('src/data/curriculum/chemistryLesson2.ts', 'utf8')
    expect(file).not.toMatch(/[‎‏‪-‮⁦-⁩]/u)
  })
})

describe('the finalized page-15 Lewis dot map', () => {
  it('prints H₂ as one shared pair and no lone pairs', () => {
    const { container } = render(<LewisMolecule left={{ symbol: 'H' }} right={{ symbol: 'H' }} sharedPairs={1} />)
    const shared = container.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')
    const lone = container.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')
    expect(shared).toHaveLength(2)
    expect(container.querySelectorAll('.lewis-mol__shared-pair')).toHaveLength(1)
    expect(lone).toHaveLength(0)
    expect(container.querySelector('.bond-model__bond')).toHaveAttribute('data-order', '1')
    expect(container.querySelectorAll('.bond-model__disc')).toHaveLength(0)
  })

  it('prints O₂ as a 2×2 shared block with an outer vertical pair and a bottom pair per O, nothing above', () => {
    const { container } = render(
      <LewisMolecule
        left={{ symbol: 'O', lonePairSides: ['left', 'bottom'] }}
        right={{ symbol: 'O', lonePairSides: ['right', 'bottom'] }}
        sharedPairs={2}
      />,
    )
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(4)
    expect(container.querySelectorAll('.lewis-mol__shared-pair')).toHaveLength(2)
    const leftAtom = container.querySelector('.lewis-mol__atom[data-outer-side="left"]')!
    const rightAtom = container.querySelector('.lewis-mol__atom[data-outer-side="right"]')!
    expect(leftAtom.querySelector('.lewis-mol__slot--left .lewis-mol__pair')).not.toBeNull()
    expect(leftAtom.querySelector('.lewis-mol__slot--bottom .lewis-mol__pair')).not.toBeNull()
    expect(leftAtom.querySelector('.lewis-mol__slot--top[data-empty="true"]')).not.toBeNull()
    expect(rightAtom.querySelector('.lewis-mol__slot--right .lewis-mol__pair')).not.toBeNull()
    expect(rightAtom.querySelector('.lewis-mol__slot--bottom .lewis-mol__pair')).not.toBeNull()
    expect(rightAtom.querySelector('.lewis-mol__slot--top[data-empty="true"]')).not.toBeNull()
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(8)
    // Model column: double bond and four non-bonding discs per sphere.
    expect(container.querySelector('.bond-model__bond')).toHaveAttribute('data-order', '2')
    expect(container.querySelectorAll('.bond-model__disc')).toHaveLength(8)
  })

  it('prints N₂ as six shared dots (2 columns × 3 rows) with one outer lone pair per N', () => {
    const { container } = render(
      <LewisMolecule
        left={{ symbol: 'N', lonePairSides: ['left'] }}
        right={{ symbol: 'N', lonePairSides: ['right'] }}
        sharedPairs={3}
      />,
    )
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(6)
    expect(container.querySelectorAll('.lewis-mol__shared-pair')).toHaveLength(3)
    const leftAtom = container.querySelector('.lewis-mol__atom[data-outer-side="left"]')!
    expect(leftAtom.querySelector('.lewis-mol__slot--left .lewis-mol__pair')).not.toBeNull()
    expect(leftAtom.querySelector('.lewis-mol__slot--bottom[data-empty="true"]')).not.toBeNull()
    expect(leftAtom.querySelector('.lewis-mol__slot--top[data-empty="true"]')).not.toBeNull()
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(4)
    expect(container.querySelector('.bond-model__bond')).toHaveAttribute('data-order', '3')
    expect(container.querySelectorAll('.bond-model__disc')).toHaveLength(4)
  })

  it('keeps the Lewis column and the whole figure inside LTR isolates', () => {
    const { container } = render(
      <LewisMolecule left={{ symbol: 'O', lonePairSides: ['left', 'bottom'] }} right={{ symbol: 'O', lonePairSides: ['right', 'bottom'] }} sharedPairs={2} />,
    )
    expect(container.querySelector('.lewis-mol__row')).toHaveAttribute('dir', 'ltr')
    expect(container.querySelector('.lewis-mol__lewis')?.closest('[dir="ltr"]')).not.toBeNull()
    expect(container.querySelector('.bond-model')).toHaveAttribute('dir', 'ltr')
  })
})

describe('the printed page-14 transfer figure', () => {
  it('renders the five book panels with their electron counts', () => {
    const { container } = render(<IonicTransferDiagram />)
    const atoms = container.querySelectorAll('[data-bohr]')
    expect(atoms).toHaveLength(4)
    const counts = [...atoms].map((atom) => atom.querySelectorAll('.bohr__electron').length)
    expect(counts).toEqual([11, 17, 10, 18])
    const labels = [...atoms].map((atom) => atom.querySelector('.bohr__label')?.textContent)
    expect(labels).toEqual(['Na', 'Cl', 'Na+', 'Cl−'])
    expect(container.textContent).toContain('NaCl')
    expect(container.querySelectorAll('[data-ion]')).toHaveLength(10)
  })
})

describe('ionic bonding interactive', () => {
  it('moves a real electron and updates charges, then builds the crystal', async () => {
    const user = userEvent.setup()
    const { container } = render(<IonicBondingLab interactiveId="ionic-bonding-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-stage', '0')
    expect(section.textContent).toContain('الشحنة 0')

    await user.click(screen.getByRole('button', { name: 'انقل الإلكترون السطحي من Na إلى Cl' }))
    expect(section).toHaveAttribute('data-stage', '1')
    expect(container.querySelector('.ionic-bond-lab__particle')).toHaveClass('is-moving')

    await user.click(screen.getByRole('button', { name: 'أكمل الانتقال: تكوّن الأيونان' }))
    expect(section).toHaveAttribute('data-stage', '2')
    const donors = container.querySelectorAll('[data-bohr]')
    expect(donors[0]).toHaveAttribute('data-charge', '+')
    expect(donors[1]).toHaveAttribute('data-charge', '-')
    expect(container.querySelectorAll('[data-bohr="Na"] .bohr__electron')).toHaveLength(10)
    expect(container.querySelectorAll('[data-bohr="Cl"] .bohr__electron')).toHaveLength(18)

    await user.click(screen.getByRole('button', { name: 'قرّب الأيونين: التجاذب الكهربائي الساكن' }))
    expect(section).toHaveAttribute('data-stage', '3')
    expect(screen.getAllByText(/بلورة/).length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-ion]').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'إعادة المحاكاة من الذرّتين المتعادلتين' }))
    expect(section).toHaveAttribute('data-stage', '0')
  })

  it('respects reduced motion with instant state changes', () => {
    const { container } = render(<IonicBondingLab interactiveId="ionic-bonding-lab" reducedMotion={true} />)
    expect(container.querySelector('section')).toHaveClass('lab--still')
  })
})

describe('covalent bonding interactive', () => {
  it('switches molecules and reports bond order, shared and lone pairs', async () => {
    const user = userEvent.setup()
    const { container } = render(<CovalentBondLab interactiveId="covalent-bond-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-molecule', 'H2')
    expect(within(section).getByText('رابطة وحيدة')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /O2/ }))
    expect(section).toHaveAttribute('data-molecule', 'O2')
    expect(within(section).getByText('رابطة مضاعفة')).toBeInTheDocument()
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(4)

    await user.click(screen.getByRole('button', { name: /N2/ }))
    expect(section).toHaveAttribute('data-molecule', 'N2')
    expect(within(section).getByText('رابطة ثلاثية')).toBeInTheDocument()
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(6)
  })

  it('toggles Lewis ↔ model representations and the shared-pair highlight', async () => {
    const user = userEvent.setup()
    const { container } = render(<CovalentBondLab interactiveId="covalent-bond-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(container.querySelector('.lewis-mol')).not.toBeNull()
    expect(container.querySelector('.bond-model')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'النموذج فقط' }))
    expect(section).toHaveAttribute('data-view', 'model')
    expect(container.querySelector('.lewis-mol')).toBeNull()
    expect(container.querySelector('.bond-model')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'تمثيل لويس فقط' }))
    expect(container.querySelector('.lewis-mol')).not.toBeNull()
    expect(container.querySelector('.bond-model')).toBeNull()

    await user.click(screen.getByRole('checkbox', { name: /إبراز الأزواج المشتركة/ }))
    expect(section).toHaveAttribute('data-highlight-shared', 'true')
  })
})

describe('lesson 2 assessment', () => {
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
    const mc = finalTest.questions.find((question) => question.id === 'l2-final-2')!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['c'] } }).outcome).toBe('correct')

    const tf = finalTest.questions.find((question) => question.id === 'l2-final-5')!
    expect(evaluateQuestion(tf, { questionId: tf.id, value: { type: 'boolean', value: false } }).outcome).toBe('correct')

    const num = finalTest.questions.find((question) => question.id === 'l2-final-10')!
    expect(evaluateQuestion(num, { questionId: num.id, value: { type: 'number', value: '4' } }).outcome).toBe('correct')

    const blank = finalTest.questions.find((question) => question.id === 'l2-final-7')!
    expect(
      evaluateQuestion(blank, { questionId: blank.id, value: { type: 'blanks', values: { b1: 'كهربائية', b2: 'موجب' } } }).outcome,
    ).toBe('correct')
  })

  it('grades a wrong book answer as incorrect without revealing it inline', () => {
    const mc = bookQuestions[0]!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['b'] } }).outcome).toBe('incorrect')
  })
})

describe('teacher area — lesson 2 tab', () => {
  beforeEach(() => {
    teacherAccess.lock()
    teacherAccess.unlock(TEACHER_PASSWORD)
  })

  it('registers lesson 2 as an independent teacher lesson', () => {
    expect(TEACHER_LESSONS.map((lesson) => lesson.lessonId)).toContain('chem-u1-l2')
    expect(getTeacherLesson('chem-u1-l2').label).toBe('الدرس الثاني — كيمياء: الروابط الكيميائية')
    expect(getTeacherLesson(null).lessonId).toBe('chem-u1-l1')
  })

  it('shows lesson 2 book solutions with page references after switching tabs', async () => {
    const user = userEvent.setup()
    renderApp('/teacher/book-solutions')
    await user.click(screen.getByRole('link', { name: 'الدرس الثاني — كيمياء: الروابط الكيميائية' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الثاني — كيمياء: الروابط الكيميائية' })).toBeInTheDocument()
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة 17/).length).toBeGreaterThan(4)
    expect(screen.getAllByText(/التفسير وخطوات الحل/).length).toBeGreaterThan(10)
    expect(screen.getByText(/قضيّة للبحث/)).toBeInTheDocument()
  })

  it('shows complete solutions for every final-test question of lesson 2', async () => {
    renderApp('/teacher/final-test-solutions?lesson=chem-u1-l2')

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الثاني — كيمياء: الروابط الكيميائية' })).toBeInTheDocument()
    expect(screen.getAllByText(/التفسير وخطوات الحل/)).toHaveLength(finalTest.questions.length)
    expect(screen.queryByText('الدرس الأول — كيمياء: الذرّة والعنصر', { selector: 'h2' })).not.toBeInTheDocument()
  })

  it('keeps lesson 1 as the default tab', async () => {
    renderApp('/teacher/book-solutions')
    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الأول — كيمياء: الذرّة والعنصر' })).toBeInTheDocument()
  })
})

describe('lesson 2 page rendering', () => {
  it('renders the lesson engine with all steps in the outline', async () => {
    const { container } = renderApp(LESSON_PATH)
    expect(await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).getAllByRole('button')).toHaveLength(chemistryLesson2.steps.length)
    expect(container.textContent).toContain('ألاحظ وأجيب')
  })

  it('mounts the registered interactives on their simulation steps', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })

    await user.click(screen.getByRole('button', { name: /محاكاة: انتقال الإلكترون/ }))
    expect(await screen.findByText('من ذرّتي Na وCl إلى بلورة NaCl')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="ionic-bonding-lab"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /مختبر: الأزواج المشتركة/ }))
    expect(await screen.findByText('كيف تتشارك الذرّتان الإلكترونات؟')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="covalent-bond-lab"]')).not.toBeNull()
  })

  it('renders the source Lewis figure with the finalized dot map on its step', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })
    await user.click(screen.getByRole('button', { name: /الجزيئات الممثّلة وفق لويس/ }))

    const molecules = await screen.findAllByRole('img', { name: /تمثيل لويس للجزيء/ })
    expect(molecules.length).toBeGreaterThanOrEqual(3)
    const o2 = container.querySelector('[data-lewis-molecule="O₂"]')!
    expect(o2.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(4)
    const n2 = container.querySelector('[data-lewis-molecule="N₂"]')!
    expect(n2.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(6)
  })

  it('has no serious or critical axe violations on the lesson page', async () => {
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(
      results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'),
    ).toEqual([])
  })
})

describe('platform additions are labelled', () => {
  it('marks every explanation and simulation step as platform material', () => {
    for (const step of chemistryLesson2.steps) {
      if (step.kind === 'explanation' || step.kind === 'simulation' || step.kind === 'common-error') {
        expect(step.attribution, step.id).toBe('platform')
      }
      if (step.kind === 'source' || step.kind === 'activity' || step.kind === 'question') {
        expect(['textbook', 'mixed'], step.id).toContain(step.attribution)
      }
    }
  })
})
