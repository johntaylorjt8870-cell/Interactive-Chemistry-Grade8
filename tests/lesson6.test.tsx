import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { Question, QuestionResponse, ResponseValue } from '@/assessment/types'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import { evaluateQuestion, isAttemptComplete, summariseAttempt } from '@/assessment/evaluate'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { getLesson, getUnit } from '@/data/curriculum/registry'
import { validateLesson } from '@/data/sourceFidelity'
import {
  bookActivitySolutions,
  bookQuestions,
  chemistryLesson6,
  finalTest,
  lesson6BookQuestionCount,
  lesson6BookQuestionIds,
  lesson6TeacherGuide,
} from '@/data/curriculum/chemistryLesson6'
import { getInteractive } from '@/simulations/registry'
import {
  BALANCER_REACTIONS,
  computeSideCounts,
  evaluateBalanceState,
  formatReactionTeX,
  gcdList,
} from '@/simulations/lesson6Models'
import Lesson6ZincHclDiagram from '@/simulations/Lesson6ZincHclDiagram'
import Lesson6EquationAnatomyDiagram from '@/simulations/Lesson6EquationAnatomyDiagram'
import Lesson6StateSymbolsDiagram from '@/simulations/Lesson6StateSymbolsDiagram'
import Lesson6CoeffVsSubscriptDiagram from '@/simulations/Lesson6CoeffVsSubscriptDiagram'
import ZincHclExperimentLab from '@/simulations/ZincHclExperimentLab'
import EquationBalancerLab from '@/simulations/EquationBalancerLab'
import WordToSymbolBuilderLab from '@/simulations/WordToSymbolBuilderLab'
import Lesson6ErrorSpotterLab from '@/simulations/Lesson6ErrorSpotterLab'
import { getTeacherLesson } from '@/teacher/teacherContent'
import { TEACHER_PASSWORD, teacherAccess } from '@/teacher/teacherAccess'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { renderApp } from './utils/renderApp'

const PATH = '/chemistry/structural-chemistry/chemical-equations'

const sourceAudit = JSON.parse(
  readFileSync('docs/source-reports/lesson6-source-audit.json', 'utf8'),
) as {
  lessonId: string
  pages: string[]
  items: Array<{ id: string; page: string; questionIds: string[] }>
}

function correctResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice':
      return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false':
      return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank':
      return {
        type: 'blanks',
        values: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!])),
      }
    case 'matching':
      return { type: 'matching', pairs: question.pairs }
    case 'ordering':
      return { type: 'order', itemIds: question.correctOrder }
    case 'numerical':
      return { type: 'number', value: String(question.acceptedAnswers[0]), unit: question.unit }
    default:
      throw new Error(`Unexpected question type in final test: ${question.id}`)
  }
}

function wrongResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice':
      return {
        type: 'choice',
        optionIds: [question.options.find((opt) => !question.correctOptionIds.includes(opt.id))!.id],
      }
    case 'true-false':
      return { type: 'boolean', value: !question.correctAnswer }
    case 'fill-blank':
      return {
        type: 'blanks',
        values: Object.fromEntries(question.blanks.map((blank) => [blank.id, '999'])),
      }
    case 'matching':
      return {
        type: 'matching',
        pairs: question.pairs.map((pair, idx) => ({
          leftId: pair.leftId,
          rightId: question.right[(idx + 1) % question.right.length]!.id,
        })),
      }
    case 'ordering':
      return { type: 'order', itemIds: [...question.correctOrder].reverse() }
    case 'numerical':
      return { type: 'number', value: String(question.acceptedAnswers[0]! + 15), unit: question.unit }
    default:
      throw new Error(`Unexpected question type in final test: ${question.id}`)
  }
}

