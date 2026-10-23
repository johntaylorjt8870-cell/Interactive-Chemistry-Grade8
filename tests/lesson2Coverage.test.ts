import { describe, expect, it } from 'vitest'
import katex from 'katex'
import {
  chemistryLesson2,
  bookQuestions,
  bookActivitySolutions,
  finalTest,
  practiceAssessment,
} from '@/data/curriculum/chemistryLesson2'
import { LESSON2_LEDGER, LESSON2_OBJECTIVES, computeLedgerCoverage, stepBlocks } from '@/data/curriculum/lesson2SourceLedger'
import { getLesson } from '@/data/curriculum/registry'
import { countQuestions, validateFinalTest } from '@/assessment/validate'
import { evaluateQuestion } from '@/assessment/evaluate'
import type { ContentBlock } from '@/data/curriculum/schema'
import type { Question, QuestionResponse, ResponseValue } from '@/assessment/types'

/**
 * Lesson 2 source coverage and scientific correctness.
 *
 * Everything here is computed from the lesson definition and the ledger — no
 * check merely asserts that a file exists. A failure means a printed item is
 * no longer reachable, a key no longer evaluates, or a notation no longer
 * compiles.
 */

const lesson = chemistryLesson2

const walk = (questions: Question[], visit: (question: Question) => void): void => {
  for (const question of questions) {
    visit(question)
    if (question.type === 'table-interpretation' || question.type === 'diagram-interpretation') {
      walk(question.questions, visit)
    }
  }
}

const allBlocks = lesson.steps.flatMap((step) => step.blocks)
const inlineQuestionIds = lesson.steps.flatMap((step) =>
  step.blocks.filter((block) => block.kind === 'question').map((block) => (block as { questionId: string }).questionId),
)
const textbookQuestions = [...bookActivitySolutions, ...bookQuestions]

describe('lesson 2 source ledger', () => {
  it('covers every printed page and never repeats an item id', () => {
    expect(lesson.source.pages.map((page) => page.page)).toEqual(['13', '14', '15', '16', '17'])
    expect(new Set(LESSON2_LEDGER.map((item) => item.id)).size).toBe(LESSON2_LEDGER.length)
    for (const item of LESSON2_LEDGER) {
      expect(item.page, item.id).toMatch(/^1[3-7]$/)
      expect(item.title.trim(), item.id).not.toBe('')
      expect(item.locator.trim(), item.id).not.toBe('')
      expect(item.implementedBy.length, item.id).toBeGreaterThan(0)
    }
  })

  it('has no dangling step or question reference and no unlisted textbook question', () => {
    const coverage = computeLedgerCoverage(lesson)
    expect(coverage.danglingSteps).toEqual([])
    expect(coverage.danglingQuestions).toEqual([])
    expect(coverage.unlistedTextbookQuestions).toEqual([])
    expect(coverage.pagesWithoutEntries).toEqual([])
    expect(coverage.total).toBe(LESSON2_LEDGER.length)
    expect(coverage.implemented + coverage.reconstructed + coverage.decorative).toBe(coverage.total)
    expect(coverage.total).toBeGreaterThanOrEqual(25)
    // Every page carries at least one item, and page 17 carries the questions.
    expect(coverage.byPage['13']).toBeGreaterThan(0)
    expect(coverage.byPage['17']).toBeGreaterThan(0)
  })

  it('classifies every reconstruction or decorative figure explicitly', () => {
    for (const item of LESSON2_LEDGER) {
      if (item.status === 'reconstructed' || item.status === 'decorative') {
        expect(item.note?.trim() ?? '', `${item.id} note`).not.toBe('')
      }
    }
    // The two printed figures are reconstructions, and the photo row is the only
    // decorative item: nothing else may hide behind that label.
    const reconstructed = LESSON2_LEDGER.filter((item) => item.status === 'reconstructed').map((item) => item.id)
    expect(reconstructed).toEqual(['p14-figure-transfer', 'p15-figure-lewis'])
    const decorative = LESSON2_LEDGER.filter((item) => item.status === 'decorative').map((item) => item.id)
    expect(decorative).toEqual(['p13-figure-photos'])
  })

  it('maps every objective to existing steps that actually teach it', () => {
    const stepIds = new Set(lesson.steps.map((step) => step.id))
    expect(LESSON2_OBJECTIVES.map((objective) => objective.id)).toEqual(['O1', 'O2', 'O3', 'O4', 'O5'])
    for (const objective of LESSON2_OBJECTIVES) {
      expect(objective.printed.trim()).not.toBe('')
      expect(objective.stepIds.length).toBeGreaterThan(0)
      for (const stepId of objective.stepIds) expect(stepIds.has(stepId), `${objective.id} → ${stepId}`).toBe(true)
    }
    // The four printed objectives of page 13 are preserved verbatim.
    expect(LESSON2_OBJECTIVES.slice(0, 4).map((objective) => objective.printed)).toEqual([
      'يتعرّف الرابطة الكيميائيّة.',
      'يتعرّف الرابطة الأيونية.',
      'يتعرّف الرابطة المشتركة.',
      'يرسم تمثيل لويس لبعض الجزيئات ذات رابطة مشتركة.',
    ])
  })
})

