import { describe, expect, it } from 'vitest'
import type { ResponseValue, TestQuestion } from '@/data/testArea/types'
import { gradeQuestion } from '@/testArea/grading'
import { gradeAttempt, unansweredIds } from '@/testArea/gradeAttempt'
import { canonicalAnswerOf, solutionAnswerMatchesKey } from '@/testArea/answers'
import { parseNumericInput, toAsciiDigits } from '@/testArea/grading/numeric'
import {
  normaliseDistribution,
  normaliseFraction,
  normaliseFormula,
  normaliseIon,
} from '@/testArea/grading/exact'
import { fixtureBank } from './fixtures/testArea'

/* ============================================================================
   Test Area grading — pure rules, no rendering
   ----------------------------------------------------------------------------
   Every question type is graded through `gradeQuestion`, so these cases prove
   the marking rules the student is actually marked by.
   ========================================================================= */

const page = { page: '5' }

function base(id: string) {
  return {
    id,
    prompt: 'سؤال تجريبي',
    difficulty: 'basic' as const,
    conceptId: 'c1',
    sourceRefs: [page],
    tags: ['conceptual' as const],
  }
}

describe('single choice', () => {
  const question: TestQuestion = {
    ...base('q'),
    type: 'single-choice',
    options: [
      { id: 'a', label: 'الأول' },
      { id: 'b', label: 'الثاني' },
      { id: 'c', label: 'الثالث' },
    ],
    correctOptionIds: ['b'],
  }

  it('marks a correct choice', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['b'] }).outcome).toBe('correct')
  })

  it('marks a wrong choice', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['a'] }).outcome).toBe('incorrect')
  })

  it('treats a missing response as unanswered, never as wrong', () => {
    expect(gradeQuestion(question, undefined).outcome).toBe('unanswered')
    expect(gradeQuestion(question, { type: 'choice', optionIds: [] }).outcome).toBe('unanswered')
  })

  it('rejects a response of the wrong shape instead of guessing', () => {
    expect(gradeQuestion(question, { type: 'text', value: 'ب' }).outcome).toBe('invalid')
  })
})

describe('true / false', () => {
  const question: TestQuestion = { ...base('q'), type: 'true-false', correctAnswer: true }

  it('marks both answers', () => {
    expect(gradeQuestion(question, { type: 'boolean', value: true }).outcome).toBe('correct')
    expect(gradeQuestion(question, { type: 'boolean', value: false }).outcome).toBe('incorrect')
  })

  it('treats a null answer as unanswered', () => {
    expect(gradeQuestion(question, { type: 'boolean', value: null }).outcome).toBe('unanswered')
    expect(gradeQuestion(question, undefined).outcome).toBe('unanswered')
  })
})

describe('multi-select', () => {
  const question: TestQuestion = {
    ...base('q'),
    type: 'multi-select',
    options: [
      { id: 'a', label: 'الأول' },
      { id: 'b', label: 'الثاني' },
      { id: 'c', label: 'الثالث' },
    ],
    correctOptionIds: ['a', 'c'],
  }

  it('requires an exact match', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['a', 'c'] }).outcome).toBe('correct')
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['c', 'a'] }).outcome).toBe('correct')
  })

  it('marks a missing option wrong', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['a'] }).outcome).toBe('incorrect')
  })

  it('marks an extra option wrong', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['a', 'b', 'c'] }).outcome).toBe('incorrect')
  })

  it('marks a completely wrong selection wrong', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: ['b'] }).outcome).toBe('incorrect')
  })

  it('treats an empty selection as unanswered', () => {
    expect(gradeQuestion(question, { type: 'choice', optionIds: [] }).outcome).toBe('unanswered')
  })

  it('applies partial credit only when the blueprint allows it', () => {
    const response: ResponseValue = { type: 'choice', optionIds: ['a', 'b', 'c'] }
    expect(gradeQuestion(question, response).outcome).toBe('incorrect')
    const partial = gradeQuestion(question, response, { allowPartial: true })
    expect(partial.outcome).toBe('partial')
    // (2 correct − 1 extra) / 2 correct options
    expect(partial.ratio).toBeCloseTo(0.5)
  })
})

