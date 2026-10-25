import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { readFileSync } from 'node:fs'
import { getLesson } from '@/data/curriculum/registry'
import { ContentBlocks } from '@/lessons/ContentBlocks'
import { strayScriptGlyphs } from './utils/strayGlyphs'
import {
  chemistryLesson2,
  bookQuestions,
  bookActivitySolutions,
  finalTest,
  practiceAssessment,
} from '@/data/curriculum/chemistryLesson2'
import { validateLesson } from '@/data/sourceFidelity'
import { LewisMolecule } from '@/scientific/LewisMolecule'
import { IonicTransferDiagram } from '@/scientific/IonicTransferDiagram'
import IonicBondingLab from '@/simulations/IonicBondingLab'
import CovalentBondLab from '@/simulations/CovalentBondLab'
import Lesson2ValenceDiagram from '@/simulations/Lesson2ValenceDiagram'
import Lesson2IonBalanceDiagram from '@/simulations/Lesson2IonBalanceDiagram'
import Lesson2BondAnatomyDiagram from '@/simulations/Lesson2BondAnatomyDiagram'
import Lesson2LewisAnatomyDiagram from '@/simulations/Lesson2LewisAnatomyDiagram'
import Lesson2HeteroLewisDiagram from '@/simulations/Lesson2HeteroLewisDiagram'
import Lesson2OctetBridgeDiagram from '@/simulations/Lesson2OctetBridgeDiagram'
import Lesson2TransferMechanismDiagram from '@/simulations/Lesson2TransferMechanismDiagram'
import ValenceCounterLab from '@/simulations/ValenceCounterLab'
import ElementBehaviorLab from '@/simulations/ElementBehaviorLab'
import BondStepsLab from '@/simulations/BondStepsLab'
import ErrorSpotterLab from '@/simulations/ErrorSpotterLab'
import { evaluateQuestion } from '@/assessment/evaluate'
import { isInteractiveRegistered } from '@/simulations/registry'
import { teacherAccess, TEACHER_PASSWORD } from '@/teacher/teacherAccess'
import { TEACHER_LESSONS, getTeacherLesson } from '@/teacher/teacherContent'
import { renderApp } from './utils/renderApp'
import type { LessonStep } from '@/data/curriculum/schema'

/**
 * Lesson 2 — «الروابط الكيميائية» (pages 13–17).
 *
 * The checks below are behavioural: they read the lesson data, render the real
 * components and assert on the result. They never assert that a file simply
 * exists, and they never weaken a check to make a build pass.
 */

const LESSON_PATH = '/chemistry/structural-chemistry/chemical-bonds'

function sourceSteps(): LessonStep[] {
  return chemistryLesson2.steps.filter((step) => step.source?.pages.length)
}

const inlineQuestionIds = chemistryLesson2.steps.flatMap((step) =>
  step.blocks.filter((block) => block.kind === 'question').map((block) => (block as { questionId: string }).questionId),
)