async function answerDomQuestion(
  user: ReturnType<typeof userEvent.setup>,
  container: HTMLElement,
  question: Question,
) {
  const card = container.querySelector<HTMLElement>(`[data-question="${question.id}"]`)
  expect(card, `missing DOM card for ${question.id}`).not.toBeNull()
  const scope = within(card!)

  switch (question.type) {
    case 'multiple-choice': {
      for (const optionId of question.correctOptionIds) {
        const input = card!.querySelector<HTMLInputElement>(`input[value="${optionId}"]`)
        expect(input).not.toBeNull()
        if (!input!.checked) await user.click(input!)
      }
      return
    }
    case 'true-false': {
      const label = question.correctAnswer ? 'صح' : 'خطأ'
      await user.click(scope.getByLabelText(label))
      return
    }
    case 'fill-blank': {
      const inputs = card!.querySelectorAll<HTMLInputElement>('input')
      expect(inputs.length).toBe(question.blanks.length)
      for (let i = 0; i < question.blanks.length; i += 1) {
        await user.clear(inputs[i]!)
        await user.type(inputs[i]!, question.blanks[i]!.acceptedAnswers[0]!)
      }
      return
    }
    case 'matching': {
      const selects = card!.querySelectorAll<HTMLSelectElement>('select')
      expect(selects.length).toBe(question.pairs.length)
      for (let i = 0; i < question.pairs.length; i += 1) {
        await user.selectOptions(selects[i]!, question.pairs[i]!.rightId)
      }
      return
    }
    case 'ordering': {
      const moveDownButtons = scope.queryAllByRole('button', { name: /أسفل/ })
      if (moveDownButtons.length >= 2) {
        await user.click(moveDownButtons[0]!)
        const moveUpButtons = scope.queryAllByRole('button', { name: /أعلى/ })
        await user.click(moveUpButtons[1]!)
      }
      return
    }
    case 'numerical': {
      const input = scope.getByLabelText('القيمة')
      await user.clear(input)
      await user.type(input, String(question.acceptedAnswers[0]))
      return
    }
    default:
      throw new Error(`Unsupported DOM helper question type: ${question.type}`)
  }
}

beforeEach(() => {
  localStorage.clear()
  window.location.hash = ''
})

