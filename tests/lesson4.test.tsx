import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson4, bookActivitySolutions, bookQuestions, finalTest, lesson4TeacherGuide } from '@/data/curriculum/chemistryLesson4'
import { getLesson, getUnit } from '@/data/curriculum/registry'
import { validateLesson } from '@/data/sourceFidelity'
import { validateFinalTest } from '@/assessment/validate'
import { evaluateQuestion, isAttemptComplete, summariseAttempt } from '@/assessment/evaluate'
import type { FinalTest, Question, QuestionResponse, ResponseValue } from '@/assessment/types'
import type { ContentBlock } from '@/data/curriculum/schema'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import { InlineQuestion } from '@/assessment/InlineQuestion'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { WordEquation } from '@/scientific'
import { getInteractive } from '@/simulations/registry'
import ReactionObservationLab from '@/simulations/ReactionObservationLab'
import MagnesiumCombustionLab from '@/simulations/MagnesiumCombustionLab'
import CombustionAirLab from '@/simulations/CombustionAirLab'
import WordEquationLab from '@/simulations/WordEquationLab'
import { getTeacherLesson } from '@/teacher/teacherContent'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { renderApp } from './utils/renderApp'
import { auditTestBank, auditTestMeta, auditSolutionSet, auditOriginality } from '@/data/testArea/audit'
import { existingPromptEntries } from '@/data/testArea/originality'
import { getTestDefinition } from '@/data/testArea/registry'
import '@/data/testArea/register'
import bank from '@/data/testArea/banks/chem-u1-l4'
import solutions from '@/data/testArea/solutions/chem-u1-l4'
import { keyResponseOf, solutionAnswerMatchesKey } from '@/testArea/answers'
import { attemptReducer, createAttemptState, answeredCountOf } from '@/testArea/attemptReducer'
import { hasCompleteResponse, type ResponseValue as BankResponseValue, type TestQuestion } from '@/data/testArea/types'
import { TestQuestionCard } from '@/testArea/components/TestQuestionCard'
import { gradeQuestion } from '@/testArea/grading'
import { strayScriptGlyphs } from './utils/strayGlyphs'

const PATH = '/chemistry/structural-chemistry/chemical-reactions'
const sourceQuestions = [...bookActivitySolutions, ...bookQuestions]
const sourceById = new Map(sourceQuestions.map((question) => [question.id, question]))

type InventoryItem = {
  id: string; page: string; stepId: string; texts?: string[]; questionIds?: string[];
  sourceNumbers?: number[]; optionIds?: string[]; figureIds?: string[]; figureFragments?: string[];
  wordEquations?: Partial<Extract<ContentBlock, { kind: 'word-equation' }>>[];
}
const inventory = JSON.parse(readFileSync('docs/source-reports/lesson4-source-audit.json', 'utf8')) as { items: InventoryItem[] }

/** Deliberately excludes teacher answers/platform supplements: a solution cannot mask an omitted source item. */
function sourceMaterial(stepId: string) {
  const step = chemistryLesson4.steps.find((item) => item.id === stepId)!
  const questions = step.blocks.flatMap((block) => block.kind === 'question' ? [sourceById.get(block.questionId)!] : [])
  const blocks = [...step.blocks, ...questions.flatMap((question) => question.material ?? [])]
    .filter((block) => block.kind === 'textbook-verbatim' || ('attribution' in block && block.attribution === 'textbook'))
  const texts = blocks.flatMap((block) => {
    if (block.kind === 'textbook-verbatim' || block.kind === 'callout') return [block.text]
    if (block.kind === 'list') return block.items
    if (block.kind === 'diagram') return [block.caption ?? '']
    if (block.kind === 'word-equation') return [block.caption ?? '']
    return []
  })
  texts.push(...questions.flatMap((question) => [question.prompt, ...(question.type === 'multiple-choice' ? question.options.map((option) => option.label) : [])]))
  return { step, questions, blocks, texts }
}

function correctResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice': return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false': return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank': return { type: 'blanks', values: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!])) }
    case 'matching': return { type: 'matching', pairs: question.pairs }
    case 'ordering': return { type: 'order', itemIds: question.correctOrder }
    case 'numerical': return { type: 'number', value: String(question.acceptedAnswers[0]) }
    default: throw new Error(`Non-deterministic question: ${question.id}`)
  }
}

function wrongResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice': return { type: 'choice', optionIds: [question.options.find((option) => !question.correctOptionIds.includes(option.id))!.id] }
    case 'true-false': return { type: 'boolean', value: !question.correctAnswer }
    case 'fill-blank': return { type: 'blanks', values: Object.fromEntries(question.blanks.map((blank) => [blank.id, 'إجابة غير مقبولة'])) }
    case 'matching': return { type: 'matching', pairs: question.pairs.map((pair) => ({ leftId: pair.leftId, rightId: question.right.find((item) => item.id !== pair.rightId)!.id })) }
    case 'ordering': return { type: 'order', itemIds: [...question.correctOrder].reverse() }
    case 'numerical': return { type: 'number', value: String(question.acceptedAnswers[0]! + 10) }
    default: throw new Error(`Unexpected question type: ${question.id}`)
  }
}
function wrongBankResponse(question: TestQuestion): BankResponseValue {
  const key = keyResponseOf(question)
  switch (key.type) {
    case 'choice': {
      if (!('options' in question)) throw new Error(question.id)
      return { type: 'choice', optionIds: [question.options.find((option) => !key.optionIds.includes(option.id))!.id] }
    }
    case 'boolean': return { type: 'boolean', value: !key.value }
    case 'text': return { type: 'text', value: 'إجابة غير مقبولة' }
    case 'number': return { type: 'number', value: String(Number(key.value) + 10) }
    case 'order': return { type: 'order', itemIds: [...key.itemIds].reverse() }
    case 'matching': {
      if (question.type !== 'matching') throw new Error(question.id)
      return { type: 'matching', pairs: key.pairs.map((pair) => ({ leftId: pair.leftId, rightId: question.right.find((item) => item.id !== pair.rightId)!.id })) }
    }
  }
}

function completeResponses(test: FinalTest): Record<string, QuestionResponse> {
  return Object.fromEntries(test.questions.map((question) => [question.id, { questionId: question.id, value: correctResponse(question) }]))
}

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); teacherAccess.lock(); window.history.replaceState(null, '', '/') })

