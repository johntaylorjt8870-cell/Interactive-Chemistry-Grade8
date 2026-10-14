import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { FinalTest, Question, QuestionResponse, ResponseValue } from '@/assessment/types'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import { evaluateQuestion, isAttemptComplete, summariseAttempt } from '@/assessment/evaluate'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { getLesson, getUnit } from '@/data/curriculum/registry'
import { validateLesson } from '@/data/sourceFidelity'
import {
  allLesson5BookQuestions,
  bookActivitySolutions,
  bookQuestions,
  chemistryLesson5,
  finalTest,
  lesson5BookQuestionCount,
  lesson5BookQuestionIds,
  lesson5TeacherGuide,
} from '@/data/curriculum/chemistryLesson5'
import { lesson5TestBlueprint } from '@/data/curriculum/chemistryLesson5Test'
import { getInteractive } from '@/simulations/registry'
import { countFormulaAtoms, countSpeciesAtoms, ACETIC_ACID_REACTION, calculateOpenSystemMass, calculateProportionalReaction, MASS_RATIOS } from '@/simulations/lesson5Models'
import AtomCountLab from '@/simulations/AtomCountLab'
import MassConservationLab from '@/simulations/MassConservationLab'
import FixedRatioLab from '@/simulations/FixedRatioLab'
import { getTeacherLesson } from '@/teacher/teacherContent'
import { TEACHER_PASSWORD, teacherAccess } from '@/teacher/teacherAccess'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { renderApp } from './utils/renderApp'

const PATH = '/chemistry/structural-chemistry/mass-and-fixed-proportions'
const sourceById = new Map(nestedQuestions(allLesson5BookQuestions).map((question) => [question.id, question]))
const sourceAudit = JSON.parse(readFileSync('docs/source-reports/lesson5-source-audit.json', 'utf8')) as {
  lessonId: string
  pages: string[]
  items: Array<{ id: string; page: string; stepId: string; questionIds: string[]; coverage: string }>
}

function nestedQuestions(questions: Question[]): Question[] {
  return questions.flatMap((question) => [
    question,
    ...(question.type === 'table-interpretation' || question.type === 'diagram-interpretation' ? nestedQuestions(question.questions) : []),
  ])
}

function correctResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice': return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false': return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank': return { type: 'blanks', values: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!])) }
    case 'matching': return { type: 'matching', pairs: question.pairs }
    case 'ordering': return { type: 'order', itemIds: question.correctOrder }
    case 'numerical': return { type: 'number', value: String(question.acceptedAnswers[0]), unit: question.unit }
    default: throw new Error(`Unexpected composite or review-only final question: ${question.id}`)
  }
}

function wrongResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice': return { type: 'choice', optionIds: [question.options.find((option) => !question.correctOptionIds.includes(option.id))!.id] }
    case 'true-false': return { type: 'boolean', value: !question.correctAnswer }
    case 'fill-blank': return { type: 'blanks', values: Object.fromEntries(question.blanks.map((blank) => [blank.id, 'إجابة غير صحيحة'])) }
    case 'matching': return {
      type: 'matching',
      pairs: question.pairs.map((pair, index) => ({ leftId: pair.leftId, rightId: question.right[(index + 1) % question.right.length]!.id })),
    }
    case 'ordering': return { type: 'order', itemIds: [...question.correctOrder].reverse() }
    case 'numerical': return { type: 'number', value: String(question.acceptedAnswers[0]! + 10), unit: question.unit }
    default: throw new Error(`Unexpected composite or review-only final question: ${question.id}`)
  }
}

function completeResponses(test: FinalTest): Record<string, QuestionResponse> {
  return Object.fromEntries(test.questions.map((question) => [question.id, { questionId: question.id, value: correctResponse(question) }]))
}

