import { describe, expect, it } from 'vitest'
import type { ResponseValue, TestBank } from '@/data/testArea/types'
import {
  attemptReducer,
  answeredCountOf,
  createAttemptState,
  isAttemptComplete,
  progressRatioOf,
  unansweredIndicesOf,
  type AttemptAction,
  type AttemptState,
} from '@/testArea/attemptReducer'
import { clearDraft, readDraft, writeDraft, type StorageLike } from '@/testArea/draft'
import { fixtureBank } from './fixtures/testArea'

/* ============================================================================
   Attempt state machine
   ----------------------------------------------------------------------------
   The "nothing is revealed before submit" rule is a data invariant here, so it
   is tested on the reducer — the fastest, most honest place to test it.
   ========================================================================= */

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

function answerAll(bank: TestBank): AttemptState {
  let state = createAttemptState(bank)
  for (const question of bank.questions) {
    const value: ResponseValue = responseFor(question.type)
    state = attemptReducer(state, { type: 'answer', questionId: question.id, value }, bank)
  }
  return state
}

function responseFor(type: string): ResponseValue {
  switch (type) {
    case 'single-choice':
    case 'error-analysis':
      return { type: 'choice', optionIds: ['b'] }
    case 'multi-select':
      return { type: 'choice', optionIds: ['a', 'c'] }
    case 'true-false':
      return { type: 'boolean', value: true }
    case 'numeric':
      return { type: 'number', value: '1' }
    case 'exact':
      return { type: 'text', value: '2-8-1' }
    case 'ordering':
      return { type: 'order', itemIds: ['s1', 's2', 's3'] }
    case 'matching':
      return { type: 'matching', pairs: [{ leftId: 'l1', rightId: 'r1' }] }
    default:
      return { type: 'text', value: '8' }
  }
}

describe('fresh attempt', () => {
  it('starts with no result, no answers and no warning', () => {
    const bank = fixtureBank()
    const state = createAttemptState(bank)
    expect(state.status).toBe('in-progress')
    expect(state.result).toBeNull()
    expect(state.responses).toEqual({})
    expect(state.currentIndex).toBe(0)
    expect(state.unansweredWarning).toBe(false)
  })

  it('carries no score, percentage or outcome anywhere in its shape', () => {
    const bank = fixtureBank()
    const state = createAttemptState(bank)
    expect(Object.keys(state).sort()).toEqual([
      'bankVersion',
      'currentIndex',
      'responses',
      'result',
      'status',
      'testId',
      'unansweredWarning',
    ])
  })

  it('tracks progress without revealing anything', () => {
    const bank = fixtureBank()
    let state = createAttemptState(bank)
    expect(answeredCountOf(bank, state)).toBe(0)
    state = attemptReducer(state, { type: 'answer', questionId: 'fx-q01', value: { type: 'choice', optionIds: ['b'] } }, bank)
    expect(answeredCountOf(bank, state)).toBe(1)
    expect(progressRatioOf(bank, state)).toBeCloseTo(1 / 20)
    expect(unansweredIndicesOf(bank, state)).toHaveLength(19)
    expect(state.result).toBeNull()
  })
})

describe('navigation', () => {
  it('clamps the index at both ends', () => {
    const bank = fixtureBank()
    let state = createAttemptState(bank)
    state = attemptReducer(state, { type: 'previous' }, bank)
    expect(state.currentIndex).toBe(0)
    state = attemptReducer(state, { type: 'goto', index: 999 }, bank)
    expect(state.currentIndex).toBe(bank.questions.length - 1)
    state = attemptReducer(state, { type: 'next' }, bank)
    expect(state.currentIndex).toBe(bank.questions.length - 1)
    state = attemptReducer(state, { type: 'goto', index: 4 }, bank)
    state = attemptReducer(state, { type: 'previous' }, bank)
    expect(state.currentIndex).toBe(3)
  })

  it('lets the student change an answer before submitting', () => {
    const bank = fixtureBank()
    let state = createAttemptState(bank)
    state = attemptReducer(state, { type: 'answer', questionId: 'fx-q01', value: { type: 'choice', optionIds: ['a'] } }, bank)
    state = attemptReducer(state, { type: 'answer', questionId: 'fx-q01', value: { type: 'choice', optionIds: ['b'] } }, bank)
    expect(state.responses['fx-q01']).toEqual({ type: 'choice', optionIds: ['b'] })
    state = attemptReducer(state, { type: 'clear', questionId: 'fx-q01' }, bank)
    expect(state.responses['fx-q01']).toBeUndefined()
  })
})