describe('Lesson 4 registration, sequence and source audit', () => {
  it('keeps lesson 4 registered before the fifth verified lesson without adding a unit test', () => {
    expect(getLesson('chemistry', 'structural-chemistry', 'chemical-reactions')).toBe(chemistryLesson4)
    expect(getUnit('chemistry', 'structural-chemistry')?.lessons.map((lesson) => lesson.id)).toEqual(['chem-u1-l1', 'chem-u1-l2', 'chem-u1-l3', 'chem-u1-l4', 'chem-u1-l5'])
    expect(chemistryLesson4.source.pages.map((page) => page.page)).toEqual(['24', '25', '26', '27', '28', '29'])
    expect(chemistryLesson4.order).toBe(4)
    expect(chemistryLesson4.status).toBe('source-verified')
    expect(chemistryLesson4.tests?.map((test) => test.id)).toEqual(['chem-u1-l4-book', 'chem-u1-l4-practice', 'chem-u1-l4-final'])
  })

  it('passes source and assessment validation, including the 33-source-item container', () => {
    expect(validateLesson(chemistryLesson4, chemistryLesson4.id)).toEqual([])
    for (const test of chemistryLesson4.tests ?? []) expect(validateFinalTest(test, test.id)).toEqual([])
  })

  it('preserves page and topic order and all 33 source question units exactly once', () => {
    const pages = chemistryLesson4.steps.flatMap((step) => step.source?.pages.map((page) => Number(page.page)) ?? [])
    expect(pages).toEqual([...pages].sort((a, b) => a - b))
    expect(bookActivitySolutions).toHaveLength(20)
    expect(bookQuestions).toHaveLength(13)
    const textbookQuestionsInSteps = chemistryLesson4.steps
      .filter((step) => step.source?.pages.length)
      .flatMap((step) => step.blocks)
      .flatMap((block) => block.kind === 'question' ? [block.questionId] : [])
    expect(textbookQuestionsInSteps).toEqual(sourceQuestions.map((question) => question.id))
    expect(new Set(textbookQuestionsInSteps).size).toBe(33)
    const allStepQuestions = chemistryLesson4.steps.flatMap((step) => step.blocks).flatMap((block) => block.kind === 'question' ? [block.questionId] : [])
    expect(new Set(allStepQuestions).size).toBe(57)
    expect(chemistryLesson4.steps.at(-1)?.kind).toBe('final-test')
  })

  it('keeps the 48 independent inventory IDs in agreement with the intake table', () => {
    const report = readFileSync('docs/source-reports/lesson4-chemical-reactions-intake.md', 'utf8')
    const reportIds = [...report.matchAll(/^\| (L4-[^ |]+) \|/gm)].map((match) => match[1])
    expect(inventory.items).toHaveLength(48)
    expect(inventory.items.map((item) => item.id)).toEqual(reportIds)
  })

  it.each(inventory.items)('$id — source text, figures, symbols and subparts reach the student', (item) => {
    const { step, questions, blocks, texts } = sourceMaterial(item.stepId)
    expect(step.source?.pages.some((page) => page.page === item.page)).toBe(true)
    for (const text of item.texts ?? []) expect(texts, `${item.id}: ${text}`).toContain(text)
    const expectedQuestions = (item.questionIds ?? []).map((id) => sourceById.get(id)!)
    for (const question of expectedQuestions) {
      expect(question, item.id).toBeDefined()
      expect(questions.map((candidate) => candidate.id)).toContain(question.id)
      expect(question.origin).toBe('textbook')
      expect(question.source?.page).toBe(item.page)
    }
    if (item.sourceNumbers) expect(expectedQuestions.map((question) => question.sourceIndex)).toEqual(item.sourceNumbers)
    if (item.optionIds) for (const question of expectedQuestions) {
      expect(question.type).toBe('multiple-choice')
      if (question.type === 'multiple-choice') {
        expect(question.options.map((option) => option.id)).toEqual(item.optionIds)
        expect(question.showOptionIds).toBe(true)
      }
    }
    for (const id of item.figureIds ?? []) {
      const figure = blocks.find((block) => block.kind === 'diagram' && block.diagramId === id)
      expect(figure).toBeDefined()
      if (figure?.kind === 'diagram') {
        expect(figure.sourceRef).toContain(`الصفحة ${item.page}`)
        for (const fragment of item.figureFragments ?? []) expect(figure.description).toContain(fragment)
      }
    }
    for (const equation of item.wordEquations ?? []) {
      expect(blocks.some((block) => block.kind === 'word-equation' && Object.entries(equation).every(([key, value]) => JSON.stringify(block[key as keyof typeof block]) === JSON.stringify(value))), item.id).toBe(true)
    }
  })

  it('keeps original word order, repeated definitions and the three printed blank equations', () => {
    const definitions = ['reaction-definition', 'learned-summary'].map((id) => sourceMaterial(id).texts)
    for (const texts of definitions) expect(texts).toContain('التفاعل الكيميائي: تحوّل يطرأ على مواد كيميائية (مواد متفاعلة) وتتكون مواد جديدة (مواد ناتجة).')
    expect(sourceMaterial('book-question-2').blocks.filter((block) => block.kind === 'word-equation').map((block) => block.kind === 'word-equation' ? block.reactants : [])).toEqual([
      ['الأكسجين', 'المغنزيوم'], ['الزنك', 'الكبريت'], ['الكبريت', 'الحديد'],
    ])
    expect(sourceMaterial('combustion-conclusions').texts.join(' ')).not.toMatch(/\d+(?:°|mol|g|mL)/)
  })

  it('uses the p26 execution wording and p27 pronoun checked against the attached pages', () => {
    expect(sourceById.get('l4-burner-observe1')?.prompt).toBe('أشعل الموقد كما في الحالة (1) وأضع فوق اللهب صحن الخزف، ماذا ألاحظ؟')
    const gasNote = sourceMaterial('household-gas').texts.join(' ')
    expect(gasNote).toContain('(المركبتان) لها رائحة قوية')
    expect(gasNote).not.toContain('(المركبتان) له رائحة قوية')
  })

  it('matches the p24 red caption to the user-supplied crop without altering its wording', () => {
    const captionText = 'إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)'
    const caption = chemistryLesson4.steps.find((step) => step.id === 'observe-reactions')?.blocks.find(
      (block) => block.kind === 'textbook-verbatim' && block.text === captionText,
    )
    expect(caption).toMatchObject({
      kind: 'textbook-verbatim', text: captionText,
      source: { page: '24', item: 'تعليق الصورة اليمنى' },
    })
    expect(inventory.items.find((item) => item.id === 'L4-24-05')?.texts).toContain(captionText)
  })

  it('registers four lazy purposeful interactives, each labelled as platform-authored', async () => {
    const blocks = chemistryLesson4.steps.flatMap((step) => step.blocks).filter((block) => block.kind === 'interactive')
    const ids = blocks.map((block) => block.kind === 'interactive' ? block.interactiveId : '')
    expect(ids).toEqual(['reaction-observation-lab', 'magnesium-combustion-lab', 'word-equation-lab', 'combustion-air-lab'])
    for (const block of blocks) {
      if (block.kind !== 'interactive') continue
      expect(chemistryLesson4.steps.find((step) => step.blocks.includes(block))?.attribution).toBe('platform')
      expect(getInteractive(block.interactiveId)).toBeDefined()
      expect((await getInteractive(block.interactiveId)!.load()).default).toBeDefined()
    }
  })
})

