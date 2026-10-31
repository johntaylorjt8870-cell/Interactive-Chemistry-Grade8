import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { chemistryLesson7, bookActivitySolutions, bookQuestions, finalTest, lesson7PracticeQuestions } from '@/data/curriculum/chemistryLesson7'
import { getLesson, getUnit } from '@/data/curriculum/registry'
import { getTeacherLesson } from '@/teacher/teacherContent'
import { TEACHER_PASSWORD, teacherAccess } from '@/teacher/teacherAccess'
import { progressStore } from '@/data/progress'
import { evaluateQuestion } from '@/assessment/evaluate'
import type { Question, ResponseValue } from '@/assessment/types'
import { FinalTestRunner } from '@/assessment/FinalTestRunner'
import MolarMassLab from '@/simulations/MolarMassLab'
import MolarVolumeLab from '@/simulations/MolarVolumeLab'
import { airVolumeForOxygen, calculateGasSample, calculateMolarSample, molarMass } from '@/simulations/lesson7Models'
import { renderApp } from './utils/renderApp'

const PATH = '/chemistry/structural-chemistry/chemical-calculations'
function correctResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice': return { type: 'choice', optionIds: question.correctOptionIds }
    case 'true-false': return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank': return { type: 'blanks', values: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!])) }
    case 'matching': return { type: 'matching', pairs: question.pairs }
    case 'ordering': return { type: 'order', itemIds: question.correctOrder }
    case 'numerical': return { type: 'number', value: String(question.acceptedAnswers[0]), unit: question.unit }
    case 'short-answer': return { type: 'text', value: question.referenceAnswer }
    default: throw new Error(`unexpected ${question.type}`)
  }
}
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); progressStore.resetAll(); teacherAccess.lock(); window.location.hash = '' })

describe('Lesson 7 route, unit completion, navigation and progress', () => {
  it('registers lesson 7 last and closes unit 1 on p49', () => {
    const unit = getUnit('chemistry', 'structural-chemistry')!
    expect(unit.lessons).toHaveLength(7)
    expect(unit.lessons.at(-1)).toBe(chemistryLesson7)
    expect(unit.source?.pages.at(-1)?.page).toBe('49')
    expect(getLesson('chemistry', 'structural-chemistry', 'chemical-calculations')).toBe(chemistryLesson7)
    renderApp('/chemistry/structural-chemistry')
    expect(screen.getByText(/اكتمل محتوى الوحدة الأولى بسبعة دروس/)).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /الحساب الكيميائيّ/ })
    expect(links.length).toBeGreaterThan(0)
  })
  it('opens the lesson from its real URL with source attribution and four original crops available across steps', async () => {
    renderApp(PATH)
    expect(screen.getByRole('heading', { level: 1, name: /الحساب الكيميائيّ/ })).toBeInTheDocument()
    expect(screen.getAllByText('من الكتاب المدرسي').length).toBeGreaterThan(0)
    expect(document.querySelector('.source-image img')).not.toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /التالي/ }))
    expect(window.location.hash).toBe('#step-2')
    expect(progressStore.getLesson('chem-u1-l7')?.seenStepIds).toContain('p40-mole-questions')
  })
  it('navigates by outline, keeps deep links, and completes only on explicit finish', async () => {
    const user = userEvent.setup()
    window.location.hash = '#step-33'
    renderApp(PATH)
    expect(screen.getByRole('heading', { name: /الاختبار النهائي الشامل — الحساب الكيميائيّ/ })).toBeInTheDocument()
    expect(progressStore.getLesson('chem-u1-l7')?.completed).not.toBe(true)
    await user.click(screen.getByRole('button', { name: /إنهاء الدرس/ }))
    expect(progressStore.getLesson('chem-u1-l7')?.completed).toBe(true)
    expect(JSON.parse(localStorage.getItem('ipc:progress')!).lessons['chem-u1-l7'].completed).toBe(true)
  })
  it('exposes the seventh teacher tab with 41 book solutions and 20 final-test solutions', () => {
    const teacher = getTeacherLesson('chem-u1-l7')
    expect(teacher.bookQuestions).toHaveLength(41)
    expect(teacher.finalTest).toBe(finalTest)
    teacherAccess.unlock(TEACHER_PASSWORD)
    renderApp('/teacher/book-solutions?lesson=chem-u1-l7')
    expect(document.querySelectorAll('.teacher-lesson-tab')).toHaveLength(7)
    expect(document.querySelectorAll('.teacher-answer')).toHaveLength(41)
    expect(document.querySelector('.teacher-concept-guide')).not.toBeNull()
  })
})