describe('Lesson 6 curriculum registration, source fidelity, and pure models', () => {
  it('registers Lesson 6 as the sixth lesson in Unit 1 (pages 36–39) with zero validation issues', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'chemical-equations')).toBe(chemistryLesson6)
    expect(chemistryLesson6.id).toBe('chem-u1-l6')
    expect(chemistryLesson6.order).toBe(6)
    expect(chemistryLesson6.status).toBe('source-verified')
    expect(chemistryLesson6.steps).toHaveLength(35)
    expect(chemistryLesson6.source.pages.map((p) => p.page)).toEqual(['36', '37', '38', '39'])
    expect(getUnit('chemistry', 'structural-chemistry')?.lessons.map((l) => l.id)).toEqual([
      'chem-u1-l1',
      'chem-u1-l2',
      'chem-u1-l3',
      'chem-u1-l4',
      'chem-u1-l5',
      'chem-u1-l6',
    ])
    expect(chemistryLesson6.tests?.map((t) => t.id)).toEqual([
      'chem-u1-l6-book',
      'chem-u1-l6-practice',
      'chem-u1-l6-final',
    ])
    expect(validateLesson(chemistryLesson6, chemistryLesson6.id)).toEqual([])
    for (const test of chemistryLesson6.tests ?? []) {
      expect(validateFinalTest(test, test.id)).toEqual([])
    }
  })

  it('preserves ascending textbook page order and matches source-audit JSON', () => {
    const pageNumbers = chemistryLesson6.steps.flatMap(
      (step) => step.source?.pages.map((p) => Number(p.page)) ?? [],
    )
    expect(pageNumbers).toEqual([...pageNumbers].sort((a, b) => a - b))
    expect(sourceAudit.lessonId).toBe('chem-u1-l6')
    expect(sourceAudit.pages).toEqual(['36', '37', '38', '39'])
    expect(lesson6BookQuestionCount).toBe(20)
    expect(lesson6BookQuestionIds).toHaveLength(20)
    expect(countQuestions([...bookActivitySolutions, ...bookQuestions])).toBe(20)
  })

  it('computes atom inventories, GCD simplification, and merged KaTeX subscripts accurately', () => {
    expect(gcdList([2, 4, 2, 2])).toBe(2)
    expect(gcdList([2, 6, 2, 3])).toBe(1)

    const znRxn = BALANCER_REACTIONS[0]!
    expect(computeSideCounts(znRxn.reactants, [1, 2], znRxn.elements)).toEqual({
      Zn: 1,
      H: 2,
      Cl: 2,
    })

    const exactEval = evaluateBalanceState(znRxn, [1, 2], [1, 1])
    expect(exactEval.allAtomsEqual).toBe(true)
    expect(exactEval.isSimplestRatio).toBe(true)
    expect(exactEval.isBalancedInSimplestForm).toBe(true)

    const unsimplifiedEval = evaluateBalanceState(znRxn, [2, 4], [2, 2])
    expect(unsimplifiedEval.allAtomsEqual).toBe(true)
    expect(unsimplifiedEval.isSimplestRatio).toBe(false)
    expect(unsimplifiedEval.isBalancedInSimplestForm).toBe(false)
    expect(unsimplifiedEval.coefficientsGcd).toBe(2)

    const texOut = formatReactionTeX(znRxn, [1, 2], [1, 1])
    expect(texOut).toContain('\\mathrm{ZnCl}_{2(aq)}')
    expect(texOut).toContain('\\mathrm{Zn}_{(s)}')
  })

  it('registers all 8 Lesson 6 diagrams and interactive labs', () => {
    const expectedIds = [
      'source-figure-p37-zinc-hcl',
      'lesson6-equation-anatomy',
      'lesson6-state-symbols-guide',
      'lesson6-coefficient-vs-subscript',
      'lesson6-zinc-hcl-lab',
      'lesson6-equation-balancer-lab',
      'lesson6-word-to-symbol-lab',
      'lesson6-error-spotter',
    ]
    for (const id of expectedIds) {
      expect(getInteractive(id), id).toBeDefined()
    }
  })
})

