import {
  hasResponse,
  type ResponseMap,
  type ResponseValue,
  type TestBank,
} from '@/data/testArea/types'
import { gradeAttempt, type TestResult } from './gradeAttempt'

/* ============================================================================
   Attempt state machine
   ----------------------------------------------------------------------------
   Pure reducer, no React and no storage: the whole "no result before submit"
   rule lives here as a data invariant. `result` is `null` until the student
   submits, so no component can render a mark, a percentage, a correct answer
   or a solution before that moment — there is nothing to render.

   `restart` rebuilds the state from scratch: answers, draft, progress, score
   and feedback all disappear together.
   ========================================================================= */

export type AttemptStatus = 'in-progress' | 'submitted'

export type AttemptState = {
  testId: string
  bankVersion: number
  status: AttemptStatus
  currentIndex: number
  responses: ResponseMap
  /** Null until submit — the invariant the UI relies on. */
  result: TestResult | null
  unansweredWarning: boolean
}

export type AttemptAction =
  | { type: 'answer'; questionId: string; value: ResponseValue }
  | { type: 'clear'; questionId: string }
  | { type: 'goto'; index: number }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'submit' }
  | { type: 'submit-anyway' }
  | { type: 'dismiss-warning' }
  | { type: 'restart' }
  | { type: 'hydrate'; state: AttemptState }

export function createAttemptState(bank: TestBank): AttemptState {
  return {
    testId: bank.id,
    bankVersion: bank.version,
    status: 'in-progress',
    currentIndex: 0,
    responses: {},
    result: null,
    unansweredWarning: false,
  }
}

export function answeredCountOf(bank: TestBank, state: AttemptState): number {
  return bank.questions.filter((question) => hasResponse(state.responses[question.id])).length
}

export function progressRatioOf(bank: TestBank, state: AttemptState): number {
  if (bank.questions.length === 0) return 0
  return answeredCountOf(bank, state) / bank.questions.length
}

/** Zero-based indices of the questions with no answer yet. */
export function unansweredIndicesOf(bank: TestBank, state: AttemptState): number[] {
  return bank.questions
    .map((question, index) => (hasResponse(state.responses[question.id]) ? -1 : index))
    .filter((index) => index >= 0)
}

export function isAttemptComplete(bank: TestBank, state: AttemptState): boolean {
  return unansweredIndicesOf(bank, state).length === 0
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return Math.min(Math.max(index, 0), length - 1)
}

export function attemptReducer(
  state: AttemptState,
  action: AttemptAction,
  bank: TestBank,
): AttemptState {
  const total = bank.questions.length

  switch (action.type) {
    case 'answer': {
      if (state.status !== 'in-progress') return state
      return { ...state, responses: { ...state.responses, [action.questionId]: action.value } }
    }

    case 'clear': {
      if (state.status !== 'in-progress') return state
      const responses = { ...state.responses }
      delete responses[action.questionId]
      return { ...state, responses }
    }

    case 'goto': {
      if (state.status !== 'in-progress') return state
      return { ...state, currentIndex: clampIndex(action.index, total) }
    }

    case 'next': {
      if (state.status !== 'in-progress') return state
      return { ...state, currentIndex: clampIndex(state.currentIndex + 1, total) }
    }

    case 'previous': {
      if (state.status !== 'in-progress') return state
      return { ...state, currentIndex: clampIndex(state.currentIndex - 1, total) }
    }

    case 'submit': {
      if (state.status !== 'in-progress') return state
      if (!isAttemptComplete(bank, state)) {
        return { ...state, unansweredWarning: true }
      }
      return { ...state, status: 'submitted', result: gradeAttempt(bank, state.responses) }
    }

    case 'submit-anyway': {
      if (state.status !== 'in-progress') return state
      return {
        ...state,
        status: 'submitted',
        unansweredWarning: false,
        result: gradeAttempt(bank, state.responses),
      }
    }

    case 'dismiss-warning':
      return { ...state, unansweredWarning: false }

    case 'restart':
      return createAttemptState(bank)

    case 'hydrate': {
      if (state.status !== 'in-progress') return state
      if (action.state.testId !== state.testId) return state
      if (action.state.bankVersion !== state.bankVersion) return state
      return {
        ...state,
        currentIndex: clampIndex(action.state.currentIndex, total),
        responses: action.state.responses,
      }
    }

    default:
      return state
  }
}