describe('Lesson 7 models and labs — action, observation, conclusion', () => {
  it('computes molar masses from parsed formulas and book atomic masses', () => {
    expect(molarMass('H2O')).toBe(18)
    expect(molarMass('NH3')).toBe(17)
    expect(molarMass('CH4')).toBe(16)
    expect(molarMass('MgCl2')).toBe(95)
    expect(molarMass('Ca(OH)2')).toBe(74)
    expect(calculateMolarSample('H2O', 36, 'mass')?.moles).toBe(2)
    expect(calculateMolarSample('H2O', -1, 'mass')).toBeNull()
    expect(calculateMolarSample('H2O', Number.NaN, 'moles')).toBeNull()
  })
  it('keeps gas volumes equal at equal moles and standard conditions, with different masses', () => {
    const he = calculateGasSample('he', 2)!
    const o2 = calculateGasSample('o2', 2)!
    const n2 = calculateGasSample('n2', 2)!
    expect([he.volume, o2.volume, n2.volume]).toEqual([44.8, 44.8, 44.8])
    expect([he.mass, o2.mass, n2.mass]).toEqual([8, 64, 56])
    expect(calculateGasSample('he', 11)).toBeNull()
    expect(airVolumeForOxygen(44.8)).toBeCloseTo(213.333, 2)
  })
  it('molar-mass lab reveals readings only after calculation and resets honestly', async () => {
    const user = userEvent.setup()
    render(<MolarMassLab interactiveId="lesson7-molar-mass-lab" reducedMotion={false} />)
    expect(screen.getByText(/لم تُحسب عينة بعد/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'احسب العينة' }))
    expect(screen.getByText('قراءة النموذج الحسابي')).toBeInTheDocument()
    expect(screen.getByText('36 g')).toBeInTheDocument()
    expect(screen.getByText(/ضربنا عدد المولات في الكتلة المولية/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'إعادة تعيين' }))
    expect(screen.queryByText('قراءة النموذج الحسابي')).not.toBeInTheDocument()
  })
  it('molar-volume lab compares all three gases after an explicit action', async () => {
    const user = userEvent.setup()
    render(<MolarVolumeLab interactiveId="lesson7-molar-volume-lab" reducedMotion />)
    await user.click(screen.getByRole('button', { name: 'احسب الحجم' }))
    expect(screen.getByText('الملاحظة والاستنتاج')).toBeInTheDocument()
    expect(screen.getByText('مقارنة الغازات الثلاثة عند عدد المولات نفسه')).toBeInTheDocument()
    expect(screen.getByText(/هذه قراءة حسابية لا تجربة مخبرية/)).toBeInTheDocument()
  })
  it('rejects invalid lab input without inventing a reading', async () => {
    const user = userEvent.setup()
    render(<MolarMassLab interactiveId="lesson7-molar-mass-lab" reducedMotion />)
    await user.clear(screen.getByLabelText('القيمة'))
    await user.click(screen.getByRole('button', { name: 'احسب العينة' }))
    expect(screen.getByRole('alert')).toHaveTextContent('أدخل قيمة من 0 إلى 10000')
  })
})

describe('Lesson 7 assessment behaviour and accessibility', () => {
  it('grades all final-test question types deterministically', () => {
    for (const question of finalTest.questions) expect(evaluateQuestion(question, { questionId: question.id, value: correctResponse(question) }).outcome).toBe('correct')
    for (const question of [...bookActivitySolutions, ...bookQuestions, ...lesson7PracticeQuestions]) {
      const outcome = evaluateQuestion(question, { questionId: question.id, value: correctResponse(question) }).outcome
      expect(['correct', 'needs-review']).toContain(outcome)
    }
  })
  it('requires complete final-test answers before submission', async () => {
    const user = userEvent.setup()
    render(<FinalTestRunner test={finalTest} />)
    await user.click(screen.getByRole('button', { name: /إنهاء الاختبار وعرض النتيجة/ }))
    expect(screen.getByText('ما زالت هناك أسئلة دون إجابة')).toBeInTheDocument()
    expect(screen.queryByText('نتيجة المحاولة')).not.toBeInTheDocument()
  })
  it('has no serious or critical axe violations on the entry step and both labs', async () => {
    const { container, unmount } = renderApp(PATH)
    let results = await axe.run(container)
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
    unmount()
    const lab = render(<><MolarMassLab interactiveId="lesson7-molar-mass-lab" reducedMotion /><MolarVolumeLab interactiveId="lesson7-molar-volume-lab" reducedMotion /></>)
    results = await axe.run(lab.container)
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([])
  }, 30000)
})