async function answerQuestion(user: ReturnType<typeof userEvent.setup>, container: HTMLElement, question: Question) {
  const node = container.querySelector<HTMLElement>(`[data-question="${question.id}"]`)
  if (!node) throw new Error(`Missing final question ${question.id}`)
  switch (question.type) {
    case 'multiple-choice':
      for (const id of question.correctOptionIds) await user.click(node.querySelector<HTMLInputElement>(`input[value="${id}"]`)!)
      break
    case 'true-false':
      await user.click(within(node).getByRole('radio', { name: question.correctAnswer ? 'صح' : 'خطأ' }))
      break
    case 'fill-blank':
      for (const blank of question.blanks) fireEvent.change(within(node).getByLabelText(`الفراغ ${blank.id}`), { target: { value: blank.acceptedAnswers[0] } })
      break
    case 'matching':
      for (const pair of question.pairs) {
        const index = question.left.findIndex((item) => item.id === pair.leftId)
        await user.selectOptions(within(node).getAllByRole('combobox')[index]!, pair.rightId)
      }
      break
    case 'numerical':
      fireEvent.change(within(node).getByLabelText('القيمة'), { target: { value: String(question.acceptedAnswers[0]) } })
      break
    case 'ordering': {
      const currentOrder = question.items.map((item) => item.id)
      for (let position = 0; position < question.correctOrder.length; position += 1) {
        const id = question.correctOrder[position]!
        let current = currentOrder.indexOf(id)
        while (current > position) {
          const label = question.items.find((item) => item.id === id)!.label
          await user.click(within(node).getByRole('button', { name: `تحريك «${label}» إلى الأعلى` }))
          ;[currentOrder[current - 1], currentOrder[current]] = [currentOrder[current]!, currentOrder[current - 1]!]
          current -= 1
        }
      }
      break
    }
    default: throw new Error(`Unexpected final question type ${question.type}`)
  }
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  teacherAccess.lock()
  window.history.replaceState(null, '', '/')
})

