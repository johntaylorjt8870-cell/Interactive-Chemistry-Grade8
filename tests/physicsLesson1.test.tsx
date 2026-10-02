import { describe, expect, it, beforeEach } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { readFileSync } from 'node:fs'
import { getLesson } from '@/data/curriculum/registry'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import { physicsLesson1, bookQuestions, bookActivitySolutions, finalTest } from '@/data/curriculum/physicsLesson1'
import { validateLesson } from '@/data/sourceFidelity'
import ParallelogramLab from '@/simulations/ParallelogramLab'
import ConcurrentForcesLab from '@/simulations/ConcurrentForcesLab'
import ForceComponentsLab from '@/simulations/ForceComponentsLab'
import { evaluateQuestion } from '@/assessment/evaluate'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TEACHER_LESSONS, getTeacherLesson } from '@/teacher/teacherContent'
import { renderApp } from './utils/renderApp'
import type { LessonStep } from '@/data/curriculum/schema'

const LESSON_PATH = '/physics/motion-and-forces/concurrent-forces'

function sourceSteps(): LessonStep[] {
  return physicsLesson1.steps.filter((step) => step.source?.pages.length)
}

describe('curriculum registry — physics lesson 1', () => {
  it('publishes the lesson inside unit 2 of physics', () => {
    const lesson = getLesson('physics', 'motion-and-forces', 'concurrent-forces')
    expect(lesson).toBeDefined()
    expect(lesson?.id).toBe('phys-u2-l1')
    expect(lesson?.order).toBe(1)
    expect(lesson?.status).toBe('source-verified')
    expect(lesson?.title).toContain('القوى المتلاقية')
  })

  it('covers exactly pages 55–62 with a fully clear readability report', () => {
    const pages = physicsLesson1.source.pages.map((page) => page.page)
    expect(pages).toEqual(['55', '56', '57', '58', '59', '60', '61', '62'])
    expect(physicsLesson1.source.verified).toBe(true)
    const readability = physicsLesson1.source.readability!
    for (const level of Object.values(readability)) {
      if (typeof level === 'string' && level !== 'clear' && !level.includes('تنقيح')) {
        expect(level).toBe('clear')
      }
    }
  })

  it('passes the platform fidelity validators', () => {
    expect(validateLesson(physicsLesson1, 'phys-u2-l1')).toEqual([])
  })

  it('keeps textbook pages in book order across the steps', () => {
    const order = sourceSteps().map((step) => Number(step.source!.pages[0]!.page))
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order[0]).toBe(55)
    expect(order[order.length - 1]).toBe(62)
    expect(physicsLesson1.steps[physicsLesson1.steps.length - 1]!.kind).toBe('final-test')
  })

  it('references only registered interactives', () => {
    const ids = physicsLesson1.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'interactive')
      .map((block) => (block.kind === 'interactive' ? block.interactiveId : ''))
    expect(ids).toEqual(['concurrent-forces-lab', 'parallelogram-lab', 'force-components-lab'])
  })
})