describe('numeric — parsing', () => {
  it('converts Arabic-Indic and extended digits', () => {
    expect(toAsciiDigits('٣٢')).toBe('32')
    expect(toAsciiDigits('۳۲')).toBe('32')
    expect(parseNumericInput('٣٢')).toEqual({ status: 'ok', value: 32, decimalPlaces: 0 })
  })

  it('accepts a decimal comma and a typographic minus', () => {
    expect(parseNumericInput('2,5')).toEqual({ status: 'ok', value: 2.5, decimalPlaces: 1 })
    expect(parseNumericInput('−2,5')).toEqual({ status: 'ok', value: -2.5, decimalPlaces: 1 })
  })

  it('counts decimal places', () => {
    expect(parseNumericInput('1.250')).toEqual({ status: 'ok', value: 1.25, decimalPlaces: 3 })
  })

  it('reports empty and invalid input separately', () => {
    expect(parseNumericInput('')).toEqual({ status: 'empty' })
    expect(parseNumericInput('   ')).toEqual({ status: 'empty' })
    expect(parseNumericInput('abc')).toEqual({ status: 'invalid' })
    expect(parseNumericInput('1/2').status).toBe('invalid')
    expect(parseNumericInput('1/2', { allowFraction: true })).toEqual({
      status: 'ok',
      value: 0.5,
      decimalPlaces: 0,
    })
    expect(parseNumericInput('1/0', { allowFraction: true }).status).toBe('invalid')
  })
})

describe('numeric — grading', () => {
  const question: TestQuestion = {
    ...base('q'),
    type: 'numeric',
    answer: { correctValue: 18, tolerance: 0.5, integerOnly: true },
  }

  it('accepts the exact value', () => {
    expect(gradeQuestion(question, { type: 'number', value: '18' }).outcome).toBe('correct')
  })

  it('accepts a value inside the tolerance and rejects one outside it', () => {
    expect(gradeQuestion(question, { type: 'number', value: '18.4' }).outcome).toBe('incorrect')
    const tolerant: TestQuestion = {
      ...question,
      type: 'numeric',
      answer: { correctValue: 18, tolerance: 0.5 },
    }
    expect(gradeQuestion(tolerant, { type: 'number', value: '18.4' }).outcome).toBe('correct')
    expect(gradeQuestion(tolerant, { type: 'number', value: '18.6' }).outcome).toBe('incorrect')
  })

  it('rejects unreadable input instead of reading it as zero', () => {
    const grade = gradeQuestion(question, { type: 'number', value: 'ثمانية' })
    expect(grade.outcome).toBe('invalid')
    expect(grade.notes).toContain('invalid-input')
  })

  it('treats an empty entry as unanswered', () => {
    expect(gradeQuestion(question, { type: 'number', value: '' }).outcome).toBe('unanswered')
    expect(gradeQuestion(question, { type: 'number', value: '   ' }).outcome).toBe('unanswered')
  })

  it('enforces integer-only answers', () => {
    const grade = gradeQuestion(question, { type: 'number', value: '18.5' })
    expect(grade.outcome).toBe('incorrect')
    expect(grade.notes).toContain('not-integer')
  })

  it('enforces the declared decimal policy', () => {
    const precise: TestQuestion = {
      ...base('q'),
      type: 'numeric',
      answer: { correctValue: 1.5, decimals: { max: 1 } },
    }
    expect(gradeQuestion(precise, { type: 'number', value: '1.50' }).outcome).toBe('incorrect')
    expect(gradeQuestion(precise, { type: 'number', value: '1.5' }).outcome).toBe('correct')
  })

  it('accepts several alternative values', () => {
    const multi: TestQuestion = {
      ...base('q'),
      type: 'numeric',
      answer: { correctValue: 8, acceptedValues: [18] },
    }
    expect(gradeQuestion(multi, { type: 'number', value: '18' }).outcome).toBe('correct')
  })
})

