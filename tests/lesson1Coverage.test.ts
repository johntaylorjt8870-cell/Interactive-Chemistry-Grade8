import { describe, expect, it } from 'vitest'
import { chemistryLesson1, bookQuestions, bookActivitySolutions, finalTest } from '@/data/curriculum/chemistryLesson1'
import { LESSON1_LEDGER, LESSON1_OBJECTIVES, computeLedgerCoverage } from '@/data/curriculum/lesson1SourceLedger'
import { getLesson } from '@/data/curriculum/registry'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { getInteractive, isInteractiveRegistered } from '@/simulations/registry'
import { getTeacherLesson } from '@/teacher/teacherContent'
import type { Question } from '@/assessment/types'

/**
 * Lesson 1 source coverage.
 *
 * These checks are data-driven: they walk the ledger and the lesson definition
 * instead of asserting that a paragraph happens to exist. A failure means a
 * printed item is no longer reachable, a question lost its solution, or an
 * assessment/interaction is not registered.
 */

const lesson = chemistryLesson1
const walk = (questions: Question[], visit: (question: Question) => void): void => {
  for (const question of questions) {
    visit(question)
    if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
      walk(question.questions, visit)
    }
  }
}

const inlineQuestionIds = lesson.steps.flatMap((step) =>
  step.blocks.filter((block) => block.kind === 'question').map((block) => (block as { questionId: string }).questionId),
)