describe('verbatim fidelity against the finalized source report', () => {
  const allText = JSON.stringify(physicsLesson1)

  it.each([
    'أربطُ خطّافَي ربيعتين بخيط باستخدام لوح الزّنابض، وأعلّقُ خطّاف الجسم بمنتصف الخيط كما في الشكل، هل لحاملَي قوّتي شدّ الربيعتين الاستقامة ذاتها؟',
    'أدوات التجربة: لوح الزّنابض المغناطيسي – ربيعتان – جسم مزوّد بخطّاف – خيوط ربط.',
    'القوى المتلاقية: هي القوى التي تتلاقى حواملها في نقطة واحدة.',
    'في المثلّث القائم مربع الوتر يساوي مجموع مربعي الضلعين القائمين',
    'أحدّدُ على لوح الزنابض نقطة O .',
    'أرسمُ منها شعاعاً يُمثّلُ القوّة F⃗ وليكن الشعاع OM⃗ .',
    'أرسمُ من النقطة M عمودين على هذين المحورين (مرسم النقطة).',
    'يمكن الاستعاضة عن القوّة F⃗ بقوّتين متعامدتين F₁⃗ ، F₂⃗ تقومان مقامها تُسمّيان مركّبتَيها.',
    'يمكن الاستعاضة عن القوّة F⃗ بقوّتين متعامدتين F₁⃗ ، F₂⃗ تقومان مقامها تسميّان مركّبتَيها.',
    'اختر الإجابة الصحيحة لكلٍّ مما يأتي، وانقلها إلى دفترك:',
    'كيف يرتبط المظلّيُّ بمظلّته؟ ما القوى المؤثّرة على المظلّيِّ؟ أين تتلاقى حبالُ المظلّة؟',
  ])('keeps the printed wording character for character: %s', (text) => {
    expect(allText).toContain(text)
  })

  it('keeps the printed decorative heading «أسائل» (not «أتساءل»)', () => {
    expect(allText).toContain('أسائل:')
    expect(allText).not.toContain('أتساءل')
  })

  it('keeps the book numerical values and units untouched', () => {
    expect(allText).toContain('F₁ = 60 N')
    expect(allText).toContain('F₂ = 80 N')
    expect(allText).toContain('60°')
    expect(allText).toContain('1cm يمثل 1N')
    expect(allText).toContain('F = 5 \\\\times 20')
    expect(allText).toContain('F = 6 \\\\times 1 = 6\\\\ \\\\text{N}')
    const mc4 = bookQuestions.find((question) => question.id === 'p1-book-mc-4')
    expect(JSON.stringify(mc4)).toContain('F = 20 N .')
  })

  it('keeps the book questions with their page references', () => {
    expect(bookQuestions.map((question) => question.source?.page)).toEqual(['61', '61', '62', '62', '62', '62', '62', '62'])
    expect(bookQuestions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.every((question) => question.origin === 'textbook')).toBe(true)
  })

  it('stores no bidi control characters in data', () => {
    const file = readFileSync('src/data/curriculum/physicsLesson1.ts', 'utf8')
    expect(file).not.toMatch(/[‎‏‪-‮⁦-⁩]/u)
  })
})

describe('parallelogram interactive', () => {
  it('builds the resultant and recomputes it when the angle changes', async () => {
    const { container } = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-f1', '4')
    expect(section).toHaveAttribute('data-f2', '3')
    expect(section).toHaveAttribute('data-angle', '60')

    const angle = container.querySelectorAll('input[type="range"]')[2]!
    fireEvent.change(angle, { target: { value: '90' } })
    expect(section).toHaveAttribute('data-angle', '90')
    expect(section).toHaveAttribute('data-resultant', '5.0')
    expect(container.querySelector('[data-pythagoras]')).not.toBeNull()
  })

  it('shows the book 60/80 right-angle case as 100 N with Pythagoras', async () => {
    const { container } = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />)
    const [f1, f2, angle] = [...container.querySelectorAll('input[type="range"]')]
    fireEvent.change(f1!, { target: { value: '60' } })
    fireEvent.change(f2!, { target: { value: '80' } })
    fireEvent.change(angle!, { target: { value: '90' } })
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-resultant', '100.0')
    expect(container.textContent).toContain('كل 1 cm يمثل 20 N')
  })

  it('advances the construction stages and respects reduced motion', async () => {
    const user = userEvent.setup()
    const animated = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={false} />)
    const section = animated.container.querySelector('section')!
    expect(section).toHaveAttribute('data-stage', '0')
    await user.click(animated.container.querySelector('button')!)
    expect(section).toHaveAttribute('data-stage', '1')

    const still = render(<ParallelogramLab interactiveId="parallelogram-lab" reducedMotion={true} />)
    expect(still.container.querySelector('section')).toHaveClass('lab--still')
    expect(still.container.querySelector('section')).toHaveAttribute('data-stage', '2')
  })
})