describe('numeric — unit policy', () => {
  const withoutUnit: TestQuestion = {
    ...base('q'),
    type: 'numeric',
    answer: { correctValue: 32 },
  }

  it('never rejects an answer for a missing unit when no unit is declared', () => {
    expect(gradeQuestion(withoutUnit, { type: 'number', value: '32' }).outcome).toBe('correct')
    expect(
      gradeQuestion(withoutUnit, { type: 'number', value: '32', unit: 'إلكترون' }).outcome,
    ).toBe('correct')
  })

  it('checks a supplied unit once the question declares one', () => {
    const withUnit: TestQuestion = {
      ...base('q'),
      type: 'numeric',
      answer: { correctValue: 32, unit: { required: false, accepted: ['إلكترون', 'electron'] } },
    }
    expect(gradeQuestion(withUnit, { type: 'number', value: '32' }).outcome).toBe('correct')
    expect(gradeQuestion(withUnit, { type: 'number', value: '32', unit: 'إلكترون' }).outcome).toBe('correct')
    expect(gradeQuestion(withUnit, { type: 'number', value: '32', unit: 'مول' }).outcome).toBe('incorrect')
  })

  it('requires the unit when the question says so', () => {
    const required: TestQuestion = {
      ...base('q'),
      type: 'numeric',
      answer: { correctValue: 32, unit: { required: true, accepted: ['إلكترون'] } },
    }
    const missing = gradeQuestion(required, { type: 'number', value: '32' })
    expect(missing.outcome).toBe('incorrect')
    expect(missing.notes).toContain('unit-required')
    expect(gradeQuestion(required, { type: 'number', value: '32', unit: 'إلكترون' }).outcome).toBe('correct')
  })
})

describe('exact answers', () => {
  it('normalises electron distributions', () => {
    expect(normaliseDistribution('2 - 8 - 1')).toBe('2-8-1')
    expect(normaliseDistribution('٢-٨-١')).toBe('2-8-1')
    expect(normaliseDistribution('2،8،1')).toBe('2-8-1')
  })

  it('normalises formulae with unicode subscripts', () => {
    expect(normaliseFormula('H₂O')).toBe('H2O')
    expect(normaliseFormula('MgCl₂')).toBe('MgCl2')
  })

  it('normalises ions to magnitude-then-sign', () => {
    expect(normaliseIon('Ca²⁺')).toBe('Ca2+')
    expect(normaliseIon('Ca2+')).toBe('Ca2+')
    expect(normaliseIon('Cl⁻')).toBe('Cl-')
  })

  it('reduces equivalent fractions to the same value', () => {
    expect(normaliseFraction('1/1860')).toBe('1/1860')
    expect(normaliseFraction('2/3720')).toBe('1/1860')
    expect(normaliseFraction('1/1861')).toBe('1/1861')
  })

  const distribution: TestQuestion = {
    ...base('q'),
    type: 'exact',
    answer: { kind: 'distribution', acceptedAnswers: ['2-8-1'] },
  }

  it('accepts an equivalent spelling and rejects a different one', () => {
    expect(gradeQuestion(distribution, { type: 'text', value: '٢-٨-١' }).outcome).toBe('correct')
    expect(gradeQuestion(distribution, { type: 'text', value: '2-8-2' }).outcome).toBe('incorrect')
  })

  it('treats malformed and empty input correctly', () => {
    expect(gradeQuestion(distribution, { type: 'text', value: '  ' }).outcome).toBe('unanswered')
    expect(gradeQuestion(distribution, { type: 'text', value: 'غير محددة' }).outcome).toBe('incorrect')
  })

  it('accepts an equivalent fraction', () => {
    const fraction: TestQuestion = {
      ...base('q'),
      type: 'exact',
      answer: { kind: 'fraction', acceptedAnswers: ['1/1860'] },
    }
    expect(gradeQuestion(fraction, { type: 'text', value: '2/3720' }).outcome).toBe('correct')
    expect(gradeQuestion(fraction, { type: 'text', value: '1/1860' }).outcome).toBe('correct')
    expect(gradeQuestion(fraction, { type: 'text', value: '1/1861' }).outcome).toBe('incorrect')
  })

  it('keeps element symbols case sensitive', () => {
    const formula: TestQuestion = {
      ...base('q'),
      type: 'exact',
      answer: { kind: 'formula', acceptedAnswers: ['NaCl'] },
    }
    expect(gradeQuestion(formula, { type: 'text', value: 'NaCl' }).outcome).toBe('correct')
    expect(gradeQuestion(formula, { type: 'text', value: 'nacl' }).outcome).toBe('incorrect')
  })
})