describe('Lesson 5 curriculum registration, source coverage and solution set', () => {
  it('registers lesson 5 as the only added curriculum lesson, pages 30–35, without a unit exam', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'mass-and-fixed-proportions')).toBe(chemistryLesson5)
    expect(chemistryLesson5.id).toBe('chem-u1-l5')
    expect(chemistryLesson5.order).toBe(5)
    expect(chemistryLesson5.status).toBe('source-verified')
    expect(chemistryLesson5.source.pages.map((page) => page.page)).toEqual(['30', '31', '32', '33', '34', '35'])
    expect(getUnit('chemistry', 'structural-chemistry')?.lessons.map((lesson) => lesson.id)).toEqual([
      'chem-u1-l1', 'chem-u1-l2', 'chem-u1-l3', 'chem-u1-l4', 'chem-u1-l5',
    ])
    expect(chemistryLesson5.tests?.map((test) => test.id)).toEqual(['chem-u1-l5-book', 'chem-u1-l5-final'])
    expect(chemistryLesson5.tests?.some((test) => test.id.includes('unit'))).toBe(false)
    expect(validateLesson(chemistryLesson5, chemistryLesson5.id)).toEqual([])
    for (const test of chemistryLesson5.tests ?? []) expect(validateFinalTest(test, test.id)).toEqual([])
  })

  it('preserves page order and exposes all 19 transcribed source question units and branches once', () => {
    const pageOrder = chemistryLesson5.steps.flatMap((step) => step.source?.pages.map((page) => Number(page.page)) ?? [])
    expect(pageOrder).toEqual([...pageOrder].sort((left, right) => left - right))
    expect(bookActivitySolutions).toHaveLength(11)
    expect(bookQuestions).toHaveLength(4)
    expect(lesson5BookQuestionCount).toBe(19)
    expect(countQuestions([...bookActivitySolutions, ...bookQuestions])).toBe(19)
    expect(lesson5BookQuestionIds).toHaveLength(19)
    expect(new Set(lesson5BookQuestionIds).size).toBe(19)

    const flowIds = chemistryLesson5.steps.flatMap((step) => step.blocks).flatMap((block) => block.kind === 'question' ? [block.questionId] : [])
    expect(flowIds).toEqual([...bookActivitySolutions, ...bookQuestions].map((question) => question.id))
    const flattened = nestedQuestions([...bookActivitySolutions, ...bookQuestions])
    expect(flattened.map((question) => question.id)).toEqual(lesson5BookQuestionIds)
    expect(new Set(flattened.map((question) => question.id)).size).toBe(flattened.length)
    for (const question of flattened) {
      expect(question.origin).toBe('textbook')
      expect(['30', '31', '32', '33', '34', '35']).toContain(question.source?.page)
      expect(question.explanation?.length ?? 0).toBeGreaterThan(100)
      expect(question.solutionBlocks?.length ?? 0).toBeGreaterThan(0)
      const steps = question.solutionBlocks?.find((block) => block.kind === 'procedure')
      expect(steps?.kind === 'procedure' ? steps.items.length : 0).toBeGreaterThanOrEqual(3)
      expect(question.solutionBlocks?.every((block) => 'attribution' in block && block.attribution === 'platform')).toBe(true)
    }
  })

  it('connects each coverage-ledger row to a source-backed lesson step and every source-question id once', () => {
    expect(sourceAudit.lessonId).toBe(chemistryLesson5.id)
    expect(sourceAudit.pages).toEqual(['30', '31', '32', '33', '34', '35'])
    expect(sourceAudit.items.length).toBeGreaterThanOrEqual(10)
    const coveredQuestionIds = sourceAudit.items.flatMap((item) => item.questionIds)
    expect(new Set(coveredQuestionIds).size).toBe(coveredQuestionIds.length)
    expect([...coveredQuestionIds].sort()).toEqual([...lesson5BookQuestionIds].sort())
    for (const item of sourceAudit.items) {
      const step = chemistryLesson5.steps.find((candidate) => candidate.id === item.stepId)
      expect(step).toBeDefined()
      expect(step?.source?.pages.some((page) => page.page === item.page)).toBe(true)
      expect(item.coverage.length).toBeGreaterThan(60)
      for (const id of item.questionIds) expect(sourceById.get(id)?.source?.page).toBe(item.page)
    }
    expect(chemistryLesson5.source.readability?.diagrams).toBe('partial')
    expect(chemistryLesson5.source.readability?.notes).toContain('not available in this checkout')
  })

  it('includes the learner tables instead of only storing their completed teacher answers', () => {
    const lead = sourceById.get('l5-proust-table')!
    expect(lead.material?.some((block) => block.kind === 'table')).toBe(true)
    const leadTable = lead.material!.find((block) => block.kind === 'table')!
    expect(leadTable.kind).toBe('table')
    if (leadTable.kind === 'table') {
      expect(leadTable.rows.map((row) => row.id)).toEqual(['trial-1', 'trial-2', 'trial-3'])
      expect(leadTable.rows[1]?.cells.sulfurBefore).toBe('')
      expect(leadTable.rows[1]?.cells.sulfurLeft).toBe('')
    }
    const iron = sourceById.get('l5-iron-sulfur-ratio-table')!
    const ironTable = iron.material?.find((block) => block.kind === 'table')
    expect(ironTable?.kind).toBe('table')
    if (ironTable?.kind === 'table') {
      expect(ironTable.rows.map((row) => row.cells.case1)).toEqual(['56', '32', '……'])
      expect(ironTable.rows.map((row) => row.cells.case3)).toEqual(['7', '4', '……'])
    }
  })

  it('retains the source value 2.66 and separates it from exact arithmetic and conventional rounding', () => {
    const composite = sourceById.get('l5-selftest-carbon-table')!
    expect(composite.type).toBe('table-interpretation')
    if (composite.type === 'table-interpretation') {
      expect(composite.table.rows[2]?.cells.sample4).toBe('32 / 12 = 2.66')
      expect(composite.table.footnote).toContain('كما في المصدر')
      const ratio = composite.questions.find((question) => question.id === 'l5-selftest-co-table')!
      expect(ratio.type).toBe('short-answer')
      if (ratio.type === 'short-answer') {
        expect(ratio.referenceAnswer).toContain('32/12 = 8/3 = 2.666…')
        expect(ratio.explanation).toContain('التقريب المعتاد إلى منزلتين تكون 2.67')
        expect(ratio.solutionBlocks?.some((block) => block.kind === 'table' && block.footnote?.includes('2.67'))).toBe(true)
      }
    }
    expect(lesson5TeacherGuide.some((block) => block.kind === 'callout' && block.text.includes('2.666…') && block.text.includes('2.67'))).toBe(true)
  })
})