describe('concurrent forces interactive', () => {
  it('computes the two tensions and keeps the carriers meeting at O', async () => {
    const { container } = render(<ConcurrentForcesLab interactiveId="concurrent-forces-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-a1', '35')
    expect(section).toHaveAttribute('data-w', '4')
    const t1 = Number(section.getAttribute('data-t1'))
    expect(t1).toBeGreaterThan(2)
    expect(t1).toBeLessThan(3)

    const w = container.querySelectorAll('input[type="range"]')[2]!
    fireEvent.change(w, { target: { value: '8' } })
    expect(section).toHaveAttribute('data-w', '8')
    expect(Number(section.getAttribute('data-t1'))).toBeCloseTo(t1 * 2, 0)
    expect(container.querySelector('[data-meet="O"]')).not.toBeNull()
  })

  it('toggles the carriers display', async () => {
    const user = userEvent.setup()
    const { container } = render(<ConcurrentForcesLab interactiveId="concurrent-forces-lab" reducedMotion={false} />)
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(container.querySelector('section')).toHaveAttribute('data-carriers', 'false')
  })
})

describe('force components interactive', () => {
  it('decomposes a force on perpendicular axes', () => {
    const { container } = render(<ForceComponentsLab interactiveId="force-components-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-mode', 'axes')
    expect(Number(section.getAttribute('data-fx'))).toBeCloseTo(4.6, 0)
    expect(Number(section.getAttribute('data-fy'))).toBeCloseTo(3.9, 0)
  })

  it('switches to the inclined plane activity of page 60', async () => {
    const user = userEvent.setup()
    const { container } = render(<ForceComponentsLab interactiveId="force-components-lab" reducedMotion={false} />)
    await user.click(screen.getByRole('button', { name: /المستوي المائل/ }))
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-mode', 'incline')
    // default 25°, w = 5 N: along = 5 sin25 ≈ 2.1, normal = 5 cos25 ≈ 4.5
    expect(Number(section.getAttribute('data-fx'))).toBeCloseTo(2.1, 0)
    expect(Number(section.getAttribute('data-fy'))).toBeCloseTo(4.5, 0)
  })
})

describe('physics lesson 1 assessment', () => {
  it('keeps the final test inside platform policy with varied types', () => {
    expect(finalTest.questions.length).toBe(14)
    expect(finalTest.origin).toBe('platform')
    const types = new Set(finalTest.questions.map((question) => question.type))
    expect(types.size).toBeGreaterThanOrEqual(6)
    expect(finalTest.questions.every((question) => question.origin === 'platform')).toBe(true)
    expect(finalTest.questions.every((question) => (question.explanation ?? '').length > 10)).toBe(true)
  })

  it('grades correct answers as correct across types', () => {
    const mc = finalTest.questions.find((question) => question.id === 'p1-final-1')!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['b'] } }).outcome).toBe('correct')

    const tf = finalTest.questions.find((question) => question.id === 'p1-final-4')!
    expect(evaluateQuestion(tf, { questionId: tf.id, value: { type: 'boolean', value: false } }).outcome).toBe('correct')

    const num = finalTest.questions.find((question) => question.id === 'p1-final-8')!
    expect(evaluateQuestion(num, { questionId: num.id, value: { type: 'number', value: '10' } }).outcome).toBe('correct')

    const blank = finalTest.questions.find((question) => question.id === 'p1-final-5')!
    expect(
      evaluateQuestion(blank, { questionId: blank.id, value: { type: 'blanks', values: { b1: 'تلاقي', b2: 'الرأس' } } }).outcome,
    ).toBe('correct')

    const order = finalTest.questions.find((question) => question.id === 'p1-final-6')!
    expect(
      evaluateQuestion(order, { questionId: order.id, value: { type: 'order', itemIds: ['rays', 'para', 'diag', 'measure', 'elements'] } }).outcome,
    ).toBe('correct')

    const match = finalTest.questions.find((question) => question.id === 'p1-final-7')!
    expect(
      evaluateQuestion(match, {
        questionId: match.id,
        value: { type: 'matching', pairs: [{ leftId: 'z0', rightId: 'sum' }, { leftId: 'z90', rightId: 'pyth' }, { leftId: 'z180', rightId: 'diff' }] },
      }).outcome,
    ).toBe('correct')

    const diagram = finalTest.questions.find((question) => question.id === 'p1-final-11')!
    const nested = evaluateQuestion(diagram, {
      questionId: diagram.id,
      value: { type: 'composite', children: { 'p1-final-11-a': { type: 'choice', optionIds: ['b'] } } },
    })
    expect(nested.outcome).toBe('correct')
  })

  it('grades wrong book answers as incorrect', () => {
    const mc = bookQuestions[0]!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['a'] } }).outcome).toBe('incorrect')
    const mc4 = bookQuestions.find((question) => question.id === 'p1-book-mc-4')!
    expect(evaluateQuestion(mc4, { questionId: mc4.id, value: { type: 'choice', optionIds: ['c'] } }).outcome).toBe('incorrect')
  })
})