describe('Lesson 1 source ledger', () => {
  it('covers every printed page with a unique item id', () => {
    expect(lesson.source.pages.map((page) => page.page)).toEqual(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    expect(new Set(LESSON1_LEDGER.map((item) => item.id)).size).toBe(LESSON1_LEDGER.length)
    for (const item of LESSON1_LEDGER) {
      expect(item.page).toMatch(/^(3|4|5|6|7|8|9|10|11|12)$/)
      expect(item.title.trim()).not.toBe('')
      expect(item.implementedBy.length).toBeGreaterThan(0)
    }
  })

  it('has no dangling step or question references and no unlisted textbook question', () => {
    const coverage = computeLedgerCoverage(lesson)

    expect(coverage.danglingSteps).toEqual([])
    expect(coverage.danglingQuestions).toEqual([])
    expect(coverage.unlistedTextbookQuestions).toEqual([])
    expect(coverage.pagesWithoutEntries).toEqual([])
    expect(coverage.total).toBe(LESSON1_LEDGER.length)
    expect(coverage.implemented + coverage.reconstructed + coverage.decorative).toBe(coverage.total)
    expect(coverage.total).toBeGreaterThanOrEqual(60)
  })

  it('maps every objective to at least one existing step', () => {
    const stepIds = new Set(lesson.steps.map((step) => step.id))
    expect(LESSON1_OBJECTIVES.map((objective) => objective.id)).toEqual(['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8'])
    for (const objective of LESSON1_OBJECTIVES) {
      expect(objective.stepIds.length).toBeGreaterThan(0)
      for (const stepId of objective.stepIds) expect(stepIds.has(stepId), `${objective.id} → ${stepId}`).toBe(true)
    }
  })
})

describe('Lesson 1 textbook coverage', () => {
  it('carries every textbook question and activity with a solution', () => {
    const questions = [...bookActivitySolutions, ...bookQuestions]

    expect(bookActivitySolutions.length).toBeGreaterThanOrEqual(20)
    expect(bookQuestions.length).toBeGreaterThanOrEqual(15)
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)

    walk(questions, (question) => {
      expect(question.source?.page, `${question.id} page`).toBeTruthy()
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
      if (question.type === 'short-answer') {
        expect(question.referenceAnswer.trim(), `${question.id} reference answer`).not.toBe('')
        expect(question.rubric?.length ?? 0, `${question.id} rubric`).toBeGreaterThan(0)
      }
      if (question.type === 'fill-blank') {
        for (const blank of question.blanks) expect(blank.acceptedAnswers.length).toBeGreaterThan(0)
      }
      if (question.type === 'multiple-choice') {
        const labels = question.options.map((option) => option.label.trim())
        expect(new Set(labels).size, `${question.id} duplicate options`).toBe(labels.length)
        expect(question.options.length, `${question.id} options`).toBeGreaterThanOrEqual(3)
      }
    })
  })

  it('never leaves a textbook question without a visible student self-check', () => {
    const byId = new Map<string, Question>()
    walk([...bookActivitySolutions, ...bookQuestions], (question) => byId.set(question.id, question))

    // A composite question places its nested sub-questions through its own
    // `question` block, so the reachable ids are the inline ids plus their
    // descendants — not a separate block per sub-question.
    const reachable = new Set<string>()
    const addWithChildren = (questionId: string) => {
      const question = byId.get(questionId)
      if (!question || reachable.has(questionId)) return
      reachable.add(questionId)
      if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
        for (const child of question.questions) addWithChildren(child.id)
      }
    }
    for (const questionId of inlineQuestionIds) addWithChildren(questionId)

    for (const questionId of byId.keys()) {
      expect(reachable, `${questionId} is not placed in a lesson step`).toContain(questionId)
    }
  })

  it('reveals formative answers only after an attempt', () => {
    for (const step of lesson.steps) {
      for (const block of step.blocks) {
        if (block.kind !== 'question') continue
        expect(block.reveal, `${step.id}/${block.questionId}`).toBe(true)
      }
    }
  })

  it('keeps a complete teacher solution copy, separate from the student surface', () => {
    const teacher = getTeacherLesson('chem-u1-l1')
    expect(teacher.bookQuestions).toHaveLength(bookActivitySolutions.length + bookQuestions.length)
    expect(teacher.bookQuestions.map((question) => question.id)).toEqual(
      [...bookActivitySolutions, ...bookQuestions].map((question) => question.id),
    )
    expect(teacher.finalTest.id).toBe('chem-u1-l1-final')
    expect(teacher.conceptBlocks?.length ?? 0).toBeGreaterThan(0)
  })

  it('keeps the printed key values intact', () => {
    const byId = new Map([...bookActivitySolutions, ...bookQuestions].map((question) => [question.id, question]))
    const numerical = (id: string) => {
      const question = byId.get(id)
      expect(question?.type, id).toBe('numerical')
      return question?.type === 'numerical' ? question.acceptedAnswers.map(Number) : []
    }
    expect(numerical('book-p5-k')).toEqual([2])
    expect(numerical('book-p5-l')).toEqual([8])
    expect(numerical('book-p5-m')).toEqual([18])
    expect(numerical('book-p5-n')).toEqual([32])
    expect(numerical('book-p7-neon-a')).toEqual([20])
    expect(numerical('book-p7-neon-z')).toEqual([10])
    expect(numerical('book-p7-neon-e')).toEqual([10])

    const p6 = byId.get('book-p6-table')
    expect(p6?.type).toBe('table-interpretation')
    if (p6?.type === 'table-interpretation') {
      const answers = Object.fromEntries(
        p6.questions.map((child) => [
          child.id,
          child.type === 'numerical' ? Number(child.acceptedAnswers[0]) : null,
        ]),
      )
      expect(answers).toMatchObject({ 'book-p6-table-m': 18, 'book-p6-table-n': 32, 'book-p6-table-o': 50 })
    }

    const tf = ['book-tf-1', 'book-tf-2', 'book-tf-3', 'book-tf-4', 'book-tf-5', 'book-tf-6'].map((id) => {
      const question = byId.get(id)
      return question?.type === 'true-false' ? question.correctAnswer : null
    })
    expect(tf).toEqual([true, false, true, false, true, false])

    const mc = ['book-mc-1', 'book-mc-2', 'book-mc-3', 'book-mc-4', 'book-mc-5'].map((id) => {
      const question = byId.get(id)
      return question?.type === 'multiple-choice' ? question.correctOptionIds : null
    })
    expect(mc).toEqual([['b'], ['a'], ['b'], ['b'], ['b']])
  })
})