describe('ordering', () => {
  const question: TestQuestion = {
    ...base('q'),
    type: 'ordering',
    items: [
      { id: 's1', label: 'الأولى' },
      { id: 's2', label: 'الثانية' },
      { id: 's3', label: 'الثالثة' },
    ],
    correctOrder: ['s1', 's2', 's3'],
  }

  it('marks the exact order correct', () => {
    expect(gradeQuestion(question, { type: 'order', itemIds: ['s1', 's2', 's3'] }).outcome).toBe('correct')
  })

  it('marks a completely reversed order incorrect', () => {
    expect(gradeQuestion(question, { type: 'order', itemIds: ['s3', 's2', 's1'] }).outcome).toBe('incorrect')
  })

  it('reports a partially right order only when partial credit is allowed', () => {
    const response: ResponseValue = { type: 'order', itemIds: ['s1', 's3', 's2'] }
    expect(gradeQuestion(question, response).outcome).toBe('incorrect')
    const partial = gradeQuestion(question, response, { allowPartial: true })
    expect(partial.outcome).toBe('partial')
    expect(partial.ratio).toBeCloseTo(1 / 3)
  })

  it('rejects an incomplete order', () => {
    expect(gradeQuestion(question, { type: 'order', itemIds: ['s1', 's2'] }).outcome).toBe('incorrect')
  })

  it('treats no answer as unanswered', () => {
    expect(gradeQuestion(question, undefined).outcome).toBe('unanswered')
  })
})

describe('matching', () => {
  const question: TestQuestion = {
    ...base('q'),
    type: 'matching',
    left: [
      { id: 'l1', label: 'الأول' },
      { id: 'l2', label: 'الثاني' },
      { id: 'l3', label: 'الثالث' },
    ],
    right: [
      { id: 'r1', label: 'وصف 1' },
      { id: 'r2', label: 'وصف 2' },
      { id: 'r3', label: 'وصف 3' },
    ],
    pairs: [
      { leftId: 'l1', rightId: 'r1' },
      { leftId: 'l2', rightId: 'r2' },
      { leftId: 'l3', rightId: 'r3' },
    ],
  }

  const all = { type: 'matching' as const, pairs: question.type === 'matching' ? question.pairs.map((pair) => ({ leftId: pair.leftId, rightId: pair.rightId })) : [] }

  it('marks a full match correct and a full miss incorrect', () => {
    expect(gradeQuestion(question, all).outcome).toBe('correct')
    expect(
      gradeQuestion(question, {
        type: 'matching',
        pairs: [
          { leftId: 'l1', rightId: 'r2' },
          { leftId: 'l2', rightId: 'r3' },
          { leftId: 'l3', rightId: 'r1' },
        ],
      }).outcome,
    ).toBe('incorrect')
  })

  it('reports a partial match only when allowed', () => {
    const response: ResponseValue = {
      type: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r3' },
        { leftId: 'l3', rightId: 'r2' },
      ],
    }
    expect(gradeQuestion(question, response).outcome).toBe('incorrect')
    const partial = gradeQuestion(question, response, { allowPartial: true })
    expect(partial.outcome).toBe('partial')
    expect(partial.ratio).toBeCloseTo(1 / 3)
  })

  it('treats an all-empty match as unanswered', () => {
    expect(
      gradeQuestion(question, {
        type: 'matching',
        pairs: [
          { leftId: 'l1', rightId: null },
          { leftId: 'l2', rightId: null },
          { leftId: 'l3', rightId: null },
        ],
      }).outcome,
    ).toBe('unanswered')
  })

  it('rejects unknown pair ids instead of granting full credit', () => {
    const forged = gradeQuestion(question, {
      type: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r2' },
        { leftId: 'l3', rightId: 'r3' },
        { leftId: 'forged-left', rightId: 'r1' },
      ],
    })
    expect(forged.outcome).toBe('invalid')
    expect(forged.ratio).toBe(0)
  })

  it('rejects an unknown right id even when the left ids are valid', () => {
    const malformed = gradeQuestion(question, {
      type: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'unknown-right' },
        { leftId: 'l2', rightId: 'r2' },
        { leftId: 'l3', rightId: 'r3' },
      ],
    })
    expect(malformed.outcome).toBe('invalid')
    expect(malformed.ratio).toBe(0)
  })
})