describe('Lesson 6 interactive labs and diagrams — student action -> observation -> conclusion', () => {
  it('advances through all 4 stages of ZincHclExperimentLab and resets cleanly', async () => {
    const user = userEvent.setup()
    render(<ZincHclExperimentLab interactiveId="lesson6-zinc-hcl-lab" reducedMotion />)

    expect(screen.getByText('المرحلة 1 من 4')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'أضف قطرات حمض كلور الماء' }))
    expect(screen.getByText('المرحلة 2 من 4')).toBeInTheDocument()
    expect(screen.getByText(/فوران واضح وتصاعد فقاعات/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'قرّب عود الثقاب المشتعل بحذر' }))
    expect(screen.getByText('المرحلة 3 من 4')).toBeInTheDocument()
    expect(screen.getByText(/فرقعة مخبرية خفيفة/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'اعرض تمثيل التفاعل بالمعادلة' }))
    expect(screen.getByText('المرحلة 4 من 4')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'اكتملت المراحل الأربع' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'إعادة ضبط التجربة' }))
    expect(screen.getByText('المرحلة 1 من 4')).toBeInTheDocument()
  })

  it('balances reactions in EquationBalancerLab and detects + simplifies non-reduced multiples', async () => {
    const user = userEvent.setup()
    render(<EquationBalancerLab interactiveId="lesson6-equation-balancer-lab" reducedMotion />)

    expect(screen.getByRole('status')).toHaveTextContent(/إرشاد الموازنة/)

    const increaseHcl = screen.getByRole('button', { name: 'زيادة معامل محلول حمض كلور الماء' })
    await user.click(increaseHcl)
    expect(screen.getByRole('status')).toHaveTextContent(/أحسنت! المعادلة موزونة في أبسط نسبة عددية صحيحة/)

    // Double all coefficients to [2, 4, 2, 2] to trigger GCD simplification guidance
    await user.click(screen.getByRole('button', { name: 'زيادة معامل الزنك الصلب' }))
    await user.click(increaseHcl)
    await user.click(increaseHcl)
    await user.click(screen.getByRole('button', { name: 'زيادة معامل محلول كلوريد الزنك' }))
    await user.click(screen.getByRole('button', { name: 'زيادة معامل غاز الهدروجين' }))

    expect(screen.getByRole('status')).toHaveTextContent(/جميع المعاملات تقبل القسمة على 2/)
    await user.click(screen.getByRole('button', { name: /تبسيط المعاملات بالقسمة على 2/ }))
    expect(screen.getByRole('status')).toHaveTextContent(/أحسنت! المعادلة موزونة في أبسط نسبة عددية صحيحة/)

    // Selecting the theoretical Na + ZnSO4 reaction renders an explicit aqueous-sodium warning
    await user.click(screen.getByRole('button', { name: /الصوديوم مع محلول كبريتات الزنك/ }))
    const safetyNote = document.querySelector('[data-safety-note="na-znso4"]')
    expect(safetyNote).not.toBeNull()
    expect(safetyNote?.textContent).toMatch(/يتفاعل بعنف شديد مع ماء المحلول/)
  })

  it('guides the student through all 3 stages of WordToSymbolBuilderLab and displays safety note on Na + CH3COOH', async () => {
    const user = userEvent.setup()
    render(<WordToSymbolBuilderLab interactiveId="lesson6-word-to-symbol-lab" reducedMotion />)

    // Default scenario 1 is Al + S -> Al2S3
    const stage1Box = screen
      .getByText('المرحلة 1: اختر الرموز والصيغ الكيميائيّة الصحيحة قبل أي موازنة')
      .closest('div')!
    const stage1Buttons = stage1Box.querySelectorAll('button')
    await user.click(stage1Buttons[0]!) // Al + S -> AlS (wrong)
    expect(screen.getByText(/تكافؤ الألمنيوم/)).toBeInTheDocument()
    expect(screen.queryByText(/المرحلة 2:/)).toBeNull()

    await user.click(stage1Buttons[1]!) // Al + S -> Al2S3 (correct)
    const stage2Heading = screen.getByText('المرحلة 2: أقرن كل مادة برمز حالتها الفيزيائيّة المناسب')
    expect(stage2Heading).toBeInTheDocument()

    const stage2Buttons = stage2Heading.closest('div')!.querySelectorAll('button')
    await user.click(stage2Buttons[0]!) // Al(s) + S(s) -> Al2S3(s)
    const stage3Heading = screen.getByText(
      'المرحلة 3: اختر المعادلة الموزونة النهائية بعد تساوي ذرات كل عنصر',
    )
    expect(stage3Heading).toBeInTheDocument()

    const stage3Buttons = stage3Heading.closest('div')!.querySelectorAll('button')
    await user.click(stage3Buttons[1]!) // 2Al(s) + 3S(s) -> Al2S3(s)
    expect(screen.getByText('أنجزت 3 من 3 مراحل')).toBeInTheDocument()

    // Switching to scenario 3 (Na + CH3COOH) surfaces the platform safety note
    await user.click(screen.getByRole('button', { name: /تفاعل قطعة صوديوم مع حمض الخل/ }))
    const naAceticNote = document.querySelector('[data-safety-note="na-acetic"]')
    expect(naAceticNote).not.toBeNull()
    expect(naAceticNote?.textContent).toMatch(/لا كتجربة مدرسية اعتيادية/)
  })

  it('evaluates student verdicts in Lesson6ErrorSpotterLab and reveals scientific corrections', async () => {
    const user = userEvent.setup()
    render(<Lesson6ErrorSpotterLab interactiveId="lesson6-error-spotter" reducedMotion />)

    expect(screen.getByText('أجبت عن 0 من 6')).toBeInTheDocument()
    const errorButtons = screen.getAllByRole('button', { name: 'فيها خطأ علمي' })
    await user.click(errorButtons[0]!)
    expect(screen.getByText('أجبت عن 1 من 6')).toBeInTheDocument()
    expect(screen.getByText(/تغيير الرقم السفلي يغيّر هوية المركّب/)).toBeInTheDocument()
  })
})