describe('Lesson 1 lesson structure and interactions', () => {
  it('is registered as the published Lesson 1', () => {
    const registered = getLesson('chemistry', 'structural-chemistry', 'atom-and-element')
    expect(registered?.id).toBe('chem-u1-l1')
    expect(registered?.steps).toHaveLength(lesson.steps.length)
    expect(registered?.status).toBe('source-verified')
  })

  it('ends with a final-test step wired to the registered lesson test', () => {
    const last = lesson.steps.at(-1)!
    expect(last.kind).toBe('final-test')
    expect(last.testId).toBe('chem-u1-l1-final')
    expect(lesson.tests?.map((test) => test.id)).toEqual([
      'chem-u1-l1-book',
      'chem-u1-l1-practice',
      'chem-u1-l1-final',
    ])
    expect(lesson.tests?.some((test) => test.id.includes('unit'))).toBe(false)
  })

  it('registers every interactive used by the lesson', () => {
    const interactiveIds = lesson.steps.flatMap((step) =>
      step.blocks.filter((block) => block.kind === 'interactive').map((block) => (block as { interactiveId: string }).interactiveId),
    )
    expect(interactiveIds.length).toBeGreaterThanOrEqual(6)
    for (const id of new Set(interactiveIds)) {
      expect(getInteractive(id), id).toBeDefined()
      expect(getInteractive(id)?.kind).toMatch(/experiment|simulation|activity/)
    }

    // Every source figure the lesson reconstructs must be a registered
    // diagram, otherwise the page would silently fall back to a text card.
    const diagramIds = lesson.steps.flatMap((step) =>
      step.blocks.filter((block) => block.kind === 'diagram').map((block) => (block as { diagramId: string }).diagramId),
    )
    expect(diagramIds.length).toBeGreaterThan(0)
    for (const id of diagramIds) expect(isInteractiveRegistered(id), id).toBe(true)
  })

  it('has no placeholder or deferral text in student content', () => {
    const text = JSON.stringify(lesson)
    for (const banned of ['TODO', 'راجع الكتاب', 'يُترك للطالب لاحقاً', 'placeholder', 'Lorem']) {
      expect(text, banned).not.toContain(banned)
    }
    // Directional control characters never belong in authored content: the
    // renderers isolate notation structurally instead.
    expect(text).not.toContain('\u200e')
    expect(text).not.toContain('\u200f')
    expect(text).not.toContain('\u202a')
    expect(text).not.toContain('\u202b')
    expect(text).not.toContain('\u202c')
  })
})

describe('Lesson 1 formative practice', () => {
  it('mounts every practice question inside a teaching step', () => {
    const mounted = new Set(inlineQuestionIds)
    for (const question of (lesson.tests ?? []).flatMap((test) => test.questions)) {
      if (question.id.startsWith('l1-practice-')) {
        expect(mounted.has(question.id), `${question.id} is not shown in a step`).toBe(true)
      }
    }
  })

  it('gives every practice question a hint and a reasoned explanation', () => {
    const practice = (lesson.tests ?? [])
      .flatMap((test) => test.questions)
      .filter((question) => question.id.startsWith('l1-practice-'))
    expect(practice.length).toBeGreaterThanOrEqual(25)
    for (const question of practice) {
      expect(question.hint?.trim() ?? '', `${question.id} hint`).not.toBe('')
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
    }
  })

  it('keeps question ids unique across book, practice and final sets', () => {
    const ids = (lesson.tests ?? []).flatMap((test) => test.questions.map((question) => question.id))
    expect(new Set(ids).size, 'duplicate question ids').toBe(ids.length)
  })
})

describe('Lesson 1 final assessment', () => {
  it('is a valid registered test of the declared size', () => {
    expect(validateFinalTest(finalTest, finalTest.id)).toEqual([])
    expect(finalTest.id).toBe('chem-u1-l1-final')
    expect(finalTest.lessonId).toBe('chem-u1-l1')
    expect(finalTest.questions).toHaveLength(15)
    expect(countQuestions(finalTest.questions)).toBeGreaterThanOrEqual(15)
    expect(finalTest.origin).toBe('platform')
  })

  it('maps every question to a declared objective and explains every answer', () => {
    const objectiveIds = new Set<string>(LESSON1_OBJECTIVES.map((objective) => objective.id))
    const used = new Set<string>()

    walk(finalTest.questions, (question) => {
      expect(question.objectiveId, `${question.id} objective`).toBeTruthy()
      expect(objectiveIds.has(question.objectiveId!), `${question.id} unknown objective`).toBe(true)
      used.add(question.objectiveId!)
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
      if (question.type === 'multiple-choice') {
        expect(question.options.length).toBeGreaterThanOrEqual(3)
        const labels = question.options.map((option) => option.label.trim())
        expect(new Set(labels).size, `${question.id} duplicate options`).toBe(labels.length)
      }
    })

    // Every objective of the unit is assessed by at least one question.
    expect([...used].sort()).toEqual(['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8'])
  })

  it('varies its question types beyond copying the textbook', () => {
    const types = new Set<string>()
    walk(finalTest.questions, (question) => types.add(question.type))
    for (const required of ['multiple-choice', 'true-false', 'fill-blank', 'numerical', 'short-answer', 'table-interpretation']) {
      expect(types.has(required), required).toBe(true)
    }
  })
})