describe('teacher area — physics lesson 1 tab', () => {
  beforeEach(() => {
    teacherAccess.lock()
    teacherAccess.unlock(TEACHER_PASSWORD)
  })

  it('registers the physics lesson as an independent teacher lesson', () => {
    expect(TEACHER_LESSONS.map((lesson) => lesson.lessonId)).toContain('phys-u2-l1')
    expect(getTeacherLesson('phys-u2-l1').label).toBe('الدرس الأول — فيزياء: القوى المتلاقية')
    expect(getTeacherLesson(null).lessonId).toBe('chem-u1-l1')
  })

  it('shows physics book solutions with page references, not mixed with chemistry', async () => {
    const user = userEvent.setup()
    renderApp('/teacher/book-solutions')
    await user.click(screen.getByRole('link', { name: 'الدرس الأول — فيزياء: القوى المتلاقية' }))

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الأول — فيزياء: القوى المتلاقية' })).toBeInTheDocument()
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة 56/).length).toBeGreaterThan(2)
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة 62/).length).toBeGreaterThan(2)
    expect(screen.queryByText('الدرس الثاني — كيمياء: الروابط الكيميائية', { selector: 'h2' })).not.toBeInTheDocument()
    expect(screen.getByText(/نشاط المستوي المائل/)).toBeInTheDocument()
  })

  it('shows complete solutions for every final-test question of the physics lesson', async () => {
    renderApp('/teacher/final-test-solutions?lesson=phys-u2-l1')

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الأول — فيزياء: القوى المتلاقية' })).toBeInTheDocument()
    expect(screen.getAllByText(/التفسير وخطوات الحل/).length).toBeGreaterThanOrEqual(finalTest.questions.length)
  })
})

describe('physics lesson 1 page rendering', () => {
  it('renders the lesson engine with all steps in the outline', async () => {
    const { container } = renderApp(LESSON_PATH)
    expect(await screen.findByRole('heading', { level: 1, name: /القوى المتلاقية/ })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'خطوات الدرس' })
    expect(within(nav).getAllByRole('button')).toHaveLength(physicsLesson1.steps.length)
    expect(container.textContent).toContain('حبالُ المظلّة؟')
  })

  it('mounts the registered interactives on their simulation steps', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /القوى المتلاقية/ })

    await user.click(screen.getByRole('button', { name: /محاكاة: تجربة الربيعتين/ }))
    expect(await screen.findByText('أين تتلاقى حوامل القوى الثلاث؟')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="concurrent-forces-lab"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /محاكاة: ابنِ متوازي الأضلاع/ }))
    expect(await screen.findByText('قوّتان متلاقيتان: كيف نبني المحصّلة؟')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="parallelogram-lab"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: /محاكاة: من قوّة واحدة إلى مركّبتين/ }))
    expect(await screen.findByText('قوّة واحدة تُستبدل بمركّبتين متعامدتين')).toBeInTheDocument()
    expect(container.querySelector('[data-interactive="force-components-lab"]')).not.toBeNull()
  })

  it('renders KaTeX blocks for the printed equations', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /القوى المتلاقية/ })
    await user.click(screen.getByRole('button', { name: /التعامد وقانون فيتاغورث/ }))
    await screen.findByText(/نظرية فيتاغورث/)
    expect(container.querySelectorAll('.katex').length).toBeGreaterThan(2)
  })

  it('has no serious or critical axe violations on the lesson page', async () => {
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /القوى المتلاقية/ })
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(
      results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'),
    ).toEqual([])
  })
})

describe('platform additions are labelled', () => {
  it('marks every explanation and simulation step as platform material', () => {
    for (const step of physicsLesson1.steps) {
      if (step.kind === 'explanation' || step.kind === 'simulation' || step.kind === 'common-error') {
        expect(step.attribution, step.id).toBe('platform')
      }
      if (step.kind === 'source' || step.kind === 'activity' || step.kind === 'question' || step.kind === 'experiment' || step.kind === 'example') {
        expect(['textbook', 'mixed'], step.id).toContain(step.attribution)
      }
    }
  })
})

describe('regression — inline vector notation inside Physics Lesson 1 prose renders isolated', () => {
  const renderStepBlocks = (stepId: string) => {
    const step = physicsLesson1.steps.find((candidate) => candidate.id === stepId)
    expect(step, stepId).toBeDefined()
    const blocks = step!.blocks.filter((block) => block.kind !== 'interactive' && block.kind !== 'question')
    return render(
      <div dir="rtl">
        <ContentBlocks blocks={blocks} />
      </div>,
    )
  }

  it('keeps F₁⃗ and OM⃗ inside LTR isolates on the page-60 step', () => {
    const { container } = renderStepBlocks('components-theory')
    const isolated = [...container.querySelectorAll('[dir="ltr"]')].map((el) => el.textContent ?? '')
    expect(isolated.some((text) => text.includes('OM'))).toBe(true)
    expect(isolated.some((text) => text.includes('F₁⃗'))).toBe(true)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('leaves no subscript or charge glyph floating in RTL prose in ANY physics step', () => {
    for (const step of physicsLesson1.steps) {
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