describe('Scientific word equations and explicit photograph fallback', () => {
  it('isolates the chain LTR while preserving Arabic name direction and heating above the arrow', () => {
    const { container } = render(<WordEquation reactants={['المغنزيوم', 'الأكسجين']} products={['أكسيد المغنزيوم']} condition="تسخين" reactantRoles={['(مادة متفاعلة)', '(مادة متفاعلة)']} productRoles={['(مادة ناتجة)']} />)
    expect(container.querySelector('.word-equation')).toHaveAttribute('dir', 'ltr')
    expect(container.querySelector('.word-equation-scroll')).toHaveAttribute('tabindex', '0')
    expect(container.querySelector('.word-equation-scroll')).toHaveAttribute('role', 'group')
    expect(container.querySelectorAll('.word-equation__name[dir="rtl"]')).toHaveLength(3)
    expect(container.querySelector('.word-equation__condition')).toHaveTextContent('تسخين')
    expect(container.querySelector('.word-equation__arrow')).toHaveTextContent('→')
    expect([...container.querySelectorAll('.word-equation__role')].map((node) => node.textContent)).toEqual(['(مادة متفاعلة)', '(مادة متفاعلة)', '(مادة ناتجة)'])
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('never pretends that an unavailable original photo is a supplied scan', () => {
    const figure = sourceMaterial('book-question-6').blocks.find((block) => block.kind === 'diagram')!
    const { container } = render(<ContentBlocks blocks={[figure]} />)
    expect(container.textContent).toContain('مرجع وصفي إلى شكل الكتاب')
    expect(container.textContent).toContain('ليس صورة الكتاب الأصلية')
    expect(container.textContent).toContain('الشكل (1) على يمين الصفحة 29')
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows all printed option letters and hides invented numbering for unnumbered source prompts', () => {
    const { container, unmount } = render(<InlineQuestion question={bookQuestions[0]!} />)
    expect([...container.querySelectorAll('.choice__label')].map((node) => node.textContent?.trim())).toEqual(bookQuestions[0]!.type === 'multiple-choice' ? bookQuestions[0]!.options.map((option) => `${option.id}. ${option.label}`) : [])
    unmount()
    const result = render(<InlineQuestion question={bookActivitySolutions[0]!} />)
    expect(result.container.querySelector('.question__index')).toBeNull()
    expect(result.container.querySelector('.question__solution')).toBeNull()
  })
})

describe('20-question deterministic final; completion and delayed feedback', () => {
  it.each(finalTest.questions)('$id deterministically rejects a completed wrong answer without confusing presence with correctness', (question) => {
    const value = wrongResponse(question)
    expect(isAttemptComplete([question], { [question.id]: { questionId: question.id, value } }, true)).toBe(true)
    expect(evaluateQuestion(question, { questionId: question.id, value }).outcome).not.toBe('correct')
  })

  it('has exactly 20 original single-point items across six deterministic formats', () => {
    expect(finalTest.questions).toHaveLength(20)
    expect(finalTest.targetQuestionCount).toEqual({ min: 20, max: 20 })
    expect(finalTest.requireComplete).toBe(true)
    expect(new Set(finalTest.questions.map((question) => question.type)).size).toBe(6)
    const sourcePrompts = new Set(sourceQuestions.map((question) => question.prompt))
    for (const question of finalTest.questions) {
      expect(question.origin).toBe('platform')
      expect(question.points).toBe(1)
      expect(sourcePrompts.has(question.prompt)).toBe(false)
      expect(question.explanation!.length).toBeGreaterThan(150)
      expect(question.solutionBlocks?.[0]?.kind).toBe('procedure')
      expect(evaluateQuestion(question, { questionId: question.id, value: correctResponse(question) }).outcome).toBe('correct')
    }
    const summary = summariseAttempt(finalTest.questions, completeResponses(finalTest))
    expect(summary.results.every((result) => result.outcome === 'correct')).toBe(true)
    expect(summary.results.reduce((sum, result) => sum + (result.points ?? 1), 0)).toBe(20)
    expect(summary.answered).toBe(20)
  })

  it('requires every blank/match/ordering item, not merely one nonempty answer', () => {
    const full = completeResponses(finalTest)
    expect(isAttemptComplete(finalTest.questions, full, true)).toBe(true)
    const fill: Question = { id: 'multi-blank-fixture', type: 'fill-blank', origin: 'platform', prompt: 'أكمل فراغين', template: '{complete} / {incomplete}', blanks: [{ id: 'complete', acceptedAnswers: ['تام'] }, { id: 'incomplete', acceptedAnswers: ['غير تام'] }] }
    expect(fill.type).toBe('fill-blank')
    full[fill.id] = { questionId: fill.id, value: { type: 'blanks', values: { complete: 'تام', incomplete: '' } } }
    expect(isAttemptComplete([...finalTest.questions, fill], full, true)).toBe(false)
    expect(isAttemptComplete([...finalTest.questions, fill], full)).toBe(true) // Existing lesson defaults remain unchanged.
    const match = finalTest.questions.find((question) => question.type === 'matching')!
    const matchingFull = completeResponses(finalTest)
    matchingFull[match.id] = { questionId: match.id, value: { type: 'matching', pairs: [{ leftId: 'x', rightId: 'y' }] } }
    expect(isAttemptComplete(finalTest.questions, matchingFull, true)).toBe(false)
    const order = finalTest.questions.find((question) => question.type === 'ordering')!
    const orderingFull = completeResponses(finalTest)
    orderingFull[order.id] = { questionId: order.id, value: { type: 'order', itemIds: ['x', 'x', 'x'] } }
    expect(isAttemptComplete(finalTest.questions, orderingFull, true)).toBe(false)
  })

  it('blocks incomplete submission without an override or any feedback/solution leakage', async () => {
    const user = userEvent.setup()
    const question: Question = { id: 'multi-blank-ui-fixture', type: 'fill-blank', origin: 'platform', prompt: 'أكمل', template: '{complete} ثم {incomplete}', blanks: [{ id: 'complete', acceptedAnswers: ['تام'], kind: 'text' }, { id: 'incomplete', acceptedAnswers: ['غير تام'], kind: 'text' }], explanation: 'تفحص جميع الفراغات عند التسليم فقط.' }
    const strict: FinalTest = { ...finalTest, id: 'lesson4-strict-ui', questions: [question], targetQuestionCount: { min: 1, max: 1 } }
    const { container } = render(<FinalTestRunner test={strict} />)
    await user.type(screen.getByLabelText('الفراغ complete'), 'تام')
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('أكمل جميع أجزاء')
    expect(screen.queryByRole('button', { name: 'إرسال على أي حال' })).toBeNull()
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
    expect(container.querySelector('[data-correct], [data-outcome], .question__explanation')).toBeNull()
    expect(container.textContent).not.toContain(question.explanation)
    await user.type(screen.getByLabelText('الفراغ incomplete'), 'غير تام')
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(screen.getByText('نتيجة المحاولة')).toBeInTheDocument()
    expect(container.querySelector('[data-outcome="correct"]')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(screen.queryByText('نتيجة المحاولة')).toBeNull()
    expect(screen.getByLabelText('الفراغ complete')).toHaveValue('')
  })

  it('runs all 20 controls and reveals their detailed explanations only after completed submission', async () => {
    const user = userEvent.setup()
    const { container } = render(<FinalTestRunner test={{ ...finalTest, id: 'lesson4-all-controls' }} />)
    for (const question of finalTest.questions) {
      const node = container.querySelector<HTMLElement>(`[data-question="${question.id}"]`)!
      switch (question.type) {
        case 'multiple-choice':
          for (const id of question.correctOptionIds) await user.click(node.querySelector<HTMLInputElement>(`input[value="${id}"]`)!)
          break
        case 'true-false': await user.click(within(node).getByRole('radio', { name: question.correctAnswer ? 'صح' : 'خطأ' })); break
        case 'fill-blank': for (const blank of question.blanks) fireEvent.change(within(node).getByLabelText(`الفراغ ${blank.id}`), { target: { value: blank.acceptedAnswers[0] } }); break
        case 'matching': for (const pair of question.pairs) {
          const index = question.left.findIndex((item) => item.id === pair.leftId)
          await user.selectOptions(within(node).getAllByRole('combobox')[index]!, pair.rightId)
        } break
        case 'numerical': fireEvent.change(within(node).getByLabelText('القيمة'), { target: { value: String(question.acceptedAnswers[0]) } }); break
        case 'ordering': {
          const order = question.items.map((item) => item.id)
          for (let position = 0; position < question.correctOrder.length; position++) {
            const id = question.correctOrder[position]!
            let current = order.indexOf(id)
            while (current > position) {
              const label = question.items.find((item) => item.id === id)!.label
              await user.click(within(node).getByRole('button', { name: `تحريك «${label}» إلى الأعلى` }))
              ;[order[current - 1], order[current]] = [order[current]!, order[current - 1]!]
              current--
            }
          }
          break
        }
      }
      expect(container.querySelector('[data-correct], [data-outcome], .question__explanation')).toBeNull()
    }
    expect(screen.getByRole('progressbar', { name: 'التقدّم في الاختبار' })).toHaveAttribute('aria-valuenow', '20')
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار/ }))
    expect(container.querySelectorAll('[data-outcome="correct"]')).toHaveLength(20)
    expect(container.querySelectorAll('.question__explanation')).toHaveLength(20)
    for (const input of container.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')) expect(input.disabled).toBe(true)
  }, 20000)
})

describe('Four qualitative labs: meaningful state, safety, resets and no assumed measurements', () => {
  it('executes each observation, then separately reveals its inference and resets state', async () => {
    const user = userEvent.setup()
    const { container } = render(<ReactionObservationLab reducedMotion interactiveId="reaction-observation-lab" />)
    expect(container.querySelector('.reaction-lab--still')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'إضافة قطرات افتراضياً' }))
    expect(screen.getByRole('status')).toHaveTextContent('تظهر فقاعات ورغوة في الكأس.')
    await user.click(screen.getByRole('button', { name: 'فسر الملاحظة' }))
    expect(screen.getByText(/انطلق غاز أثناء التفاعل/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ماء جافيل والصباغ' }))
    expect(screen.queryByText(/انطلق غاز أثناء التفاعل/)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'مشاهدة القطرة الافتراضية' }))
    expect(screen.getByRole('status')).toHaveTextContent('تصبح بقعة الصباغ أفتح من بقية الثوب.')
    await user.click(screen.getByRole('button', { name: 'الغاز ورائق الكلس' }))
    await user.click(screen.getByRole('button', { name: 'تمرير الغاز افتراضياً' }))
    expect(screen.getByRole('status')).toHaveTextContent('يتعكر رائق الكلس ويظهر راسب أبيض.')
    await user.click(screen.getByRole('button', { name: 'إعادة المشهد' }))
    expect(screen.getByRole('status')).not.toHaveTextContent('يتعكر رائق الكلس')
    expect(container.textContent).toContain('لا تخلط مواد المشاهد المختلفة')
  })

  it('requires a lab-safety acknowledgement before Mg burning, then collects a new white product', async () => {
    const user = userEvent.setup()
    const { container } = render(<MagnesiumCombustionLab reducedMotion={false} interactiveId="magnesium-combustion-lab" />)
    expect(screen.getByRole('button', { name: 'قرب الشريط افتراضياً' })).toBeDisabled()
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'قرب الشريط افتراضياً' }))
    expect(container.querySelector('.reaction-lab__mg-glow')).not.toBeNull()
    expect(container.querySelector('.word-equation')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'راقب الناتج بعد الاحتراق' }))
    expect(container.querySelector('.reaction-lab__powder')).not.toBeNull()
    expect(container.querySelector('.word-equation')).not.toBeNull()
    expect(container.querySelector('.chem-formula')?.textContent).toBe('MgO')
    await user.click(screen.getByRole('button', { name: 'إعادة المحاكاة' }))
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(container.querySelector('.word-equation')).toBeNull()
  })

  it('changes air hole, flame and soot meaningfully without claiming fixed gas mixtures', async () => {
    const user = userEvent.setup()
    const { container } = render(<CombustionAirLab reducedMotion={false} interactiveId="combustion-air-lab" />)
    await user.click(screen.getByRole('button', { name: 'ضع صحن الخزف فوق اللهب' }))
    expect(screen.getByRole('status')).toHaveTextContent('ولا تظهر طبقة سوداء')
    expect(screen.getByRole('heading', { name: 'الاستنتاج: احتراق تام' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'الحالة (2): إغلاق الثقب جزئياً' }))
    expect(container.querySelector('.reaction-lab__soot')).toBeNull()
    expect(container.querySelector('.reaction-lab__air-hole--closed')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'ضع صحن الخزف فوق اللهب' }))
    expect(container.querySelector('.reaction-lab__soot')).not.toBeNull()
    expect(container.querySelector('.reaction-lab__result sub')).toHaveTextContent('2')
    expect(container.textContent).toContain('لا خليط ثابت أو نسب مفترضة')
    await user.click(screen.getByRole('button', { name: 'إعادة تجربة الموقد' }))
    expect(container.querySelector('.reaction-lab__soot')).toBeNull()
    expect(container.querySelector('.reaction-lab__result')).toBeNull()
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('checks a word equation only on demand, preserves the II label, and resets when context changes', async () => {
    const user = userEvent.setup()
    render(<WordEquationLab reducedMotion={false} interactiveId="word-equation-lab" />)
    await user.selectOptions(screen.getByLabelText(/المتفاعل الثاني/), 'الأكسجين')
    await user.selectOptions(screen.getByLabelText('المادة الجديدة الناتجة'), 'أكسيد المغنزيوم')
    expect(screen.getByRole('status')).not.toHaveTextContent('اتسقت البطاقة')
    await user.click(screen.getByRole('button', { name: 'تحقق من المعادلة' }))
    expect(screen.getByRole('status')).toHaveTextContent('اتسقت البطاقة')
    await user.click(screen.getByRole('button', { name: 'الحديد والكبريت' }))
    expect(screen.getByLabelText(/المتفاعل الثاني/)).toHaveValue('')
    await user.selectOptions(screen.getByLabelText(/المتفاعل الثاني/), 'الكبريت')
    await user.selectOptions(screen.getByLabelText('المادة الجديدة الناتجة'), 'كبريتيد الحديد II')
    await user.click(screen.getByRole('button', { name: 'تحقق من المعادلة' }))
    expect(screen.getByRole('status')).toHaveTextContent('كبريتيد الحديد II')
  })
})