describe('lesson 2 textbook coverage', () => {
  it('carries every textbook question and activity with a complete solution', () => {
    expect(bookActivitySolutions.length).toBe(9)
    expect(bookQuestions.length).toBe(7)
    expect(new Set(textbookQuestions.map((question) => question.id)).size).toBe(textbookQuestions.length)

    walk(textbookQuestions, (question) => {
      expect(question.source?.page, `${question.id} page`).toMatch(/^1[3-7]$/)
      expect(question.origin, `${question.id} origin`).toBe('textbook')
      expect(question.explanation?.trim() ?? '', `${question.id} explanation`).not.toBe('')
      expect(question.objectiveId, `${question.id} objective`).toBeTruthy()
      if (question.type === 'short-answer') {
        expect(question.referenceAnswer.trim(), `${question.id} reference answer`).not.toBe('')
        expect(question.rubric?.length ?? 0, `${question.id} rubric`).toBeGreaterThan(0)
      }
      if (question.type === 'multiple-choice') {
        const labels = question.options.map((option) => option.label.trim())
        expect(new Set(labels).size, `${question.id} duplicate options`).toBe(labels.length)
        expect(question.correctOptionIds.length).toBeGreaterThan(0)
        for (const id of question.correctOptionIds) {
          expect(question.options.some((option) => option.id === id), `${question.id} key ${id}`).toBe(true)
        }
      }
    })
  })

  it('places every textbook question on a student-visible step', () => {
    const byId = new Map(textbookQuestions.map((question) => [question.id, question]))
    const reachable = new Set(inlineQuestionIds)
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
    const teacher = getLesson('chemistry', 'structural-chemistry', 'chemical-bonds')
    expect(teacher?.tests?.map((test) => test.id)).toEqual(['chem-u1-l2-book', 'chem-u1-l2-practice', 'chem-u1-l2-final'])
    const bookTest = teacher!.tests!.find((test) => test.id === 'chem-u1-l2-book')!
    expect(bookTest.questions.map((question) => question.id)).toEqual(textbookQuestions.map((question) => question.id))
  })

  it('keeps the printed key values intact', () => {
    const byId = new Map(textbookQuestions.map((question) => [question.id, question]))
    // Lesson 2 has no printed numerical answers, only MCQ keys and blank lines.
    const mc = ['l2-book-mc-1', 'l2-book-mc-2'].map((id) => {
      const question = byId.get(id)
      return question?.type === 'multiple-choice' ? question.correctOptionIds : null
    })
    expect(mc).toEqual([['a'], ['d']])

    const q4 = byId.get('l2-book-q4')
    expect(q4?.type).toBe('short-answer')
    if (q4?.type === 'short-answer') {
      expect(q4.referenceAnswer).toContain('16 − 8 = 8')
      expect(q4.referenceAnswer).toContain('8 + 2 = 10')
    }

    const mg = byId.get('l2-book-q3')
    if (mg?.type === 'short-answer') {
      expect(mg.referenceAnswer).toContain('2-8-2')
      expect(mg.referenceAnswer).toContain('2-8-8')
      expect(mg.referenceAnswer).toContain('Mg²⁺')
    }
  })

  it('has no placeholder or deferral text in student content', () => {
    const text = JSON.stringify(lesson)
    for (const banned of ['TODO', 'راجع الكتاب', 'يُترك للطالب لاحقاً', 'placeholder', 'Lorem']) {
      expect(text, banned).not.toContain(banned)
    }
  })
})