describe('submitting', () => {
  it('warns instead of submitting while questions are unanswered', () => {
    const bank = fixtureBank()
    const state = attemptReducer(createAttemptState(bank), { type: 'submit' }, bank)
    expect(state.status).toBe('in-progress')
    expect(state.unansweredWarning).toBe(true)
    expect(state.result).toBeNull()
  })

  it('produces the result only once everything is answered', () => {
    const bank = fixtureBank()
    const filled = answerAll(bank)
    expect(isAttemptComplete(bank, filled)).toBe(true)
    const submitted = attemptReducer(filled, { type: 'submit' }, bank)
    expect(submitted.status).toBe('submitted')
    expect(submitted.result).not.toBeNull()
    expect(submitted.result?.total).toBe(20)
    expect(submitted.result?.correct).toBeGreaterThan(0)
    expect(submitted.result?.percentage).toBeGreaterThan(0)
  })

  it('can be submitted anyway with a clear warning state', () => {
    const bank = fixtureBank()
    let state = createAttemptState(bank)
    state = attemptReducer(state, { type: 'submit' }, bank)
    expect(state.unansweredWarning).toBe(true)
    state = attemptReducer(state, { type: 'submit-anyway' }, bank)
    expect(state.status).toBe('submitted')
    expect(state.unansweredWarning).toBe(false)
    expect(state.result?.unanswered).toBe(20)
  })

  it('ignores further answers after submitting', () => {
    const bank = fixtureBank()
    const submitted = attemptReducer(answerAll(bank), { type: 'submit' }, bank)
    const after = attemptReducer(
      submitted,
      { type: 'answer', questionId: 'fx-q01', value: { type: 'choice', optionIds: ['d'] } },
      bank,
    )
    expect(after).toBe(submitted)
  })

  it('can dismiss the unanswered warning and keep working', () => {
    const bank = fixtureBank()
    let state = attemptReducer(createAttemptState(bank), { type: 'submit' }, bank)
    state = attemptReducer(state, { type: 'dismiss-warning' }, bank)
    expect(state.unansweredWarning).toBe(false)
    expect(state.status).toBe('in-progress')
  })
})

describe('restart', () => {
  it('clears answers, progress, score and feedback in one action', () => {
    const bank = fixtureBank()
    const submitted = attemptReducer(answerAll(bank), { type: 'submit' }, bank)
    expect(submitted.result).not.toBeNull()

    const fresh = attemptReducer(submitted, { type: 'restart' }, bank)
    expect(fresh.status).toBe('in-progress')
    expect(fresh.result).toBeNull()
    expect(fresh.responses).toEqual({})
    expect(fresh.currentIndex).toBe(0)
    expect(fresh.unansweredWarning).toBe(false)
    expect(answeredCountOf(bank, fresh)).toBe(0)
    expect(unansweredIndicesOf(bank, fresh)).toHaveLength(20)
  })
})

describe('draft hydration', () => {
  it('restores a draft of the same bank version', () => {
    const bank = fixtureBank()
    let state = createAttemptState(bank)
    state = attemptReducer(state, { type: 'goto', index: 7 }, bank)
    state = attemptReducer(state, { type: 'answer', questionId: 'fx-q02', value: { type: 'choice', optionIds: ['b'] } }, bank)

    const restored = attemptReducer(
      createAttemptState(bank),
      { type: 'hydrate', state },
      bank,
    )
    expect(restored.currentIndex).toBe(7)
    expect(restored.responses['fx-q02']).toEqual({ type: 'choice', optionIds: ['b'] })
    expect(restored.result).toBeNull()
  })

  it('refuses a draft from another test or an older bank version', () => {
    const bank = fixtureBank()
    const draft: AttemptState = { ...createAttemptState(bank), testId: 'other', currentIndex: 5 }
    expect(attemptReducer(createAttemptState(bank), { type: 'hydrate', state: draft }, bank).currentIndex).toBe(0)

    const stale: AttemptState = { ...createAttemptState(bank), bankVersion: 99, currentIndex: 5 }
    expect(attemptReducer(createAttemptState(bank), { type: 'hydrate', state: stale }, bank).currentIndex).toBe(0)
  })
})

describe('draft persistence', () => {
  it('saves and restores answers for the session', () => {
    const storage = memoryStorage()
    const bank = fixtureBank()
    writeDraft(bank.id, bank.version, { currentIndex: 3, responses: { 'fx-q01': { type: 'choice', optionIds: ['b'] } } }, storage)
    const draft = readDraft(bank.id, bank.version, storage)
    expect(draft?.currentIndex).toBe(3)
    expect(draft?.responses['fx-q01']).toEqual({ type: 'choice', optionIds: ['b'] })
  })

  it('discards a draft written for another bank version', () => {
    const storage = memoryStorage()
    writeDraft('t', 1, { currentIndex: 2, responses: {} }, storage)
    expect(readDraft('t', 2, storage)).toBeNull()
  })

  it('survives corrupt storage content', () => {
    const storage = memoryStorage()
    storage.setItem('ipc:testarea:draft:v1:t', '{not json')
    expect(readDraft('t', 1, storage)).toBeNull()
  })

  it('clears the draft', () => {
    const storage = memoryStorage()
    writeDraft('t', 1, { currentIndex: 1, responses: {} }, storage)
    clearDraft('t', storage)
    expect(readDraft('t', 1, storage)).toBeNull()
  })

  it('works without storage at all', () => {
    expect(readDraft('t', 1, null)).toBeNull()
    expect(() => writeDraft('t', 1, { currentIndex: 0, responses: {} }, null)).not.toThrow()
    expect(() => clearDraft('t', null)).not.toThrow()
  })
})

describe('action coverage', () => {
  it('never mutates the state it is given', () => {
    const bank = fixtureBank()
    const state = createAttemptState(bank)
    const snapshot = JSON.stringify(state)
    const actions: AttemptAction[] = [
      { type: 'answer', questionId: 'fx-q01', value: { type: 'choice', optionIds: ['b'] } },
      { type: 'next' },
      { type: 'submit' },
      { type: 'restart' },
    ]
    for (const action of actions) attemptReducer(state, action, bank)
    expect(JSON.stringify(state)).toBe(snapshot)
  })
})