describe('error analysis and correction', () => {
  const analysis: TestQuestion = {
    ...base('q'),
    type: 'error-analysis',
    flawedWork: 'كتب الطالب: الأيون الموجب ينتج عن اكتساب إلكترونات.',
    options: [
      { id: 'a', label: 'الخطأ في تعريف الأيون' },
      { id: 'b', label: 'الخطأ في اتجاه الشحنة' },
      { id: 'c', label: 'لا خطأ' },
    ],
    correctOptionIds: ['b'],
  }

  it('grades an error-analysis question like a single choice', () => {
    expect(gradeQuestion(analysis, { type: 'choice', optionIds: ['b'] }).outcome).toBe('correct')
    expect(gradeQuestion(analysis, { type: 'choice', optionIds: ['a'] }).outcome).toBe('incorrect')
  })

  const correction: TestQuestion = {
    ...base('q'),
    type: 'error-correction',
    flawedWork: 'حسب الطالب شحنة الأيون فوجدها −1.',
    correction: { kind: 'numeric', spec: { correctValue: 2 } },
  }

  it('grades a corrected value against the numeric rule', () => {
    expect(gradeQuestion(correction, { type: 'number', value: '2' }).outcome).toBe('correct')
    expect(gradeQuestion(correction, { type: 'number', value: '1' }).outcome).toBe('incorrect')
  })
})

describe('attempt scoring', () => {
  const bank = fixtureBank()

  it('counts correct, incorrect, unanswered and the percentage', () => {
    const responses = {
      'fx-q01': { type: 'choice' as const, optionIds: ['b'] }, // correct
      'fx-q02': { type: 'choice' as const, optionIds: ['a'] }, // wrong
      'fx-q07': { type: 'boolean' as const, value: true }, // correct (index 6 → true)
    }
    const result = gradeAttempt(bank, responses)
    expect(result.total).toBe(20)
    expect(result.correct).toBe(2)
    expect(result.incorrect).toBe(1)
    expect(result.unanswered).toBe(17)
    expect(result.answered).toBe(3)
    expect(result.percentage).toBe(10)
    expect(result.score).toBe(2)
    expect(result.maxScore).toBe(20)
  })

  it('counts an unreadable answer as answered and wrong', () => {
    const result = gradeAttempt(bank, { 'fx-q11': { type: 'number', value: 'ليس عدداً' } })
    expect(result.incorrect).toBe(1)
    expect(result.unanswered).toBe(19)
    expect(result.answered).toBe(1)
  })

  it('lists unanswered ids in test order', () => {
    const ids = unansweredIds(bank, {})
    expect(ids).toHaveLength(20)
    expect(ids[0]).toBe('fx-q01')
  })

  it('scores partial credit when the blueprint allows it', () => {
    const partialBank = fixtureBank()
    partialBank.blueprint.scoring.allowPartial = true
    const ordering = partialBank.questions.find((question) => question.type === 'ordering')!
    const result = gradeAttempt(partialBank, {
      [ordering.id]: { type: 'order', itemIds: ['s1', 's3', 's2'] },
    })
    expect(result.partial).toBe(1)
    expect(result.score).toBeCloseTo(1 / 3)
  })
})

describe('canonical answers', () => {
  it('describes every type in the form the solutions area prints', () => {
    const bank = fixtureBank()
    for (const question of bank.questions) {
      expect(canonicalAnswerOf(question).trim()).not.toBe('')
    }
  })

  it('recognises an authored solution that states the key', () => {
    const bank = fixtureBank()
    for (const question of bank.questions) {
      const answer =
        question.type === 'numeric'
          ? `${(question.answer.correctValue ?? 0)} إلكتروناً`
          : canonicalAnswerOf(question)
      expect(solutionAnswerMatchesKey(answer, question)).toBe(true)
    }
  })

  it('rejects a solution that disagrees with the key', () => {
    const bank = fixtureBank()
    const numeric = bank.questions.find((question) => question.type === 'numeric')!
    expect(solutionAnswerMatchesKey('999', numeric)).toBe(false)
    const choice = bank.questions.find((question) => question.type === 'single-choice')!
    expect(solutionAnswerMatchesKey('الخيار الرابع', choice)).toBe(false)
  })
})