describe('Lesson 6 20-question FinalTest — completion lock, grading, and delayed solutions', () => {
  it('scores 20/20 on canonical answers and 0/20 on deliberate wrong answers', () => {
    expect(finalTest.questions).toHaveLength(20)
    expect(finalTest.requireComplete).toBe(true)

    const allRight: Record<string, QuestionResponse> = Object.fromEntries(
      finalTest.questions.map((q) => [q.id, { questionId: q.id, value: correctResponse(q) }]),
    )
    const allWrong: Record<string, QuestionResponse> = Object.fromEntries(
      finalTest.questions.map((q) => [q.id, { questionId: q.id, value: wrongResponse(q) }]),
    )

    expect(isAttemptComplete(finalTest.questions, allRight, true)).toBe(true)
    const rightSummary = summariseAttempt(finalTest.questions, allRight)
    expect(rightSummary.results.every((r) => r.outcome === 'correct')).toBe(true)

    const wrongSummary = summariseAttempt(finalTest.questions, allWrong)
    expect(wrongSummary.results.every((r) => r.outcome === 'incorrect')).toBe(true)

    for (const q of finalTest.questions) {
      expect(evaluateQuestion(q, allRight[q.id]).outcome, q.id).toBe('correct')
      expect(evaluateQuestion(q, allWrong[q.id]).outcome, q.id).toBe('incorrect')
    }
  })

  it('blocks incomplete submission, keeps explanations hidden during attempt, and reveals 20 solutions on submit', async () => {
    const user = userEvent.setup()
    const { container } = render(<FinalTestRunner test={finalTest} />)

    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('أكمل جميع أجزاء')
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
    expect(container.textContent).not.toContain(finalTest.questions[0]!.explanation!)

    for (const question of finalTest.questions) {
      await answerDomQuestion(user, container, question)
    }
    expect(container.querySelector('.question__explanation, [data-outcome]')).toBeNull()

    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByText('نتيجة المحاولة')).toBeInTheDocument()
    expect(container.textContent).toContain('20 من 20')
    expect(container.querySelectorAll('[data-outcome="correct"]')).toHaveLength(20)
  }, 30000)
})