describe('Formula, mass-boundary and fixed-ratio scientific models', () => {
  it('parses each species in the atom-count reaction and balances every element independently', () => {
    expect(countFormulaAtoms('CH3COOH')).toEqual({ C: 2, H: 4, O: 2 })
    expect(countFormulaAtoms('NaHCO3')).toEqual({ Na: 1, H: 1, C: 1, O: 3 })
    expect(countSpeciesAtoms(ACETIC_ACID_REACTION.reactants)).toEqual({ C: 3, H: 5, O: 5, Na: 1 })
    expect(countSpeciesAtoms(ACETIC_ACID_REACTION.products)).toEqual({ C: 3, H: 5, O: 5, Na: 1 })
  })

  it('calculates an open boundary without losing escaped mass, and rejects impossible inputs', () => {
    expect(calculateOpenSystemMass(60, 5)).toEqual({ insideMass: 55, escapedMass: 5, accountedTotal: 60 })
    expect(calculateOpenSystemMass(5, 6)).toBeNull()
    expect(calculateOpenSystemMass(-1, 0)).toBeNull()
    expect(calculateOpenSystemMass(1, Number.NaN)).toBeNull()
  })

  it('calculates limiting amounts and excess only from the source ratios', () => {
    const iron = calculateProportionalReaction(60, 30, MASS_RATIOS['iron-sulfur'])
    expect(iron).toMatchObject({ leftReacted: 52.5, rightReacted: 30, leftExcess: 7.5, rightExcess: 0, productMass: 82.5 })
    expect(iron!.leftReacted + iron!.leftExcess + iron!.rightReacted + iron!.rightExcess).toBe(90)
    const lead = calculateProportionalReaction(10, 3, MASS_RATIOS['lead-sulfur'])
    expect(lead).toMatchObject({ leftReacted: 10, rightReacted: 1.56, leftExcess: 0, rightExcess: 1.44, productMass: 11.56 })
    expect(calculateProportionalReaction(-1, 2, MASS_RATIOS['iron-sulfur'])).toBeNull()
  })

  it('renders 125.100 only as source data, and calculates separate closed/open model outputs', async () => {
    const user = userEvent.setup()
    const { container } = render(<MassConservationLab reducedMotion interactiveId="lesson5-mass-boundary-lab" />)
    const reading = container.querySelector('[data-diagram-svg]')!
    expect([...reading.querySelectorAll('text')].filter((node) => node.textContent === '125.100')).toHaveLength(2)
    expect(screen.getByText(/قراءة بيانات الكتاب/)).toBeInTheDocument()
    expect(container.textContent).toContain('لا تنتج عن أداة الحساب')

    await user.click(screen.getByRole('button', { name: 'نموذج نظام مغلق' }))
    await user.type(screen.getByLabelText('مجموع الكتلة داخل الحساب قبل التفاعل'), '20')
    expect(screen.getByRole('status')).toHaveTextContent('قبل التفاعل 20 g، وبعده 20 g')
    expect(screen.getByRole('status')).not.toHaveTextContent('125.100')

    await user.click(screen.getByRole('button', { name: 'نموذج نظام مفتوح' }))
    const openStartMass = screen.getByLabelText('مجموع الكتلة داخل الحساب قبل التفاعل')
    await user.clear(openStartMass)
    await user.type(openStartMass, '60')
    await user.type(screen.getByLabelText('كتلة المادة التي عبرت إلى المحيط'), '5')
    expect(screen.getByRole('status')).toHaveTextContent('ما بقي داخل الوعاء 55 g')
    expect(screen.getByRole('status')).toHaveTextContent('الكتلة التي عبرت الحد 60 g')
    expect(container.textContent).toContain('ناتج النموذج')
  })

  it('checks formula counts interactively and applies the iron/sulfur and lead/sulfur ratios', async () => {
    const user = userEvent.setup()
    const atoms = render(<AtomCountLab reducedMotion interactiveId="lesson5-atom-count-lab" />)
    await user.click(screen.getByRole('button', { name: 'O' }))
    await user.click(screen.getByRole('button', { name: 'النواتج' }))
    await user.type(screen.getByLabelText('كم ذرة O في النواتج؟'), '5')
    await user.click(screen.getByRole('button', { name: 'تحقق من العد' }))
    expect(screen.getByRole('status')).toHaveTextContent('إجابة صحيحة: O موجود بعدد 5')
    expect(atoms.container.querySelector('.diagram__svg')).toHaveAttribute('aria-label', expect.stringContaining('O 5'))
    atoms.unmount()

    const ratioView = render(<FixedRatioLab reducedMotion interactiveId="lesson5-fixed-ratio-lab" />)
    const ironRatio = screen.getByText('56 : 32')
    expect(ironRatio).toHaveAttribute('dir', 'ltr')
    expect(ironRatio).toHaveAttribute('data-sci', 'isolated')
    expect(screen.getByText('7 : 4')).toHaveAttribute('dir', 'ltr')
    expect(screen.getByText('(Fe : S)')).toHaveAttribute('dir', 'ltr')
    expect(ratioView.container.querySelector('.l5-lab__ratio-diagram text[direction="rtl"]')).toHaveTextContent('الحديد')
    expect(ratioView.container.querySelectorAll('.l5-lab__ratio-diagram text[direction="rtl"]')[1]).toHaveTextContent('الكبريت')
    expect(ratioView.container.querySelector('.sci-table-wrapper')).toHaveAttribute('tabindex', '0')
    expect(screen.getByText(/يمكن أن يتكوّن حسابياً 82.5 g/)).toBeInTheDocument()
    expect(screen.getByText(/يبقى 7.5 g من الحديد فائضاً/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'الرصاص والكبريت' }))
    expect(ratioView.container.querySelector('.l5-lab__ratio-diagram text[direction="rtl"]')).toHaveTextContent('الرصاص')
    expect(screen.getByText('10 : 1.56')).toHaveAttribute('dir', 'ltr')
    expect(screen.getByText(/يمكن أن يتكوّن حسابياً 11.56 g/)).toBeInTheDocument()
    expect(screen.getByText(/يبقى 1.44 g من الكبريت فائضاً/)).toBeInTheDocument()
    expect(screen.getByText(/استنتاج رياضي لا قياس مخبري جديد/)).toBeInTheDocument()
  })

  it('registers and lazy-loads exactly the three lesson 5 interactions used by lesson content', async () => {
    const used = chemistryLesson5.steps.flatMap((step) => step.blocks).flatMap((block) => block.kind === 'interactive' ? [block.interactiveId] : [])
    const diagramIds = chemistryLesson5.steps.flatMap((step) => step.blocks).flatMap((block) => block.kind === 'diagram' ? [block.diagramId] : [])
    expect(used).toEqual(['lesson5-atom-count-lab', 'lesson5-mass-boundary-lab', 'lesson5-fixed-ratio-lab'])
    expect(diagramIds).toEqual(['lesson5-mass-boundary-lab'])
    for (const id of [...used, ...diagramIds]) {
      const definition = getInteractive(id)
      expect(definition).toBeDefined()
      expect(definition?.kind).toBe('simulation')
      expect((await definition!.load()).default).toBeDefined()
    }
    expect(chemistryLesson5.steps.flatMap((step) => step.blocks).some((block) => block.kind === 'source-image')).toBe(false)
  })
})