describe('Teacher coverage, source/platform separation and independent Test Area bank', () => {
  it('provides 53 complete lesson solutions, detailed concepts and exact page references', () => {
    const teacher = getTeacherLesson('chem-u1-l4')!
    expect(teacher.bookQuestions).toEqual(sourceQuestions)
    expect(teacher.bookQuestions.length + teacher.finalTest.questions.length).toBe(53)
    expect(teacher.conceptBlocks).toBe(lesson4TeacherGuide)
    expect(teacher.conceptBlocks!.every((block) => 'attribution' in block && block.attribution === 'platform')).toBe(true)
    for (const question of sourceQuestions) {
      expect(Number(question.source!.page)).toBeGreaterThanOrEqual(24)
      expect(Number(question.source!.page)).toBeLessThanOrEqual(29)
      expect(question.explanation!.length).toBeGreaterThan(100)
      expect(question.solutionBlocks?.length).toBeGreaterThan(0)
      const steps = question.solutionBlocks!.find((block) => block.kind === 'procedure')
      expect(steps?.kind === 'procedure' ? steps.items.length : 0).toBeGreaterThanOrEqual(3)
      expect(question.solutionBlocks!.every((block) => 'attribution' in block && block.attribution === 'platform')).toBe(true)
    }
  })

  it.each(bank.questions)('$id independently rejects a structurally complete wrong answer', (question) => {
    const value = wrongBankResponse(question)
    expect(hasCompleteResponse(question, value)).toBe(true)
    expect(gradeQuestion(question, value).outcome).not.toBe('correct')
  })

  it('renders every teacher page range as a single LTR isolate using the existing renderer', () => {
    const { container } = render(<ContentBlocks blocks={lesson4TeacherGuide} />)
    for (const range of ['24–25', '25–28', '26–29', '28–29']) {
      expect([...container.querySelectorAll('.sci[dir="ltr"]')].some((node) => node.textContent === range)).toBe(true)
    }
  })

  it('uses separate lazy bank/solution modules with matching canonical keys and an original qualitative blueprint', async () => {
    const definition = getTestDefinition('chem-u1-l4')!
    expect((await definition.load()).default).toBe(bank)
    expect((await definition.loadSolutions()).default).toBe(solutions)
    expect(definition.meta.scope).toBe('lesson')
    expect(bank.questions).toHaveLength(20)
    expect(solutions.solutions).toHaveLength(20)
    expect(auditTestBank(bank)).toEqual([])
    expect(auditTestMeta(definition.meta, bank)).toEqual([])
    expect(auditSolutionSet(bank, solutions)).toEqual([])
    expect(auditOriginality(bank, existingPromptEntries())).toEqual([])
    expect(bank.blueprint.types.numeric).toBe(0)
    expect(new Set(bank.questions.map((question) => question.type)).size).toBe(8)
    for (const question of bank.questions) {
      expect(gradeQuestion(question, keyResponseOf(question)).outcome).toBe('correct')
      const solution = solutions.solutions.find((item) => item.questionId === question.id)!
      expect(solutionAnswerMatchesKey(solution.answer, question)).toBe(true)
      expect(solution.thinking.length).toBeGreaterThanOrEqual(3)
      expect(solution.whyCorrect.length).toBeGreaterThan(100)
      expect(solution.verification).toBeTruthy()
      expect(solution.commonMistakes.length).toBeGreaterThan(0)
    }
  })

  it('mounts the Student lesson and complete source exercises through the existing navigation', async () => {
    window.location.hash = '#observe-reactions'
    renderApp(PATH)
    expect(screen.getByRole('heading', { name: 'التفاعل الكيميائي: ألاحظ وأجيب' })).toBeInTheDocument()
    expect(document.querySelectorAll('[data-question]')).toHaveLength(4)
    expect(document.querySelector('.question__solution')).toBeNull()
    expect(screen.getByText('إضافة قطرات ليمون إلى بيكربونات الصوديوم (الكربونة)')).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: 'التالي' }))
    await waitFor(() => expect(document.querySelector('.reaction-lab')).not.toBeNull())
  })

  it('offers a separate fourth Teacher tab with concepts, 33 book solutions and 20 final questions', async () => {
    teacherAccess.unlock(TEACHER_PASSWORD)
    const user = userEvent.setup()
    const { unmount } = renderApp('/teacher/book-solutions')
    await user.click(screen.getByRole('link', { name: /الدرس الرابع/ }))
    expect(screen.getByText('شرح مفاهيم الدرس ودليل التجارب — إضافة من المنصة')).toBeInTheDocument()
    expect(document.querySelectorAll('.teacher-answer')).toHaveLength(33)
    expect(screen.getByRole('link', { name: 'الحلول المفصلة لأسئلة البنك العشرين' })).toHaveAttribute('href', '/test-area/chem-u1-l4/solutions')
    expect(screen.getAllByText(/مرجع الكتاب: الصفحة/).length).toBeGreaterThan(0)
    unmount()
    renderApp('/teacher/final-test-solutions?lesson=chem-u1-l4')
    expect(document.querySelectorAll('.teacher-answer')).toHaveLength(20)
    for (const node of document.querySelectorAll<HTMLElement>('.teacher-answer')) expect(within(node).getAllByText('الحل خطوة بخطوة').length).toBeGreaterThan(0)
  })

  it('has no serious/critical accessibility findings in all four labs and the lesson opening', async () => {
    for (const Lab of [ReactionObservationLab, MagnesiumCombustionLab, CombustionAirLab, WordEquationLab]) {
      const { container, unmount } = render(<Lab reducedMotion interactiveId="lesson4-axe-fixture" />)
      const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } })
      expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([])
      unmount()
    }
    const { container } = renderApp(PATH)
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([])
  }, 15000)
})