describe('curriculum registry — lesson 2', () => {
  it('publishes lesson 2 inside unit 1 after lesson 1', () => {
    const lesson = getLesson('chemistry', 'structural-chemistry', 'chemical-bonds')
    expect(lesson).toBeDefined()
    expect(lesson?.id).toBe('chem-u1-l2')
    expect(lesson?.order).toBe(2)
    expect(lesson?.status).toBe('source-verified')
    expect(lesson?.title).toContain('الروابط الكيميائية')
  })

  it('covers exactly pages 13–17 with a verified readability report', () => {
    const pages = chemistryLesson2.source.pages.map((page) => page.page)
    expect(pages).toEqual(['13', '14', '15', '16', '17'])
    expect(chemistryLesson2.source.verified).toBe(true)
    const readability = chemistryLesson2.source.readability!
    for (const [key, level] of Object.entries(readability)) {
      if (key === 'notes') continue
      expect(level, key).toBe('clear')
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

  it('references only registered interactives, and mounts every lesson-2 lab', () => {
    const ids = chemistryLesson2.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'interactive')
      .map((block) => (block as { interactiveId: string }).interactiveId)
    expect(ids).toEqual([
      'lesson2-valence-counter',
      'lesson2-element-behavior-lab',
      'ionic-bonding-lab',
      'lesson2-bond-steps',
      'covalent-bond-lab',
      'lesson2-error-spotter',
    ])
    for (const id of ids) expect(isInteractiveRegistered(id), id).toBe(true)
  })

  it('mounts every educational figure on a real step of the lesson', () => {
    const figures = chemistryLesson2.steps
      .flatMap((step) => step.blocks)
      .filter((block) => block.kind === 'diagram')
      .map((block) => (block as { diagramId: string }).diagramId)
    expect(figures).toEqual([
      'lesson2-valence-map',
      'lesson2-ion-balance',
      'lesson2-transfer-cao',
      'lesson2-lewis-anatomy',
      'lesson2-hetero-lewis',
      'lesson2-octet-bridge',
      'lesson2-bond-anatomy',
      'lesson2-transfer-mgcl2',
    ])
    for (const id of figures) expect(isInteractiveRegistered(id), id).toBe(true)
  })

  it('keeps every step id unique and every step non-empty except the final test', () => {
    const ids = chemistryLesson2.steps.map((step) => step.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const step of chemistryLesson2.steps) {
      if (step.kind === 'final-test') expect(step.testId).toBe('chem-u1-l2-final')
      else expect(step.blocks.length, step.id).toBeGreaterThan(0)
    }
  })
})

describe('verbatim fidelity of the printed material', () => {
  const allText = JSON.stringify(chemistryLesson2)

  it.each([
    'هناك قوى تربط بين الذرّات المكوّنة للمادّة نسمّيها روابط كيميائيّة.',
    'هي القوى التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
    'لنتعرّف على نوعين من الروابط الكيميائيّة بين الذرّات: هما الرابطة الأيونيّة والرّابطة المشتركة.',
    'حتّى تتحقّق قاعدة الثمانيّة نُلاحظُ أنّ ذرّة الصّوديوم Na تميل إلى فقدان إلكترونها السطحي وذرّة الكلور Cl تميل إلى اكتساب إلكترون.',
    'الرابطة الأيونيّة: قوى تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
    'المركبات ذات الرابطة الأيونية صلبة في الدرجة العادية من الحرارة، ولا تنقل التيار الكهربائي في حالتها الصلبة بينما محاليلها ومصاهيرها تنقل التيار الكهربائي ودرجات غليانها وانصهارها مرتفعة.',
    'الرابطة المشتركة: اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
    'المركّبات ذات الرابطة المشتركة معظمها غازات وغير ناقلة للتيار الكهربائي ودرجات غليانها منخفضة.',
    'الرابطة الكيميائيّة: هي القوّة التي تجذب الذرّات أو الأيونات أو الجزيئات إلى بعضها البعض.',
    'الرابطة الأيونية: هي قوة تجاذب كهربائيّة ساكنة بين أيون موجب وأيون سالب.',
    'الرابطة المشتركة: هي اشتراك ذرّتين بزوج من الإلكترونات أو أكثر.',
    'أُقارن بين عدد الأزواج الإلكترونات المشتركة في كل جزيء من الجزيئات السابقة. ماذا أستنتج؟',
    'حيث: ₁₃Al، ₂₀Ca، ₆C، ₁H، ₈O، ₇N، ₁₇Cl.',
    'الرّابطة في جزيء الهيدروجين:',
    'الرّابطة الأيونيّة هي قوى تجاذب:',
  ])('keeps the printed wording character for character: %s', (text) => {
    expect(allText).toContain(text)
  })

  it('keeps the printed objectives and keywords of page 13', () => {
    const goals = chemistryLesson2.steps.find((step) => step.id === 'goals')!
    const text = JSON.stringify(goals)
    for (const objective of [
      'يتعرّف الرابطة الكيميائيّة.',
      'يتعرّف الرابطة الأيونية.',
      'يتعرّف الرابطة المشتركة.',
      'يرسم تمثيل لويس لبعض الجزيئات ذات رابطة مشتركة.',
    ]) {
      expect(text).toContain(objective)
    }
    expect(text).toContain('رابطة كيميائيّة – رابطة أيونيّة – رابطة مشتركة')
  })

  it('keeps the book questions, options and page references untouched', () => {
    const mc1 = bookQuestions[0]!
    expect(mc1.type).toBe('multiple-choice')
    if (mc1.type === 'multiple-choice') {
      expect(mc1.options.map((option) => option.label)).toEqual(['مشتركة.', 'أيونيّة.', 'معدنيّة.', 'هيدروجينيّة.'])
      expect(mc1.correctOptionIds).toEqual(['a'])
    }
    const mc2 = bookQuestions[1]!
    expect(mc2.type).toBe('multiple-choice')
    if (mc2.type === 'multiple-choice') {
      expect(mc2.options.map((option) => option.label)).toEqual(['مغناطيسي.', 'نووي.', 'كهرطيسي.', 'كهربائي.'])
      expect(mc2.correctOptionIds).toEqual(['d'])
    }

    expect(bookQuestions.map((question) => question.source?.page)).toEqual(Array(7).fill('17'))
    expect(bookQuestions.every((question) => question.origin === 'textbook')).toBe(true)
    expect(bookActivitySolutions.map((question) => question.source?.page)).toEqual([
      '13', '13', '13', '15', '16', '16', '16', '16', '16',
    ])
    // Every printed item keeps a complete solution, not just a prompt.
    for (const question of [...bookActivitySolutions, ...bookQuestions]) {
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
      expect(question.objectiveId, `${question.id} objective`).toBeTruthy()
      if (question.type === 'short-answer') {
        expect(question.referenceAnswer.trim(), `${question.id} reference`).not.toBe('')
        expect(question.rubric?.length ?? 0, `${question.id} rubric`).toBeGreaterThan(0)
      }
    }
  })

  it('publishes the correct totals for page 17 and its five questions', () => {
    expect(bookQuestions).toHaveLength(7)
    expect(bookActivitySolutions).toHaveLength(9)
    const ids = bookQuestions.map((question) => question.id)
    expect(ids).toEqual([
      'l2-book-mc-1',
      'l2-book-mc-2',
      'l2-book-q2',
      'l2-book-q3',
      'l2-book-q4',
      'l2-book-q5-1',
      'l2-book-q5-2',
    ])
  })

  it('stores no bidi control characters in the lesson data', () => {
    const files = [
      'src/data/curriculum/chemistryLesson2.ts',
      'src/data/curriculum/chemistryLesson2Book.ts',
      'src/data/curriculum/chemistryLesson2Practice.ts',
      'src/data/curriculum/chemistryLesson2Test.ts',
    ]
    const pattern = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/u
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(pattern)
    }
  })
})

describe('the printed page-15 Lewis dot map', () => {
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

  it('prints O₂ as a 2×2 shared block with an outer vertical pair and a bottom pair per O', () => {
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
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(8)
    expect(container.querySelector('.bond-model__bond')).toHaveAttribute('data-order', '2')
    expect(container.querySelectorAll('.bond-model__disc')).toHaveLength(8)
  })

  it('prints N₂ as six shared dots with one outer lone pair per N', () => {
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
    expect(container.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(4)
    expect(container.querySelector('.bond-model__bond')).toHaveAttribute('data-order', '3')
    expect(container.querySelectorAll('.bond-model__disc')).toHaveLength(4)
  })

  it('keeps the Lewis column and the whole figure inside LTR isolates', () => {
    const { container } = render(
      <LewisMolecule
        left={{ symbol: 'O', lonePairSides: ['left', 'bottom'] }}
        right={{ symbol: 'O', lonePairSides: ['right', 'bottom'] }}
        sharedPairs={2}
      />,
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

    await user.click(screen.getByRole('button', { name: 'أكمل الانتقال: تكوّن الأيونان' }))
    expect(section).toHaveAttribute('data-stage', '2')
    const atoms = container.querySelectorAll('[data-bohr]')
    expect(atoms[0]).toHaveAttribute('data-charge', '+')
    expect(atoms[1]).toHaveAttribute('data-charge', '-')
    expect(container.querySelectorAll('[data-bohr="Na"] .bohr__electron')).toHaveLength(10)
    expect(container.querySelectorAll('[data-bohr="Cl"] .bohr__electron')).toHaveLength(18)

    await user.click(screen.getByRole('button', { name: 'قرّب الأيونين: التجاذب الكهربائي الساكن' }))
    expect(section).toHaveAttribute('data-stage', '3')
    expect(screen.getAllByText(/بلورة/).length).toBeGreaterThan(0)

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

    await user.click(screen.getByRole('button', { name: 'النموذج فقط' }))
    expect(section).toHaveAttribute('data-view', 'model')
    expect(container.querySelector('.lewis-mol')).toBeNull()

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

  it('grades correct answers as correct through the real evaluator', () => {
    const mc = finalTest.questions.find((question) => question.id === 'l2-final-2')!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['c'] } }).outcome).toBe('correct')

    const tf = finalTest.questions.find((question) => question.id === 'l2-final-5')!
    expect(evaluateQuestion(tf, { questionId: tf.id, value: { type: 'boolean', value: false } }).outcome).toBe('correct')

    const num = finalTest.questions.find((question) => question.id === 'l2-final-10')!
    expect(evaluateQuestion(num, { questionId: num.id, value: { type: 'number', value: '4' } }).outcome).toBe('correct')

    const blank = finalTest.questions.find((question) => question.id === 'l2-final-7')!
    expect(
      evaluateQuestion(blank, { questionId: blank.id, value: { type: 'blanks', values: { b1: 'كهربائية', b2: 'موجب' } } })
        .outcome,
    ).toBe('correct')

    const matching = finalTest.questions.find((question) => question.id === 'l2-final-9')!
    expect(matching.type).toBe('matching')
    if (matching.type === 'matching') {
      expect(
        evaluateQuestion(matching, { questionId: matching.id, value: { type: 'matching', pairs: matching.pairs.map((pair) => ({ ...pair })) } })
          .outcome,
      ).toBe('correct')
    }
  })

  it('marks wrong and missing answers as wrong — the key is not forgiving', () => {
    const mc = bookQuestions[0]!
    expect(evaluateQuestion(mc, { questionId: mc.id, value: { type: 'choice', optionIds: ['b'] } }).outcome).toBe('incorrect')

    const numberOfKey = finalTest.questions.find((question) => question.id === 'l2-final-11')!
    expect(
      evaluateQuestion(numberOfKey, { questionId: numberOfKey.id, value: { type: 'number', value: '17' } }).outcome,
    ).toBe('incorrect')

    const blankOfKey = finalTest.questions.find((question) => question.id === 'l2-final-7')!
    expect(
      evaluateQuestion(blankOfKey, { questionId: blankOfKey.id, value: { type: 'blanks', values: { b1: 'كهربائية', b2: 'سالب' } } })
        .outcome,
    ).not.toBe('correct')
  })

  it('awards partial credit for a partly correct matching and composite answer', () => {
    // Matching: two of four pairs right must land on `partial`, not `correct`.
    const matching = finalTest.questions.find((question) => question.id === 'l2-final-9')!
    expect(matching.type).toBe('matching')
    if (matching.type === 'matching') {
      const half = matching.pairs.slice(0, 2).map((pair) => ({ ...pair }))
      const wrong = matching.pairs.slice(2).map((pair) => ({ leftId: pair.leftId, rightId: 'single' }))
      const result = evaluateQuestion(matching, {
        questionId: matching.id,
        value: { type: 'matching', pairs: [...half, ...wrong] },
      })
      expect(result.outcome).toBe('partial')
    }

    // Composite (table interpretation): one sub-question correct, one blank.
    const composite = finalTest.questions.find((question) => question.id === 'l2-final-18')!
    expect(composite.type).toBe('table-interpretation')
    if (composite.type === 'table-interpretation') {
      const [first, second] = composite.questions
      expect(first && second).toBeTruthy()
      const firstAnswer =
        first!.type === 'multiple-choice'
          ? { type: 'choice' as const, optionIds: [first!.correctOptionIds[0]!] }
          : null
      if (firstAnswer) {
        const result = evaluateQuestion(composite, {
          questionId: composite.id,
          value: { type: 'composite', children: { [first!.id]: firstAnswer } },
        })
        expect(result.outcome).toBe('partial')
      }
    }
  })

  it('distributes the correct options across the key instead of one position', () => {
    const singleChoices = finalTest.questions.filter(
      (question): question is Extract<typeof question, { type: 'multiple-choice' }> =>
        question.type === 'multiple-choice' && question.selection === 'single',
    )
    expect(singleChoices.length).toBeGreaterThanOrEqual(3)
    const positions = singleChoices.map((question) => question.correctOptionIds[0]!)
    expect(new Set(positions).size).toBeGreaterThan(1)
  })

  it('never leaks a reference answer or explanation into the student prompt', () => {
    for (const question of finalTest.questions) {
      expect(question.prompt).not.toBe(question.explanation)
      if (question.type === 'short-answer') {
        expect(question.prompt).not.toContain(question.referenceAnswer)
      }
    }
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

  it('shows a complete solution for every final-test question of lesson 2', async () => {
    renderApp('/teacher/final-test-solutions?lesson=chem-u1-l2')

    expect(await screen.findByRole('heading', { level: 2, name: 'الدرس الثاني — كيمياء: الروابط الكيميائية' })).toBeInTheDocument()
    expect(screen.getAllByText(/التفسير وخطوات الحل/).length).toBeGreaterThanOrEqual(finalTest.questions.length)
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

  it('mounts both registered interactives on their simulation steps', async () => {
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
    // The outline title is rendered through the platform notation renderer, so
    // the accessible name flattens subscripts to plain digits (H2/O2/N2). Match
    // the stable Arabic part of the title and assert the notation itself below.
    await user.click(screen.getByRole('button', { name: /الرّابطة المشتركة/ }))

    const molecules = await screen.findAllByRole('img', { name: /تمثيل لويس للجزيء/ })
    expect(molecules.length).toBeGreaterThanOrEqual(3)
    const o2 = container.querySelector('[data-lewis-molecule="O₂"]')!
    expect(o2.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(4)
    const n2 = container.querySelector('[data-lewis-molecule="N₂"]')!
    expect(n2.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(6)
  })

  it('renders KaTeX formulas as real math, never raw TeX', async () => {
    const user = userEvent.setup()
    const { container } = renderApp(LESSON_PATH)
    await screen.findByRole('heading', { level: 1, name: /الروابط الكيميائية/ })
    await user.click(screen.getByRole('button', { name: /لماذا ينتقل الإلكترون/ }))

    const katex = container.querySelectorAll('.katex')
    expect(katex.length).toBeGreaterThan(0)
    expect(container.querySelector('[data-math-error="true"]')).toBeNull()
    // KaTeX keeps the TeX source inside a MathML annotation (for accessibility
    // tooling); what must never appear is raw TeX in the *visible* layer.
    const visible = [...container.querySelectorAll('.katex-html')].map((node) => node.textContent ?? '').join(' ')
    expect(visible.length).toBeGreaterThan(0)
    expect(visible).not.toContain('N_{')
    expect(visible).not.toContain('\\dfrac')
    expect(visible).not.toContain('\\times')
    // Display maths is isolated LTR and keyboard-reachable for horizontal scroll.
    const display = container.querySelector('[data-math="block"]')
    expect(display).toHaveAttribute('dir', 'ltr')
    expect(display).toHaveAttribute('tabindex', '0')
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

describe('attribution of steps and blocks', () => {
  it('marks every explanation/simulation/common-error step as platform material', () => {
    for (const step of chemistryLesson2.steps) {
      if (['explanation', 'deep-explanation', 'simulation', 'common-error'].includes(step.kind)) {
        expect(step.attribution, step.id).toBe('platform')
      }
    }
  })

  it('carries a verified source on every step that quotes the book', () => {
    for (const step of chemistryLesson2.steps) {
      const quotesBook = step.blocks.some(
        (block) =>
          block.kind === 'textbook-verbatim' || ('attribution' in block && block.attribution === 'textbook'),
      )
      if (quotesBook) {
        expect(step.source?.verified, step.id).toBe(true)
        expect(step.source?.pages.length, step.id).toBeGreaterThan(0)
      }
    }
  })

  it('never labels a platform simulation as textbook material', () => {
    for (const step of chemistryLesson2.steps) {
      for (const block of step.blocks) {
        if (block.kind === 'interactive') expect(step.attribution, step.id).toBe('platform')
      }
    }
  })

  it('keeps every practice question inside a teaching step and out of the book solutions', () => {
    const mounted = new Set(inlineQuestionIds)
    for (const question of practiceAssessment.questions) {
      expect(mounted.has(question.id), `${question.id} not mounted`).toBe(true)
    }
    const bookIds = new Set([...bookActivitySolutions, ...bookQuestions].map((question) => question.id))
    for (const question of practiceAssessment.questions) expect(bookIds.has(question.id)).toBe(false)
  })

  it('gives every practice question a hint and a reasoned explanation', () => {
    for (const question of practiceAssessment.questions) {
      expect(question.hint?.trim() ?? '', `${question.id} hint`).not.toBe('')
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
      expect(question.origin).toBe('platform')
    }
  })
})

describe('regression — inline notation inside Lesson 2 prose renders structurally', () => {
  const renderStepBlocks = (stepId: string) => {
    const step = chemistryLesson2.steps.find((candidate) => candidate.id === stepId)
    expect(step, stepId).toBeDefined()
    const blocks = step!.blocks.filter((block) => block.kind !== 'interactive' && block.kind !== 'question')
    return render(
      <div dir="rtl">
        <ContentBlocks blocks={blocks} />
      </div>,
    )
  }

  it('promotes Na⁺ and Cl⁻ inside the page-14 bullet list to ion DOM', () => {
    const { container } = renderStepBlocks('bond-definition')
    const ions = [...container.querySelectorAll('.ion-notation')].map((el) => el.getAttribute('data-ion'))
    expect(ions).toContain('Na+')
    expect(ions).toContain('Cl\u2212')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('promotes every nuclide in the page-16 «حيث» verbatim line', () => {
    const step = chemistryLesson2.steps.find((candidate) => JSON.stringify(candidate.blocks).includes('حيث:'))
    expect(step).toBeDefined()
    const { container } = render(
      <div dir="rtl">
        <ContentBlocks blocks={step!.blocks} />
      </div>,
    )
    expect(container.querySelectorAll('.nuclear-notation')).toHaveLength(7)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('renders table footnotes and headers as structured notation too', () => {
    const { container } = renderStepBlocks('ionic-mechanism')
    expect(container.querySelectorAll('.sci-table__footnote .ion-notation').length).toBeGreaterThan(0)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('leaves no subscript or charge glyph floating in RTL prose in ANY Lesson 2 step', () => {
    for (const step of chemistryLesson2.steps) {
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

describe('the rebuilt lesson-2 educational figures', () => {
  it('reads the valence electrons of five printed atoms without hiding the count', () => {
    const { container } = render(<Lesson2ValenceDiagram interactiveId="lesson2-valence-map" reducedMotion={false} />)
    const cards = [...container.querySelectorAll('[data-atom]')]
    expect(cards.map((card) => card.getAttribute('data-atom'))).toEqual(['Na', 'Mg', 'H', 'O', 'Cl'])
    expect(cards.map((card) => card.getAttribute('data-surface'))).toEqual(['1', '2', '1', '6', '7'])
    // The printed distribution under each atom must agree with the drawn shells.
    for (const card of cards) {
      const shells = card.querySelector('.l2-valence__facts dd[dir="ltr"]')?.textContent ?? ''
      const total = shells.split('-').reduce((sum, value) => sum + Number(value), 0)
      expect(card.querySelectorAll('.bohr__electron')).toHaveLength(total)
    }
    // The figure explains its own symbols rather than relying on colour alone.
    expect(container.querySelectorAll('.l2-figure__legend li')).toHaveLength(3)
  })

  it('contrasts neutral atom, positive ion and negative ion visually and algebraically', () => {
    const { container } = render(<Lesson2IonBalanceDiagram interactiveId="lesson2-ion-balance" reducedMotion={false} />)
    const cards = [...container.querySelectorAll('[data-particle-card]')]
    expect(cards.map((card) => card.getAttribute('data-particle-card'))).toEqual(['neutral-na', 'cation-na', 'anion-cl'])
    expect(cards.map((card) => card.querySelectorAll('.bohr__electron').length)).toEqual([11, 10, 18])
    const equations = [...container.querySelectorAll('.math-formula')]
    expect(equations).toHaveLength(3)
    expect(equations.every((equation) => equation.getAttribute('dir') === 'ltr')).toBe(true)
    expect(equations.every((equation) => equation.querySelector('.katex') && !equation.hasAttribute('data-math-error'))).toBe(true)
    expect(container.querySelectorAll('.l2-figure__legend li')).toHaveLength(3)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('shows transfer and sharing side by side with numbered evidence', () => {
    const { container } = render(<Lesson2BondAnatomyDiagram interactiveId="lesson2-bond-anatomy" reducedMotion={false} />)
    expect(container.querySelector('[data-panel="transfer"]')).not.toBeNull()
    expect(container.querySelector('[data-panel="sharing"]')).not.toBeNull()
    // Cl keeps seven surface electrons and offers one empty slot to sodium.
    expect(container.querySelectorAll('[data-panel="transfer"] [data-electron]')).toHaveLength(8)
    expect(container.querySelector('[data-slot="cl-accepts"]')).not.toBeNull()
    expect(container.querySelector('.l2-anatomy__shared')).not.toBeNull()
    expect(container.querySelectorAll('.l2-anatomy__badge')).toHaveLength(2)
    expect(container.querySelectorAll('.l2-anatomy__notes li')).toHaveLength(2)
  })

  it('labels the Lewis dot map with real dot counts and a legend', () => {
    const { container } = render(<Lesson2LewisAnatomyDiagram interactiveId="lesson2-lewis-anatomy" reducedMotion={false} />)
    const cards = [...container.querySelectorAll('.l2-lewis__card[data-molecule]')]
    expect(cards.map((card) => card.getAttribute('data-molecule'))).toEqual(['h2', 'o2', 'n2'])
    expect(cards.map((card) => card.querySelectorAll('.lewis-mol__dot[data-electron="shared"]').length)).toEqual([2, 4, 6])
    expect(container.querySelectorAll('.l2-lewis__legend li')).toHaveLength(5)
    const equations = [...container.querySelectorAll('.math-formula')]
    expect(equations).toHaveLength(4)
    expect(equations.every((equation) => equation.getAttribute('dir') === 'ltr')).toBe(true)
    expect(equations.every((equation) => equation.querySelector('.katex') && !equation.hasAttribute('data-math-error'))).toBe(true)
    // Verify each card renders the actual addition check (2 + 0 = 2, 4 + 4 = 8, 6 + 2 = 8) rather than pre-summed 8 = 8.
    const visibleMath = cards.map((card) => card.querySelector('.katex-html')?.textContent ?? '')
    expect(visibleMath[0]).toContain('2+0=2')
    expect(visibleMath[1]).toContain('4+4=8')
    expect(visibleMath[2]).toContain('6+2=8')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('draws accurate Lewis dot and bond structures for heteronuclear H2O and HCl', () => {
    const { container } = render(<Lesson2HeteroLewisDiagram interactiveId="lesson2-hetero-lewis" reducedMotion={false} />)
    const h2oDots = container.querySelector('[data-hetero-molecule="H2O"] .l2-hetero-lewis__dots')!
    const hclDots = container.querySelector('[data-hetero-molecule="HCl"] .l2-hetero-lewis__dots')!

    expect(h2oDots.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(4)
    expect(h2oDots.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(4)
    expect(h2oDots.querySelector('[data-atom="O"]')?.getAttribute('data-lone-pairs')).toBe('2')
    expect([...h2oDots.querySelectorAll('[data-atom="H"]')].map((el) => el.getAttribute('data-lone-pairs'))).toEqual(['0', '0'])

    expect(hclDots.querySelectorAll('.lewis-mol__dot[data-electron="shared"]')).toHaveLength(2)
    expect(hclDots.querySelectorAll('.lewis-mol__dot[data-electron="lone"]')).toHaveLength(6)
    expect(hclDots.querySelector('[data-atom="Cl"]')?.getAttribute('data-lone-pairs')).toBe('3')
    expect(hclDots.querySelector('[data-atom="H"]')?.getAttribute('data-lone-pairs')).toBe('0')

    const equations = [...container.querySelectorAll('.math-formula')]
    expect(equations).toHaveLength(6)
    expect(equations.every((equation) => equation.getAttribute('dir') === 'ltr')).toBe(true)
    expect(equations.every((equation) => equation.querySelector('.katex') && !equation.hasAttribute('data-math-error'))).toBe(true)
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('derives the formula from the valence count in one visible chain', () => {
    const { container } = render(<Lesson2OctetBridgeDiagram interactiveId="lesson2-octet-bridge" reducedMotion={false} />)
    const rows = [...container.querySelectorAll('.l2-chain__row')]
    expect(rows.map((row) => row.getAttribute('data-molecule'))).toEqual(['h2', 'o2', 'n2'])
    expect(rows.map((row) => row.getAttribute('data-pairs'))).toEqual(['1', '2', '3'])
    expect(rows.map((row) => row.querySelectorAll('.l2-chain__cell').length)).toEqual([5, 5, 5])
  })

  it('isolates every arithmetic check as one LTR KaTeX expression', () => {
    const { container } = render(<Lesson2OctetBridgeDiagram interactiveId="lesson2-octet-bridge" reducedMotion={false} />)
    const rows = [...container.querySelectorAll('.l2-chain__row')]

    expect(container.querySelectorAll('.l2-chain__cell--result .math-formula[dir="ltr"]')).toHaveLength(3)
    expect(container.querySelectorAll('.l2-chain__cell .math-formula[data-math="inline"]')).toHaveLength(6)
    for (const row of rows) {
      const equations = [...row.querySelectorAll('.math-formula')]
      expect(equations).toHaveLength(2)
      expect(equations.every((equation) => equation.querySelector('.katex'))).toBe(true)
      expect(equations.every((equation) => equation.getAttribute('dir') === 'ltr')).toBe(true)
      expect(equations.every((equation) => equation.getAttribute('data-math-error') !== 'true')).toBe(true)
    }
  })

  it('runs the four transfer stages for CaO and for MgCl₂ with the printed ion counts', () => {
    const { container: cao } = render(<Lesson2TransferMechanismDiagram interactiveId="lesson2-transfer-cao" reducedMotion={false} />)
    expect(cao.querySelector('figure')?.getAttribute('data-compound')).toBe('CaO')
    expect([...cao.querySelectorAll('[data-stage]')].map((stage) => stage.getAttribute('data-stage'))).toEqual(['1', '2', '3', '4'])
    expect(cao.querySelector('[data-stage="3"]')?.querySelectorAll('[data-bohr]')).toHaveLength(2)
    expect(cao.querySelectorAll('[data-stage="4"] .l2-transfer__anion')).toHaveLength(1)

    const { container: mg } = render(<Lesson2TransferMechanismDiagram interactiveId="lesson2-transfer-mgcl2" reducedMotion={false} />)
    expect(mg.querySelector('figure')?.getAttribute('data-compound')).toBe('MgCl2')
    expect(mg.querySelector('[data-stage="1"]')?.querySelectorAll('[data-bohr]')).toHaveLength(3)
    expect(mg.querySelector('[data-stage="3"]')?.querySelectorAll('[data-bohr]')).toHaveLength(3)
    expect(mg.querySelectorAll('[data-stage="4"] .l2-transfer__anion')).toHaveLength(2)
    // Every charge relation is one KaTeX LTR isolate; no raw mixed-direction equation.
    const equations = [...mg.querySelectorAll('.math-formula')]
    expect(equations.length).toBeGreaterThanOrEqual(4)
    expect(equations.every((equation) => equation.getAttribute('dir') === 'ltr')).toBe(true)
    expect(equations.every((equation) => equation.querySelector('.katex') && !equation.hasAttribute('data-math-error'))).toBe(true)
    // Charge arithmetic is printed, never asserted without evidence.
    expect(mg.textContent).toContain('12')
    expect(mg.textContent).toContain('18')
  })
})

describe('the rebuilt lesson-2 interactions', () => {
  it('counts valence electrons, reports the reason and resets', async () => {
    const user = userEvent.setup()
    const { container } = render(<ValenceCounterLab interactiveId="lesson2-valence-counter" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-atom', 'Na')
    expect(section).toHaveAttribute('data-state', 'idle')

    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق' }))
    expect(section).toHaveAttribute('data-state', 'incorrect')
    expect(container.querySelector('[data-feedback="incorrect"]')?.textContent).toContain('آخر رقم')

    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(section).toHaveAttribute('data-state', 'idle')
    expect(container.querySelector('[data-feedback="idle"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: '1' }))
    await user.click(screen.getByRole('button', { name: 'تحقّق' }))
    expect(section).toHaveAttribute('data-state', 'correct')
    expect(container.querySelector('[data-feedback="correct"]')?.textContent).toContain('فقد')

    await user.click(screen.getByRole('button', { name: 'الذرّة التالية' }))
    expect(section).toHaveAttribute('data-atom', 'Mg')
    expect(section).toHaveAttribute('data-state', 'idle')
  })

  it('deduces partner-dependent behavior across metal+nonmetal and nonmetal+nonmetal pairs', async () => {
    const user = userEvent.setup()
    const { container } = render(<ElementBehaviorLab interactiveId="lesson2-element-behavior-lab" reducedMotion={false} />)
    const section = container.querySelector('section')!

    expect(section).toHaveAttribute('data-pair', 'na-cl')
    expect(section).toHaveAttribute('data-state', 'idle')

    await user.click(screen.getByRole('button', { name: 'لا فلزّ مع لا فلزّ' }))
    await user.click(screen.getByRole('button', { name: /مشاركة أزواج إلكترونات/ }))
    await user.click(screen.getByRole('button', { name: 'تحقّق' }))
    expect(section).toHaveAttribute('data-state', 'incorrect')

    await user.click(screen.getByRole('button', { name: 'إعادة المحاولة' }))
    expect(section).toHaveAttribute('data-state', 'idle')

    await user.click(screen.getByRole('button', { name: 'فلزّ مع لا فلزّ' }))
    await user.click(screen.getByRole('button', { name: /انتقال إلكترونات وتكوّن أيونات/ }))
    await user.click(screen.getByRole('button', { name: 'تحقّق' }))
    expect(section).toHaveAttribute('data-state', 'correct')

    // Switch to Cl + Cl to prove the same chlorine shares when paired with a non-metal.
    await user.click(screen.getByRole('button', { name: /Cl \+ Cl/ }))
    expect(section).toHaveAttribute('data-pair', 'cl-cl')
    expect(section).toHaveAttribute('data-state', 'idle')
    await user.click(screen.getByRole('button', { name: 'لا فلزّ مع لا فلزّ' }))
    await user.click(screen.getByRole('button', { name: /مشاركة أزواج إلكترونات/ }))
    await user.click(screen.getByRole('button', { name: 'تحقّق' }))
    expect(section).toHaveAttribute('data-state', 'correct')
    expect(strayScriptGlyphs(container)).toEqual([])
  })

  it('walks the bond mechanism forward, backward and back to the start', async () => {
    const user = userEvent.setup()
    const { container } = render(<BondStepsLab interactiveId="lesson2-bond-steps" reducedMotion />)
    const section = container.querySelector('section')!
    const previous = screen.getByRole('button', { name: 'السابق' })
    const next = screen.getByRole('button', { name: 'التالي' })
    const reset = screen.getByRole('button', { name: 'إعادة' })

    expect(section).toHaveAttribute('data-stage', '0')
    expect(previous).toBeDisabled()
    expect(reset).toBeDisabled()

    for (let press = 1; press <= 4; press += 1) {
      await user.click(next)
      expect(section).toHaveAttribute('data-stage', String(press))
    }
    expect(next).toBeDisabled()
    const equation = container.querySelector('.l2-steps-lab__formula .math-formula')!
    expect(equation).toHaveAttribute('dir', 'ltr')
    expect(equation.querySelector('.katex')).not.toBeNull()
    expect(equation).not.toHaveAttribute('data-math-error')
    const readouts = [...container.querySelectorAll('.l2-steps-lab__counters strong')].map((node) => node.textContent)
    expect(readouts).toEqual(['11', '10', '+1', '17', '18', '\u22121'])

    await user.click(previous)
    expect(section).toHaveAttribute('data-stage', '3')
    await user.click(reset)
    expect(section).toHaveAttribute('data-stage', '0')
    expect(section).toHaveAttribute('data-compound', 'NaCl')
  })

  it('switches to MgCl₂ and keeps one magnesium against two chlorines', async () => {
    const user = userEvent.setup()
    const { container } = render(<BondStepsLab interactiveId="lesson2-bond-steps" reducedMotion />)
    const section = container.querySelector('section')!
    const choices = container.querySelectorAll<HTMLButtonElement>('.l2-steps-lab__picker .l2-choice')
    await user.click(choices[1]!)
    expect(section).toHaveAttribute('data-compound', 'MgCl2')
    expect(container.querySelectorAll('[data-side="nonmetal"] [data-bohr]')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    await user.click(screen.getByRole('button', { name: 'التالي' }))
    expect(container.querySelector('[data-side="metal"] [data-bohr]')?.getAttribute('data-charge')).toBe('2+')
    expect(container.querySelectorAll('[data-side="nonmetal"] [data-bohr]')).toHaveLength(2)
  })

  it('judges misconceptions, explains each verdict and resets the score', async () => {
    const user = userEvent.setup()
    const { container } = render(<ErrorSpotterLab interactiveId="lesson2-error-spotter" reducedMotion />)
    const section = container.querySelector('section')!

    expect(container.querySelectorAll('[data-statement]')).toHaveLength(6)
    expect(section).toHaveAttribute('data-answered', '0')

    const first = container.querySelector('[data-statement="charge-sign"]')!
    const [trueButton, falseButton] = [...first.querySelectorAll('button')]
    await user.click(trueButton!)
    expect(first).toHaveAttribute('data-state', 'incorrect')
    expect(first.textContent).toContain('11 بروتوناً − 10 إلكترونات')

    // A correct verdict on the one true statement must be recognised as correct.
    const covalent = container.querySelector('[data-statement="covalent-properties"]')!
    const [, covalentFalse] = [...covalent.querySelectorAll('button')]
    await user.click(covalentFalse!)
    expect(covalent).toHaveAttribute('data-state', 'incorrect')

    // The partner-dependent non-metal statement is false and must be marked correct when judged false.
    const nonmetal = container.querySelector('[data-statement="nonmetal-always-gains"]')!
    const [, nonmetalFalse] = [...nonmetal.querySelectorAll('button')]
    await user.click(nonmetalFalse!)
    expect(nonmetal).toHaveAttribute('data-state', 'correct')

    const reset = screen.getByRole('button', { name: 'إعادة المحاولة' })
    expect(section).toHaveAttribute('data-answered', '3')
    await user.click(reset)
    expect(section).toHaveAttribute('data-answered', '0')
    expect(container.querySelectorAll('[data-state="unanswered"]')).toHaveLength(6)

    // The verdict buttons are keyboard reachable buttons, never drag-only targets.
    expect(falseButton).toBeInstanceOf(HTMLButtonElement)
    expect(strayScriptGlyphs(container)).toEqual([])
  })
})