describe('Lesson 5 final test — exact 16-item scope, grading and delayed feedback', () => {
  it.each(finalTest.questions)('$id grades completed correct and wrong responses deterministically', (question) => {
    const correct = correctResponse(question)
    const wrong = wrongResponse(question)
    expect(evaluateQuestion(question, { questionId: question.id, value: correct }).outcome).toBe('correct')
    expect(evaluateQuestion(question, { questionId: question.id, value: wrong }).outcome).not.toBe('correct')
  })

  it('has 16 original single-point platform questions, a complete blueprint and full worked explanations', () => {
    expect(finalTest.questions).toHaveLength(16)
    expect(countQuestions(finalTest.questions)).toBe(16)
    expect(finalTest.targetQuestionCount).toEqual({ min: 16, max: 16 })
    expect(finalTest.requireComplete).toBe(true)
    expect(new Set(finalTest.questions.map((question) => question.type).values()).size).toBeGreaterThanOrEqual(5)
    const sourcePrompts = new Set(allLesson5BookQuestions.map((question) => question.prompt))
    const knownIds = new Set(finalTest.questions.map((question) => question.id))
    for (const group of [...lesson5TestBlueprint.objectives, ...lesson5TestBlueprint.difficulty.foundational.map((id) => ({ questionIds: [id] })), ...lesson5TestBlueprint.difficulty.application.map((id) => ({ questionIds: [id] })), ...lesson5TestBlueprint.difficulty.reasoning.map((id) => ({ questionIds: [id] }))]) {
      for (const id of group.questionIds) expect(knownIds.has(id)).toBe(true)
    }
    for (const question of finalTest.questions) {
      expect(question.origin).toBe('platform')
      expect(question.points).toBe(1)
      expect(sourcePrompts.has(question.prompt)).toBe(false)
      expect(question.explanation?.length ?? 0).toBeGreaterThan(100)
      const method = question.solutionBlocks?.find((block) => block.kind === 'procedure')
      expect(method?.kind === 'procedure' ? method.items.length : 0).toBeGreaterThanOrEqual(3)
    }
    const summary = summariseAttempt(finalTest.questions, completeResponses(finalTest))
    expect(summary.answered).toBe(16)
    expect(summary.results.every((result) => result.outcome === 'correct')).toBe(true)
    expect(summary.results.reduce((sum, result) => sum + (result.points ?? 1), 0)).toBe(16)
    const responses = completeResponses(finalTest)
    expect(isAttemptComplete(finalTest.questions, responses, true)).toBe(true)
    delete responses[finalTest.questions[0]!.id]
    expect(isAttemptComplete(finalTest.questions, responses, true)).toBe(false)
  })

  it('requires all questions before submission and does not expose a solution early', async () => {
    const user = userEvent.setup()
    const { container } = render(<FinalTestRunner test={finalTest} />)
    expect(container.querySelectorAll('[data-question]')).toHaveLength(16)
    expect(container.querySelector('.question__explanation, [data-outcome], [data-correct]')).toBeNull()
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('أكمل جميع أجزاء')
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
    expect(container.textContent).not.toContain(finalTest.questions[0]!.explanation)

    for (const question of finalTest.questions) await answerQuestion(user, container, question)
    expect(container.querySelector('.question__explanation, [data-outcome], [data-correct]')).toBeNull()
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByText('نتيجة المحاولة')).toBeInTheDocument()
    expect(container.textContent).toContain('16 من 16')
    expect(container.querySelectorAll('[data-outcome="correct"]')).toHaveLength(16)
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
  }, 30000)
})