describe('Lesson 4 Test Area strict completion — old banks keep their defaults', () => {
  it('does not grade an empty/partial attempt even through the override action', () => {
    let state = createAttemptState(bank)
    for (const action of ['submit', 'submit-anyway'] as const) {
      state = attemptReducer(state, { type: action }, bank)
      expect(state.status).toBe('in-progress')
      expect(state.result).toBeNull()
      expect(state.unansweredWarning).toBe(true)
    }
    const matching = bank.questions.find((question) => question.type === 'matching')!
    if (matching.type !== 'matching') throw new Error('Missing authored matching item')
    const partial = { type: 'matching' as const, pairs: [matching.pairs[0]!] }
    expect(hasCompleteResponse(matching, partial)).toBe(false)
    state = attemptReducer(state, { type: 'answer', questionId: matching.id, value: partial }, bank)
    expect(answeredCountOf(bank, state)).toBe(0)
    expect(attemptReducer(state, { type: 'submit-anyway' }, bank).result).toBeNull()
    const legacy = { ...bank, requireComplete: false }
    expect(attemptReducer(state, { type: 'submit-anyway' }, legacy).status).toBe('submitted')
  })

  it('keeps all 20 keyed responses ungraded until submit, then gives 20/20 and resets cleanly', () => {
    let state = createAttemptState(bank)
    for (const question of bank.questions) {
      const value = keyResponseOf(question)
      expect(hasCompleteResponse(question, value)).toBe(true)
      state = attemptReducer(state, { type: 'answer', questionId: question.id, value }, bank)
      expect(state.result).toBeNull()
    }
    expect(answeredCountOf(bank, state)).toBe(20)
    state = attemptReducer(state, { type: 'submit' }, bank)
    expect(state.result?.score).toBe(20)
    expect(state.result?.correct).toBe(20)
    state = attemptReducer(state, { type: 'restart' }, bank)
    expect(state.result).toBeNull()
    expect(state.responses).toEqual({})
  })

  it('uses RTL inputs for Arabic exact answers and LTR for Latin formulae', () => {
    const arabic = bank.questions.find((question) => question.type === 'exact' && question.answer.kind === 'text')!
    const latin = bank.questions.find((question) => question.type === 'exact' && question.answer.kind === 'formula')!
    const { container, unmount } = render(<TestQuestionCard question={arabic} number={1} response={undefined} onChange={() => {}} />)
    expect(container.querySelector('input')).toHaveAttribute('dir', 'rtl')
    expect(container.querySelector('input')).toHaveAttribute('lang', 'ar')
    unmount()
    const second = render(<TestQuestionCard question={latin} number={1} response={undefined} onChange={() => {}} />)
    expect(second.container.querySelector('input')).toHaveAttribute('dir', 'ltr')
    expect(second.container.querySelector('input')).toHaveAttribute('lang', 'en')
  })
})