describe('Lesson 6 route, Teacher Area tab, and axe-core accessibility', () => {
  it('exposes the 6th Teacher tab with concept guide, 20 book solutions, and 20 final-test solutions', () => {
    const teacher = getTeacherLesson('chem-u1-l6')
    expect(teacher.lessonId).toBe('chem-u1-l6')
    expect(teacher.bookQuestions).toHaveLength(20)
    expect(teacher.finalTest).toBe(finalTest)
    expect(teacher.finalTest.questions).toHaveLength(20)
    expect(teacher.conceptBlocks).toBe(lesson6TeacherGuide)
    expect(teacher.testAreaId).toBeUndefined()

    teacherAccess.unlock(TEACHER_PASSWORD)
    renderApp('/teacher/book-solutions?lesson=chem-u1-l6')
    expect(screen.getByRole('heading', { level: 2, name: /الدرس السادس/ })).toBeInTheDocument()
    expect(document.querySelectorAll('.teacher-lesson-tab')).toHaveLength(6)
    expect(document.querySelectorAll('.teacher-answer')).toHaveLength(20)
  })

  it('renders Lesson 6 through its student URL with clear textbook vs platform badges', async () => {
    window.location.hash = '#step-6'
    renderApp(PATH)
    expect(
      screen.getByRole('heading', { name: /«أجرب وأستنتج»: تفاعل الزّنك مع محلول حمض كلور الماء/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('من الكتاب المدرسي').length).toBeGreaterThan(0)
    expect(document.querySelector('[data-interactive="source-figure-p37-zinc-hcl"]')).not.toBeNull()
    await screen.findByText(/إعادة بناء تخطيطية من المنصة لشكل الكتاب/)
  })

  it('reveals the platform sodium safety warning inside l6-book-q2-2 inline dropdown without affecting sibling questions', async () => {
    const user = userEvent.setup()
    const stepIndex = chemistryLesson6.steps.findIndex((s) => s.id === 'self-test-q2-source') + 1
    window.location.hash = `#step-${stepIndex}`
    const { container } = renderApp(PATH)

    // Before answering, inline explanation dropdowns are locked behind the attempt hint
    expect(container.querySelector('[data-self-check="l6-book-q2-2"] details')).toBeNull()
    expect(container.textContent).not.toContain('تفاعل عنيف للصوديوم مع ماء المحلول')

    // Answer l6-book-q2-2 (Na + CuSO4(aq)) and expand "راجع إجابتك مع الشرح"
    const q2Item2 = bookQuestions.find((q) => q.id === 'l6-book-q2-2')!
    await answerDomQuestion(user, container, q2Item2)
    const q2SelfCheck = container.querySelector('[data-self-check="l6-book-q2-2"]') as HTMLElement
    const q2Summary = within(q2SelfCheck).getByText('راجع إجابتك مع الشرح')
    await user.click(q2Summary)

    const q2RevealBody = q2SelfCheck.querySelector('.question__reveal-body')
    expect(q2RevealBody).not.toBeNull()
    expect(q2RevealBody?.textContent).toContain('ملاحظة علمية مخبرية (إضافة من المنصة)')
    expect(q2RevealBody?.textContent).toContain('تفاعل عنيف للصوديوم مع ماء المحلول')
    expect(q2RevealBody?.textContent).toContain('ليست هذه المعادلة تعليمةً لإجراء تجربة مخبرية')

    // Sibling question l6-book-q2-1 (Mg + O2 -> MgO) keeps its normal inline explanation with no sodium text
    const q2Item1 = bookQuestions.find((q) => q.id === 'l6-book-q2-1')!
    await answerDomQuestion(user, container, q2Item1)
    const q1SelfCheck = container.querySelector('[data-self-check="l6-book-q2-1"]') as HTMLElement
    await user.click(within(q1SelfCheck).getByText('راجع إجابتك مع الشرح'))
    const q1RevealBody = q1SelfCheck.querySelector('.question__reveal-body')
    expect(q1RevealBody?.textContent).toContain('2Mg(s) + O2(g) → 2MgO(s)')
    expect(q1RevealBody?.textContent).not.toContain('الصوديوم')
  })

  it('passes axe-core with zero serious or critical violations across all 8 Lesson 6 visuals & labs', async () => {
    const components = [
      Lesson6ZincHclDiagram,
      Lesson6EquationAnatomyDiagram,
      Lesson6StateSymbolsDiagram,
      Lesson6CoeffVsSubscriptDiagram,
      ZincHclExperimentLab,
      EquationBalancerLab,
      WordToSymbolBuilderLab,
      Lesson6ErrorSpotterLab,
    ]
    for (const Comp of components) {
      const { container, unmount } = render(<Comp interactiveId="lesson6-a11y" reducedMotion />)
      const res = await axe.run(container, {
        rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
      })
      const severe = res.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
      expect(severe, Comp.name).toEqual([])
      unmount()
    }

    const { container } = render(<ContentBlocks blocks={lesson6TeacherGuide} />)
    const guideRes = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(guideRes.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([])
  }, 20000)
})