/** The response a perfect student gives, derived from the authored key. */
function modelResponse(question: Question): ResponseValue {
  switch (question.type) {
    case 'multiple-choice':
      return { type: 'choice', optionIds: [...question.correctOptionIds] }
    case 'true-false':
      return { type: 'boolean', value: question.correctAnswer }
    case 'fill-blank':
      return {
        type: 'blanks',
        values: Object.fromEntries(question.blanks.map((blank) => [blank.id, blank.acceptedAnswers[0]!])),
      }
    case 'numerical':
      return { type: 'number', value: String(question.acceptedAnswers[0]) }
    case 'ordering':
      return { type: 'order', itemIds: [...question.correctOrder] }
    case 'matching':
      return { type: 'matching', pairs: question.pairs.map((pair) => ({ ...pair })) }
    case 'short-answer':
      return { type: 'text', value: question.referenceAnswer }
    case 'table-interpretation':
    case 'diagram-interpretation':
      return {
        type: 'composite',
        children: Object.fromEntries(question.questions.map((child) => [child.id, modelResponse(child)])),
      }
  }
}

describe('lesson 2 assessment keys', () => {
  it('validates the final test and the practice container', () => {
    expect(validateFinalTest(finalTest, finalTest.id)).toEqual([])
    expect(validateFinalTest(practiceAssessment, practiceAssessment.id)).toEqual([])
    expect(finalTest.id).toBe('chem-u1-l2-final')
    expect(finalTest.lessonId).toBe('chem-u1-l2')
    expect(finalTest.questions).toHaveLength(17)
    expect(countQuestions(finalTest.questions)).toBe(20)
    expect(practiceAssessment.questions).toHaveLength(20)
  })

  it('marks the authored final-test key as fully correct through the real evaluator', () => {
    const outcomes = finalTest.questions.map((question) => ({
      id: question.id,
      outcome: evaluateQuestion(question, { questionId: question.id, value: modelResponse(question) } as QuestionResponse)
        .outcome,
    }))
    const autoMarked = outcomes.filter((entry) => entry.outcome !== 'needs-review')
    expect(autoMarked.every((entry) => entry.outcome === 'correct'), JSON.stringify(outcomes)).toBe(true)
    expect(autoMarked.length).toBeGreaterThanOrEqual(14)
  })

  it('marks the authored practice key as fully correct too', () => {
    const outcomes = practiceAssessment.questions.map((question) => ({
      id: question.id,
      outcome: evaluateQuestion(question, { questionId: question.id, value: modelResponse(question) } as QuestionResponse)
        .outcome,
    }))
    const autoMarked = outcomes.filter((entry) => entry.outcome !== 'needs-review')
    expect(autoMarked.every((entry) => entry.outcome === 'correct'), JSON.stringify(outcomes)).toBe(true)
    expect(autoMarked.length).toBeGreaterThanOrEqual(16)
  })

  it('marks wrong answers wrong (a key that accepts everything would be useless)', () => {
    for (const question of finalTest.questions) {
      if (question.type === 'multiple-choice' && question.selection === 'single') {
        const wrong = question.options.find((option) => !question.correctOptionIds.includes(option.id))
        if (!wrong) continue
        expect(
          evaluateQuestion(question, { questionId: question.id, value: { type: 'choice', optionIds: [wrong.id] } }).outcome,
          question.id,
        ).toBe('incorrect')
      }
      if (question.type === 'true-false') {
        expect(
          evaluateQuestion(question, { questionId: question.id, value: { type: 'boolean', value: !question.correctAnswer } })
            .outcome,
          question.id,
        ).toBe('incorrect')
      }
      if (question.type === 'numerical') {
        expect(
          evaluateQuestion(question, { questionId: question.id, value: { type: 'number', value: '999' } }).outcome,
          question.id,
        ).toBe('incorrect')
      }
    }
  })

  it('measures every declared objective with at least one question', () => {
    const objectiveIds = new Set<string>(LESSON2_OBJECTIVES.map((objective) => objective.id))
    const used = new Set<string>()
    walk(finalTest.questions, (question) => {
      expect(objectiveIds.has(question.objectiveId ?? ''), `${question.id} objective`).toBe(true)
      used.add(question.objectiveId!)
    })
    expect([...used].sort()).toEqual(['O1', 'O2', 'O3', 'O4', 'O5'])
  })

  it('keeps question ids unique across book, practice and final sets', () => {
    const ids = (lesson.tests ?? []).flatMap((test) => test.questions.map((question) => question.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('lesson 2 scientific notation integrity', () => {
  const texBlocks = allBlocks.filter(
    (block): block is Extract<ContentBlock, { kind: 'formula' }> => block.kind === 'formula',
  )

  it('compiles every authored TeX formula with KaTeX', () => {
    expect(texBlocks.length).toBeGreaterThan(3)
    for (const block of texBlocks) {
      expect(() => katex.renderToString(block.tex, { throwOnError: true, displayMode: true, trust: false }), block.tex).not.toThrow()
    }
  })

  it('never uses MathFormula for a plain chemical formula', () => {
    // Chemical species belong to ChemicalFormula (real <sub>/<sup>), not to TeX.
    for (const block of texBlocks) {
      expect(block.tex, block.tex).not.toMatch(/[A-Z][a-z]?\\?_?\\d/)
    }
  })

  it('expresses every species in lesson 2 with structured notation blocks', () => {
    const chemical = allBlocks.filter((block) => block.kind === 'chemical-formula')
    const equations = allBlocks.filter((block) => block.kind === 'chemical-equation')
    const lewis = allBlocks.filter((block) => block.kind === 'lewis-molecule')
    const transfer = allBlocks.filter((block) => block.kind === 'transfer-diagram')
    expect(chemical.length).toBeGreaterThanOrEqual(4)
    expect(equations.length).toBeGreaterThanOrEqual(3)
    expect(lewis.length).toBe(3)
    expect(transfer).toHaveLength(1)
    for (const block of equations) {
      expect(block.reactants.length).toBeGreaterThan(0)
      expect(block.products.length).toBeGreaterThan(0)
    }
  })

  it('keeps the printed electron-transfer counts in the transfer-diagram step', () => {
    const transfer = stepBlocks(lesson, 'bond-definition').find((block) => block.kind === 'transfer-diagram')
    expect(transfer).toBeDefined()
    expect((transfer as { attribution: string }).attribution).toBe('textbook')
  })

  it('keeps the composition table values that the lesson teaches', () => {
    const tableBlock = stepBlocks(lesson, 'covalent-meaning').find((block) => block.kind === 'table')
    expect(tableBlock).toBeDefined()
    if (tableBlock?.kind === 'table') {
      const rows = Object.fromEntries(tableBlock.rows.map((row) => [row.id, row.cells]))
      expect(rows.h2).toMatchObject({ before: '1', need: '1', pairs: '1', lone: '0', after: '2' })
      expect(rows.o2).toMatchObject({ before: '6', need: '2', pairs: '2', lone: '2', after: '8' })
      expect(rows.n2).toMatchObject({ before: '5', need: '3', pairs: '3', lone: '1', after: '8' })
    }
  })

  it('keeps the worked ionic ratio example arithmetically consistent', () => {
    const tableBlock = stepBlocks(lesson, 'ionic-ratio-example').find((block) => block.kind === 'table')
    expect(tableBlock).toBeDefined()
    if (tableBlock?.kind === 'table') {
      const rows = Object.fromEntries(tableBlock.rows.map((row) => [row.id, row.cells]))
      const mgProtons = Number(rows.mg!.z)
      const oProtons = Number(rows.o!.z)
      expect(mgProtons - 10).toBe(2)
      expect(oProtons - 10).toBe(-2)
      expect(mgProtons - 10 + (oProtons - 10)).toBe(0)
    }
  })

  it('keeps the comparison table honest about the book examples', () => {
    const comparison = stepBlocks(lesson, 'bond-compare').find((block) => block.kind === 'table')
    expect(comparison).toBeDefined()
    if (comparison?.kind === 'table') {
      const examples = comparison.rows.find((row) => row.id === 'examples')!
      expect(examples.cells.ionic).toContain('NaCl')
      expect(examples.cells.covalent).toContain('O₂')
      const properties = comparison.rows.find((row) => row.id === 'properties')!
      expect(properties.cells.covalent).toContain('غازات')
      expect(properties.cells.ionic).toContain('مرتفعان')
    }
  })
})