describe('Lesson 5 teacher area, student route and accessible platform diagrams', () => {
  it('provides all 19 book-item solutions, a separate 16-item test and no Test Area bank link', () => {
    const teacher = getTeacherLesson('chem-u1-l5')!
    expect(teacher.bookQuestions).toEqual([...bookActivitySolutions, ...bookQuestions])
    expect(nestedQuestions(teacher.bookQuestions)).toHaveLength(19)
    expect(teacher.finalTest).toBe(finalTest)
    expect(teacher.finalTest.questions).toHaveLength(16)
    expect(teacher.conceptBlocks).toBe(lesson5TeacherGuide)
    expect(teacher.testAreaId).toBeUndefined()
    expect(teacher.conceptBlocks?.every((block) => 'attribution' in block && block.attribution === 'platform')).toBe(true)
  })

  it('renders the fifth lesson through its registered path with textbook and platform marks intact', async () => {
    window.location.hash = '#atom-count-source'
    renderApp(PATH)
    expect(screen.getByRole('heading', { name: 'ألاحظ وأستنتج: عدّ الذرات' })).toBeInTheDocument()
    expect(screen.getByText('ألاحظ وأستنتج:')).toBeInTheDocument()
    expect(screen.getAllByText('من الكتاب المدرسي').length).toBeGreaterThan(0)
    expect(document.querySelector('[data-interactive="lesson5-atom-count-lab"]')).not.toBeNull()
    await screen.findByRole('heading', { name: /مختبر عدّ الذرات/ })
    expect(screen.getAllByText(/إضافة من المنصة/).length).toBeGreaterThan(0)
  })

  it('renders the teacher tab and full final-test solution page without an extra-bank navigation', async () => {
    teacherAccess.unlock(TEACHER_PASSWORD)
    renderApp('/teacher/book-solutions?lesson=chem-u1-l5')
    expect(screen.getByRole('heading', { level: 2, name: /الدرس الخامس/ })).toBeInTheDocument()
    expect(screen.getByText('شرح مفاهيم الدرس ودليل التجارب — إضافة من المنصة')).toBeInTheDocument()
    expect(document.querySelectorAll('.teacher-answer')).toHaveLength(19)
    expect(screen.queryByText(/البنك المستقل/)).toBeNull()
  })

  it('has no serious or critical axe findings in all three interactive models', async () => {
    for (const Lab of [AtomCountLab, MassConservationLab, FixedRatioLab]) {
      const { container, unmount } = render(<Lab reducedMotion interactiveId="lesson5-a11y-audit" />)
      const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
      expect(result.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
      unmount()
    }
    const { container } = render(<ContentBlocks blocks={lesson5TeacherGuide} />)
    const guide = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(guide.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  }, 15000)
})
